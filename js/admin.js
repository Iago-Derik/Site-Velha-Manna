document.addEventListener("DOMContentLoaded", () => {
  const loginSection = document.getElementById("login-section");
  const dashboardSection = document.getElementById("dashboard-section");
  const loginForm = document.getElementById("login-form");
  const logoutBtn = document.getElementById("logout-btn");
  const loginError = document.getElementById("login-error");

  const productList = document.getElementById("product-list");
  const sectionFilter = document.getElementById("section-filter");

  const modal = document.getElementById("product-modal");
  const closeModalBtn = document.querySelector(".close-modal");
  const addProductBtn = document.getElementById("add-product-btn");
  const productForm = document.getElementById("product-form");
  // Format price input as BRL while typing
  const priceInputGlobal = document.getElementById("product-price");
  if (priceInputGlobal) {
    priceInputGlobal.addEventListener("input", (e) => {
      const el = e.target;
      // keep only digits
      let digits = el.value.replace(/\D/g, "");
      if (digits === "") {
        el.value = "";
        return;
      }
      const num = parseInt(digits, 10);
      el.value = new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
      }).format(num / 100);
    });
  }

  // Navigation & User Management Elements
  const navProductsBtn = document.getElementById("nav-products");
  const navUsersBtn = document.getElementById("nav-users");
  const navSettingsBtn = document.getElementById("nav-settings");
  const productsView = document.getElementById("products-view");
  const usersView = document.getElementById("users-view");
  const settingsView = document.getElementById("settings-view");
  const addUserForm = document.getElementById("add-user-form");
  const userList = document.getElementById("user-list");
  const saveSettingsForm = document.getElementById("settings-form");

  // Check Login
  function checkLogin() {
    const isLoggedIn = sessionStorage.getItem("isLoggedIn");
    if (isLoggedIn) {
      loginSection.classList.add("hidden");
      dashboardSection.classList.remove("hidden");
      logoutBtn.style.display = "block";
      renderAdminProducts();
    } else {
      loginSection.classList.remove("hidden");
      dashboardSection.classList.add("hidden");
      logoutBtn.style.display = "none";
    }
  }

  // Login Handler
  loginForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const user = document.getElementById("username").value;
    const pass = document.getElementById("password").value;

    const users = getUsers();
    const validUser = users.find(
      (u) => u.username === user && u.password === pass,
    );

    if (validUser) {
      sessionStorage.setItem("isLoggedIn", "true");
      sessionStorage.setItem("currentUser", user);
      loginError.style.display = "none";
      checkLogin();
    } else {
      loginError.style.display = "block";
    }
  });

  // Logout Handler
  logoutBtn.addEventListener("click", (e) => {
    e.preventDefault();
    sessionStorage.removeItem("isLoggedIn");
    checkLogin();
  });

  // Render Products
  function renderAdminProducts() {
    const filter = sectionFilter.value;
    let products = getProducts();

    if (filter !== "all") {
      products = products.filter((p) => p.section === filter);
    }

    productList.innerHTML = "";

    products.forEach((p) => {
      const tr = document.createElement("tr");

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
    document.querySelectorAll(".edit-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const id = parseInt(btn.getAttribute("data-id"));
        const product = getProducts().find((p) => p.id === id);
        openModal(product);
      });
    });

    document.querySelectorAll(".delete-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const id = btn.getAttribute("data-id");
        if (confirm("Tem certeza que deseja excluir este produto?")) {
          deleteProduct(id);
          renderAdminProducts();
        }
      });
    });
  }

  // Filter Change
  sectionFilter.addEventListener("change", renderAdminProducts);

  // Modal Logic
  function openModal(product = null) {
    const modalTitle = document.getElementById("modal-title");
    const idInput = document.getElementById("product-id");
    const nameInput = document.getElementById("product-name");
    const imageInput = document.getElementById("product-image");
    const descInput = document.getElementById("product-desc");
    const sectionInput = document.getElementById("product-section");
    const priceInputContainer = document.getElementById(
      "product-price-container",
    );
    const priceInput = document.getElementById("product-price");
    const boldDescInput = document.getElementById("product-bold-desc");

    if (product) {
      modalTitle.textContent = "Editar Produto";
      idInput.value = product.id;
      nameInput.value = product.name;
      imageInput.value = product.image;
      descInput.value = product.description || "";
      sectionInput.value = product.section;
      priceInput.value = product.price || "";
      boldDescInput.checked = product.isBold || false;
    } else {
      modalTitle.textContent = "Adicionar Produto";
      idInput.value = "";
      productForm.reset();
    }

    modal.classList.remove("hidden");
  }

  closeModalBtn.addEventListener("click", () => {
    modal.classList.add("hidden");
  });

  window.addEventListener("click", (e) => {
    if (e.target === modal) {
      modal.classList.add("hidden");
    }
  });

  addProductBtn.addEventListener("click", () => {
    openModal();
  });

  // Form Submit
  productForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const id = document.getElementById("product-id").value;
    const fileInput = document.getElementById("product-image-file");
    const imageInput = document.getElementById("product-image");

    const productData = {
      name: document.getElementById("product-name").value,
      description: document.getElementById("product-desc").value,
      section: document.getElementById("product-section").value,
      price: document.getElementById("product-price").value,
      isBold: document.getElementById("product-bold-desc").checked,
    };

    const saveProduct = (imageUrl) => {
      productData.image = imageUrl;

      if (id) {
        updateProduct(id, productData);
      } else {
        addProduct(productData);
      }

      modal.classList.add("hidden");
      renderAdminProducts();
    };

    if (fileInput.files && fileInput.files[0]) {
      const reader = new FileReader();
      reader.onload = function (e) {
        saveProduct(e.target.result);
      };
      reader.readAsDataURL(fileInput.files[0]);
    } else {
      saveProduct(imageInput.value);
    }
  });

  // Navigation Logic
  navProductsBtn.addEventListener("click", () => {
    productsView.classList.remove("hidden");
    usersView.classList.add("hidden");
    settingsView.classList.add("hidden");
    navProductsBtn.style.backgroundColor = "var(--primary-color)";
    navUsersBtn.style.backgroundColor = "#ddd";
    navSettingsBtn.style.backgroundColor = "#ddd";
  });

  navUsersBtn.addEventListener("click", () => {
    productsView.classList.add("hidden");
    usersView.classList.remove("hidden");
    settingsView.classList.add("hidden");
    navUsersBtn.style.backgroundColor = "var(--primary-color)";
    navProductsBtn.style.backgroundColor = "#ddd";
    navSettingsBtn.style.backgroundColor = "#ddd";
    renderUsers();
  });

  navSettingsBtn.addEventListener("click", () => {
    productsView.classList.add("hidden");
    usersView.classList.add("hidden");
    settingsView.classList.remove("hidden");
    navSettingsBtn.style.backgroundColor = "var(--primary-color)";
    navProductsBtn.style.backgroundColor = "#ddd";
    navUsersBtn.style.backgroundColor = "#ddd";
    renderSettings();
  });

  // Settings Logic
  function renderSettings() {
    const config = getSiteConfig();

    // Check if logo is a Data URL (Base64) to avoid lagging the input
    if (config.logoUrl && config.logoUrl.startsWith("data:")) {
      document.getElementById("site-logo-url").value = "[Imagem Carregada]";
      document.getElementById("site-logo-url").dataset.isBase64 = "true";
    } else {
      document.getElementById("site-logo-url").value = config.logoUrl || "";
      delete document.getElementById("site-logo-url").dataset.isBase64;
    }

    document.getElementById("bg-page-url").value = config.pageBgUrl || "";

    document.getElementById("bg-feminino").value =
      config.banners?.feminino || "";
    document.getElementById("bg-masculino").value =
      config.banners?.masculino || "";
    document.getElementById("bg-baloes").value = config.banners?.baloes || "";
    document.getElementById("bg-lembrancinhas").value =
      config.banners?.lembrancinhas || "";
    document.getElementById("bg-cursos").value = config.banners?.cursos || "";
  }

  // Helper to read file as Data URL
  const readFileAsDataURL = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  if (saveSettingsForm) {
    saveSettingsForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      let logoUrlValue = document.getElementById("site-logo-url").value;
      // If the value is the placeholder for Base64, keep the existing one
      if (logoUrlValue === "[Imagem Carregada]") {
        const oldConfig = getSiteConfig();
        logoUrlValue = oldConfig.logoUrl;
      }

      const config = {
        logoUrl: logoUrlValue,
        pageBgUrl: document.getElementById("bg-page-url").value,
        banners: {
          feminino: document.getElementById("bg-feminino").value,
          masculino: document.getElementById("bg-masculino").value,
          baloes: document.getElementById("bg-baloes").value,
          lembrancinhas: document.getElementById("bg-lembrancinhas").value,
          cursos: document.getElementById("bg-cursos").value,
        },
      };

      const checkFile = async (fileId, configKey, subKey = null) => {
        const fileInput = document.getElementById(fileId);
        if (fileInput && fileInput.files && fileInput.files[0]) {
          const file = fileInput.files[0];
          // Check size (limit to 2MB to avoid LocalStorage quota issues)
          if (file.size > 2 * 1024 * 1024) {
            alert(
              `A imagem ${file.name} é muito grande (>2MB). Por favor, use uma imagem menor para garantir que seja salva.`,
            );
            return;
          }

          try {
            const dataUrl = await readFileAsDataURL(file);
            if (subKey) {
              config[configKey][subKey] = dataUrl;
            } else {
              config[configKey] = dataUrl;
            }
          } catch (err) {
            console.error(`Error reading file ${fileId}:`, err);
          }
        }
      };

      await Promise.all([
        checkFile("site-logo-file", "logoUrl"),
        checkFile("bg-page-file", "pageBgUrl"),
        checkFile("bg-feminino-file", "banners", "feminino"),
        checkFile("bg-masculino-file", "banners", "masculino"),
        checkFile("bg-baloes-file", "banners", "baloes"),
        checkFile("bg-lembrancinhas-file", "banners", "lembrancinhas"),
        checkFile("bg-cursos-file", "banners", "cursos"),
      ]);

      try {
        saveSiteConfig(config);
        alert("Configurações salvas com sucesso!");
        // Update images/background immediately on the admin page
        if (config.logoUrl && config.logoUrl.trim() !== "") {
          document
            .querySelectorAll(".nav-logo, .hero-logo, .site-logo")
            .forEach((img) => {
              if (img) img.src = config.logoUrl;
            });
        }
        if (config.pageBgUrl) {
          document.body.style.backgroundImage = `url('${config.pageBgUrl}')`;
          document.body.style.backgroundSize = "cover";
          document.body.style.backgroundAttachment = "fixed";
        }
      } catch (error) {
        console.error("Erro ao salvar configurações:", error);
        if (error.name === "QuotaExceededError" || error.code === 22) {
          alert(
            "Erro: O tamanho das imagens excedeu o limite do armazenamento. Tente usar imagens menores ou URLs externas.",
          );
        } else {
          alert(
            "Erro ao salvar configurações. Consulte o console para mais detalhes.",
          );
        }
      }
    });
  }

  // User Management Logic
  function renderUsers() {
    const users = getUsers();
    userList.innerHTML = "";
    const currentUser = sessionStorage.getItem("currentUser");

    users.forEach((u) => {
      const tr = document.createElement("tr");
      const isSelf = u.username === currentUser;

      tr.innerHTML = `
                <td>${u.username}</td>
                <td>
                    ${!isSelf ? `<button class="action-btn delete-btn user-delete-btn" data-username="${u.username}"><i class="fas fa-trash"></i> Excluir</button>` : '<span style="color: #999; font-size: 0.9rem;">(Você)</span>'}
                </td>
            `;
      userList.appendChild(tr);
    });

    document.querySelectorAll(".user-delete-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const username = btn.getAttribute("data-username");
        if (
          confirm(`Tem certeza que deseja excluir o usuário "${username}"?`)
        ) {
          deleteUser(username);
          renderUsers();
        }
      });
    });
  }

  addUserForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const username = document.getElementById("new-username").value;
    const password = document.getElementById("new-password").value;

    if (addUser(username, password)) {
      alert("Usuário adicionado com sucesso!");
      addUserForm.reset();
      renderUsers();
    } else {
      alert("Erro: Usuário já existe.");
    }
  });

  // Initialize
  checkLogin();
});
