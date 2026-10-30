Laporan Implementasi UI/UX & Desain Prototype — Proyek Brobean

Dokumen ini merangkum proses perancangan antarmuka pengguna (User Interface / UI) dan pengalaman pengguna (User Experience / UX) untuk aplikasi Brobean, mulai dari tahapan pemodelan arsitektur hingga implementasi nyata pada platform Progressive Web App (PWA).

1. Konsep & Arsitektur UI/UX

Mengacu pada Dokumen Arsitektur Proyek (P2), aplikasi Brobean dirancang dengan pendekatan Mobile-First Design agar nyaman diakses baik melalui perangkat seluler maupun peramban desktop.

1.1 Struktur Proyek (Monorepo)

Pemisahan struktur direktori dirancang agar modular dan mudah dikembangkan secara berskala:

brobean-monorepo/
├── packages/
│   └── shared/
│       └── src/models/
│           └── Bean.ts         # Model entitas data global
└── apps/
    ├── api/                    # Backend API (Express.js)
    └── web/
        ├── src/
        │   ├── main.tsx        # Entry point aplikasi
        │   ├── App.tsx         # Routing & Layout utama
        │   ├── pages/          
        │   │   └── BeanCatalog.tsx # Halaman utama dashboard & form
        │   ├── components/     # Reusable components (Button, Card, Input)
        │   ├── store/          # State Management (Zustand)
        │   └── services/       # Repository & API Client (Axios)


1.2 Skema Warna & Tema (Design System)

Tema visual mengusung konsep Warm Coffee Aesthetics, mencerminkan identitas industri kopi sangrai (roastery):

Primary / Dominant: Deep Coffee Brown (#4E342E / #3E2723) untuk kesan profesional dan elegan.

Secondary / Accent: Warm Amber & Cream (#D7CCC8, #FDF8F5) untuk kenyamanan visual (mengurangi kelelahan mata pengguna).

Feedback Colors: Emerald Green (GPS/Success) dan Crimson Red (Error/Delete).

2. Dokumentasi Tampilan & Komponen (Screenshots / Mockups)

Berikut adalah rincian tata letak antarmuka yang diimplementasikan langsung menggunakan Tailwind CSS:

A. Navigasi Utama (App Bar)

Desain: Bilah atas tetap (sticky top) dengan warna latar belakang kopi tua, menampilkan logo cangkir minimalis dan judul aplikasi "Brobean".

Fungsi UX: Membantu pengguna mengenali identitas aplikasi dengan cepat di berbagai ukuran layar.

B. Formulir Input Data & Integrasi Hardware (Create / Update)

Komponen Terintegrasi:

Input Field untuk nama biji kopi dan roastery.

Tombol GPS Geolocation dengan indikator loading saat menarik koordinat lintang dan bujur.

Fitur unggah Kamera / Media Capture (capture="environment") yang memproses foto langsung menjadi preview visual.

Penanganan Validasi (Validation State): Menampilkan pesan teks merah jika kolom wajib dikosongkan sebelum tombol submit ditekan.

C. Grid Katalog Biji Kopi (Read, Update, Delete)

Tata Letak Kartu: Berbentuk grid responsif yang memuat foto produk, nama kopi, roastery, serta koordinat GPS.

Aksi Interaktif: Setiap kartu dilengkapi tombol Edit (untuk memuat ulang data ke form atas) dan tombol Hapus dengan konfirmasi instan.

3. Penanganan State UI (6 Kondisi Interaktif)

Aplikasi telah dirancang secara robust untuk menangani seluruh kemungkinan status interaksi pengguna:

Loading State: Ditandai dengan animasi lembut ("Menyeduh data...") saat menunggu respons jaringan dari backend atau penyimpanan lokal.

Success State: Data berhasil disimpan, disusul dengan munculnya notifikasi sistem (Web Notification).

Empty State: Menampilkan pesan ilustratif ramah pengguna ketika belum ada data koleksi kopi yang dimasukkan.

Error & Retry State: Ketika terjadi kegagalan koneksi server, sistem memunculkan kotak peringatan merah beserta tombol Coba Lagi (Retry).

Validation State: Mencegah pengiriman data kosong melalui validasi instan pada kolom formulir.

Submit Loading State: Tombol ubah/simpan berubah status menjadi "Menyimpan..." untuk mencegah aksi klik ganda (double-tap).

4. Pengujian & Validasi

Responsive Testing: Diuji melalui perangkat seluler virtual menggunakan Chrome DevTools untuk memastikan tata letak vertikal berjalan sempurna.

Hardware API Testing: Memastikan izin Geolocation dan Notification meminta konfirmasi persetujuan pengguna secara aman tanpa memicu crash pada aplikasi.

Dokumentasi ini disusun sebagai laporan resmi pemenuhan tugas perancangan UI/UX dan implementasi MVP penuh pada proyek Brobean.