// Configuration API
const API_URL = 'http://localhost:3000/api';

// État de l'application
let currentEditId = null;
let allProducts = [];

// Initialisation
document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
    setupEventListeners();
    loadDashboard();
});

// Initialisation de l'application
function initializeApp() {
    // Vérifier le thème sauvegardé
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);
}

// Configuration des écouteurs d'événements
function setupEventListeners() {
    // Navigation
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', handleNavigation);
    });

    // Thème
    document.getElementById('themeToggle').addEventListener('click', toggleTheme);

    // Sidebar mobile
    document.getElementById('sidebarToggle').addEventListener('click', toggleSidebar);

    // Modal
    document.getElementById('addProductBtn').addEventListener('click', () => openProductModal());
    document.getElementById('closeModal').addEventListener('click', closeProductModal);
    document.getElementById('cancelBtn').addEventListener('click', closeProductModal);
    document.getElementById('productForm').addEventListener('submit', handleProductSubmit);

    // Recherche
    document.getElementById('searchInput').addEventListener('input', handleSearch);

    // Filtre catégorie
    document.getElementById('categoryFilter').addEventListener('change', handleCategoryFilter);
}

// Navigation
function handleNavigation(e) {
    e.preventDefault();
    const page = e.currentTarget.dataset.page;

    // Mettre à jour la navigation active
    document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
    e.currentTarget.classList.add('active');

    // Afficher la bonne page
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById(`${page}Page`).classList.add('active');

    // Mettre à jour le titre
    const titles = {
        dashboard: 'Dashboard',
        products: 'Produits',
        history: 'Historique',
        alerts: 'Alertes Stock'
    };
    document.getElementById('pageTitle').textContent = titles[page];

    // Charger les données de la page
    switch(page) {
        case 'dashboard':
            loadDashboard();
            break;
        case 'products':
            loadProducts();
            break;
        case 'history':
            loadHistory();
            break;
        case 'alerts':
            loadAlerts();
            break;
    }
}

// Toggle thème
function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateThemeIcon(newTheme);
}

function updateThemeIcon(theme) {
    const icon = document.querySelector('.theme-toggle i');
    const text = document.querySelector('.theme-toggle span');
    
    if (theme === 'dark') {
        icon.className = 'fas fa-sun';
        text.textContent = 'Mode Clair';
    } else {
        icon.className = 'fas fa-moon';
        text.textContent = 'Mode Sombre';
    }
}

// Toggle sidebar mobile
function toggleSidebar() {
    document.getElementById('sidebar').classList.toggle('active');
}

// Charger le dashboard
async function loadDashboard() {
    try {
        const [stats, products, history] = await Promise.all([
            fetch(`${API_URL}/stats`).then(r => r.json()),
            fetch(`${API_URL}/products`).then(r => r.json()),
            fetch(`${API_URL}/history?limit=5`).then(r => r.json())
        ]);

        // Mettre à jour les stats
        document.getElementById('totalProducts').textContent = stats.totalProducts;
        document.getElementById('totalValue').textContent = formatCurrency(stats.totalValue);
        document.getElementById('lowStockCount').textContent = stats.lowStockCount;
        document.getElementById('categoriesCount').textContent = stats.categories.length;

        // Afficher l'activité récente
        displayRecentActivity(history);

    } catch (error) {
        showToast('Erreur lors du chargement du dashboard', 'error');
        console.error(error);
    }
}

