import express from "express";
import dotenv from "dotenv"
import connectDB from "./config/db.js";
import cors from "cors";
import restaurantRoute from "./routes/restuarant.js"
import itemRoute from "./routes/menuitems.js";
import cartRoute from "./routes/carts.js";
import addressRoute from "./routes/address.js";
import orderRoute from "./routes/order.js";
import { connectRabbitMQ } from "./config/rabbitmq.js";
import { startPaymentConsumer } from "./config/payment.producer.js";

dotenv.config();

await connectRabbitMQ();
startPaymentConsumer();

const app = express();

app.use(cors());

app.use(express.json());

app.use("/api/restaurant", restaurantRoute);
app.use("/api/item", itemRoute);
app.use("/api/cart", cartRoute);
app.use("/api/address", addressRoute);
app.use("/api/order", orderRoute);

const PORT = process.env.PORT || 5001;

app.listen(PORT,() => {
  console.log(`Restaurant service is running on port ${PORT}`);
  connectDB();
});
