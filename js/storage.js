const STORAGE_KEY = 'products_data';
const USERS_KEY = 'admin_users';
const CONFIG_KEY = 'site_config';
const INVITES_KEY = 'admin_invites';

function getSiteConfig() {
    const storedConfig = localStorage.getItem(CONFIG_KEY);
    if (storedConfig) {
        try {
            return JSON.parse(storedConfig);
        } catch (e) {
            console.error("Error parsing site config", e);
            return {};
        }
    }
    return {};
}

function saveSiteConfig(config) {
    localStorage.setItem(CONFIG_KEY, JSON.stringify(config));
}

function getUsers() {
    const storedUsers = localStorage.getItem(USERS_KEY);
    if (storedUsers) {
        try {
            const users = JSON.parse(storedUsers);
            if (Array.isArray(users) && users.length > 0) {
                return users;
            }
        } catch (e) {
            console.error("Error parsing users from localStorage, resetting to default.", e);
        }
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
    // Ensure at least one user remains? Maybe not necessary as we can always create 'admin' again,
    // but typically we don't want to delete the last admin.
    // However, the current logic re-creates 'admin' on reload if empty.
    if (users.length !== initialLength) {
        saveUsers(users);
        return true;
    }
    return false;
}

function getProducts() {
    const storedProducts = localStorage.getItem(STORAGE_KEY);
    if (storedProducts) {
        try {
            return JSON.parse(storedProducts);
        } catch (e) {
            console.error("Error parsing products", e);
        }
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

// Invite System Logic

function getInvites() {
    const storedInvites = localStorage.getItem(INVITES_KEY);
    if (storedInvites) {
        try {
            return JSON.parse(storedInvites);
        } catch (e) {
            console.error("Error parsing invites", e);
            return [];
        }
    }
    return [];
}

function saveInvites(invites) {
    localStorage.setItem(INVITES_KEY, JSON.stringify(invites));
}

function addInvite(email) {
    const invites = getInvites();
    // Simple token generation
    const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    const invite = {
        email,
        token,
        createdAt: new Date().toISOString()
    };
    invites.push(invite);
    saveInvites(invites);
    return token;
}

function validateInvite(token) {
    const invites = getInvites();
    return invites.find(i => i.token === token);
}

function consumeInvite(token) {
    let invites = getInvites();
    const initialLength = invites.length;
    invites = invites.filter(i => i.token !== token);
    if (invites.length !== initialLength) {
        saveInvites(invites);
        return true;
    }
    return false;
}
