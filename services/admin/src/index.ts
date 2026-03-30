import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import adminRouter from "./routes/admin.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/v1", adminRouter);

app.listen(process.env.PORT, () => {
    console.log(`Admin service is running on port ${process.env.PORT}`);
});