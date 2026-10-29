# Brobean

## Deskripsi Masalah
Para penikmat kopi (home brewer maupun barista) sering bereksperimen dengan berbagai biji kopi dan metode seduh. Namun, mereka sering kali lupa parameter persisnya (seperti ukuran gilingan/ grind size, rasio air, dan suhu) yang menghasilkan cangkir kopi terbaik mereka. Belum ada jurnal digital sederhana yang fokus dan praktis untuk mencatat, melacak, dan mengelola inventaris biji kopi serta riwayat parameter seduhan secara rapi di satu tempat.

## Profil Target Pengguna
* **Home Barista / Penikmat Kopi Rumahan**: Orang yang suka menyeduh kopi sendiri di rumah dan ingin melacak resep seduhan terbaik mereka.
* **Coffee Enthusiast / Hobiis Kopi**: Mereka yang sering membeli berbagai macam biji kopi (dari berbagai roastery) dan butuh mengelola inventaris serta mencatat tasting notes (catatan rasa).

## Manfaat Aplikasi
* Membantu pengguna mereplikasi hasil seduhan kopi terbaik mereka dengan melihat resep atau parameter historis yang pernah dicatat.
* Menjadi inventaris digital untuk melacak biji kopi apa saja yang sedang dimiliki (lengkap dengan informasi roaster, asal, dan tanggal sangrai).
* Menyediakan media yang terstruktur untuk mengevaluasi setiap cangkir kopi (catatan rasa dan rating).

## Daftar Fitur Inti (Target 12 Pertemuan)
1. **Manajemen Biji Kopi (Beans Manajemen)**: Fitur CRUD (Create, Read, Update, Delete) untuk mencatat data biji kopi (Nama Roaster, Asal/ Origin, Proses, Tingkat Sangrai, dan Tanggal Sangrai).
2. **Jurnal Seduhan (Brew Journal)**: Fitur mencatat parameter seduhan yang terhubung dengan biji kopi tertentu (Metode/Alat seduh, Grind Size, Berat Kopi, Berat Air/ Yield, Waktu Seduh, dan Suhu).
3. **Catatan Evaluasi (Tasting Notes & Rating)**: Fitur untuk memberikan penilaian (bintang 1-5) dan catatan rasa tekstual pada setiap seduhan.
4. **Penyimpanan Lokal (Local Storage)**: Data disimpan secara lokal di dalam perangkat pengguna agar aplikasi dapat digunakan secara offline dengan cepat.

## Fitur yang Tidak Dikerjakan (Out of Scope)
* Integrasi Timbangan Cerdas berbasis Bluetooth (Bluetooth Scale Integration).
* Sinkronisasi Cloud atau Database Online (semua data hanya disimpan secara lokal).
* Visualisasi grafik statistik seduhan yang kompleks.
* Manajemen profil air (Water tracking) dan inventaris alat seduh (Gear management) yang terlalu detail.

## Kriteria Aplikasi Dinyatakan Berhasil
* Pengguna dapat berhasil menambahkan, melihat, mengubah, dan menghapus daftar biji kopi di dalam aplikasi.
* Pengguna dapat mencatat riwayat seduhan (brew) baru yang ditautkan ke salah satu biji kopi yang ada, lalu menyimpannya dengan parameter yang lengkap.
* Aplikasi tidak mengalami crash saat melakukan perpindahan halaman atau saat menyimpan/menghapus data.
* Data yang sudah di-input oleh pengguna tetap tersimpan dan muncul kembali (persisten) meskipun aplikasi telah ditutup dan dibuka kembali.
