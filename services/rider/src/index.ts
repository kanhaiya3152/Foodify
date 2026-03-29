import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import cors from "cors";
import riderRoute from "./routes/rider.js";
import { connectRabbitMQ } from "./config/rabbitmq.js";
import { startOrderReadyConsumer } from "./config/orderReady.consumer.js";

dotenv.config();

await connectRabbitMQ();
startOrderReadyConsumer();

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/rider", riderRoute);

app.listen(process.env.PORT,()=>{
    console.log(`Rider Service is running on port ${process.env.PORT}`);
    connectDB();
})
