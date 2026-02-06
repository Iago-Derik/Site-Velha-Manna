function sendWhatsAppMessage(itemName, type) { const phoneNumber = "5511999999999"; let message = "";

if (type === 'curso') {
    message = `Olá! Gostaria de saber mais sobre o curso: ${itemName}`;
} else {
    message = `Olá! Gostaria de encomendar este modelo artesanal feito à mão: ${itemName} 💛`;
}

const encodedMessage = encodeURIComponent(message);
const url = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;

window.open(url, '_blank');
}

// Add simple animation on scroll
document.addEventListener('DOMContentLoaded', () => { const observer = new IntersectionObserver((entries) => { entries.forEach(entry => { if (entry.isIntersecting) { entry.target.classList.add('visible'); } }); }, { threshold: 0.1 });

document.querySelectorAll('.card, .section-title').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(el);
});

// Inject styles for animation
const style = document.createElement('style');
style.innerHTML = `
    .visible {
        opacity: 1 !important;
        transform: translateY(0) !important;
    }
`;
document.head.appendChild(style);
});
