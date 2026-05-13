// routes/bookingRoutes.js
const express = require("express");
const router  = express.Router();
const {
  createBooking, getMyBookings, getAllBookings,
  updateBookingStatus, deleteBooking,
} = require("../controllers/bookingController");
const { protect, adminOnly } = require("../middleware/authMiddleware");

router.post("/",            protect, createBooking);
router.get("/my",           protect, getMyBookings);
router.get("/",             protect, adminOnly, getAllBookings);
router.put("/:id/status",   protect, adminOnly, updateBookingStatus);
router.delete("/:id",       protect, adminOnly, deleteBooking);

module.exports = router;