import axios from "axios";
import { Rider } from "../model/Rider.js";
import { getChannel } from "./rabbitmq.js";

//  Retry Configuration 
// Each attempt expands the search radius.
// attempt 0 → 500m, attempt 1 → 1000m, attempt 2 → 2000m
const RADIUS_BY_ATTEMPT: number[] = [500, 1000, 2000];
const MAX_ATTEMPTS = RADIUS_BY_ATTEMPT.length; // 3 total attempts
const RETRY_DELAY_MS = 60_000;                 // wait 1 minute before each retry

// Helper: re-queue the event with incremented attempt after a delay 
const scheduleRetry = (payload: object, delayMs: number): void => {
  setTimeout(() => {
    try {
      const channel = getChannel();
      channel.sendToQueue(
        process.env.ORDER_READY_QUEUE!,
        Buffer.from(JSON.stringify(payload)),
        { persistent: true } // survive RabbitMQ restart
      );
      console.log(`Retry message published to queue`);
    } catch (err) {
      console.error("Failed to re-queue retry message:", err);
    }
  }, delayMs);
};

// Helper: notify admin dashboard via Realtime Service
const notifyAdmin = async (
  orderId: string,
  restaurantId: string
): Promise<void> => {
  try {
    await axios.post(
      `${process.env.REALTIME_SERVICE}/api/v1/internal/emit`,
      {
        event: "admin:no_rider_found",
        room: "admin:notifications",
        payload: {
          orderId,
          restaurantId,
          message: `No rider found after ${MAX_ATTEMPTS} attempts. Manual assignment needed.`,
          timestamp: new Date().toISOString(),
        },
      },
      {
        headers: {
          "x-internal-key": process.env.INTERNAL_SERVICE_KEY,
        },
      }
    );
    console.log(`Admin notified about unassigned order ${orderId}`);
  } catch (err: any) {
    console.error("Failed to notify admin:", err.message);
  }
};

// Main Consumer
export const startOrderReadyConsumer = async () => {
  const channel = getChannel();

  console.log("Starting to consume from:", process.env.ORDER_READY_QUEUE);

  channel.consume(process.env.ORDER_READY_QUEUE!, async (msg) => {
    if (!msg) return;

    try {
      console.log("Received message:", msg.content.toString());

      const event = JSON.parse(msg.content.toString());

      console.log("event type:", event.type);

      if (event.type !== "ORDER_READY_FOR_RIDER") {
        channel.ack(msg);
        return;
      }

      // Extract attempt from message (defaults to 0 on first try)
      const { orderId, restaurantId, location, attempt = 0 } = event.data;

      // Get the search radius for this attempt
      const maxDistance = RADIUS_BY_ATTEMPT[attempt];

      console.log(
        `Attempt ${attempt + 1}/${MAX_ATTEMPTS} — searching within ${maxDistance}m for order ${orderId}`
      );

      // Search for available verified riders nearby
      const riders = await Rider.find({
        isAvailble: true,
        isVerified: true,
        location: {
          $near: {
            $geometry: location,
            $maxDistance: maxDistance,
          },
        },
      });

      console.log(`Found ${riders.length} nearby riders`);

      // No riders found
      if (riders.length === 0) {
        // Always ack the current message first so it's removed from queue
        channel.ack(msg);

        const nextAttempt = attempt + 1;

        if (nextAttempt >= MAX_ATTEMPTS) {
          // All attempts exhausted — escalate to admin
          console.log(
            ` No rider found after ${MAX_ATTEMPTS} attempts for order ${orderId}. Notifying admin...`
          );
          await notifyAdmin(orderId, restaurantId);
          return;
        }

        //  Schedule a retry with expanded radius after 1 minute
        const nextRadius = RADIUS_BY_ATTEMPT[nextAttempt];
        console.log(
          `No riders found at ${maxDistance}m. Retrying in 1 min with ${nextRadius}m radius...`
        );

        scheduleRetry(
          {
            type: "ORDER_READY_FOR_RIDER",
            data: {
              orderId,
              restaurantId,
              location,
              attempt: nextAttempt, // key: incremented so next run uses wider radius
            },
          },
          RETRY_DELAY_MS
        );

        return;
      }

      // Riders found — notify each one via Socket.io
      for (const rider of riders) {
        try {
          await axios.post(
            `${process.env.REALTIME_SERVICE}/api/v1/internal/emit`,
            {
              event: "order:available",
              room: `user:${rider.userId}`,
              payload: { orderId, restaurantId },
            },
            {
              headers: {
                "x-internal-key": process.env.INTERNAL_SERVICE_KEY,
              },
            }
          );
          console.log(` Notified rider ${rider.userId} successfully`);
        } catch (error) {
          console.log(`Failed to notify rider ${rider.userId}`, error);
        }
      }

      channel.ack(msg);
      console.log("Message acknowledged");
    } catch (error) {
      console.log("OrderReady consumer error:", error);
      // Ack even on unexpected errors to prevent infinite requeue loop
      channel.ack(msg);
    }
  });
};