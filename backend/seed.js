// ================================================================
//  seed.js — Peuplement base de données synthese_db
//  Lancer avec : node seed.js
// ================================================================

const mongoose = require("mongoose");
const dotenv   = require("dotenv");
dotenv.config();

mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/synthese_db")
  .then(() => console.log("✅ Connecté à MongoDB — synthese_db"))
  .catch((err) => { console.error("❌ Erreur connexion:", err); process.exit(1); });

// ── SCHÉMAS ───────────────────────────────────────────────────────

const PortSchema = new mongoose.Schema({
  nom:          String,
  code:         String,
  ville:        String,
  pays:         { type: String, default: "Maroc" },
  frais_escale: Number,
  taxe_regionale: { type: Number, default: 0 },
  region:       String,   // région administrative
  actif:        { type: Boolean, default: true },
}, { collection: "ports" });

const NavireSchema = new mongoose.Schema({
  nom:          String,
  compagnie:    String,
  pavilion:     String,
  type_navire:  String,
  capacite_tpl: Number,
  actif:        { type: Boolean, default: true },
}, { collection: "navires" });

const EscaleSchema = new mongoose.Schema({
  numero:        String,
  navire:        String,
  navire_id:     mongoose.Schema.Types.ObjectId,
  port:          String,
  port_id:       mongoose.Schema.Types.ObjectId,
  date_arrivee:  Date,
  date_depart:   Date,
  statut_escale: { type: String, default: "planifiee" },
}, { collection: "escales" });

const TarifSchema = new mongoose.Schema({
  code_marchandise: Number,
  libelle:          String,
  tarif_par_tonne:  Number,
  unite:            { type: String, default: "DH/T" },
  actif:            { type: Boolean, default: true },
}, { collection: "tarifs" });

// NOTE: La collection "marchandises" a été supprimée - utilisez "tarifs" à la place


// ================================================================
//  DONNÉES
// ================================================================

// ── 1. PORTS ANP ─────────────────────────────────────────────────
const ports = [
  { nom: "Nador",       code: "MANAD", ville: "Nador",      region: "Oriental",              frais_escale: 2800, taxe_regionale: 2 },
  { nom: "Al Hoceima",  code: "MAAHO", ville: "Al Hoceima", region: "Tanger-Tétouan-Al Hoceima", frais_escale: 2200, taxe_regionale: 2 },
  { nom: "Kénitra",     code: "MAKEN", ville: "Kénitra",    region: "Rabat-Salé-Kénitra",    frais_escale: 2600, taxe_regionale: 8 },
  { nom: "Casablanca",  code: "MACAS", ville: "Casablanca", region: "Casablanca-Settat",      frais_escale: 5000, taxe_regionale: 3 },
  { nom: "Jorf Lasfar", code: "MAJLF", ville: "El Jadida",  region: "Casablanca-Settat",      frais_escale: 3500, taxe_regionale: 3 },
  { nom: "Safi",        code: "MASAF", ville: "Safi",       region: "Marrakech-Safi",         frais_escale: 2500, taxe_regionale: 3 },
  { nom: "Agadir",      code: "MAAGA", ville: "Agadir",     region: "Souss-Massa",            frais_escale: 3000, taxe_regionale: 4 },
  { nom: "Tan-Tan",     code: "MATAN", ville: "Tan-Tan",    region: "Guelmim-Oued Noun",      frais_escale: 1800, taxe_regionale: 2 },
  { nom: "Laâyoune",   code: "MALAA", ville: "Laâyoune",  region: "Laâyoune-Sakia El Hamra",frais_escale: 2000, taxe_regionale: 2 },
  { nom: "Dakhla",      code: "MADKH", ville: "Dakhla",     region: "Dakhla-Oued Ed-Dahab",   frais_escale: 1600, taxe_regionale: 2 },
  { nom: "Mohammedia",  code: "MAMOH", ville: "Mohammedia", region: "Casablanca-Settat",      frais_escale: 3200, taxe_regionale: 3 },
  { nom: "Essaouira",   code: "MAESU", ville: "Essaouira",  region: "Marrakech-Safi",         frais_escale: 2100, taxe_regionale: 3 },
];

// ── 2. NAVIRES ────────────────────────────────────────────────────
const navires = [
  { nom: "MSC DIANA",      compagnie: "MSC",         pavilion: "Panama",    type_navire: "Porte-conteneurs", capacite_tpl: 150000 },
  { nom: "CMA CGM ATLAS",  compagnie: "CMA CGM",     pavilion: "France",    type_navire: "Porte-conteneurs", capacite_tpl: 200000 },
  { nom: "MAERSK EVER",    compagnie: "Maersk",      pavilion: "Danemark",  type_navire: "Vraquier",         capacite_tpl: 180000 },
  { nom: "EVER GIVEN",     compagnie: "Evergreen",   pavilion: "Panama",    type_navire: "Porte-conteneurs", capacite_tpl: 220000 },
  { nom: "COSCO SHIPPING", compagnie: "COSCO",       pavilion: "Chine",     type_navire: "Vraquier",         capacite_tpl: 160000 },
  { nom: "KAH JIF",        compagnie: "ANP",         pavilion: "Maroc",     type_navire: "Vraquier",         capacite_tpl: 90000  },
  { nom: "JML UDF",        compagnie: "ANP",         pavilion: "Maroc",     type_navire: "Pétrolier",        capacite_tpl: 75000  },
];

