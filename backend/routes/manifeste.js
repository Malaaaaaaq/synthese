const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

// ================================================================
//  MODÈLE 1 — detailsmanifeste
//  Stocke les lignes Excel : code + libelle + tonnage
// ================================================================
const detailsSchema = new mongoose.Schema({
  code_marchandises: { type: String },
  libelle: { type: String },
  tonnage: { type: Number },
  manifeste_id: { type: mongoose.Schema.Types.ObjectId, ref: "manifeste" },
}, { collection: "detailsmanifeste" });

const DetailsManifeste =
  mongoose.models.detailsmanifeste ||
  mongoose.model("detailsmanifeste", detailsSchema);

// ================================================================
//  MODÈLE 2 — manifestes
//  Stocke les infos navire + statut + marchandises[]
// ================================================================
const manifesteSchema = new mongoose.Schema({
  n_escale: { type: String },
  navire: { type: String },
  port: { type: String },
  date_arrivee: { type: Date },
  date_depart: { type: Date },
  date_depot: { type: Date, default: Date.now },
  statut: {
    type: String,
    enum: ["en_attente", "facture"],
    default: "en_attente",
  },
  date_facturation: { type: Date },
  marchandises: { type: [mongoose.Schema.Types.Mixed], default: [] },
}, { collection: "manifestes" });

const Manifeste =
  mongoose.models.manifeste ||
  mongoose.model("manifeste", manifesteSchema);


// ================================================================
//  UTILITAIRES — Nettoyage des données Excel
// ================================================================

// Nettoie une clé : supprime espaces + minuscules
// "  CODE MARCHANDISES  " → "code marchandises"
function nettoyerCle(cle) {
  if (!cle) return "";
  return String(cle).trim().toLowerCase();
}

// Construit un objet marchandise propre depuis une ligne Excel
function construireLigne(headers, row) {
  const doc = {};
  headers.forEach((header, index) => {
    if (!header) return;
    const valeur = row[index];
    if (valeur !== null && valeur !== undefined && valeur !== "") {
      doc[header] = valeur;
    }
  });
  return doc;
}

// Extrait le code marchandise depuis un objet (gère tous les formats)
function extraireCode(doc) {
  return doc["code marchandises"]
    || doc["code_marchandises"]
    || doc["code marchandise"]
    || doc["code"]
    || null;
}

// Extrait le libellé depuis un objet
function extraireLibelle(doc) {
  return doc["libelle"] || doc["designation"] || null;
}

// Extrait le tonnage depuis un objet
function extraireTonnage(doc) {
  const val = doc["tonnage"] || doc["poids"] || 0;
  return parseFloat(val) || 0;
}


