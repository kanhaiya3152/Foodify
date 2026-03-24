import ampq from "amqplib"; // this helps us to connect with rabbitmq
let channel;
export const connectRabbitMQ = async () => {
    const connection = await ampq.connect(process.env.RABBITMQ_URL);
    channel = await connection.createChannel();
    await channel.assertQueue(process.env.PAYMENT_QUEUE, {
        durable: true,
    });
    console.log("🐇 connected to RabbitMQ! [Restaurant service]");
};
export const getChannel = () => channel;
