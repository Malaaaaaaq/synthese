const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/synthese_db";

async function checkInvoices() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("✅ Connecté à MongoDB");

    const Facture = mongoose.models.facture || mongoose.model("facture", new mongoose.Schema({}, { collection: "factures", strict: false }));
    const Manifeste = mongoose.models.manifeste || mongoose.model("manifeste", new mongoose.Schema({}, { collection: "manifestes", strict: false }));
    const DetailsFacture = mongoose.models.detailsfacture || mongoose.model("detailsfacture", new mongoose.Schema({}, { collection: "detailsfacture", strict: false }));

    const factures = await Facture.find({});
    console.log(`\n📄 Nombre total de factures: ${factures.length}`);
    for (const f of factures) {
      console.log(`- [${f.numero_facture}] Port: ${f.port}, Navire: ${f.navire}, Date: ${f.date_facturation}`);
      if (f.port === "Tan-Tan") {
          const details = await DetailsFacture.find({ id_facture: f._id });
          console.log(`  └─ Détails trouvés: ${details.length} lignes`);
      }
    }

    const manifestes = await Manifeste.find({ port: /Tan-Tan/i });
    console.log(`\n🚢 Manifestes pour Tan-Tan: ${manifestes.length}`);
    manifestes.forEach(m => {
      console.log(`- [${m.n_escale}] Navire: ${m.navire}, Statut: ${m.statut}`);
    });

  } catch (err) {
    console.error("❌ Erreur:", err);
  } finally {
    await mongoose.connection.close();
    process.exit();
  }
}

checkInvoices();
