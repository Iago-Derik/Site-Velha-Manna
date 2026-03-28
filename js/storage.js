const STORAGE_KEY = 'products_data';
const USERS_KEY = 'admin_users';
const CONFIG_KEY = 'site_config';
const INVITES_KEY = 'admin_invites';
const LOGS_KEY = 'admin_logs';

// Supabase Client Reference
let supabaseClient = null;

// Initialization Logic
async function initSupabase(retries = 5, delay = 1000) {
    if (typeof window.supabase !== 'undefined' && window.supabase.createClient && window.supabaseConfig) {
        try {
            supabaseClient = window.supabase.createClient(window.supabaseConfig.url, window.supabaseConfig.anonKey);
            console.log('Supabase connected successfully');
            setupSupabaseSync();
            return;
        } catch (error) {
            console.error('Error initializing Supabase client:', error);
        }
    }

    if (retries > 0) {
        setTimeout(() => initSupabase(retries - 1, delay * 1.5), delay);
    } else {
        console.warn('Failed to load Supabase after retries. Fallback to localStorage activated.');
    }
}

// Map localStorage keys to Supabase paths
const KEY_MAP = {
    [STORAGE_KEY]: 'products',
    [USERS_KEY]: 'users',
    [CONFIG_KEY]: 'config',
    [INVITES_KEY]: 'invites',
    [LOGS_KEY]: 'logs'
};

// Initialize
initSupabase();

// Helper function to safely read from localStorage
function getLocalData(localKey) {
    const dataStr = localStorage.getItem(localKey);
    if (dataStr) {
        try {
            return JSON.parse(dataStr);
        } catch (e) {
            return null;
        }
    }
    return null;
}

// Save to both localStorage (cache) and Supabase (source of truth)
async function persistData(localKey, data) {
    try {
        localStorage.setItem(localKey, JSON.stringify(data));
    } catch (e) {
        console.error('localStorage write error:', e);
    }

    if (supabaseClient) {
        const tableName = KEY_MAP[localKey];
        if (tableName) {
            try {
                // The structure expected is single row with an `id` or specific structure?
                // The previous code did db.ref(apiKey).set(data) which replaced the entire list at that node.
                // In Supabase, we should store this as a JSON document in a single row or map it.
                // Assuming we use a simple key-value structure in the tables to match Firebase's unstructured set:
                // We will wrap the data in an object with a fixed ID (e.g., id: 1) to replace the whole collection.
                // Wait, the prompt says: "Substituir operações destrutivas como: delete().neq('id', -1) Por: upsert(data)"
                // This implies we should `upsert` the array directly if it's an array of items with IDs, or wrap it.
                // Wait, if data is an array (like products), we can upsert the whole array.
                // If it's an object (like config), we upsert it. We should make sure they have an 'id'.

                // Let's modify the data to ensure it can be upserted.
                // If it's a simple key-value table, we might need a generic approach.
                // Let's check how the tables are structured. The prompt mentions:
                // "products_data" -> "products", "site_config" -> "config", "admin_invites" -> "invites", "admin_logs" -> "logs"
                // If they are relational tables, `upsert` takes an array of objects or a single object.
                // For `config` (which is an object), we should give it a dummy id so it overwrites row 1.

                let upsertData = data;

                if (tableName === 'config' && !Array.isArray(data)) {
                     upsertData = { id: 1, ...data };
                } else if (tableName === 'users' && Array.isArray(data)) {
                     // Ensure users have an ID for upsert, or username is the primary key.
                     upsertData = data.map(u => ({ ...u, id: u.username })); // Using username as id if no id exists
                } else if (tableName === 'invites' && Array.isArray(data)) {
                     upsertData = data.map(i => ({ ...i, id: i.token }));
                } else if (tableName === 'logs' && Array.isArray(data)) {
                     upsertData = data.map((l, index) => ({ ...l, id: l.timestamp + index }));
                } else if (tableName === 'products' && Array.isArray(data)) {
                     // Products already have an 'id'
                     upsertData = data;
                }

                const { error } = await supabaseClient.from(tableName).upsert(upsertData);
                if (error) {
                    console.error(`Supabase upsert error for ${tableName}:`, error);
                } else {
                    console.log(`Successfully synced ${tableName} to Supabase`);
                }
            } catch (error) {
                console.error(`Supabase set error for ${tableName}:`, error);
            }
        }
    }
}

// Setup Realtime Sync
function setupSupabaseSync() {
    if (!supabaseClient) return;

    Object.keys(KEY_MAP).forEach(async function(localKey) {
        const tableName = KEY_MAP[localKey];

        // Initial Fetch
        try {
            const { data, error } = await supabaseClient.from(tableName).select('*');

            if (error) {
                console.error(`Error fetching initial data for ${tableName}:`, error);
                return;
            }

            if (data && data.length > 0) {
                // Determine structure based on table
                let parsedData = data;
                if (tableName === 'config') {
                    // Config is expected to be a single object
                    parsedData = data[0];
                    delete parsedData.id; // remove dummy id if needed
                }

                try {
                    localStorage.setItem(localKey, JSON.stringify(parsedData));
                } catch (e) {
                    console.error('localStorage write error during sync:', e);
                }
                window.dispatchEvent(new CustomEvent('storage-updated', { detail: { key: localKey } }));
            } else {
                // Server data is empty. Migration/Seeding logic.
                const localData = getLocalData(localKey);
                let migrated = false;

                if (localData) {
                    if ((Array.isArray(localData) && localData.length > 0) ||
                        (typeof localData === 'object' && Object.keys(localData).length > 0)) {
                        await persistData(localKey, localData);
                        migrated = true;
                    }
                }

                if (!migrated) {
                    // Seed defaults if no local data to migrate
                    if (tableName === 'products' && typeof initialProducts !== 'undefined') {
                        await persistData(localKey, initialProducts);
                    } else if (tableName === 'users') {
                        const defaultUsers = [{ username: 'admin', password: 'admin' }];
                        await persistData(localKey, defaultUsers);
                    }
                }
            }
        } catch (err) {
            console.error(`Initial fetch failed for ${tableName}:`, err);
        }

        // Realtime Subscription
        supabaseClient
            .channel(`public:${tableName}`)
            .on('postgres_changes', { event: '*', schema: 'public', table: tableName }, async (payload) => {
                console.log(`Change received for ${tableName}:`, payload);
                // Simple approach: re-fetch the entire table to keep cache consistent and simple
                // This mimics the Firebase `on('value')` behavior which gives the whole snapshot.
                const { data, error } = await supabaseClient.from(tableName).select('*');
                if (!error && data) {
                    let updatedData = data;
                    if (tableName === 'config') {
                        updatedData = data.length > 0 ? data[0] : {};
                    }
                    try {
                        localStorage.setItem(localKey, JSON.stringify(updatedData));
                        window.dispatchEvent(new CustomEvent('storage-updated', { detail: { key: localKey } }));
                    } catch (e) {
                        console.error('localStorage write error during realtime sync:', e);
                    }
                }
            })
            .subscribe();
    });
}

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
