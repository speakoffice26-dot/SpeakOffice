/**
 * SPEAKOFFICE - Firebase Configuration & Data Persistence Layer
 * Media Pembelajaran Komunikasi & Etika Perkantoran untuk Siswa SMK Manajemen Perkantoran
 * 
 * File ini menangani penyimpanan data aktivitas belajar siswa ke Firebase Firestore
 * dengan fallback otomatis ke localStorage agar aplikasi tetap berjalan lancar 100%
 * meskipun kredensial Firebase belum dimasukkan oleh guru/sekolah.
 */

// =============================================================================
// 1. KONFIGURASI FIREBASE (SIAP PAKAI / PLACEHOLDER)
// =============================================================================
// Ganti nilai di bawah ini dengan kredensial dari Firebase Console proyek Anda:
// (Buka https://console.firebase.google.com -> Buat Proyek -> Tambahkan Web App)
const firebaseConfig = {
  apiKey: "YOUR_FIREBASE_API_KEY_HERE",
  authDomain: "speakoffice-smk.firebaseapp.com",
  projectId: "speakoffice-smk",
  storageBucket: "speakoffice-smk.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef1234567890"
};

// State koneksi Firebase
let isFirebaseInitialized = false;
let firestoreDb = null;

// Inisialisasi Firebase jika library Firebase SDK sudah dimuat di halaman
(function initFirebase() {
  try {
    if (typeof firebase !== 'undefined' && firebase.initializeApp) {
      if (!firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
      }
      firestoreDb = firebase.firestore();
      isFirebaseInitialized = true;
      console.log("✅ [SPEAKOFFICE] Firebase Firestore berhasil diinisialisasi.");
    } else {
      console.info("ℹ️ [SPEAKOFFICE] Berjalan dalam mode LocalStorage (Firebase SDK opsional).");
    }
  } catch (err) {
    console.warn("⚠️ [SPEAKOFFICE] Firebase belum aktif, menggunakan LocalStorage fallback:", err.message);
    isFirebaseInitialized = false;
  }
})();

// =============================================================================
// 2. DATA DUMMY AWAL (SEED DATA UNTUK DEMO DASHBOARD GURU)
// =============================================================================
const DEFAULT_STUDENT_ACTIVITIES = [
  {
    id: "act-1731560001",
    studentName: "Naura Thara",
    studentClass: "XI MP 1",
    studentAbsent: "18",
    category: "Menerima Tamu & Janji Temu",
    score: 100,
    totalQuestions: 5,
    correctAnswers: 5,
    predicate: "Sangat Kompeten",
    timestamp: "2026-11-18 09:30:15"
  },
  {
    id: "act-1731560002",
    studentName: "Dimas Arya Pratama",
    studentClass: "XI MP 1",
    studentAbsent: "08",
    category: "Etika Telepon & Korespondensi Bisnis",
    score: 80,
    totalQuestions: 5,
    correctAnswers: 4,
    predicate: "Kompeten",
    timestamp: "2026-11-18 10:15:40"
  },
  {
    id: "act-1731560003",
    studentName: "Siti Rahmawati",
    studentClass: "XI MP 2",
    studentAbsent: "25",
    category: "Pelayanan Prima & Penanganan Keluhan",
    score: 100,
    totalQuestions: 5,
    correctAnswers: 5,
    predicate: "Sangat Kompeten",
    timestamp: "2026-11-18 11:05:22"
  },
  {
    id: "act-1731560004",
    studentName: "Fajar Nugraha",
    studentClass: "X MP 2",
    studentAbsent: "12",
    category: "Menerima Tamu & Janji Temu",
    score: 60,
    totalQuestions: 5,
    correctAnswers: 3,
    predicate: "Perlu Latihan",
    timestamp: "2026-11-18 13:45:10"
  },
  {
    id: "act-1731560005",
    studentName: "Aulia Putri Zahra",
    studentClass: "XII MP 1",
    studentAbsent: "04",
    category: "Semua Kategori (Uji Komprehensif)",
    score: 93,
    totalQuestions: 15,
    correctAnswers: 14,
    predicate: "Sangat Kompeten",
    timestamp: "2026-11-19 08:20:05"
  }
];

// Catatan: Siswa baru dimulai dari keadaan 0 (tanpa riwayat/nilai awal).
// DEFAULT_STUDENT_ACTIVITIES tetap disediakan bila ingin memuat simulasi data demo di dashboard guru.

