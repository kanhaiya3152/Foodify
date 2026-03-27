import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import cors from "cors";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.listen(process.env.PORT,()=>{
    console.log(`Rider Service is running on port ${process.env.PORT}`);
    connectDB();
})
