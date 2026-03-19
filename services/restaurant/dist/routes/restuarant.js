import express from "express";
import { isAuth, isSeller } from "../middlewares/isAuth.js";
import { addRestraunt, fetchMyRestaurant } from "../controllers/restaurant.js";
import uploadFile from "../middlewares/multer.js";
const router = express.Router();
router.post("/new", isAuth, isSeller, uploadFile, addRestraunt);
router.get("/my", isAuth, isSeller, fetchMyRestaurant);
export default router;
