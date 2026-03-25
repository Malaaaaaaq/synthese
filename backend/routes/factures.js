const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

const Port = mongoose.models.port || mongoose.model("port", new mongoose.Schema({
  nom: String,
  taxe_regionale: Number
}, { collection: "ports" }));

// ── Modèle Facture ────────────────────────────────────────────────
const Facture = mongoose.models.facture || mongoose.model("facture", new mongoose.Schema({
  numero_facture: { type: String, unique: true },
  manifeste_id: { type: mongoose.Schema.Types.ObjectId, ref: "manifeste" },
  navire: { type: String },
  n_escale: { type: String },
  port: { type: String },
  port_id: { type: mongoose.Schema.Types.ObjectId, ref: "port" },
  date_arrivee: { type: Date },
  date_depart: { type: Date },
  lignes: [{
    libelle: { type: String },
    tonnage: { type: Number },
    tarif: { type: Number },
    montant_ht: { type: Number },
  }],
  total_ht: { type: Number },
  frais_port: { type: Number },
  sous_total_ht: { type: Number },
  tr_2: { type: Number },
  tva: { type: Number },
  total_ttc: { type: Number },
  // ── Taxe régionale ──────────────────────────────────────────
  taux_regional: { type: Number },   // ex: 3 (%)
  montant_taxe_reg: { type: Number },   // total_ttc × taux/100
  total_net: { type: Number },   // total_ttc + montant_taxe_reg
  // ────────────────────────────────────────────────────────────
  agent_facturation: { type: String },
  date_facturation: { type: Date, default: Date.now },
  statut: { type: String, enum: ["emise", "payee"], default: "emise" },
}, { collection: "factures" }));

// ── Modèle DetailsFacture ─────────────────────────────────────────
const DetailsFacture = mongoose.models.detailsfacture || mongoose.model("detailsfacture",
  new mongoose.Schema({
    id_facture: { type: mongoose.Schema.Types.ObjectId, ref: "facture", required: true },
    id_tarif: { type: mongoose.Schema.Types.ObjectId, ref: "tarif", default: null },
    n_ligne_facture: { type: Number },
    categorie_marchandise: { type: String },
    tonnage: { type: Number },
    tarif: { type: Number },
    HT: { type: Number },
    TVA: { type: Number },
    TTC: { type: Number },
    TR: { type: Number },
  }, { collection: "detailsfacture" })
);

// ── Modèle Tarif ─────────────────────────────────────────────────
const Tarif = mongoose.models.tarif || mongoose.model("tarif",
  new mongoose.Schema({
    code_marchandise: Number,
    libelle: String,
    tarif_par_tonne: Number,
    actif: { type: Boolean, default: true },
  }, { collection: "tarifs" })
);

// ── Trouver taxe régionale dans la collection ports ──────────────
async function trouverTaxeParPort(nomPort) {
  if (!nomPort) return 0;
  const nomLower = nomPort.toLowerCase().trim();

  // On cherche le port par son nom (insensible à la casse)
  const port = await Port.findOne({
    nom: { $regex: new RegExp(`^${nomLower}$`, "i") }
  });

  if (port) {
    return port.taxe_regionale || 0;
  }

  // Fallback si pas de match exact : recherche floue
  const ports = await Port.find({ actif: true });
  for (const p of ports) {
    if (p.nom.toLowerCase().includes(nomLower) || nomLower.includes(p.nom.toLowerCase())) {
      return p.taxe_regionale || 0;
    }
  }
  return 0; // aucune taxe trouvée
}

// ── Trouver tarif selon libellé de marchandise ────────────────────
async function trouverTarifParLibelle(libelle) {
  if (!libelle) return null;
  const lib = libelle.toLowerCase().trim();
  const tarifs = await Tarif.find({ actif: true });

  for (const t of tarifs) {
    if (!t.libelle) continue;
    const tarifLib = t.libelle.toLowerCase();
    const motsTarif = tarifLib.split(/[\s\/\-]+/).filter(m => m.length > 2);
    const motsLib = lib.split(/[\s\/\-]+/).filter(m => m.length > 2);
    const match =
      motsTarif.some(mot => lib.includes(mot)) ||
      motsLib.some(mot => tarifLib.includes(mot));
    if (match) return t;
  }
  return { _id: null, tarif_par_tonne: 35 };
}

