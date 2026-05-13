// controllers/serviceController.js — Services CRUD
const Service = require("../models/Service");

// GET all active services
const getServices = async (req, res) => {
  const services = await Service.find({ isActive: true }).sort("category");
  res.json(services);
};

// GET all services (admin)
const getAllServices = async (req, res) => {
  const services = await Service.find().sort("-createdAt");
  res.json(services);
};

// GET single service
const getServiceById = async (req, res) => {
  const service = await Service.findById(req.params.id);
  if (!service) return res.status(404).json({ message: "Service not found" });
  res.json(service);
};

// POST create service (admin)
const createService = async (req, res) => {
  try {
    const service = await Service.create(req.body);
    res.status(201).json(service);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// PUT update service (admin)
const updateService = async (req, res) => {
  try {
    const service = await Service.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!service) return res.status(404).json({ message: "Service not found" });
    res.json(service);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// DELETE service (admin)
const deleteService = async (req, res) => {
  const service = await Service.findByIdAndDelete(req.params.id);
  if (!service) return res.status(404).json({ message: "Service not found" });
  res.json({ message: "Service deleted" });
};

module.exports = { getServices, getAllServices, getServiceById, createService, updateService, deleteService };