document.addEventListener("DOMContentLoaded", function () {
  const galleryGrid = document.querySelector('.gallery-grid');
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightbox-img');

  // Dynamically load 30 images
  for (let i = 1; i <= 30; i++) {
    const imgWrapper = document.createElement('div');
    imgWrapper.classList.add('cushion-item');

    const img = document.createElement('img');
    img.src = `Cushion Gallery/(${i}).jpg`;
    img.alt = `Cushion ${i}`;
    img.loading = "lazy";

    imgWrapper.appendChild(img);
    galleryGrid.appendChild(imgWrapper);
  }

  // Open lightbox on image click
  galleryGrid.addEventListener('click', function (e) {
    if (e.target.tagName === 'IMG') {
      lightboxImg.src = e.target.src;
      lightboxImg.alt = e.target.alt;
      lightbox.style.display = 'flex';
    }
  });

  // Close lightbox when clicking outside the image
  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) {
      lightbox.style.display = 'none';
      lightboxImg.src = '';
      lightboxImg.alt = '';
    }
  });
});
