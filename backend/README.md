# 🚀 Déploiement Backend SYNTHESE (Node.js + MongoDB)

## Statut: ✅ Déployé sur https://backend-synthese.onrender.com

## 1. Prérequis
```
npm install -g vercel
MongoDB Atlas account (gratuit)
Render.com account (gratuit)
GitHub account
```

## 2. MongoDB Atlas (Base de données)
1. https://cloud.mongodb.com → New Cluster (gratuit M0)
2. Create → Collections → `synthese_db` 
3. Connect → Drivers → Node.js → Copie `mongodb+srv://...`
4. **URI importante**: `mongodb+srv://user:pass@cluster.mongodb.net/synthese_db?retryWrites=true&w=majority`

## 3. Env Vars Requises
```
MONGODB_URI=mongodb+srv://... (de Atlas)
JWT_SECRET=ton_super_secret_jwt_32_chars_min
PORT=10000 (optionnel, Render auto)
```

## 4. Local Development
```bash
cd backend
npm install
npm start  # http://localhost:5000/api/ports
```

## 5. Déploiement Render.com (Recommandé)
1. render.com → New → Web Service → GitHub repo
2. Git push → Auto-deploy on commit
3. Environment → Add Variables: MONGODB_URI, JWT_SECRET
4. Build Command: `npm install`
5. Start Command: `npm start`

## 6. Seeder Données (Ports/Tarifs)
```bash
# Local
node seed.js

# Prod: Connect Atlas → Run seed.js ou via Postman
curl -X POST https://backend...onrender.com/api/manifeste/seed
```

## 7. Test API
```
GET https://backend-synthese.onrender.com/api/ports  # Liste ports
GET https://backend-synthese.onrender.com/api/tarifs # Tarifs
POST https://backend.../api/auth/register
```

## 8. Logs Render
Service → Logs → Voir erreurs Mongo/JWT

**Frontend Vercel**: `/api/*` → proxy auto vers ce backend ✅

**Prochaine étape**: Frontend URLs fix + Vercel redeploy

