// routes/serviceRoutes.js
const express = require("express");
const router  = express.Router();
const {
  getServices, getAllServices, getServiceById,
  createService, updateService, deleteService,
} = require("../controllers/serviceController");
const { protect, adminOnly } = require("../middleware/authMiddleware");

router.get("/",           getServices);                          // public
router.get("/all",        protect, adminOnly, getAllServices);   // admin
router.get("/:id",        getServiceById);                       // public
router.post("/",          protect, adminOnly, createService);    // admin
router.put("/:id",        protect, adminOnly, updateService);    // admin
router.delete("/:id",     protect, adminOnly, deleteService);    // admin

module.exports = router;