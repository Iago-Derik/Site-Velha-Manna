const STORAGE_KEY = 'products_data';
const USERS_KEY = 'admin_users';
const CONFIG_KEY = 'site_config';
const INVITES_KEY = 'admin_invites';
const LOGS_KEY = 'admin_logs';

// --- Server API helpers ---
const API_PATH = '/api/data';

// Maps localStorage keys to server API keys
const KEY_TO_API = {
    [STORAGE_KEY]: 'products',
    [USERS_KEY]: 'users',
    [CONFIG_KEY]: 'config',
    [INVITES_KEY]: 'invites',
    [LOGS_KEY]: 'logs'
};

function apiGet(apiKey) {
    return fetch(API_PATH + '?key=' + apiKey)
        .then(function(r) { return r.json(); })
        .then(function(body) { return body.data; })
        .catch(function(e) {
            console.error('API GET error for ' + apiKey + ':', e);
            return null;
        });
}

function apiPut(apiKey, data) {
    return fetch(API_PATH + '?key=' + apiKey, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: data })
    })
    .then(function(r) { return r.json(); })
    .catch(function(e) {
        console.error('API PUT error for ' + apiKey + ':', e);
        return null;
    });
}

// Save to both localStorage (cache) and server (source of truth)
function persistData(localKey, data) {
    try {
        localStorage.setItem(localKey, JSON.stringify(data));
    } catch (e) {
        console.error('localStorage write error:', e);
    }
    var apiKey = KEY_TO_API[localKey];
    if (apiKey) {
        apiPut(apiKey, data);
    }
}

// Load from server, update local cache, and notify UI
function syncFromServer(apiKey, localKey) {
    return apiGet(apiKey).then(function(serverData) {
        if (serverData !== null && serverData !== undefined) {
            try {
                localStorage.setItem(localKey, JSON.stringify(serverData));
            } catch (e) {
                console.error('localStorage write error during sync:', e);
            }
            window.dispatchEvent(new CustomEvent('storage-updated', { detail: { key: localKey } }));
        }
        return serverData;
    });
}

// On page load, sync all data from server to local cache.
// If server has no products, seed it with initial defaults.
function initServerSync() {
    var mappings = [
        { apiKey: 'products', localKey: STORAGE_KEY },
        { apiKey: 'users', localKey: USERS_KEY },
        { apiKey: 'config', localKey: CONFIG_KEY },
        { apiKey: 'invites', localKey: INVITES_KEY },
        { apiKey: 'logs', localKey: LOGS_KEY }
    ];

    mappings.forEach(function(m) {
        syncFromServer(m.apiKey, m.localKey).then(function(serverData) {
            // Seed products on server if empty
            if (m.apiKey === 'products' && (serverData === null || serverData === undefined)) {
                if (typeof initialProducts !== 'undefined') {
                    apiPut('products', initialProducts);
                }
            }
            // Seed default admin user on server if empty
            if (m.apiKey === 'users' && (serverData === null || serverData === undefined)) {
                var defaultUsers = [{ username: 'admin', password: 'admin' }];
                apiPut('users', defaultUsers);
            }
        });
    });
}

// Start sync on load
initServerSync();

// Poll server periodically for changes from other admins (every 30s)
setInterval(function() {
    var mappings = [
        { apiKey: 'products', localKey: STORAGE_KEY },
        { apiKey: 'users', localKey: USERS_KEY },
        { apiKey: 'config', localKey: CONFIG_KEY }
    ];
    mappings.forEach(function(m) {
        syncFromServer(m.apiKey, m.localKey);
    });
}, 30000);
// ---------------------------

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
    // Default admin user
    var defaultUsers = [{ username: 'admin', password: 'admin' }];
    saveUsers(defaultUsers);
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
    // If no products in local cache, use initial ones for display only (save to localStorage only).
    // Server sync will either overwrite with real data or seed the server if empty.
    if (typeof initialProducts !== 'undefined') {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(initialProducts));
        } catch (e) {
            console.error("localStorage write error:", e);
        }
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
