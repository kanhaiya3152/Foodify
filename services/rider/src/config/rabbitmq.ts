import ampq from "amqplib"; // this helps us to connect with rabbitmq

let channel: ampq.Channel;

const reconnectDelay = 5000; // 5 seconds

export const connectRabbitMQ = async (): Promise<void> => {
  try {
    const connection = await ampq.connect(process.env.RABBITMQ_URL!);

    connection.on("error", (err) => {
      console.error("RabbitMQ connection error:", err.message);
    });

    connection.on("close", () => {
      console.warn("RabbitMQ connection closed. Reconnecting in 5s...");
      setTimeout(connectRabbitMQ, reconnectDelay);
    });

    channel = await connection.createChannel();

    channel.on("error", (err) => {
      console.error("RabbitMQ channel error:", err.message);
    });

    await channel.assertQueue(process.env.RIDER_QUEUE!, {
      durable: true,
    });

    await channel.assertQueue(process.env.ORDER_READY_QUEUE!, {
      durable: true,
    });

    console.log("🐇 connected to RabbitMQ! [Rider service]");
  } catch (err: any) {
    console.error("Failed to connect to RabbitMQ:", err.message, `Retrying in ${reconnectDelay / 1000}s...`);
    setTimeout(connectRabbitMQ, reconnectDelay);
  }
};

export const getChannel = () => channel;