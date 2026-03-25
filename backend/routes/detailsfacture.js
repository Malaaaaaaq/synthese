const express  = require("express");
const router   = express.Router();
const mongoose = require("mongoose");

// ================================================================
//  MODÈLE DETAILSFACTURE
// ================================================================
const DetailsFactureSchema = new mongoose.Schema({
  id_facture:            { type: mongoose.Schema.Types.ObjectId, ref: "facture",  required: true },
  id_tarif:              { type: mongoose.Schema.Types.ObjectId, ref: "tarif",    required: false },
  n_ligne_facture:       { type: Number },
  categorie_marchandise: { type: String },
  tonnage:               { type: Number },
  tarif:                 { type: Number },
  HT:                    { type: Number },  // tonnage × tarif
  TVA:                   { type: Number },  // HT × 20%
  TTC:                   { type: Number },  // HT + TVA
  TR:                    { type: Number },  // TTC + frais port (dernière ligne)
}, { collection: "detailsfacture" });

const DetailsFacture = mongoose.models.detailsfacture ||
  mongoose.model("detailsfacture", DetailsFactureSchema);

// ================================================================
//  MODÈLE TARIF (pour trouver id_tarif selon libellé)
// ================================================================
const Tarif = mongoose.models.tarif || mongoose.model("tarif",
  new mongoose.Schema({
    code_marchandise: Number,
    libelle:          String,
    tarif_par_tonne:  Number,
    actif:            { type: Boolean, default: true },
  }, { collection: "tarifs" })
);

// ================================================================
//  FONCTION : Trouver le tarif selon le libellé de marchandise
//  Les tarifs sont différents selon la catégorie !
// ================================================================
async function trouverTarifParLibelle(libelle) {
  if (!libelle) return null;
  const lib    = libelle.toLowerCase().trim();
  const tarifs = await Tarif.find({ actif: true });

  for (const t of tarifs) {
    if (!t.libelle) continue;
    const tarifLib  = t.libelle.toLowerCase();
    const motsTarif = tarifLib.split(/[\s\/\-]+/).filter(m => m.length > 2);
    const motsLib   = lib.split(/[\s\/\-]+/).filter(m => m.length > 2);

    const match =
      motsTarif.some(mot => lib.includes(mot)) ||
      motsLib.some(mot => tarifLib.includes(mot));

    if (match) return t;
  }
  return { _id: null, tarif_par_tonne: 35 };
}

// ================================================================
//  GET /api/detailsfacture/:id_facture
//  Récupérer les détails d'une facture
// ================================================================
router.get("/:id_facture", async (req, res) => {
  try {
    const details = await DetailsFacture
      .find({ id_facture: req.params.id_facture })
      .populate("id_tarif", "libelle tarif_par_tonne code_marchandise")
      .sort({ n_ligne_facture: 1 });
    res.json(details);
  } catch (err) {
    res.status(500).json({ message: "Erreur serveur", error: err.message });
  }
});

// ================================================================
//  POST /api/detailsfacture
//  Créer les détails d'une facture avec calculs automatiques
// ================================================================
router.post("/", async (req, res) => {
  try {
    const { id_facture, lignes, frais_port } = req.body;

    if (!id_facture || !lignes || lignes.length === 0) {
      return res.status(400).json({ message: "id_facture et lignes sont requis" });
    }

    const detailsDocs = [];

    for (let i = 0; i < lignes.length; i++) {
      const ligne = lignes[i];

      // Trouver le tarif depuis la DB selon le libellé
      const tarifDoc    = await trouverTarifParLibelle(ligne.libelle);
      const tarifValeur = tarifDoc?.tarif_par_tonne || ligne.tarif || 35;
      const tonnage     = parseFloat(ligne.tonnage || 0);

      // ── Calculs automatiques ──────────────────────────────
      const HT  = tonnage * tarifValeur;
      const TVA = HT * 0.20;
      const TTC = HT + TVA;
      // TR = TTC + frais_port uniquement sur la dernière ligne
      const TR  = i === lignes.length - 1 ? TTC + (frais_port || 0) : TTC;

      detailsDocs.push({
        id_facture,
        id_tarif:              tarifDoc?._id || null,
        n_ligne_facture:       i + 1,
        categorie_marchandise: ligne.libelle || "—",
        tonnage,
        tarif:                 tarifValeur,
        HT:                    Math.round(HT  * 100) / 100,
        TVA:                   Math.round(TVA * 100) / 100,
        TTC:                   Math.round(TTC * 100) / 100,
        TR:                    Math.round(TR  * 100) / 100,
      });
    }

    const inseres = await DetailsFacture.insertMany(detailsDocs);
    console.log(`✅ ${inseres.length} détails facture insérés`);
    res.status(201).json(inseres);

  } catch (err) {
    console.error("❌ Erreur:", err);
    res.status(500).json({ message: "Erreur serveur", error: err.message });
  }
});

module.exports = router;
module.exports.DetailsFacture        = DetailsFacture;
module.exports.trouverTarifParLibelle = trouverTarifParLibelle;