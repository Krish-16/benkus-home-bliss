document.addEventListener("DOMContentLoaded", function () {
  // --- 1. SPA Tab Switching Logic ---
  const navLinks = document.querySelectorAll(".nav-link");
  const viewSections = document.querySelectorAll(".view-section");

  navLinks.forEach((link) => {
    link.addEventListener("click", function (e) {
      e.preventDefault();
      const targetId = this.getAttribute("data-target");

      // Set active nav link
      navLinks.forEach((l) => l.classList.remove("active"));
      this.classList.add("active");

      // Switch active view section
      viewSections.forEach((section) => {
        if (section.id === targetId) {
          section.classList.add("active");
          // Smooth fade-in and slide-up transition trigger
          setTimeout(() => {
            section.style.opacity = "1";
            section.style.transform = "translateY(0)";
          }, 50);
        } else {
          section.classList.remove("active");
          section.style.opacity = "0";
          section.style.transform = "translateY(10px)";
        }
      });

      // Scroll to top of window smoothly on tab switch
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  });

  // Intercept the homepage gallery link button to switch tabs
  const galleryLinkBtn = document.querySelector(".gallery-link-btn");
  if (galleryLinkBtn) {
    galleryLinkBtn.addEventListener("click", function (e) {
      e.preventDefault();
      const galleryTab = document.querySelector('.nav-link[data-target="gallery-view"]');
      if (galleryTab) {
        galleryTab.click();
      }
    });
  }

  // --- 2. Dynamic Cushion Gallery Loading ---
  const galleryGrid = document.querySelector(".gallery-grid");
  if (galleryGrid) {
    for (let i = 1; i <= 30; i++) {
      const imgWrapper = document.createElement("div");
      imgWrapper.className = "cushion-item";

      const img = document.createElement("img");
      img.src = `Cushion Gallery/(${i}).jpg`;
      img.alt = `Cushion ${i}`;
      img.loading = "lazy";

      imgWrapper.appendChild(img);
      galleryGrid.appendChild(imgWrapper);
    }
  }

  // --- 3. Unified Lightbox Logic ---
  const lightbox = document.getElementById("lightbox");
  const lightboxImg = document.getElementById("lightbox-img");

  if (lightbox && lightboxImg) {
    // Open lightbox when clicking on any best seller or gallery image
    document.addEventListener("click", function (e) {
      const target = e.target;
      if (
        target.tagName === "IMG" &&
        (target.closest(".cushion-list") || target.closest(".gallery-grid"))
      ) {
        lightboxImg.src = target.src;
        lightboxImg.alt = target.alt;
        lightbox.style.display = "flex";
      }
    });

    // Close lightbox on clicking outside the image
    lightbox.addEventListener("click", function (e) {
      if (e.target === lightbox || e.target.id === "lightbox-close") {
        lightbox.style.display = "none";
        lightboxImg.src = "";
        lightboxImg.alt = "";
      }
    });
  }
});

