# 📦 Application de Gestion de Stock - StockPro

Application web moderne de gestion de stock avec interface élégante, base de données MongoDB NoSQL et fonctionnalités complètes.

## ✨ Fonctionnalités

### 🎯 Gestion des Produits
- ✅ Créer, modifier et supprimer des produits
- ✅ Upload d'images pour les produits
- ✅ Catégorisation des produits
- ✅ Gestion des fournisseurs
- ✅ Prix et quantités en stock
- ✅ Stock minimum avec alertes automatiques

### 📊 Dashboard & Statistiques
- 📈 Nombre total de produits
- 💰 Valeur totale du stock
- ⚠️ Alertes de stock faible
- 📦 Nombre de catégories
- 🕐 Activité récente en temps réel

### 🔍 Recherche & Filtres
- 🔎 Recherche par nom, catégorie ou fournisseur
- 🏷️ Filtrage par catégorie
- 📋 Vue des produits en stock faible

### 📜 Historique
- 📝 Traçabilité complète des actions
- 👤 Suivi des modifications par utilisateur
- ⏰ Horodatage de toutes les opérations

### 🎨 Interface Moderne
- 🌓 Mode sombre / clair
- 📱 Design responsive (mobile, tablette, desktop)
- ⚡ Animations fluides
- 🎯 Interface intuitive
- 🖼️ Cartes produits avec images

## 🛠️ Technologies Utilisées

### Backend
- **Node.js** - Runtime JavaScript
- **Express.js** - Framework web
- **MongoDB** - Base de données NoSQL
- **Mongoose** - ODM pour MongoDB

### Frontend
- **HTML5** - Structure
- **CSS3** - Styles modernes avec variables CSS
- **JavaScript ES6+** - Logique client
- **Font Awesome** - Icônes

## 📋 Prérequis

Avant de commencer, assurez-vous d'avoir installé :

1. **Node.js** (version 14 ou supérieure)
   - Télécharger : https://nodejs.org/

2. **MongoDB** (version 4.4 ou supérieure)
   - **Option A - MongoDB Local** :
     - Télécharger : https://www.mongodb.com/try/download/community
   - **Option B - MongoDB Atlas (Cloud - Recommandé)** :
     - Créer un compte gratuit : https://www.mongodb.com/cloud/atlas/register
     - Créer un cluster gratuit
     - Obtenir l'URL de connexion



## 📖 Utilisation

### 1️⃣ Accéder à l'application
Ouvrez votre navigateur et allez sur : **http://localhost:3000**

### 2️⃣ Navigation
- **Dashboard** : Vue d'ensemble avec statistiques
- **Produits** : Gestion complète des produits
- **Historique** : Toutes les opérations effectuées
- **Alertes** : Produits avec stock faible

### 3️⃣ Ajouter un produit
1. Cliquez sur le bouton "➕ Nouveau Produit"
2. Remplissez le formulaire :
   - Nom du produit *
   - Catégorie *
   - Quantité en stock *
   - Prix *
   - Stock minimum (optionnel)
   - Fournisseur (optionnel)
   - URL de l'image (optionnel)
   - Description (optionnel)
3. Cliquez sur "💾 Enregistrer"

### 4️⃣ Modifier un produit
1. Cliquez sur "✏️ Modifier" sur la carte du produit
2. Modifiez les informations
3. Enregistrez les changements

### 5️⃣ Supprimer un produit
1. Cliquez sur "🗑️" (poubelle) sur la carte du produit
2. Confirmez la suppression

### 6️⃣ Rechercher des produits
- Utilisez la barre de recherche en haut
- Filtrez par catégorie dans la page Produits

### 7️⃣ Changer le thème
- Cliquez sur "🌙 Mode Sombre" dans la sidebar pour basculer

## 📁 Structure du Projet

```
academic-project/
├── server.js              # Serveur Express et API
├── package.json           # Dépendances Node.js
├── .env                   # Configuration MongoDB
├── README.md             # Documentation
└── public/               # Frontend
    ├── index.html        # Structure HTML
    ├── style.css         # Styles CSS
    └── app.js            # Logique JavaScript
```

## 🔌 API Endpoints

### Produits
- `GET /api/products` - Liste tous les produits
- `GET /api/products/:id` - Récupère un produit
- `POST /api/products` - Crée un produit
- `PUT /api/products/:id` - Modifie un produit
- `DELETE /api/products/:id` - Supprime un produit

### Statistiques
- `GET /api/stats` - Récupère les statistiques

### Historique
- `GET /api/history` - Liste l'historique des opérations

## 🎨 Personnalisation

### Modifier les couleurs
Éditez les variables CSS dans `public/style.css` :
```css
:root {
    --primary: #6366f1;      /* Couleur principale */
    --secondary: #8b5cf6;    /* Couleur secondaire */
    --success: #10b981;      /* Vert */
    --warning: #f59e0b;      /* Orange */
    --danger: #ef4444;       /* Rouge */
}
```

### Ajouter des catégories
Modifiez les options dans :
1. `public/index.html` (lignes 136-142 et modal)
2. `server.js` si vous voulez les stocker en BD

## 🐛 Dépannage

### Erreur de connexion MongoDB
- Vérifiez que MongoDB est démarré (local)
- Vérifiez l'URL de connexion dans `.env`
- Vérifiez les identifiants MongoDB Atlas

### Port 3000 déjà utilisé
Modifiez le port dans `.env` :
```
PORT=4000
```

### Erreur `npm install`
Supprimez `node_modules` et réessayez :
```bash
rm -rf node_modules
npm install
```

## 🔒 Sécurité

Pour un environnement de production, ajoutez :
- 🔐 Authentification des utilisateurs
- 🛡️ Validation des données côté serveur
- 🔑 Variables d'environnement sécurisées
- 🌐 HTTPS
- 🚫 Rate limiting sur l'API

## 📝 Améliorations Futures

- [ ] Authentification multi-utilisateurs
- [ ] Export Excel/PDF des données
- [ ] Notifications par email
- [ ] Scan de codes-barres
- [ ] Application mobile
- [ ] Multi-langue
- [ ] Gestion des commandes fournisseurs

## 📄 Licence

Ce projet est libre d'utilisation pour un usage personnel et commercial.

## 👨‍💻 Support

Pour toute question ou problème :
1. Vérifiez la section Dépannage
2. Consultez la documentation MongoDB
3. Vérifiez les logs de la console

---

**Développé avec ❤️ pour une gestion de stock efficace**