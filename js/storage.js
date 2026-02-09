const STORAGE_KEY = 'products_data';
const USERS_KEY = 'admin_users';
const CONFIG_KEY = 'site_config';

function getSiteConfig() {
    const storedConfig = localStorage.getItem(CONFIG_KEY);
    if (storedConfig) {
        return JSON.parse(storedConfig);
    }
    return {};
}

function saveSiteConfig(config) {
    localStorage.setItem(CONFIG_KEY, JSON.stringify(config));
}

function getUsers() {
    const storedUsers = localStorage.getItem(USERS_KEY);
    if (storedUsers) {
        return JSON.parse(storedUsers);
    }
    // Default admin user
    const defaultUsers = [{ username: 'admin', password: 'admin' }];
    saveUsers(defaultUsers);
    return defaultUsers;
}

function saveUsers(users) {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function addUser(username, password) {
    const users = getUsers();
    if (users.some(u => u.username === username)) {
        return false; // User already exists
    }
    users.push({ username, password });
    saveUsers(users);
    return true;
}

function deleteUser(username) {
    let users = getUsers();
    const initialLength = users.length;
    users = users.filter(u => u.username !== username);
    if (users.length !== initialLength) {
        saveUsers(users);
        return true;
    }
    return false;
}

function getProducts() {
    const storedProducts = localStorage.getItem(STORAGE_KEY);
    if (storedProducts) {
        return JSON.parse(storedProducts);
    }
    // If no products in storage, save the initial ones and return them
    // Check if initialProducts is defined (from data.js)
    if (typeof initialProducts !== 'undefined') {
        saveProducts(initialProducts);
        return initialProducts;
    }
    return [];
}

function saveProducts(products) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
}

function addProduct(product) {
    const products = getProducts();
    // Generate a new ID (max id + 1)
    const newId = products.length > 0 ? Math.max(...products.map(p => p.id)) + 1 : 1;
    product.id = newId;
    products.push(product);
    saveProducts(products);
    return product;
}

function updateProduct(id, updatedProduct) {
    const products = getProducts();
    const index = products.findIndex(p => p.id === parseInt(id));
    if (index !== -1) {
        // Merge existing fields with updates to avoid losing data if partial update
        products[index] = { ...products[index], ...updatedProduct };
        saveProducts(products);
        return true;
    }
    return false;
}

function deleteProduct(id) {
    let products = getProducts();
    const initialLength = products.length;
    products = products.filter(p => p.id !== parseInt(id));
    if (products.length !== initialLength) {
        saveProducts(products);
        return true;
    }
    return false;
}
