/**
 * seed-taxe.js — Mise à jour taxe régionale (TR)
 * Règles :
 *   Mohammadia, Casablanca, Jorf Lasfar → 3%
 *   Tanger, Agadir                      → 4%
 *   Kénitra                             → 8%
 *
 * Lancer : node seed-taxe.js
 */
require("dotenv").config();
const mongoose = require("mongoose");

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/synthese_db";

// Schéma ports
const Port = mongoose.model("port", new mongoose.Schema({
  nom:            String,
  taxe_regionale: { type: Number, default: 0 },
  frais_escale:   Number,
  actif:          Boolean,
}, { collection: "ports" }));

// ── Taux TR selon vos exigences ────────────────────────────────
const TAUX = [
  { mots: ["mohamm"],           taux: 3 },
  { mots: ["casa"],             taux: 3 },
  { mots: ["jorf"],             taux: 3 },
  { mots: ["tanger"],           taux: 4 },
  { mots: ["agadir"],           taux: 4 },
  { mots: ["kenitra", "kénitra"], taux: 8 },
  { mots: ["nador"],            taux: 2 },
  { mots: ["safi"],             taux: 3 },
  { mots: ["tantan", "tan-tan"], taux: 2 },
  { mots: ["laayoune", "laâyoune"], taux: 2 },
  { mots: ["dakhla"],           taux: 2 },
  { mots: ["houceima", "hoceima"], taux: 2 },
];

function getTaux(nom) {
  const n = (nom || "").toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  for (const { mots, taux } of TAUX) {
    if (mots.some(m => n.includes(m))) return taux;
  }
  return 0;
}

async function seed() {
  await mongoose.connect(MONGO_URI);
  console.log("✅ Connecté à MongoDB —", MONGO_URI);

  // ── 1. Mettre à jour taxe_regionale dans la collection ports ───
  const ports = await Port.find({});
  console.log(`📦 ${ports.length} port(s) trouvés dans la collection 'ports'`);

  for (const p of ports) {
    const taux = getTaux(p.nom);
    await Port.updateOne({ _id: p._id }, { $set: { taxe_regionale: taux } });
    console.log(`  → ${p.nom.padEnd(15)} : taxe_regionale = ${taux}%`);
  }

  console.log("\n✅ Mise à jour terminée !");
  await mongoose.disconnect();
}

seed().catch(err => {
  console.error("❌ Erreur :", err.message);
  process.exit(1);
});
