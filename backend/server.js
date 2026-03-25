const express  = require('express');
const cors     = require('cors');
const dotenv   = require('dotenv');
const connectDB = require('./config/db');

dotenv.config();
connectDB();

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// ── Routes ────────────────────────────────────────────────────────
app.use('/api/auth',          require('./routes/auth'));
app.use('/api/manifeste',     require('./routes/manifeste'));
app.use('/api/navires',       require('./routes/navires'));
app.use('/api/ports',         require('./routes/ports'));
app.use('/api/escales',       require('./routes/escales'));
app.use('/api/factures',      require('./routes/factures'));
app.use('/api/tarifs',        require('./routes/tarifs'));
// app.use('/api/marchandises',  require('./routes/marchandises'));  // Désactivé - utilisez /api/tarifs
app.use('/api/detailsfacture', require('./routes/detailsfacture'));
app.use((req, res) => res.status(404).json({ message: 'Route non trouvée' }));
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Erreur serveur!' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Serveur démarré sur le port ${PORT}`);
  console.log(`📦 Routes disponibles :`);
  console.log(`   /api/auth | /api/manifeste | /api/navires`);
  console.log(`   /api/ports | /api/escales | /api/factures`);
  console.log(`   /api/tarifs | /api/marchandises`);
});