const STORAGE_KEY = 'products_data';
const USERS_KEY = 'admin_users';
const CONFIG_KEY = 'site_config';
const INVITES_KEY = 'admin_invites';
const LOGS_KEY = 'admin_logs';

// Firebase Database Reference
let db = null;
if (typeof firebase !== 'undefined' && window.firebaseConfig) {
    if (!firebase.apps.length) {
        firebase.initializeApp(window.firebaseConfig);
    }
    db = firebase.database();
}

// Map localStorage keys to Firebase paths
const KEY_MAP = {
    [STORAGE_KEY]: 'products',
    [USERS_KEY]: 'users',
    [CONFIG_KEY]: 'config',
    [INVITES_KEY]: 'invites',
    [LOGS_KEY]: 'logs'
};

// Save to both localStorage (cache) and Firebase (source of truth)
function persistData(localKey, data) {
    try {
        localStorage.setItem(localKey, JSON.stringify(data));
    } catch (e) {
        console.error('localStorage write error:', e);
    }

    if (db) {
        const apiKey = KEY_MAP[localKey];
        if (apiKey) {
            db.ref(apiKey).set(data).catch(function(e) { console.error('Firebase set error:', e); });
        }
    }
}

// Setup Realtime Sync
function setupFirebaseSync() {
    if (!db) return;

    Object.keys(KEY_MAP).forEach(function(localKey) {
        const apiKey = KEY_MAP[localKey];
        const ref = db.ref(apiKey);

        ref.on('value', function(snapshot) {
            const val = snapshot.val();
            if (val !== null && val !== undefined) {
                // Update local cache from server
                try {
                    localStorage.setItem(localKey, JSON.stringify(val));
                } catch (e) {
                    console.error('localStorage write error during sync:', e);
                }
                window.dispatchEvent(new CustomEvent('storage-updated', { detail: { key: localKey } }));
            } else {
                // Server data is empty. Migration/Seeding logic.
                const localDataStr = localStorage.getItem(localKey);
                let migrated = false;

                if (localDataStr) {
                    try {
                        const localData = JSON.parse(localDataStr);
                        // Check if it has content
                        if ((Array.isArray(localData) && localData.length > 0) ||
                            (typeof localData === 'object' && Object.keys(localData).length > 0)) {
                            ref.set(localData);
                            migrated = true;
                        }
                    } catch (e) { }
                }

                if (!migrated) {
                    // Seed defaults if no local data to migrate
                    if (apiKey === 'products' && typeof initialProducts !== 'undefined') {
                        ref.set(initialProducts);
                    } else if (apiKey === 'users') {
                        const defaultUsers = [{ username: 'admin', password: 'admin' }];
                        ref.set(defaultUsers);
                    }
                }
            }
        });
    });
}

// Start sync
setupFirebaseSync();

function getSiteConfig() {
    var storedConfig = localStorage.getItem(CONFIG_KEY);
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
    try {
        persistData(CONFIG_KEY, config);
        return true;
    } catch (e) {
        console.error("Error saving site config", e);
        return false;
    }
}

function getUsers() {
    var storedUsers = localStorage.getItem(USERS_KEY);
    if (storedUsers) {
        try {
            var users = JSON.parse(storedUsers);
            if (Array.isArray(users) && users.length > 0) {
                return users;
            }
        } catch (e) {
            console.error("Error parsing users from localStorage, resetting to default.", e);
        }
    }
    // Default admin user (will be saved to DB by persistData inside saveUsers if DB is connected)
    var defaultUsers = [{ username: 'admin', password: 'admin' }];
    return defaultUsers;
}

function saveUsers(users) {
    try {
        persistData(USERS_KEY, users);
        return true;
    } catch (e) {
        console.error("Error saving users", e);
        return false;
    }
}

function addUser(username, password) {
    var users = getUsers();
    if (users.some(function(u) { return u.username === username; })) {
        return false;
    }
    users.push({ username: username, password: password });
    return saveUsers(users);
}

function deleteUser(username) {
    var users = getUsers();
    var initialLength = users.length;
    users = users.filter(function(u) { return u.username !== username; });
    if (users.length !== initialLength) {
        return saveUsers(users);
    }
    return false;
}

function getProducts() {
    var storedProducts = localStorage.getItem(STORAGE_KEY);
    if (storedProducts) {
        try {
            return JSON.parse(storedProducts);
        } catch (e) {
            console.error("Error parsing products", e);
        }
    }
    if (typeof initialProducts !== 'undefined') {
        return initialProducts;
    }
    return [];
}

function saveProducts(products) {
    try {
        persistData(STORAGE_KEY, products);
        return true;
    } catch (e) {
        console.error("Error saving products", e);
        return false;
    }
}

function addProduct(product) {
    var products = getProducts();
    var newId = products.length > 0 ? Math.max.apply(null, products.map(function(p) { return p.id; })) + 1 : 1;
    product.id = newId;
    products.push(product);
    if (saveProducts(products)) {
        return product;
    }
    return false;
}

function updateProduct(id, updatedProduct) {
    var products = getProducts();
    var index = products.findIndex(function(p) { return p.id === parseInt(id); });
    if (index !== -1) {
        var existing = products[index];
        for (var key in updatedProduct) {
            if (updatedProduct.hasOwnProperty(key)) {
                existing[key] = updatedProduct[key];
            }
        }
        products[index] = existing;
        return saveProducts(products);
    }
    return false;
}

function deleteProduct(id) {
    var products = getProducts();
    var initialLength = products.length;
    products = products.filter(function(p) { return p.id !== parseInt(id); });
    if (products.length !== initialLength) {
        return saveProducts(products);
    }
    return false;
}

// Invite System Logic

function getInvites() {
    var storedInvites = localStorage.getItem(INVITES_KEY);
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
    try {
        persistData(INVITES_KEY, invites);
        return true;
    } catch (e) {
        console.error("Error saving invites", e);
        return false;
    }
}

function addInvite(email) {
    var invites = getInvites();
    var token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    var invite = {
        email: email,
        token: token,
        createdAt: new Date().toISOString()
    };
    invites.push(invite);
    saveInvites(invites);
    return token;
}

function validateInvite(token) {
    var invites = getInvites();
    return invites.find(function(i) { return i.token === token; });
}

function consumeInvite(token) {
    var invites = getInvites();
    var initialLength = invites.length;
    invites = invites.filter(function(i) { return i.token !== token; });
    if (invites.length !== initialLength) {
        return saveInvites(invites);
    }
    return false;
}

// Access Logs

function getLogs() {
    var storedLogs = localStorage.getItem(LOGS_KEY);
    if (storedLogs) {
        try {
            return JSON.parse(storedLogs);
        } catch (e) {
            console.error("Error parsing logs", e);
            return [];
        }
    }
    return [];
}

function saveLog(logEntry) {
    var logs = getLogs();
    if (logs.length >= 100) {
        logs.shift();
    }
    logs.push(logEntry);
    try {
        persistData(LOGS_KEY, logs);
        return true;
    } catch (e) {
        console.error("Error saving log", e);
        return false;
    }
}
