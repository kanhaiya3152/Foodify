import express from "express";
import { isAuth, isSeller } from "../middlewares/isAuth.js";
import { addMenuItem, deleteMenuItem, getAllItems, toggleMenuItemAvailability } from "../controllers/menuitem.js";
import uploadFile from "../middlewares/multer.js";
import { fetchSingleRestaurant, getNearbyRestaurant } from "../controllers/restaurant.js";

const router = express.Router();

router.post("/new", isAuth, isSeller,uploadFile, addMenuItem);
router.get("/all/:id", isAuth, getAllItems);
router.delete("/:itemId", isAuth, isSeller, deleteMenuItem);
router.put("/status/:itemId", isAuth, isSeller, toggleMenuItemAvailability);
router.get("/all", isAuth, getNearbyRestaurant);
router.get("/:id", isAuth, fetchSingleRestaurant);

export default router;
