const PRICE_THRESHOLD = 150;

function parsePrice(priceStr) {
    if (!priceStr) return 0;
    // Remove 'R$', spaces, and replace comma with dot
    const cleanStr = priceStr.replace('R$', '').replace(/\s/g, '').replace(',', '.');
    return parseFloat(cleanStr) || 0;
}

function renderProducts(section, containerId, filters = {}) {
    let products = getProducts().filter(p => p.section === section);
    const container = document.getElementById(containerId);

    if (!container) return;

    // Apply Search Filter
    if (filters.search) {
        const term = filters.search.toLowerCase();
        products = products.filter(p => p.name.toLowerCase().includes(term));
    }

    // Apply Collection Filter (Price based)
    if (filters.collection && filters.collection !== 'all') {
        products = products.filter(p => {
            const price = parsePrice(p.price);
            if (filters.collection === 'essencia') {
                return price < PRICE_THRESHOLD;
            } else if (filters.collection === 'encanto') {
                return price >= PRICE_THRESHOLD;
            }
            return true;
        });
    }

    container.innerHTML = '';

    if (products.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #666; width: 100%; padding: 2rem;">Nenhum produto encontrado para esta seleção.</p>';
        return;
    }

    products.forEach(product => {
        const card = document.createElement('div');
        card.className = 'card';

        // Image
        const imgWrapper = document.createElement('div');
        imgWrapper.className = 'card-img-wrapper';
        const img = document.createElement('img');
        img.src = product.image;
        img.alt = product.name;
        imgWrapper.appendChild(img);

        // Content
        const content = document.createElement('div');
        content.className = 'card-content';

        const title = document.createElement('h3');
        title.className = 'card-title';
        title.textContent = product.name;

        content.appendChild(title);

        if (product.price) {
            const price = document.createElement('p');
            price.style.color = '#333';
            price.style.fontWeight = 'bold';
            price.style.marginBottom = '0.5rem';
            price.style.fontSize = '1.1rem';
            price.textContent = product.price;
            content.appendChild(price);
        }

        if (product.description) {
            const desc = document.createElement('p');
            desc.className = 'card-text';
            desc.textContent = product.description;
            if (product.isBold) {
                desc.style.fontWeight = 'bold';
                desc.style.color = '#333';
            }
            content.appendChild(desc);
        }

        // Button Logic
        const btn = document.createElement('a');
        btn.href = 'javascript:void(0)';
        btn.className = 'btn card-btn';

        if (section === 'cursos') {
             btn.classList.add('btn-secondary');
             btn.textContent = 'Quero saber mais';
             btn.onclick = () => sendWhatsAppMessage(product.name, 'curso');
        } else {
             // Add icon for non-course items
             const icon = document.createElement('i');
             icon.className = 'fab fa-whatsapp';
             icon.style.marginRight = '8px';
             btn.appendChild(icon);

             if (section === 'baloes') {
                 btn.appendChild(document.createTextNode(' Encomendar'));
                 btn.onclick = () => sendWhatsAppMessage(product.name, 'balao');
             } else {
                 btn.appendChild(document.createTextNode(' Pedir no WhatsApp'));
                 // Pass the section as type, sendWhatsAppMessage handles non-curso as generic order
                 btn.onclick = () => sendWhatsAppMessage(product.name, section);
             }
        }

        content.appendChild(btn);

        card.appendChild(imgWrapper);
        card.appendChild(content);

        container.appendChild(card);
    });
}
