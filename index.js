document.addEventListener("DOMContentLoaded", function () {
  const bestSellerGrid = document.querySelector('.cushion-list');
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightbox-img');

  bestSellerGrid.addEventListener('click', function (e) {
    if (e.target.tagName === 'IMG') {
      lightboxImg.src = e.target.src;
      lightboxImg.alt = e.target.alt;
      lightbox.style.display = 'flex';
    }
  });

  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) {
      lightbox.style.display = 'none';
      lightboxImg.src = '';
      lightboxImg.alt = '';
    }
  });
});
