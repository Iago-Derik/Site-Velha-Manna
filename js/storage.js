const PRODUCTS_KEY = 'products_data';
const ADMINS_KEY = 'admins_data';

function getProducts() {
    const storedProducts = localStorage.getItem(PRODUCTS_KEY);
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
    localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products));
}

function getAdmins() {
    const storedAdmins = localStorage.getItem(ADMINS_KEY);
    if (storedAdmins) {
        return JSON.parse(storedAdmins);
    }
    // If no admins in storage, save the initial ones
    if (typeof initialAdmins !== 'undefined') {
        saveAdmins(initialAdmins);
        return initialAdmins;
    }
    return [];
}

function saveAdmins(admins) {
    localStorage.setItem(ADMINS_KEY, JSON.stringify(admins));
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

function addAdmin(admin) {
    const admins = getAdmins();
    // Check if username already exists
    if (admins.some(a => a.username === admin.username)) {
        return false;
    }
    const newId = admins.length > 0 ? Math.max(...admins.map(a => a.id)) + 1 : 1;
    admin.id = newId;
    admins.push(admin);
    saveAdmins(admins);
    return true;
}

function deleteAdmin(id) {
    let admins = getAdmins();
    // Prevent deleting the last admin
    if (admins.length <= 1) {
        return false;
    }
    const initialLength = admins.length;
    admins = admins.filter(a => a.id !== parseInt(id));
    if (admins.length !== initialLength) {
        saveAdmins(admins);
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
