const PRICE_THRESHOLD = 150;

function parsePrice(priceStr) {
  if (!priceStr) return 0;
  // Remove 'R$', spaces, and replace comma with dot
  const cleanStr = priceStr
    .replace("R$", "")
    .replace(/\s/g, "")
    .replace(",", ".");
  return parseFloat(cleanStr) || 0;
}

function renderProducts(section, containerId, filters = {}) {
  let products = getProducts().filter((p) => p.section === section);
  const container = document.getElementById(containerId);

  if (!container) return;

  // Apply Search Filter
  if (filters.search) {
    const term = filters.search.toLowerCase();
    products = products.filter((p) => p.name.toLowerCase().includes(term));
  }

  // Apply Collection Filter (Price based)
  if (filters.collection && filters.collection !== "all") {
    products = products.filter((p) => {
      const price = parsePrice(p.price);
      if (filters.collection === "essencia") {
        return price < PRICE_THRESHOLD;
      } else if (filters.collection === "encanto") {
        return price >= PRICE_THRESHOLD;
      }
      return true;
    });
  }

  container.innerHTML = "";

  if (products.length === 0) {
    container.innerHTML =
      '<p style="text-align: center; color: #666; width: 100%; padding: 2rem;">Nenhum produto encontrado para esta seleção.</p>';
    return;
  }

  products.forEach((product) => {
    const card = document.createElement("div");
    card.className = "card";

    // Image
    const imgWrapper = document.createElement("div");
    imgWrapper.className = "card-img-wrapper";
    const img = document.createElement("img");
    img.src = product.image;
    img.alt = product.name;
    imgWrapper.appendChild(img);

    // Content
    const content = document.createElement("div");
    content.className = "card-content";

    // Header row: title (left) and price (right)
    const header = document.createElement("div");
    header.className = "card-header";

    const title = document.createElement("h3");
    title.className = "card-title";
    title.textContent = product.name;

    const priceSpan = document.createElement("div");
    priceSpan.className = "card-price";
    if (product.price) {
      // Normalize and format price as BRL
      const numeric = parsePrice(product.price);
      priceSpan.textContent = new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
      }).format(numeric);
    }

    header.appendChild(title);
    header.appendChild(priceSpan);
    content.appendChild(header);

    // Description: render full description and let card adapt to content height
    if (product.description) {
      const desc = document.createElement("div");
      desc.className = "card-desc";
      desc.textContent = product.description;
      if (product.isBold) {
        desc.style.fontWeight = "700";
        desc.style.color = "#333";
      }
      content.appendChild(desc);
    }

    // Button Logic
    const btn = document.createElement("a");
    btn.href = "javascript:void(0)";
    btn.className = "btn card-btn";

    if (section === "cursos") {
      btn.classList.add("btn-secondary");
      btn.textContent = "Quero saber mais";
      btn.onclick = () => sendWhatsAppMessage(product.name, "curso");
    } else {
      // Add icon for non-course items
      const icon = document.createElement("i");
      icon.className = "fab fa-whatsapp";
      icon.style.marginRight = "8px";
      btn.appendChild(icon);

      btn.appendChild(document.createTextNode(" Pedir no WhatsApp"));
      // Pass the section as type, sendWhatsAppMessage handles non-curso as generic order
      btn.onclick = () => sendWhatsAppMessage(product.name, section);
    }

    content.appendChild(btn);

    card.appendChild(imgWrapper);
    card.appendChild(content);

    container.appendChild(card);
  });
}