// ── 3. TARIFS ─────────────────────────────────────────────────────
const tarifs = [
  { code_marchandise: 27.14, libelle: "Bitume de pétrole",     tarif_par_tonne: 45 },
  { code_marchandise: 27.01, libelle: "Houilles / Charbon",    tarif_par_tonne: 20 },
  { code_marchandise: 27.10, libelle: "Huiles de pétrole",     tarif_par_tonne: 50 },
  { code_marchandise: 31.02, libelle: "Engrais azotés",        tarif_par_tonne: 35 },
  { code_marchandise: 31.04, libelle: "Engrais potassiques",   tarif_par_tonne: 35 },
  { code_marchandise: 10.01, libelle: "Blé / Céréales",        tarif_par_tonne: 25 },
  { code_marchandise: 17.01, libelle: "Sucre de canne",        tarif_par_tonne: 40 },
  { code_marchandise: 25.23, libelle: "Ciment Portland",       tarif_par_tonne: 30 },
  { code_marchandise: 72.14, libelle: "Barres en fer / acier", tarif_par_tonne: 60 },
  { code_marchandise: 89.06, libelle: "Conteneurs",            tarif_par_tonne: 80 },
  { code_marchandise: 26.01, libelle: "Minerais de fer",       tarif_par_tonne: 22 },
  { code_marchandise: 15.07, libelle: "Huile de soja",         tarif_par_tonne: 45 },
  { code_marchandise: 28.04, libelle: "Produits chimiques",    tarif_par_tonne: 70 },
  { code_marchandise: 44.07, libelle: "Bois sciés",            tarif_par_tonne: 50 },
  { code_marchandise: 55.90, libelle: "Fibres synthétiques",   tarif_par_tonne: 35 },
];

// ── 4. MARCHANDISES ───────────────────────────────────────────────
// SUPPRIMÉ: Utilisez la collection "tarifs" pour les tarifs par marchandise
// Les données de manifeste vont dans "detailsmanifeste"

