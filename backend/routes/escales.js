const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

const Escale = mongoose.models.escale || mongoose.model("escale", new mongoose.Schema({
  numero:        { type: String, required: true, unique: true },
  navire:        { type: String, required: true },
  navire_id:     { type: mongoose.Schema.Types.ObjectId, ref: "navire" },
  port:          { type: String, required: true },
  port_id:       { type: mongoose.Schema.Types.ObjectId, ref: "port" },
  date_arrivee:  { type: Date },
  date_depart:   { type: Date },
  statut_escale: { type: String, enum: ["planifiee", "en_cours", "terminee"], default: "planifiee" },
}, { collection: "escales" }));

// GET toutes les escales
router.get("/", async (req, res) => {
  try {
    const escales = await Escale.find().sort({ date_arrivee: -1 });
    res.json(escales);
  } catch (err) {
    res.status(500).json({ message: "Erreur serveur", error: err.message });
  }
});

// POST créer une escale
router.post("/", async (req, res) => {
  try {
    const escale = new Escale(req.body);
    await escale.save();
    res.status(201).json(escale);
  } catch (err) {
    res.status(500).json({ message: "Erreur serveur", error: err.message });
  }
});

module.exports = router;