// ── Générer numéro facture unique ─────────────────────────────────
function genererNumero(escale) {
  const annee = new Date().getFullYear();
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `FACT-${escale || "000"}-${annee}-${rand}`;
}

// ── GET toutes les factures ───────────────────────────────────────
router.get("/", async (req, res) => {
  try {
    const factures = await Facture.find().sort({ date_facturation: -1 });
    res.json(factures);
  } catch (err) {
    res.status(500).json({ message: "Erreur serveur", error: err.message });
  }
});

// ── GET une facture par id ────────────────────────────────────────
router.get("/:id", async (req, res) => {
  try {
    const facture = await Facture.findById(req.params.id);
    if (!facture) return res.status(404).json({ message: "Facture introuvable" });
    res.json(facture);
  } catch (err) {
    res.status(500).json({ message: "Erreur serveur", error: err.message });
  }
});

// ── POST créer une facture + détails + taxe régionale ────────────
router.post("/", async (req, res) => {
  try {
    const {
      manifeste_id, navire, n_escale, port,
      date_arrivee, date_depart,
      lignes,
      total_ht, frais_port, sous_total_ht, tr_2, tva, total_ttc,
      agent_facturation,
    } = req.body;

    // ── 1. Trouver la taxe régionale selon le port ───────────────
    const tauxRegional = await trouverTaxeParPort(port);
    const montantTaxeReg = req.body.montant_taxe_reg || Math.round((sous_total_ht * tauxRegional / 100) * 100) / 100;
    const totalNet = req.body.total_ttc;

    console.log(`📍 Port: ${port} | Taxe régionale: ${tauxRegional}% | Montant: ${montantTaxeReg} DH`);

    // ── 2. Créer la facture avec taxe régionale ──────────────────
    const facture = new Facture({
      numero_facture: genererNumero(n_escale),
      manifeste_id, navire, n_escale, port,
      date_arrivee, date_depart,
      lignes,
      total_ht, frais_port, sous_total_ht, tva, total_ttc,
      // Taxe régionale
      taux_regional: tauxRegional,
      montant_taxe_reg: montantTaxeReg,
      total_net: totalNet,
      agent_facturation,
    });
    await facture.save();
    console.log(`✅ Facture créée : ${facture.numero_facture}`);

    // ── 3. Créer les détails avec calculs automatiques ───────────
    if (lignes && lignes.length > 0) {
      const detailsDocs = [];

      for (let i = 0; i < lignes.length; i++) {
        const ligne = lignes[i];
        const tarifDoc = await trouverTarifParLibelle(ligne.libelle);
        const tarifValeur = tarifDoc?.tarif_par_tonne || ligne.tarif || 35;
        const tonnage = parseFloat(ligne.tonnage || 0);

        const HT_base = tonnage * tarifValeur;
        const HT_total = i === lignes.length - 1 ? HT_base + (frais_port || 0) : HT_base;
        const TVA = HT_total * 0.20;
        const TR = HT_total * (tauxRegional / 100);
        const TTC = HT_total + TVA + TR;

        detailsDocs.push({
          id_facture: facture._id,
          id_tarif: tarifDoc?._id || null,
          n_ligne_facture: i + 1,
          categorie_marchandise: ligne.libelle || "—",
          tonnage,
          tarif: tarifValeur,
          HT: Math.round(HT_total * 100) / 100,
          TVA: Math.round(TVA * 100) / 100,
          TTC: Math.round(TTC * 100) / 100,
          TR: Math.round(TR * 100) / 100,
        });

        console.log(`   Ligne ${i + 1}: ${ligne.libelle} | ${tonnage}T × ${tarifValeur} DH/T = ${Math.round(HT_total)} DH HT`);
      }

      await DetailsFacture.insertMany(detailsDocs);
      console.log(`✅ ${detailsDocs.length} ligne(s) insérée(s) dans detailsfacture`);
    }

    res.status(201).json(facture);
  } catch (err) {
    console.error("❌ Erreur:", err);
    res.status(500).json({ message: "Erreur serveur", error: err.message });
  }
});

module.exports = router;