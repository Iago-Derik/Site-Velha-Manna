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
  // Normalize section comparison (case-insensitive) to avoid mismatch issues
  const targetSection = (section || "").toString().toLowerCase();
  let products = getProducts().filter((p) => {
    const s = (p.section || "").toString().toLowerCase();
    return s === targetSection;
  });
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
    } else {
      // Leave empty if no base price, or could add logic to show range if rules exist
      priceSpan.textContent = "";
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

    // Price Rules Buttons
    let selectedRuleDetails = null;

    if (
      product.priceRules &&
      Array.isArray(product.priceRules) &&
      product.priceRules.length > 0
    ) {
      const rulesContainer = document.createElement("div");
      rulesContainer.className = "price-rules-buttons";
      rulesContainer.style.marginBottom = "0.8rem";
      rulesContainer.style.display = "flex";
      rulesContainer.style.gap = "0.5rem";
      rulesContainer.style.flexWrap = "wrap";

      product.priceRules.forEach((rule) => {
        const ruleBtn = document.createElement("button");
        // Basic styling for rule buttons
        ruleBtn.style.padding = "6px 10px";
        ruleBtn.style.fontSize = "0.8rem";
        ruleBtn.style.borderRadius = "8px";
        ruleBtn.style.border = "1px solid #ddd";
        ruleBtn.style.background = "#f9f9f9";
        ruleBtn.style.cursor = "pointer";
        ruleBtn.style.transition = "all 0.2s";
        ruleBtn.style.fontFamily = "inherit";
        ruleBtn.textContent = rule.label;

        ruleBtn.onclick = () => {
          // Update price
          const numeric = parsePrice(rule.price);
          priceSpan.textContent = new Intl.NumberFormat("pt-BR", {
            style: "currency",
            currency: "BRL",
          }).format(numeric);

          // Highlight button
          Array.from(rulesContainer.children).forEach((btn) => {
            btn.style.background = "#f9f9f9";
            btn.style.color = "var(--text-color)";
            btn.style.borderColor = "#ddd";
          });
          ruleBtn.style.background = "var(--primary-color)";
          ruleBtn.style.color = "#333";
          ruleBtn.style.borderColor = "var(--primary-dark)";

          // Store selected detail
          selectedRuleDetails = `${rule.label} - ${rule.price}`;
        };

        rulesContainer.appendChild(ruleBtn);
      });

      content.appendChild(rulesContainer);
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
      btn.onclick = () =>
        sendWhatsAppMessage(product.name, section, selectedRuleDetails);
    }

    content.appendChild(btn);

    card.appendChild(imgWrapper);
    card.appendChild(content);

    container.appendChild(card);
  });
}
