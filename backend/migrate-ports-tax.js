require("dotenv").config();
const mongoose = require("mongoose");

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/synthese_db";

const Port = mongoose.models.port || mongoose.model("port", new mongoose.Schema({
  nom: String,
  taxe_regionale: { type: Number, default: 0 }
}, { collection: "ports" }));

const TAX_RATES = {
  "Casablanca": 3,
  "Mohammedia": 3,
  "Jorf Lasfar": 3,
  "Tanger": 4,
  "Agadir": 4,
  "Kénitra": 8,
  "Nador": 2,
  "Safi": 3,
  "Tan-Tan": 2,
  "Laâyoune": 2,
  "Dakhla": 2,
  "Al Hoceima": 2
};

async function migrate() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB");

    const ports = await Port.find({});
    console.log(`Found ${ports.length} ports.`);

    for (const port of ports) {
      let tax = 0;
      for (const [name, rate] of Object.entries(TAX_RATES)) {
        if (port.nom.toLowerCase().includes(name.toLowerCase())) {
          tax = rate;
          break;
        }
      }
      
      await Port.updateOne({ _id: port._id }, { $set: { taxe_regionale: tax } });
      console.log(`Updated ${port.nom}: taxe_regionale = ${tax}%`);
    }

    console.log("Migration completed successfully.");
  } catch (err) {
    console.error("Migration failed:", err);
  } finally {
    await mongoose.disconnect();
  }
}

migrate();
