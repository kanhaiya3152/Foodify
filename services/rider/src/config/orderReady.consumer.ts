import axios from "axios";
import { Rider } from "../model/Rider.js";
import { getChannel } from "./rabbitmq.js"


export const startOrderReadyConsumer = async() => {
    const channel = getChannel();

    console.log("Starting to consume from: ", process.env.ORDER_READY_QUEUE);

    channel.consume(process.env.ORDER_READY_QUEUE!, async(msg) => {
        if(!msg) return;

        try {
            console.log("Received message", msg.content.toString());

            const event = JSON.parse(msg.content.toString());

            console.log("event type", event.type);

            if(event.type !== "ORDER_READY_FOR_RIDER"){
                channel.ack(msg);
                return;
            }
            const {orderId, restaurantId, location} = event.data;

            const riders = await Rider.find({
                isAvailble: true,
                isVerified: true,
                location: {
                    $near: {
                        $geometry: location,
                        $maxDistance: 500,
                    },
                },
            });

            console.log(`Found ${riders.length} nearby riders`);

            if(riders.length === 0){
                console.log("No riders are available nearby!");
                channel.ack(msg);
                return;
            }

            for(const rider of riders){
                try {
                    await axios.post(`${process.env.REALTIME_SERVICE}/api/internal/emit`,{
                        event: "order:available",
                        room: `user:${rider.userId}`,
                        payload: {orderId, restaurantId},
                    },{
                        headers:{
                            "x-internal-key": process.env.INTERNAL_SERVICE_KEY,
                        }
                    })
                    console.log(`Notified rider ${rider.userId} successfully`);
                } catch (error) {
                    console.log(`Failed to notify rider ${rider.userId}`, error);
                }
            }
            channel.ack(msg);
            console.log("Message acknowledge");
        } catch (error) {
            console.log("OrderReady consumer error: ", error);
        }
    })
}