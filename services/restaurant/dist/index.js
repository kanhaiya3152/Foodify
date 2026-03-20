import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import cors from "cors";
import restaurantRoute from "./routes/restuarant.js";
import itemRoute from "./routes/menuitems.js";
dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());
app.use("/api/restaurant", restaurantRoute);
app.use("/api/item", itemRoute);
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
    console.log(`Restaurant service is running on port ${PORT}`);
    connectDB();
});
