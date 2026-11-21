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
  apiKey: "AIzaSyAzsGW9N1p1a1x1DD_3yg-BzPDANswjW4U",
  authDomain: "speakoffice.firebaseapp.com",
  projectId: "speakoffice",
  storageBucket: "speakoffice.firebasestorage.app",
  messagingSenderId: "880929150478",
  appId: "1:880929150478:web:4ce9260e7c0bfa10b8ce5f",
  measurementId: "G-JNRH5LC5GM"
};


// State koneksi Firebase
let isFirebaseInitialized = false;
let firestoreDb = null;
let firebaseAuth = null;

// Inisialisasi Firebase jika library Firebase SDK sudah dimuat di halaman
(function initFirebase() {
  try {
    if (typeof firebase !== 'undefined' && firebase.initializeApp) {
      if (!firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
      }
      firestoreDb = firebase.firestore();
      firebaseAuth = firebase.auth();
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
// 3. AUTENTIKASI SISWA
// =============================================================================


async function registerStudent(email, password, studentData) {
  try {
    const userCredential = await firebaseAuth.createUserWithEmailAndPassword(
      email,
      password
    );

    const uid = userCredential.user.uid;

    await firestoreDb.collection("students").doc(uid).set({
      uid: uid,
      email: email,
      name: studentData.name,
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });

    return {
      success: true,
      message: "Pendaftaran berhasil!"
    };

  } catch (error) {
    console.error("Gagal mendaftar:", error);

    return {
      success: false,
      message: error.message
    };
  }
}


// =============================================================================
// 4. INTEGRASI PROFIL SISWA DENGAN FIRESTORE
// =============================================================================

// Mengambil profil siswa berdasarkan UID akun yang sedang login
async function getCurrentStudentProfile() {
  try {
    const user = firebaseAuth.currentUser;

    if (!user) {
      throw new Error("Siswa belum login.");
    }

    const doc = await firestoreDb
      .collection("students")
      .doc(user.uid)
      .get();

    if (!doc.exists) {
      throw new Error("Data profil siswa tidak ditemukan.");
    }

    return {
      success: true,
      data: doc.data()
    };

  } catch (error) {
    console.error("Gagal mengambil profil siswa:", error);

    return {
      success: false,
      message: error.message
    };
  }
}


// Menyimpan perubahan profil siswa berdasarkan UID
async function updateCurrentStudentProfile(profileData) {
  try {
    const user = firebaseAuth.currentUser;

    if (!user) {
      throw new Error("Siswa belum login.");
    }

    const studentProfile = {
      name: profileData.name || "",
      studentClass: profileData.studentClass || "",
      absent: profileData.absent || "",
      school: profileData.school || "",
      avatar: profileData.avatar || "👩‍💼",
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    };

    await firestoreDb
      .collection("students")
      .doc(user.uid)
      .set(studentProfile, { merge: true });

    return {
      success: true,
      message: "Profil berhasil diperbarui!"
    };

  } catch (error) {
    console.error("Gagal menyimpan profil siswa:", error);

    return {
      success: false,
      message: error.message
    };
  }
}



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
  if (Object.prototype.hasOwnProperty.call(data, 'name')) {
    localStorage.setItem(
      'speakoffice_student_name',
      (data.name || '').trim()
    );
  }

  if (Object.prototype.hasOwnProperty.call(data, 'studentClass')) {
    localStorage.setItem(
      'speakoffice_student_class',
      (data.studentClass || '').trim()
    );
  }

  if (Object.prototype.hasOwnProperty.call(data, 'absent')) {
    localStorage.setItem(
      'speakoffice_student_absent',
      String(data.absent || '').trim()
    );
  }

  if (Object.prototype.hasOwnProperty.call(data, 'school')) {
    localStorage.setItem(
      'speakoffice_student_school',
      (data.school || '').trim()
    );
  }

  if (Object.prototype.hasOwnProperty.call(data, 'avatar')) {
    localStorage.setItem(
      'speakoffice_student_avatar',
      data.avatar || '👩‍💼'
    );
  }

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
   * Mencatat 1 kasus/soal (1..15) yang sudah dikerjakan siswa
   */
  recordAnsweredCase: function (caseId, meta = {}) {
    if (!caseId) return this.getAnsweredCaseIds();
    const key = 'speakoffice_answered_cases';
    let map = {};
    try {
      const raw = localStorage.getItem(key);
      map = raw ? JSON.parse(raw) : {};
    } catch (e) {
      map = {};
    }

    map[String(caseId)] = {
      id: String(caseId),
      categoryTag: meta.categoryTag || '',
      categoryName: meta.categoryName || '',
      correct: Boolean(meta.correct),
      updatedAt: Date.now()
    };

    localStorage.setItem(key, JSON.stringify(map));
    return Object.keys(map);
  },

  /**
   * Mengambil daftar ID kasus unik yang sudah dikerjakan siswa
   */
  getAnsweredCaseIds: function () {
    try {
      const raw = localStorage.getItem('speakoffice_answered_cases');
      const map = raw ? JSON.parse(raw) : {};
      return Object.keys(map);
    } catch (e) {
      return [];
    }
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
  try {
    const user = firebaseAuth?.currentUser;

    if (!user || !firestoreDb) {
      throw new Error("Siswa belum login atau Firebase belum terhubung.");
    }

    const uid = user.uid;
    const now = new Date();

    const formattedDate =
      now.getFullYear() + "-" +
      String(now.getMonth() + 1).padStart(2, '0') + "-" +
      String(now.getDate()).padStart(2, '0') + " " +
      String(now.getHours()).padStart(2, '0') + ":" +
      String(now.getMinutes()).padStart(2, '0') + ":" +
      String(now.getSeconds()).padStart(2, '0');
   
const record = {
  id: "act-" + Date.now(),
  uid: uid,
  studentName: activityData.studentName || localStorage.getItem('speakoffice_student_name') || "",
  studentClass: activityData.studentClass || localStorage.getItem('speakoffice_student_class') || "",
  studentAbsent: activityData.studentAbsent || localStorage.getItem('speakoffice_student_absent') || "-",
  category: activityData.category || "Interactive Case Study",
  score: Number(activityData.score) || 0,
  totalQuestions: activityData.totalQuestions || 0,
  correctAnswers: activityData.correctAnswers || 0,
  predicate: activityData.predicate || "",
  timestamp: formattedDate
};


    // Simpan ke Firestore collection terpisah
    const docRef = await firestoreDb
      .collection("student_activities")
      .add(record);

    // Cache lokal berdasarkan UID
    const cacheKey = "speakoffice_activity_logs_" + uid;

    let logs = [];
    try {
      logs = JSON.parse(localStorage.getItem(cacheKey) || "[]");
      if (!Array.isArray(logs)) logs = [];
    } catch (e) {
      logs = [];
    }

    logs.unshift({
      id: docRef.id,
      ...record
    });

    localStorage.setItem(cacheKey, JSON.stringify(logs));

    console.log(
      "Aktivitas berhasil disimpan berdasarkan UID:",
      uid
    );

    return {
      success: true,
      mode: "firebase",
      data: record
    };

  } catch (error) {
    console.error("Gagal menyimpan aktivitas siswa:", error);

    return {
      success: false,
      message: error.message
    };
  }
},


  /**
   * Mengambil seluruh daftar aktivitas siswa (dengan opsi filter kelas)
   */
  

getStudentActivities: async function (classFilter = "") {
  try {
    const user = firebaseAuth?.currentUser;

    if (!user || !firestoreDb) {
      return [];
    }

    const snapshot = await firestoreDb
      .collection("student_activities")
      .where("uid", "==", user.uid)
      .get();

    let data = [];

    snapshot.forEach(doc => {
      data.push({
        id: doc.id,
        ...doc.data()
      });
    });

    data.sort((a, b) =>
      (b.timestamp || "").localeCompare(a.timestamp || "")
    );

    if (classFilter && classFilter !== "all") {
      data = data.filter(item =>
        (item.studentClass || "").toLowerCase() ===
        classFilter.toLowerCase()
      );
    }

    return data;

  } catch (error) {
    console.error("Gagal mengambil riwayat aktivitas:", error);
    return [];
  }
},


getAllStudentActivitiesForTeacher: async function () {
  try {
    if (!isFirebaseInitialized || !firestoreDb) {
      throw new Error("Firebase belum terhubung.");
    }

    const snapshot = await firestoreDb
      .collection("student_activities")
      .get();

    const data = [];

    snapshot.forEach(doc => {
      data.push({
        id: doc.id,
        ...doc.data()
      });
    });

    data.sort((a, b) =>
      (b.timestamp || "").localeCompare(a.timestamp || "")
    );

    return data;

  } catch (error) {
    console.error(
      "Gagal mengambil seluruh aktivitas siswa:",
      error
    );

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
        data = data.filter(item => (item.studentClass || '').toLowerCase() === classFilter.toLowerCase());
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
    localStorage.removeItem('speakoffice_answered_cases');
    localStorage.removeItem('speakoffice_completed_categories');
    localStorage.removeItem('speakoffice_logged_cat_TAMU');
    localStorage.removeItem('speakoffice_logged_cat_TELEPON');
    localStorage.removeItem('speakoffice_logged_cat_PELAYANAN');
    if (!keepProfile) {
      localStorage.removeItem('speakoffice_student_name');
      localStorage.removeItem('speakoffice_student_class');
      localStorage.removeItem('speakoffice_student_absent');
      localStorage.removeItem('speakoffice_student_school');
      localStorage.removeItem('speakoffice_student_avatar');
      localStorage.removeItem('speakoffice_student_session');
      localStorage.removeItem('speakoffice_read_attire');
    }
  },

  /**
   * Muat data contoh demo simulasi (khusus jika guru ingin melihat simulasi dashboard)
   */
  loadDemoData: function () {
    localStorage.setItem('speakoffice_activity_logs', JSON.stringify(DEFAULT_STUDENT_ACTIVITIES));
  },

  /**
- Menghapus seluruh data riwayat aktivitas & progres kasus siswa agar bisa dikerjakan ulang (khusus reset oleh guru)
   */
  resetActivities: function () {
    localStorage.removeItem('speakoffice_activity_logs');
    localStorage.removeItem('speakoffice_answered_cases');
    localStorage.removeItem('speakoffice_completed_categories');
    localStorage.removeItem('speakoffice_logged_cat_TAMU');
    localStorage.removeItem('speakoffice_logged_cat_TELEPON');
    localStorage.removeItem('speakoffice_logged_cat_PELAYANAN');
  }
};