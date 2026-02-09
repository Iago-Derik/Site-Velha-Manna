function renderProducts(section, containerId) {
    const products = getProducts().filter(p => p.section === section);
    const container = document.getElementById(containerId);

    if (!container) return;

    container.innerHTML = '';

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
