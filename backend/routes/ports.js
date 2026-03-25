const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

const Port = mongoose.models.port || mongoose.model("port", new mongoose.Schema({
  nom:              { type: String, required: true },
  code:             { type: String },
  ville:            { type: String },
  pays:             { type: String, default: "Maroc" },
  frais_escale:     { type: Number, required: true },
  taxe_regionale:   { type: Number, default: 0 },   // TR en pourcentage (ex: 3, 4, 8)
  actif:            { type: Boolean, default: true },
}, { collection: "ports" }));

// GET tous les ports
router.get("/", async (req, res) => {
  try {
    const ports = await Port.find({ actif: true }).sort({ nom: 1 });
    res.json(ports);
  } catch (err) {
    res.status(500).json({ message: "Erreur serveur", error: err.message });
  }
});

// POST créer un port
router.post("/", async (req, res) => {
  try {
    const port = new Port(req.body);
    await port.save();
    res.status(201).json(port);
  } catch (err) {
    res.status(500).json({ message: "Erreur serveur", error: err.message });
  }
});

// PATCH mettre à jour un port (taxe_regionale, frais_escale, etc.)
router.patch("/:id", async (req, res) => {
  try {
    const port = await Port.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!port) return res.status(404).json({ message: "Port introuvable" });
    res.json(port);
  } catch (err) {
    res.status(500).json({ message: "Erreur serveur", error: err.message });
  }
});

module.exports = router;