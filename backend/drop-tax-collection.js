require("dotenv").config();
const mongoose = require("mongoose");

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/synthese_db";

async function dropCollection() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB");

    const collections = await mongoose.connection.db.listCollections().toArray();
    const exists = collections.some(col => col.name === "taxeregionale");

    if (exists) {
      await mongoose.connection.db.dropCollection("taxeregionale");
      console.log("Collection 'taxeregionale' dropped successfully.");
    } else {
      console.log("Collection 'taxeregionale' does not exist.");
    }

  } catch (err) {
    console.error("Error dropping collection:", err);
  } finally {
    await mongoose.disconnect();
  }
}

dropCollection();