// =============================================================================
// 3. API MODULAR SPEAKOFFICE DB (FIREBASE + LOCALSTORAGE FALLBACK)
// =============================================================================
window.SpeakOfficeDB = {
  /**
   * Menyimpan sesi data diri siswa saat pertama kali masuk
   */
  saveStudentSession: function (data) {
    if (data.name) localStorage.setItem('speakoffice_student_name', data.name.trim());
    if (data.studentClass) localStorage.setItem('speakoffice_student_class', data.studentClass.trim());
    if (data.absent) localStorage.setItem('speakoffice_student_absent', data.absent.toString().trim());
    if (data.school) localStorage.setItem('speakoffice_student_school', data.school.trim());
    if (data.avatar) localStorage.setItem('speakoffice_student_avatar', data.avatar);
    return this.getStudentSession();
  },

  /**
   * Mengambil sesi data diri siswa yang sedang aktif
   */
  getStudentSession: function () {
    return {
      name: localStorage.getItem('speakoffice_student_name') || '',
      studentClass: localStorage.getItem('speakoffice_student_class') || '',
      absent: localStorage.getItem('speakoffice_student_absent') || '',
      school: localStorage.getItem('speakoffice_student_school') || 'SMK Negeri 1 Jakarta',
      avatar: localStorage.getItem('speakoffice_student_avatar') || '👩‍💼'
    };
  },

  /**
   * Menyimpan aktivitas pengerjaan kuis/studi kasus siswa
   * @param {Object} activityData
   * {
   *   studentName: string,
   *   studentClass: string,
   *   studentAbsent: string,
   *   category: string,
   *   score: number (0-100),
   *   totalQuestions: number,
   *   correctAnswers: number,
   *   predicate: string ('Sangat Kompeten' | 'Kompeten' | 'Perlu Latihan')
   * }
   */
  saveStudentActivity: async function (activityData) {
    const now = new Date();
    const formattedDate = now.getFullYear() + "-" +
      String(now.getMonth() + 1).padStart(2, '0') + "-" +
      String(now.getDate()).padStart(2, '0') + " " +
      String(now.getHours()).padStart(2, '0') + ":" +
      String(now.getMinutes()).padStart(2, '0') + ":" +
      String(now.getSeconds()).padStart(2, '0');

    const record = {
      id: "act-" + Date.now(),
      studentName: activityData.studentName || localStorage.getItem('speakoffice_student_name') || "Siswa SpeakOffice",
      studentClass: activityData.studentClass || localStorage.getItem('speakoffice_student_class') || "Kelas XI MP",
      studentAbsent: activityData.studentAbsent || localStorage.getItem('speakoffice_student_absent') || "-",
      category: activityData.category || "Interactive Case Study",
      score: typeof activityData.score === 'number' ? activityData.score : 0,
      totalQuestions: activityData.totalQuestions || 0,
      correctAnswers: activityData.correctAnswers || 0,
      predicate: activityData.predicate || (activityData.score >= 85 ? "Sangat Kompeten" : activityData.score >= 75 ? "Kompeten" : "Perlu Latihan"),
      timestamp: formattedDate
    };

    // 1. Simpan ke LocalStorage (selalu tersimpan sebagai cache lokal)
    let logs = [];
    try {
      const raw = localStorage.getItem('speakoffice_activity_logs');
      logs = raw ? JSON.parse(raw) : [];
    } catch (e) {
      logs = [];
    }
    logs.unshift(record); // Tambahkan di baris teratas (paling baru)
    localStorage.setItem('speakoffice_activity_logs', JSON.stringify(logs));

    // 2. Simpan ke Firebase Firestore jika sudah terhubung
    if (isFirebaseInitialized && firestoreDb) {
      try {
        await firestoreDb.collection("student_activities").add(record);
        console.log("☁️ [SPEAKOFFICE] Berhasil merekam aktivitas ke Firebase Firestore:", record);
        return { success: true, mode: 'firebase', data: record };
      } catch (err) {
        console.warn("⚠️ Gagal sync ke Firestore, data tersimpan di LocalStorage:", err.message);
        return { success: true, mode: 'local', data: record };
      }
    }

    return { success: true, mode: 'local', data: record };
  },

  /**
   * Mengambil seluruh daftar aktivitas siswa (dengan opsi filter kelas)
   */
  getStudentActivities: async function (classFilter = "") {
    // Jika Firebase Firestore aktif, coba ambil data terbaru dari cloud
    if (isFirebaseInitialized && firestoreDb) {
      try {
        let query = firestoreDb.collection("student_activities").orderBy("timestamp", "desc");
        if (classFilter && classFilter !== "all") {
          query = query.where("studentClass", "==", classFilter);
        }
        const snapshot = await query.get();
        const cloudData = [];
        snapshot.forEach(doc => cloudData.push({ id: doc.id, ...doc.data() }));
        if (cloudData.length > 0) {
          return cloudData;
        }
      } catch (err) {
        console.warn("⚠️ Gagal mengambil dari Firestore, fallback ke LocalStorage:", err.message);
      }
    }

    // Fallback: Membaca dari LocalStorage
    try {
      const raw = localStorage.getItem('speakoffice_activity_logs');
      let data = raw ? JSON.parse(raw) : [];
      if (classFilter && classFilter !== "all") {
        data = data.filter(item => item.studentClass.toLowerCase() === classFilter.toLowerCase());
      }
      return data;
    } catch (e) {
      return [];
    }
  },

  /**
   * Ekspor seluruh data aktivitas siswa ke format file CSV (kompatibel Excel dengan UTF-8 BOM)
   */
  exportToCSV: function (dataToExport) {
    const list = dataToExport && dataToExport.length > 0 ? dataToExport : this.getStudentActivitiesSync();
    if (!list || list.length === 0) {
      return false;
    }

    // Header Kolom CSV
    const headers = ["No", "Waktu Pengerjaan", "Nama Siswa", "Kelas / Jurusan", "No. Absen", "Kategori Skenario", "Skor Angka", "Predikat"];
    
    const rows = list.map((item, index) => [
      index + 1,
      `"${item.timestamp || ''}"`,
      `"${(item.studentName || '').replace(/"/g, '""')}"`,
      `"${(item.studentClass || '').replace(/"/g, '""')}"`,
      `"${item.studentAbsent || '-'}"`,
      `"${(item.category || '').replace(/"/g, '""')}"`,
      item.score,
      `"${item.predicate || ''}"`
    ]);

    const csvContent = "\uFEFF" + [headers.join(","), ...rows.map(r => r.join(","))].join("\r\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement("a");
    const dateStr = new Date().toISOString().slice(0, 10);
    link.setAttribute("href", url);
    link.setAttribute("download", `Rekap_Nilai_SPEAKOFFICE_${dateStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    return true;
  },

  /**
   * Pengambilan synchronous langsung dari LocalStorage untuk render instan
   */
  getStudentActivitiesSync: function (classFilter = "") {
    try {
      const raw = localStorage.getItem('speakoffice_activity_logs');
      let data = raw ? JSON.parse(raw) : [];
      if (classFilter && classFilter !== "all") {
        data = data.filter(item => item.studentClass.toLowerCase() === classFilter.toLowerCase());
      }
      return data;
    } catch (e) {
      return [];
    }
  },

  /**
   * Reset seluruh progres pembelajaran siswa kembali ke nol murni
   * @param {boolean} keepProfile - Jika true, nama dan kelas tetap disimpan, hanya nilai & kasus yang di-reset ke 0.
   */
  resetStudentProgress: function (keepProfile = true) {
    localStorage.removeItem('speakoffice_activity_logs');
    if (!keepProfile) {
      localStorage.removeItem('speakoffice_student_name');
      localStorage.removeItem('speakoffice_student_class');
      localStorage.removeItem('speakoffice_student_absent');
      localStorage.removeItem('speakoffice_student_school');
      localStorage.removeItem('speakoffice_student_avatar');
    }
  },

  /**
   * Muat data contoh demo simulasi (khusus jika guru ingin melihat simulasi dashboard)
   */
  loadDemoData: function () {
    localStorage.setItem('speakoffice_activity_logs', JSON.stringify(DEFAULT_STUDENT_ACTIVITIES));
  },

  /**
   * Menghapus seluruh data riwayat aktivitas (khusus reset oleh guru)
   */
  resetActivities: function () {
    localStorage.removeItem('speakoffice_activity_logs');
  }
};
