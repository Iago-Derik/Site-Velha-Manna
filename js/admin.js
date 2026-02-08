document.addEventListener('DOMContentLoaded', () => {
    const loginSection = document.getElementById('login-section');
    const dashboardSection = document.getElementById('dashboard-section');
    const loginForm = document.getElementById('login-form');
    const logoutBtn = document.getElementById('logout-btn');
    const loginError = document.getElementById('login-error');

    const productList = document.getElementById('product-list');
    const sectionFilter = document.getElementById('section-filter');

    const modal = document.getElementById('product-modal');
    const closeModalBtn = document.querySelector('.close-modal');
    const addProductBtn = document.getElementById('add-product-btn');
    const productForm = document.getElementById('product-form');

    // Admin Management Elements
    const manageAdminsBtn = document.getElementById('manage-admins-btn');
    const adminModal = document.getElementById('admin-modal');
    const closeAdminModalBtn = document.querySelector('.close-admin-modal');
    const addAdminForm = document.getElementById('add-admin-form');
    const adminList = document.getElementById('admin-list');
    const adminError = document.getElementById('admin-error');

    // Check Login
    function checkLogin() {
        const isLoggedIn = sessionStorage.getItem('isLoggedIn');
        if (isLoggedIn) {
            loginSection.classList.add('hidden');
            dashboardSection.classList.remove('hidden');
            logoutBtn.style.display = 'block';
            renderAdminProducts();
        } else {
            loginSection.classList.remove('hidden');
            dashboardSection.classList.add('hidden');
            logoutBtn.style.display = 'none';
        }
    }

    // Login Handler
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const user = document.getElementById('username').value;
        const pass = document.getElementById('password').value;

        const admins = getAdmins();
        const validAdmin = admins.find(a => a.username === user && a.password === pass);

        if (validAdmin) {
            sessionStorage.setItem('isLoggedIn', 'true');
            loginError.style.display = 'none';
            checkLogin();
        } else {
            loginError.style.display = 'block';
        }
    });

    // Logout Handler
    logoutBtn.addEventListener('click', (e) => {
        e.preventDefault();
        sessionStorage.removeItem('isLoggedIn');
        checkLogin();
    });

    // Render Products
    function renderAdminProducts() {
        const filter = sectionFilter.value;
        let products = getProducts();

        if (filter !== 'all') {
            products = products.filter(p => p.section === filter);
        }

        productList.innerHTML = '';

        products.forEach(p => {
            const tr = document.createElement('tr');

            tr.innerHTML = `
                <td><img src="${p.image}" alt="${p.name}"></td>
                <td>${p.name}</td>
                <td>${p.section}</td>
                <td>
                    <button class="action-btn edit-btn" data-id="${p.id}"><i class="fas fa-edit"></i> Editar</button>
                    <button class="action-btn delete-btn" data-id="${p.id}"><i class="fas fa-trash"></i> Excluir</button>
                </td>
            `;

            productList.appendChild(tr);
        });

        // Attach events
        document.querySelectorAll('.edit-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = parseInt(btn.getAttribute('data-id'));
                const product = getProducts().find(p => p.id === id);
                openModal(product);
            });
        });

        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.getAttribute('data-id');
                if(confirm('Tem certeza que deseja excluir este produto?')) {
                    deleteProduct(id);
                    renderAdminProducts();
                }
            });
        });
    }

    // Filter Change
    sectionFilter.addEventListener('change', renderAdminProducts);

    // Admin Management Logic
    function renderAdmins() {
        adminList.innerHTML = '';
        const admins = getAdmins();

        admins.forEach(admin => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${admin.username}</td>
                <td>
                    <button class="action-btn delete-btn delete-admin-btn" data-id="${admin.id}" style="background-color: #ffcdd2; color: #c62828;">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;
            adminList.appendChild(tr);
        });

        document.querySelectorAll('.delete-admin-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.getAttribute('data-id');
                if (getAdmins().length <= 1) {
                    alert('Não é possível excluir o último administrador.');
                    return;
                }
                if (confirm('Tem certeza que deseja excluir este administrador?')) {
                   deleteAdmin(id);
                   renderAdmins();
                }
            });
        });
    }

    manageAdminsBtn.addEventListener('click', () => {
        renderAdmins();
        adminModal.classList.remove('hidden');
    });

    closeAdminModalBtn.addEventListener('click', () => {
        adminModal.classList.add('hidden');
    });

    addAdminForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const user = document.getElementById('new-admin-user').value;
        const pass = document.getElementById('new-admin-pass').value;

        const success = addAdmin({ username: user, password: pass });

        if (success) {
            document.getElementById('new-admin-user').value = '';
            document.getElementById('new-admin-pass').value = '';
            adminError.style.display = 'none';
            renderAdmins();
        } else {
            adminError.textContent = 'Usuário já existe.';
            adminError.style.display = 'block';
        }
    });

    // Modal Logic
    function openModal(product = null) {
        const modalTitle = document.getElementById('modal-title');
        const idInput = document.getElementById('product-id');
        const nameInput = document.getElementById('product-name');
        const imageInput = document.getElementById('product-image');
        const descInput = document.getElementById('product-desc');
        const sectionInput = document.getElementById('product-section');

        if (product) {
            modalTitle.textContent = 'Editar Produto';
            idInput.value = product.id;
            nameInput.value = product.name;
            imageInput.value = product.image;
            descInput.value = product.description || '';
            sectionInput.value = product.section;
        } else {
            modalTitle.textContent = 'Adicionar Produto';
            idInput.value = '';
            productForm.reset();
        }

        modal.classList.remove('hidden');
    }

    closeModalBtn.addEventListener('click', () => {
        modal.classList.add('hidden');
    });

    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.add('hidden');
        }
        if (e.target === adminModal) {
            adminModal.classList.add('hidden');
        }
    });

    addProductBtn.addEventListener('click', () => {
        openModal();
    });

    // Form Submit
    productForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const id = document.getElementById('product-id').value;
        const product = {
            name: document.getElementById('product-name').value,
            image: document.getElementById('product-image').value,
            description: document.getElementById('product-desc').value,
            section: document.getElementById('product-section').value
        };

        if (id) {
            updateProduct(id, product);
        } else {
            addProduct(product);
        }

        modal.classList.add('hidden');
        renderAdminProducts();
    });

    // Initialize
    checkLogin();
});