// ================================================================
//  POST /api/manifeste/import
//  Upload Excel → sauvegarde dans detailsmanifeste + manifestes
// ================================================================
router.post("/import", async (req, res) => {
  try {
    const { excelData, navireInfo } = req.body;

    if (!excelData || excelData.length < 2) {
      return res.status(400).json({ message: "Données insuffisantes ou fichier vide." });
    }

    // ── 1. Nettoyer les headers Excel et récupérer les lignes ──
    const headers = excelData[0].map(h => (h ? String(h).trim().toLowerCase() : ""));
    const rows = excelData.slice(1);
    
    console.log("📑 Headers Excel détectés:", headers);
    console.log("📊 Première ligne de données:", rows[0]);

    // ── 2. Construire les marchandises ──────────────────────────
    const marchandises = rows.map(row => {
      const doc = {};
      headers.forEach((header, index) => {
        if (!header) return;
        const valeur = row[index];
        if (valeur !== null && valeur !== undefined && valeur !== "") {
          doc[header] = valeur;
        }
      });
      return doc;
    }).filter(doc => Object.keys(doc).length > 0);

    if (marchandises.length === 0) {
      return res.status(400).json({ message: "Aucune marchandise valide trouvée." });
    }

    // ── 3. Créer le manifeste d'abord (pour avoir son _id) ─────
    const nouveauManifeste = new Manifeste({
      n_escale: navireInfo?.escale || "Inconnu",
      navire: navireInfo?.navire || "Inconnu",
      port: navireInfo?.port || "Inconnu",
      date_arrivee: navireInfo?.dateArrivee || null,
      date_depart: navireInfo?.dateDepart || null,
      date_depot: new Date(),
      statut: "en_attente",
      marchandises: marchandises,
    });

    await nouveauManifeste.save();

    // ── 4. Insérer dans detailsmanifeste avec manifeste_id ─────
    console.log("📊 Traitement de", marchandises.length, "marchandises pour detailsmanifeste");
    
    const detailsDocs = marchandises.map((doc, index) => {
      // Extraire de manière flexible (selon vos noms de colonnes)
      // Gère: code marchandises, code_marchandises, code marchandise, code, code_marchandise, codemarchandise
      const code = doc["code marchandises"] 
        || doc["code_marchandises"] 
        || doc["code marchandise"] 
        || doc["code"] 
        || doc["code_marchandise"] 
        || doc["codemarchandise"]
        || doc["code_march"]
        || "";
      
      const libelle = doc["libelle"] 
        || doc["libellé"] 
        || doc["designation"] 
        || doc["description"]
        || doc["nom"]
        || "";
      
      const tonnageStr = doc["tonnage"] 
        || doc["poids"] 
        || doc["tonne"] 
        || doc["quantite"]
        || doc["qte"]
        || "0";
      
      const tonnage = parseFloat(String(tonnageStr).replace(',', '.')) || 0;

      // Convertir le code en string (accepte "M001" ou "123")
      const codeString = code !== null && code !== undefined ? String(code).trim() : "";

      if (index < 3) {
        console.log(`   Ligne ${index}: code="${codeString}", libelle="${libelle}", tonnage=${tonnage}`);
      }

      return {
        code_marchandises: codeString,
        libelle: String(libelle).trim(),
        tonnage: tonnage,
        manifeste_id: nouveauManifeste._id,
      };
    }).filter(doc => doc.code_marchandises !== "" || doc.libelle !== ""); // Filtrer les lignes vides

    console.log("📋 Documents à insérer dans detailsmanifeste:", detailsDocs.length);
    
    if (detailsDocs.length > 0) {
      const insertResult = await DetailsManifeste.insertMany(detailsDocs);
      console.log("✅ Insertion detailsmanifeste réussie:", insertResult.length, "documents");
    } else {
      console.warn("⚠️ Aucun document à insérer dans detailsmanifeste");
    }

    res.status(200).json({
      message: `${marchandises.length} marchandises insérées avec succès.`,
      count: marchandises.length,
      manifeste_id: nouveauManifeste._id,
    });

  } catch (error) {
    console.error("Erreur d'import:", error);
    res.status(500).json({ message: "Erreur lors de l'insertion en base de données.", error: error.message });
  }
});


// ================================================================
//  GET /api/manifeste/all
// ================================================================
router.get("/all", async (req, res) => {
  try {
    const manifestes = await Manifeste.find().sort({ date_depot: -1 });
    console.log(`📋 ${manifestes.length} manifestes trouvés`);
    res.json(manifestes);
  } catch (error) {
    console.error("❌ Erreur:", error);
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
});


// ================================================================
//  PUT /api/manifeste/facturer/:id
// ================================================================
router.put("/facturer/:id", async (req, res) => {
  try {
    const manifeste = await Manifeste.findByIdAndUpdate(
      req.params.id,
      { statut: "facture", date_facturation: new Date() },
      { new: true }
    );

    if (!manifeste) {
      return res.status(404).json({ message: "Manifeste introuvable" });
    }

    console.log(`✅ Manifeste ${manifeste.n_escale} → facturé`);
    res.json({ message: "Facture générée avec succès", manifeste });

  } catch (error) {
    console.error("❌ Erreur:", error);
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
});


module.exports = router;