import ampq from "amqplib"; // this helps us to connect with rabbitmq

let channel: ampq.Channel;

const reconnectDelay = 5000; // 5 seconds

export const connectRabbitMQ = async (): Promise<void> => {
  try {
    const connection = await ampq.connect(process.env.RABBITMQ_URL!);

    // Handle connection-level errors (e.g. ECONNRESET) without crashing
    connection.on("error", (err) => {
      console.error("RabbitMQ connection error:", err.message);
    });

    // Auto-reconnect when connection closes unexpectedly
    connection.on("close", () => {
      console.warn("RabbitMQ connection closed. Reconnecting in 5s...");
      setTimeout(connectRabbitMQ, reconnectDelay);
    });

    channel = await connection.createChannel();

    // Handle channel-level errors gracefully
    channel.on("error", (err) => {
      console.error("RabbitMQ channel error:", err.message);
    });

    await channel.assertQueue(process.env.PAYMENT_QUEUE!, {
      durable: true,
    });

    console.log("🐇 connected to RabbitMQ!");
  } catch (err: any) {
    console.error("Failed to connect to RabbitMQ:", err.message, `Retrying in ${reconnectDelay / 1000}s...`);
    setTimeout(connectRabbitMQ, reconnectDelay);
  }
};

export const getChannel = () => channel;