function sendWhatsAppMessage(itemName, type, customDetails = null, imageUrl = null) {
  const phoneNumber = "";
  let message = "";

  if (type === "curso") {
    message = `Olá! Gostaria de saber mais sobre o curso: ${itemName}`;
  } else {
    let detailsPart = customDetails ? ` de ${customDetails}` : "";
    message = `Olá, tenho interesse em ${itemName}${detailsPart}!`;
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
          const el = entry.target;
          el.classList.add("scroll-visible");
          el.classList.remove("scroll-hidden");

          // Remove inline transition after animation ends to restore CSS hover speeds
          el.addEventListener(
            "transitionend",
            () => {
              el.style.transition = "";
            },
            { once: true },
          );

          observer.unobserve(el);
        }
      });
    },
    { threshold: 0.1 },
  );

  document.querySelectorAll(".card, .section-title").forEach((el) => {
    if (!el.classList.contains("scroll-visible")) {
      el.classList.add("scroll-hidden");
      // Set slower transition for the entrance animation
      el.style.transition = "opacity 0.6s ease, transform 0.6s ease";
      observer.observe(el);
    }
  });
};

document.addEventListener("DOMContentLoaded", () => {
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
      /*
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
      */
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