// ================================================================
//  FONCTION PRINCIPALE
// ================================================================
async function seed() {
  try {
    const Port          = mongoose.models.port          || mongoose.model("port",          PortSchema);
    const Navire        = mongoose.models.navire        || mongoose.model("navire",        NavireSchema);
    const Escale        = mongoose.models.escale        || mongoose.model("escale",        EscaleSchema);
    const Tarif         = mongoose.models.tarif         || mongoose.model("tarif",         TarifSchema);

    // ── Vider les collections ──────────────────────────────────────
    await Port.deleteMany({});
    await Navire.deleteMany({});
    await Escale.deleteMany({});
    await Tarif.deleteMany({});
    console.log("🗑️  Collections vidées");

    // ── Insérer ports ──────────────────────────────────────────────
    const portsInseres = await Port.insertMany(ports);
    console.log(`✅ ${portsInseres.length} ports ANP insérés`);

    // ── Insérer navires ────────────────────────────────────────────
    const naviresInseres = await Navire.insertMany(navires);
    console.log(`✅ ${naviresInseres.length} navires insérés`);

    // ── Insérer tarifs ─────────────────────────────────────────────
    const tarifsInseres = await Tarif.insertMany(tarifs);
    console.log(`✅ ${tarifsInseres.length} tarifs insérés`);


    // ── Insérer escales ────────────────────────────────────────────
    const portCasa   = portsInseres.find(p => p.nom === "Casablanca");
    const portJorf   = portsInseres.find(p => p.nom === "Jorf Lasfar");
    const portAgadir = portsInseres.find(p => p.nom === "Agadir");
    const portSafi   = portsInseres.find(p => p.nom === "Safi");
    const portNador  = portsInseres.find(p => p.nom === "Nador");
    const portDakhla = portsInseres.find(p => p.nom === "Dakhla");
    const portKenitra = portsInseres.find(p => p.nom === "Kénitra");
    const portTanTan = portsInseres.find(p => p.nom === "Tan-Tan");
    const portMohammedia = portsInseres.find(p => p.nom === "Mohammedia");
    const portEssaouira = portsInseres.find(p => p.nom === "Essaouira");
    const portHouceima = portsInseres.find(p => p.nom === "Al Hoceima");
    const portLaayoune = portsInseres.find(p => p.nom === "Laâyoune");

    const navMSC   = naviresInseres.find(n => n.nom === "MSC DIANA");
    const navCMA   = naviresInseres.find(n => n.nom === "CMA CGM ATLAS");
    const navEver  = naviresInseres.find(n => n.nom === "EVER GIVEN");
    const navKah   = naviresInseres.find(n => n.nom === "KAH JIF");
    const navJml   = naviresInseres.find(n => n.nom === "JML UDF");
    const navCosco = naviresInseres.find(n => n.nom === "COSCO SHIPPING");

    const escales = [
      { numero: "ESC001", navire: "MSC DIANA",      navire_id: navMSC?._id,   port: "Casablanca",  port_id: portCasa?._id,   date_arrivee: new Date("2026-01-15"), date_depart: new Date("2026-01-20") },
      { numero: "ESC002", navire: "CMA CGM ATLAS",  navire_id: navCMA?._id,   port: "Jorf Lasfar", port_id: portJorf?._id,   date_arrivee: new Date("2026-02-10"), date_depart: new Date("2026-02-15") },
      { numero: "ESC003", navire: "KAH JIF",        navire_id: navKah?._id,   port: "Dakhla",      port_id: portDakhla?._id, date_arrivee: new Date("2026-02-10"), date_depart: new Date("2026-02-15") },
      { numero: "ESC004", navire: "EVER GIVEN",     navire_id: navEver?._id,  port: "Agadir",      port_id: portAgadir?._id, date_arrivee: new Date("2026-03-18"), date_depart: new Date("2026-03-25") },
      { numero: "ESC005", navire: "COSCO SHIPPING", navire_id: navCosco?._id, port: "Casablanca",  port_id: portCasa?._id,   date_arrivee: new Date("2026-04-01"), date_depart: new Date("2026-04-07") },
      { numero: "ESC006", navire: "CMA CGM ATLAS",  navire_id: navCMA?._id,   port: "Nador",       port_id: portNador?._id,  date_arrivee: new Date("2026-04-10"), date_depart: new Date("2026-04-15") },
      { numero: "ESC007", navire: "JML UDF",        navire_id: navJml?._id,   port: "Safi",        port_id: portSafi?._id,   date_arrivee: new Date("2026-08-10"), date_depart: new Date("2026-08-15") },
      { numero: "ESC008", navire: "MSC DIANA",      navire_id: navMSC?._id,   port: "Kénitra",     port_id: portKenitra?._id, date_arrivee: new Date("2026-09-05"), date_depart: new Date("2026-09-10") },
      { numero: "ESC009", navire: "MAERSK EVER",    navire_id: navEver?._id,  port: "Tan-Tan",     port_id: portTanTan?._id,  date_arrivee: new Date("2026-10-12"), date_depart: new Date("2026-10-17") },
      { numero: "ESC010", navire: "CMA CGM ATLAS",  navire_id: navCMA?._id,   port: "Mohammedia",  port_id: portMohammedia?._id, date_arrivee: new Date("2026-11-20"), date_depart: new Date("2026-11-25") },
      { numero: "ESC011", navire: "EVER GIVEN",     navire_id: navEver?._id,  port: "Essaouira",   port_id: portEssaouira?._id, date_arrivee: new Date("2026-12-01"), date_depart: new Date("2026-12-05") },
      { numero: "ESC012", navire: "MAERSK EVER",    navire_id: navEver?._id,  port: "Al Hoceima",  port_id: portHouceima?._id, date_arrivee: new Date("2026-12-15"), date_depart: new Date("2026-12-20") },
      { numero: "ESC013", navire: "COSCO SHIPPING", navire_id: navCosco?._id, port: "Laâyoune",    port_id: portLaayoune?._id, date_arrivee: new Date("2026-12-22"), date_depart: new Date("2026-12-28") },
    ];

    const escalesInserees = await Escale.insertMany(escales);
    console.log(`✅ ${escalesInserees.length} escales insérées`);

    // ── Résumé final ───────────────────────────────────────────────
    console.log("\n🎉 Base de données synthese_db peuplée avec succès !");
    console.log("══════════════════════════════════════════════════════");
    console.log(`📍 Ports ANP         : ${portsInseres.length}`);
    console.log(`🚢 Navires           : ${naviresInseres.length}`);
    console.log(`⚓ Escales           : ${escalesInserees.length}`);
    console.log(`💰 Tarifs            : ${tarifsInseres.length}`);
    // console.log(`📦 Marchandises      : ${marchandisesInserees.length}`);
    console.log("══════════════════════════════════════════════════════");

  } catch (err) {
    console.error("❌ Erreur seed:", err);
  } finally {
    mongoose.connection.close();
    console.log("\n🔌 Connexion fermée");
  }
}

seed();