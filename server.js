const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/gestion_stock';

mongoose.connect(MONGODB_URI)
  .then(() => console.log('✅ Connecté à MongoDB'))
  .catch(err => console.error('❌ Erreur MongoDB:', err));

// Schéma Produit
const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String, required: true },
  quantity: { type: Number, required: true, default: 0 },
  price: { type: Number, required: true },
  minStock: { type: Number, default: 10 },
  supplier: { type: String },
  description: { type: String },
  image: { type: String, default: 'https://via.placeholder.com/150' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const Product = mongoose.model('Product', productSchema);

// Schéma Historique
const historySchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  action: { type: String, required: true }, // 'add', 'remove', 'update'
  quantity: { type: Number },
  oldValue: { type: Number },
  newValue: { type: Number },
  user: { type: String, default: 'Admin' },
  timestamp: { type: Date, default: Date.now }
});

const History = mongoose.model('History', historySchema);

// Routes API

// GET - Récupérer tous les produits
app.get('/api/products', async (req, res) => {
  try {
    const { category, search, lowStock } = req.query;
    let query = {};

    if (category && category !== 'all') {
      query.category = category;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { supplier: { $regex: search, $options: 'i' } }
      ];
    }

    const products = await Product.find(query).sort({ createdAt: -1 });

    if (lowStock === 'true') {
      const filtered = products.filter(p => p.quantity <= p.minStock);
      return res.json(filtered);
    }

    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET - Récupérer un produit
app.get('/api/products/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'Produit non trouvé' });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST - Créer un produit
app.post('/api/products', async (req, res) => {
  try {
    const product = new Product(req.body);
    await product.save();

    // Enregistrer dans l'historique
    await new History({
      productId: product._id,
      action: 'create',
      quantity: product.quantity,
      newValue: product.quantity
    }).save();

    res.status(201).json(product);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// PUT - Mettre à jour un produit
app.put('/api/products/:id', async (req, res) => {
  try {
    const oldProduct = await Product.findById(req.params.id);
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: Date.now() },
      { new: true }
    );

    if (!product) {
      return res.status(404).json({ error: 'Produit non trouvé' });
    }

    // Enregistrer dans l'historique si quantité changée
    if (oldProduct.quantity !== product.quantity) {
      await new History({
        productId: product._id,
        action: 'update',
        oldValue: oldProduct.quantity,
        newValue: product.quantity,
        quantity: product.quantity - oldProduct.quantity
      }).save();
    }

    res.json(product);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// DELETE - Supprimer un produit
app.delete('/api/products/:id', async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'Produit non trouvé' });
    }

    // Enregistrer dans l'historique
    await new History({
      productId: product._id,
      action: 'delete',
      quantity: product.quantity
    }).save();

    res.json({ message: 'Produit supprimé avec succès' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET - Statistiques
app.get('/api/stats', async (req, res) => {
  try {
    const totalProducts = await Product.countDocuments();
    const products = await Product.find();
    
    const totalValue = products.reduce((sum, p) => sum + (p.quantity * p.price), 0);
    const lowStockCount = products.filter(p => p.quantity <= p.minStock).length;
    
    const categories = await Product.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ]);

    res.json({
      totalProducts,
      totalValue,
      lowStockCount,
      categories
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET - Historique
app.get('/api/history', async (req, res) => {
  try {
    const history = await History.find()
      .populate('productId', 'name')
      .sort({ timestamp: -1 })
      .limit(50);
    res.json(history);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Route par défaut
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Serveur démarré sur http://localhost:${PORT}`);
});