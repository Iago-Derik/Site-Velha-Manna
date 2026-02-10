function sendWhatsAppMessage(itemName, type) {
  const phoneNumber = "5511999999999";
  let message = "";

  if (type === "curso") {
    message = `Olá! Gostaria de saber mais sobre o curso: ${itemName}`;
  } else {
    message = `Olá! Gostaria de encomendar este modelo artesanal feito à mão: ${itemName} 💛`;
  }

  const encodedMessage = encodeURIComponent(message);
  const url = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;

  window.open(url, "_blank");
}

// Global function to re-init animations for new content
window.initAnimations = function () {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
        }
      });
    },
    { threshold: 0.1 },
  );

  document.querySelectorAll(".card, .section-title").forEach((el) => {
    // Only observe if not already visible/observed (to avoid resetting styles unnecessarily)
    if (
      !el.classList.contains("visible") &&
      !el.classList.contains("observing")
    ) {
      el.style.opacity = "0";
      el.style.transform = "translateY(20px)";
      el.style.transition = "opacity 0.6s ease, transform 0.6s ease";
      observer.observe(el);
      el.classList.add("observing"); // Mark as observed
    }
  });
};

document.addEventListener("DOMContentLoaded", () => {
  // Inject styles for animation
  const style = document.createElement("style");
  style.innerHTML = `
        .visible {
            opacity: 1 !important;
            transform: translateY(0) !important;
        }
    `;
  document.head.appendChild(style);

  // Initial animation setup
  window.initAnimations();

  // Load Site Config
  if (typeof getSiteConfig === 'function') {
      const config = getSiteConfig();
      if (config && config.logoUrl && config.logoUrl.trim() !== '') {
          document.querySelectorAll('.nav-logo, .hero-logo, .site-logo').forEach(img => {
              img.src = config.logoUrl;
          });
      }
      if (config.pageBgUrl) {
          document.body.style.backgroundImage = `url('${config.pageBgUrl}')`;
          document.body.style.backgroundSize = 'cover';
          document.body.style.backgroundAttachment = 'fixed';
      }
      if (config.banners) {
          const setBannerBg = (id, bg) => {
              const el = document.getElementById(id);
              if (el && bg) {
                  // Check if it looks like a full CSS value (gradient/url) or just a raw URL
                  if (bg.includes('gradient') || bg.includes('url(')) {
                      el.style.background = bg;
                  } else {
                       el.style.background = `url('${bg}')`;
                       el.style.backgroundSize = 'cover';
                       el.style.backgroundPosition = 'center';
                  }
              }
          };
          setBannerBg('banner-feminino', config.banners.feminino);
          setBannerBg('banner-masculino', config.banners.masculino);
          setBannerBg('banner-baloes', config.banners.baloes);
          setBannerBg('banner-lembrancinhas', config.banners.lembrancinhas);
          setBannerBg('banner-cursos', config.banners.cursos);
      }
  }

  // (removed automatic active-link assignment per user request)

  // Navbar Toggle Logic
  const hamburger = document.querySelector(".hamburger");
  const navMenu = document.querySelector(".nav-menu");

  if (hamburger && navMenu) {
    hamburger.addEventListener("click", () => {
      hamburger.classList.toggle("active");
      navMenu.classList.toggle("active");
    });

    document.querySelectorAll(".nav-link").forEach((n) =>
      n.addEventListener("click", () => {
        hamburger.classList.remove("active");
        navMenu.classList.remove("active");
      }),
    );
  }
});
