// ==========================================================================
// SPEAKOFFICE MAIN SCRIPT (js/main.js)
// Dipegang oleh: Device 1 (Navigasi Global & Interaksi Dasar)
// ==========================================================================

document.addEventListener('DOMContentLoaded', () => {
  console.log('SpeakOffice Design System & Navigation Ready.');

  // 1. Efek bayangan tambahan pada Top Navbar saat halaman di-scroll ke bawah
  const navbar = document.querySelector('.navbar');
  if (navbar) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 10) {
        navbar.style.boxShadow = '0 4px 20px rgba(10, 30, 94, 0.08)';
      } else {
        navbar.style.boxShadow = 'none';
      }
    });
  }

  // 2. Penanda otomatis menu aktif (Active Link) di Top Navbar & Mobile Bottom Nav
  const currentPath = window.location.pathname.split('/').pop() || 'index.html';
  const allNavLinks = document.querySelectorAll('.nav-link, .bottom-nav-item');

  allNavLinks.forEach(link => {
    const href = link.getAttribute('href');
    if (href && href.endsWith(currentPath)) {
      link.classList.add('active');
    }
  });
});