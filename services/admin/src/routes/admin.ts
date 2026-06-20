import express from "express";
import { isAdmin, isAuth } from "../middlewares/isAuth.js";
import {
  getPendingRestaurant,
  getPendingRiders,
  verifyRestaurant,
  verifyRider,
  getAllRestaurants,
  getAllRiders,
  getDashboardStats,
} from "../controllers/admin.js";

const router = express.Router();

// Existing routes (kept for backwards compatibility)
router.get("/admin/restaurant/pending", isAuth, isAdmin, getPendingRestaurant);
router.get("/admin/rider/pending", isAuth, isAdmin, getPendingRiders);

// New routes
router.get("/admin/restaurant/all", isAuth, isAdmin, getAllRestaurants);
router.get("/admin/rider/all", isAuth, isAdmin, getAllRiders);
router.get("/admin/stats", isAuth, isAdmin, getDashboardStats);

// Verify routes
router.patch("/verify/rider/:id", isAuth, isAdmin, verifyRider);
router.patch("/verify/restaurant/:id", isAuth, isAdmin, verifyRestaurant);

export default router;