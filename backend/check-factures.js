const mongoose = require('mongoose');

async function checkFactures() {
  try {
    await mongoose.connect('mongodb://localhost:27017/synthese_db');
    console.log('✅ Connecté à MongoDB\n');

    // Récupérer toutes les factures
    const factures = await mongoose.connection.db.collection('factures').find().toArray();
    
    console.log(`📋 ${factures.length} facture(s) trouvée(s)\n`);
    console.log('══════════════════════════════════════════════════════\n');

    factures.forEach((f, i) => {
      console.log(`🔹 Facture #${i + 1}:`);
      console.log(`   Numéro      : ${f.numero_facture || 'N/A'}`);
      console.log(`   Navire      : ${f.navire || 'N/A'}`);
      console.log(`   Escale      : ${f.n_escale || 'N/A'}`);
      console.log(`   Port        : ${f.port || 'N/A'}`);
      console.log(`   Total HT    : ${f.total_ht?.toLocaleString('fr-FR') || 0} DH`);
      console.log(`   Total TTC   : ${f.total_ttc?.toLocaleString('fr-FR') || 0} DH`);
      console.log(`   Statut      : ${f.statut || 'N/A'}`);
      console.log(`   Date        : ${f.date_facturation ? new Date(f.date_facturation).toLocaleDateString('fr-FR') : 'N/A'}`);
      console.log(`   ID          : ${f._id}`);
      console.log('');
    });

    // Vérifier aussi detailsfacture
    const details = await mongoose.connection.db.collection('detailsfacture').find().toArray();
    console.log(`📄 ${details.length} ligne(s) de détail trouvée(s)\n`);

  } catch (err) {
    console.error('❌ Erreur:', err.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Déconnecté');
  }
}

checkFactures();
