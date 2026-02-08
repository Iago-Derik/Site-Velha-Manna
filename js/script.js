function sendWhatsAppMessage(itemName, type) {
    const phoneNumber = "5511999999999";
    let message = "";

    if (type === 'curso') {
        message = `Olá! Gostaria de saber mais sobre o curso: ${itemName}`;
    } else {
        message = `Olá! Gostaria de encomendar este modelo artesanal feito à mão: ${itemName} 💛`;
    }

    const encodedMessage = encodeURIComponent(message);
    const url = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;

    window.open(url, '_blank');
}

// Global function to re-init animations for new content
window.initAnimations = function() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('.card, .section-title').forEach(el => {
        // Only observe if not already visible/observed (to avoid resetting styles unnecessarily)
        if (!el.classList.contains('visible') && !el.classList.contains('observing')) {
             el.style.opacity = '0';
             el.style.transform = 'translateY(20px)';
             el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
             observer.observe(el);
             el.classList.add('observing'); // Mark as observed
        }
    });
};

document.addEventListener('DOMContentLoaded', () => {
    // Inject styles for animation
    const style = document.createElement('style');
    style.innerHTML = `
        .visible {
            opacity: 1 !important;
            transform: translateY(0) !important;
        }
    `;
    document.head.appendChild(style);

    // Initial animation setup
    window.initAnimations();

    // Navbar Toggle Logic
    const hamburger = document.querySelector(".hamburger");
    const navMenu = document.querySelector(".nav-menu");

    if (hamburger && navMenu) {
        hamburger.addEventListener("click", () => {
            hamburger.classList.toggle("active");
            navMenu.classList.toggle("active");
        });

        document.querySelectorAll(".nav-link").forEach(n => n.addEventListener("click", () => {
            hamburger.classList.remove("active");
            navMenu.classList.remove("active");
        }));
    }
});
