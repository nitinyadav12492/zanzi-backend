// controllers/bookingController.js — Bookings Logic
const Booking = require("../models/Booking");

// POST /api/bookings — create booking
const createBooking = async (req, res) => {
  try {
    const { name, phone, address, serviceType, date, notes } = req.body;
    const booking = await Booking.create({
      user: req.user._id, name, phone, address, serviceType, date, notes,
    });
    res.status(201).json(booking);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// GET /api/bookings/my — logged-in user's bookings
const getMyBookings = async (req, res) => {
  const bookings = await Booking.find({ user: req.user._id }).sort("-createdAt");
  res.json(bookings);
};

// GET /api/bookings — all bookings (admin)
const getAllBookings = async (req, res) => {
  const bookings = await Booking.find()
    .populate("user", "name email phone")
    .sort("-createdAt");
  res.json(bookings);
};

// PUT /api/bookings/:id/status — update status (admin)
const updateBookingStatus = async (req, res) => {
  try {
    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true }
    );
    if (!booking) return res.status(404).json({ message: "Booking not found" });
    res.json(booking);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// DELETE /api/bookings/:id
const deleteBooking = async (req, res) => {
  const booking = await Booking.findByIdAndDelete(req.params.id);
  if (!booking) return res.status(404).json({ message: "Booking not found" });
  res.json({ message: "Booking deleted" });
};

module.exports = { createBooking, getMyBookings, getAllBookings, updateBookingStatus, deleteBooking };