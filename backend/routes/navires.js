const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

const Navire = mongoose.models.navire || mongoose.model("navire", new mongoose.Schema({
  nom:          { type: String, required: true },
  compagnie:    { type: String },
  pavilion:     { type: String },
  type_navire:  { type: String },
  capacite_tpl: { type: Number },
  actif:        { type: Boolean, default: true },
}, { collection: "navires" }));

// GET tous les navires
router.get("/", async (req, res) => {
  try {
    const navires = await Navire.find({ actif: true }).sort({ nom: 1 });
    res.json(navires);
  } catch (err) {
    res.status(500).json({ message: "Erreur serveur", error: err.message });
  }
});

// POST créer un navire
router.post("/", async (req, res) => {
  try {
    const navire = new Navire(req.body);
    await navire.save();
    res.status(201).json(navire);
  } catch (err) {
    res.status(500).json({ message: "Erreur serveur", error: err.message });
  }
});

module.exports = router;