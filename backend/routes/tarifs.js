const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

const Tarif = mongoose.models.tarif || mongoose.model("tarif", new mongoose.Schema({
  code_marchandise: Number,
  libelle:          String,
  tarif_par_tonne:  Number,
  unite:            { type: String, default: "DH/T" },
  actif:            { type: Boolean, default: true },
}, { collection: "tarifs" }));

// GET tous les tarifs
router.get("/", async (req, res) => {
  try {
    const tarifs = await Tarif.find({ actif: true }).sort({ libelle: 1 });
    res.json(tarifs);
  } catch (err) {
    res.status(500).json({ message: "Erreur serveur", error: err.message });
  }
});

module.exports = router;
module.exports.Tarif = Tarif;