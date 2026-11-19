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
// --- INTERAKSI LOGO MEMBAL (JELLY EFFECT) ---
const logoBtn = document.getElementById('logoBtn');
if (logoBtn) {
  const logoImg = logoBtn.querySelector('img');
  logoBtn.addEventListener('click', (e) => {
    // Jalankan efek membal
    logoImg.classList.remove('jelly-active');
    void logoImg.offsetWidth; // Reset animasi
    logoImg.classList.add('jelly-active');
  });
}

// --- INTERAKSI KLIK BUKA/TUTUP PROFIL POPUP ---
const profileBtn = document.getElementById('profileBtn');
const profileCard = document.getElementById('profileCard');

if (profileBtn && profileCard) {
  profileBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    const isHidden = profileCard.style.display === 'none' || profileCard.style.display === '';
    profileCard.style.display = isHidden ? 'block' : 'none';
  });

  // Menutup popup saat klik di luar kartu
  document.addEventListener('click', (e) => {
    if (!profileCard.contains(e.target) && !profileBtn.contains(e.target)) {
      profileCard.style.display = 'none';
    }
  });
}