// Afficher l'activité récente
function displayRecentActivity(history) {
    const container = document.getElementById('recentActivity');
    
    if (history.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: var(--text-secondary);">Aucune activité récente</p>';
        return;
    }

    container.innerHTML = history.map(item => {
        const actionIcons = {
            create: { icon: 'fa-plus-circle', color: '#10b981' },
            update: { icon: 'fa-edit', color: '#3b82f6' },
            delete: { icon: 'fa-trash', color: '#ef4444' }
        };

        const { icon, color } = actionIcons[item.action] || { icon: 'fa-circle', color: '#6366f1' };
        const productName = item.productId?.name || 'Produit supprimé';

        return `
            <div class="activity-item">
                <div class="activity-icon" style="background: ${color}">
                    <i class="fas ${icon}"></i>
                </div>
                <div class="activity-content">
                    <div class="activity-text">
                        <strong>${productName}</strong> - ${getActionText(item)}
                    </div>
                    <div class="activity-time">
                        <i class="fas fa-clock"></i> ${formatDate(item.timestamp)}
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

function getActionText(item) {
    switch(item.action) {
        case 'create':
            return `Créé avec ${item.quantity} unités`;
        case 'update':
            return `Mis à jour: ${item.oldValue} → ${item.newValue} unités`;
        case 'delete':
            return 'Supprimé du stock';
        default:
            return item.action;
    }
}

// Charger les produits
async function loadProducts(filters = {}) {
    try {
        const queryParams = new URLSearchParams(filters);
        const response = await fetch(`${API_URL}/products?${queryParams}`);
        allProducts = await response.json();
        displayProducts(allProducts);
    } catch (error) {
        showToast('Erreur lors du chargement des produits', 'error');
        console.error(error);
    }
}

// Afficher les produits
function displayProducts(products) {
    const grid = document.getElementById('productsGrid');
    
    if (products.length === 0) {
        grid.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 40px;">
                <i class="fas fa-box-open" style="font-size: 48px; color: var(--text-secondary); margin-bottom: 16px;"></i>
                <p style="color: var(--text-secondary);">Aucun produit trouvé</p>
            </div>
        `;
        return;
    }

    grid.innerHTML = products.map(product => {
        const stockStatus = getStockStatus(product);
        
        return `
            <div class="product-card" data-id="${product._id}">
                <img src="${product.image}" alt="${product.name}" class="product-image" onerror="this.src='https://via.placeholder.com/300x200?text=No+Image'">
                <div class="product-content">
                    <div class="product-header">
                        <h3 class="product-name">${product.name}</h3>
                        <span class="product-category">${product.category}</span>
                    </div>
                    
                    <div class="product-info">
                        <div class="info-item">
                            <span class="info-label">Prix</span>
                            <span class="info-value">${formatCurrency(product.price)}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">Quantité</span>
                            <span class="info-value">${product.quantity}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">Stock Min</span>
                            <span class="info-value">${product.minStock}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">Valeur</span>
                            <span class="info-value">${formatCurrency(product.price * product.quantity)}</span>
                        </div>
                    </div>

                    ${product.supplier ? `<p style="font-size: 13px; color: var(--text-secondary); margin: 8px 0;"><i class="fas fa-truck"></i> ${product.supplier}</p>` : ''}
                    
                    <div class="stock-status ${stockStatus.class}">
                        <i class="fas ${stockStatus.icon}"></i> ${stockStatus.text}
                    </div>

                    <div class="product-actions">
                        <button class="btn btn-sm btn-primary" onclick="editProduct('${product._id}')">
                            <i class="fas fa-edit"></i> Modifier
                        </button>
                        <button class="btn btn-sm btn-danger" onclick="deleteProduct('${product._id}')">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

// Statut du stock
function getStockStatus(product) {
    if (product.quantity === 0) {
        return { class: 'out-of-stock', icon: 'fa-times-circle', text: 'Rupture de stock' };
    } else if (product.quantity <= product.minStock) {
        return { class: 'low-stock', icon: 'fa-exclamation-triangle', text: 'Stock faible' };
    } else {
        return { class: 'in-stock', icon: 'fa-check-circle', text: 'En stock' };
    }
}

// Modal produit
function openProductModal(productId = null) {
    currentEditId = productId;
    const modal = document.getElementById('productModal');
    const form = document.getElementById('productForm');
    const title = document.getElementById('modalTitle');

    form.reset();

    if (productId) {
        title.textContent = 'Modifier le Produit';
        loadProductData(productId);
    } else {
        title.textContent = 'Nouveau Produit';
    }

    modal.classList.add('active');
}

function closeProductModal() {
    document.getElementById('productModal').classList.remove('active');
    document.getElementById('productForm').reset();
    currentEditId = null;
}

async function loadProductData(productId) {
    try {
        const response = await fetch(`${API_URL}/products/${productId}`);
        const product = await response.json();

        document.getElementById('productName').value = product.name;
        document.getElementById('productCategory').value = product.category;
        document.getElementById('productQuantity').value = product.quantity;
        document.getElementById('productPrice').value = product.price;
        document.getElementById('productMinStock').value = product.minStock;
        document.getElementById('productSupplier').value = product.supplier || '';
        document.getElementById('productImage').value = product.image || '';
        document.getElementById('productDescription').value = product.description || '';
    } catch (error) {
        showToast('Erreur lors du chargement du produit', 'error');
        console.error(error);
    }
}

// Soumettre le formulaire
async function handleProductSubmit(e) {
    e.preventDefault();

    const productData = {
        name: document.getElementById('productName').value,
        category: document.getElementById('productCategory').value,
        quantity: parseInt(document.getElementById('productQuantity').value),
        price: parseFloat(document.getElementById('productPrice').value),
        minStock: parseInt(document.getElementById('productMinStock').value),
        supplier: document.getElementById('productSupplier').value,
        image: document.getElementById('productImage').value,
        description: document.getElementById('productDescription').value
    };

    try {
        const url = currentEditId ? `${API_URL}/products/${currentEditId}` : `${API_URL}/products`;
        const method = currentEditId ? 'PUT' : 'POST';

        const response = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(productData)
        });

        if (response.ok) {
            showToast(currentEditId ? 'Produit modifié avec succès' : 'Produit créé avec succès', 'success');
            closeProductModal();
            loadProducts();
            loadDashboard();
        } else {
            throw new Error('Erreur serveur');
        }
    } catch (error) {
        showToast('Erreur lors de l\'enregistrement', 'error');
        console.error(error);
    }
}

// Modifier un produit
window.editProduct = (productId) => {
    openProductModal(productId);
};

// Supprimer un produit
window.deleteProduct = async (productId) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce produit ?')) {
        return;
    }

    try {
        const response = await fetch(`${API_URL}/products/${productId}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            showToast('Produit supprimé avec succès', 'success');
            loadProducts();
            loadDashboard();
        } else {
            throw new Error('Erreur serveur');
        }
    } catch (error) {
        showToast('Erreur lors de la suppression', 'error');
        console.error(error);
    }
};

// Recherche
function handleSearch(e) {
    const search = e.target.value.toLowerCase();
    const filtered = allProducts.filter(p => 
        p.name.toLowerCase().includes(search) ||
        p.category.toLowerCase().includes(search) ||
        (p.supplier && p.supplier.toLowerCase().includes(search))
    );
    displayProducts(filtered);
}

// Filtre catégorie
function handleCategoryFilter(e) {
    const category = e.target.value;
    loadProducts(category !== 'all' ? { category } : {});
}

// Charger l'historique
async function loadHistory() {
    try {
        const response = await fetch(`${API_URL}/history`);
        const history = await response.json();
        displayHistory(history);
    } catch (error) {
        showToast('Erreur lors du chargement de l\'historique', 'error');
        console.error(error);
    }
}

function displayHistory(history) {
    const table = document.getElementById('historyTable');
    
    if (history.length === 0) {
        table.innerHTML = '<tr><td colspan="5" style="text-align: center; padding: 40px; color: var(--text-secondary);">Aucun historique</td></tr>';
        return;
    }

    table.innerHTML = history.map(item => {
        const productName = item.productId?.name || 'Produit supprimé';
        const actionBadge = `<span class="action-badge ${item.action}">${item.action}</span>`;
        
        return `
            <tr>
                <td>${formatDate(item.timestamp)}</td>
                <td><strong>${productName}</strong></td>
                <td>${actionBadge}</td>
                <td>${item.quantity || '-'}</td>
                <td>${item.user}</td>
            </tr>
        `;
    }).join('');
}

// Charger les alertes
async function loadAlerts() {
    try {
        const response = await fetch(`${API_URL}/products?lowStock=true`);
        const products = await response.json();
        displayAlerts(products);
    } catch (error) {
        showToast('Erreur lors du chargement des alertes', 'error');
        console.error(error);
    }
}

function displayAlerts(products) {
    const container = document.getElementById('alertsList');
    
    if (products.length === 0) {
        container.innerHTML = '<p style="text-align: center; padding: 40px; color: var(--text-secondary);">Aucune alerte de stock</p>';
        return;
    }

    container.innerHTML = products.map(product => `
        <div class="alert-item">
            <div class="alert-icon">
                <i class="fas fa-exclamation-triangle"></i>
            </div>
            <div class="alert-content">
                <div class="alert-title">${product.name}</div>
                <div class="alert-details">
                    Stock actuel: <strong>${product.quantity}</strong> | 
                    Stock minimum: <strong>${product.minStock}</strong> | 
                    Catégorie: <strong>${product.category}</strong>
                </div>
            </div>
            <button class="btn btn-sm btn-primary" onclick="editProduct('${product._id}')">
                <i class="fas fa-plus"></i> Réapprovisionner
            </button>
        </div>
    `).join('');
}

// Notification toast
function showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    const icons = {
        success: 'fa-check-circle',
        error: 'fa-times-circle',
        info: 'fa-info-circle'
    };

    toast.innerHTML = `
        <i class="fas ${icons[type]}"></i>
        <span>${message}</span>
    `;

    container.appendChild(toast);

    setTimeout(() => {
        toast.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Formatage
function formatCurrency(value) {
    return new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: 'EUR'
    }).format(value);
}

function formatDate(date) {
    return new Intl.DateTimeFormat('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    }).format(new Date(date));
}