# DOKUMENTASI TUGAS PERTEMUAN 7
# MVP LENGKAP – PROJECT BROBEAN

## 1. Deskripsi Proyek

Brobean merupakan aplikasi web yang dirancang untuk membantu home brewer, barista, dan coffee enthusiast dalam mengelola inventaris biji kopi serta mencatat riwayat aktivitas menyeduh kopi.

Aplikasi ini memungkinkan pengguna menyimpan informasi biji kopi, mencatat parameter penyeduhan, dan memberikan evaluasi terhadap hasil seduhan.

Pada pengembangan MVP, aplikasi difokuskan agar seluruh fitur inti dapat digunakan melalui alur yang terintegrasi, mulai dari pengelolaan data biji kopi hingga pencatatan dan evaluasi hasil seduhan.

## 2. Tujuan Pengembangan MVP

Tujuan pengembangan MVP adalah:
1. Menyelesaikan seluruh fitur utama aplikasi Brobean.
2. Memastikan navigasi antarhalaman berjalan dengan baik.
3. Menyediakan form untuk menambahkan dan mengubah data.
4. Menerapkan validasi input agar data yang disimpan sesuai kebutuhan.
5. Mengintegrasikan penyimpanan data dengan backend.
6. Mengimplementasikan minimal tiga advanced features.
7. Menangani loading, empty, error, serta izin dan pembatalan fitur perangkat.

## 3. Fitur Inti MVP

### A. Bean Management

Bean Management merupakan fitur untuk mengelola inventaris biji kopi yang dimiliki pengguna.

Fitur yang tersedia dalam rancangan MVP:
- Menampilkan daftar biji kopi.
- Menambahkan biji kopi baru.
- Mengubah informasi biji kopi.
- Menghapus biji kopi.
- Melihat detail biji kopi.

Informasi yang disimpan meliputi:
- Nama biji kopi.
- Nama roastery.
- Asal kopi (origin).
- Tingkat sangrai (roast level).
- Tanggal sangrai.
- Lokasi roastery.
- Foto biji kopi.

### B. Brew Journal

Brew Journal digunakan untuk mencatat aktivitas penyeduhan kopi berdasarkan biji kopi yang dipilih.

Informasi yang dicatat:
- Biji kopi yang digunakan.
- Metode penyeduhan.
- Berat kopi (dose).
- Berat air atau hasil seduhan (yield).
- Ukuran gilingan (grind size).
- Suhu air.
- Waktu penyeduhan.
- Tanggal penyeduhan.

Setiap catatan seduhan dihubungkan dengan data biji kopi agar pengguna dapat melihat riwayat penyeduhan berdasarkan masing-masing biji kopi.

### C. Tasting Notes & Rating

Fitur ini digunakan untuk memberikan evaluasi terhadap hasil seduhan.

Pengguna dapat:
- Memberikan rating dari 1 sampai 5 bintang.
- Menambahkan catatan rasa.
- Melihat evaluasi dari penyeduhan sebelumnya.

Dengan fitur ini, pengguna dapat membandingkan hasil seduhan dan menemukan parameter yang menghasilkan rasa kopi terbaik.

## 4. Navigasi Aplikasi

Navigasi dirancang agar pengguna dapat mengakses seluruh fitur utama tanpa kesulitan.

Struktur navigasi:

1. Dashboard
   - Ringkasan jumlah roastery.
   - Ringkasan jumlah biji kopi.
   - Ringkasan jumlah aktivitas seduhan.
   - Status evaluasi biji kopi.

2. Roaster Management
   - Daftar roastery.
   - Tambah roastery.
   - Edit roastery.

3. Bean Management
   - Daftar biji kopi.
   - Tambah biji kopi.
   - Edit biji kopi.
   - Detail biji kopi.

4. Brew Journal
   - Tambah catatan seduhan.
   - Riwayat penyeduhan.
   - Detail aktivitas seduhan.

5. Tasting Notes
   - Rating seduhan.
   - Catatan rasa.
   - Evaluasi hasil seduhan.

## 5. Form dan Validasi Data

Setiap form harus memiliki validasi agar informasi yang disimpan sesuai dengan struktur data aplikasi.

### A. Form Bean

Validasi yang diterapkan:
- Nama biji kopi wajib diisi.
- Nama roastery wajib dipilih atau diisi.
- Origin tidak boleh melebihi batas karakter.
- Roast level harus menggunakan pilihan yang tersedia.
- Tanggal sangrai harus menggunakan format tanggal yang valid.

### B. Form Brew Journal

Validasi yang diterapkan:
- Biji kopi wajib dipilih.
- Metode seduh wajib dipilih.
- Berat kopi harus berupa angka positif.
- Berat air harus berupa angka positif.
- Suhu air harus berupa angka yang valid.
- Waktu penyeduhan harus valid.

### C. Form Tasting Notes

Validasi yang diterapkan:
- Rating hanya menerima nilai 1 sampai 5.
- Catatan rasa harus berupa teks.
- Pengguna dapat menyimpan evaluasi setelah aktivitas seduhan tersedia.

Validasi dilakukan pada frontend untuk memberikan umpan balik langsung dan pada backend untuk memastikan data yang masuk tetap sesuai dengan aturan aplikasi.

## 6. Penyimpanan Data

Penyimpanan data menggunakan backend agar informasi yang dimasukkan pengguna dapat disimpan dan diambil kembali.

Database yang direncanakan pada arsitektur proyek adalah MySQL dengan Prisma ORM.

Entitas utama:
- Roaster
- Bean
- BrewMethod
- Brew

Hubungan data:
- Satu roastery dapat memiliki beberapa biji kopi.
- Satu biji kopi dapat memiliki beberapa catatan seduhan.
- Satu metode seduh dapat digunakan pada beberapa aktivitas penyeduhan.
- Setiap catatan seduhan terhubung dengan satu biji kopi.

Data yang telah disimpan harus tetap tersedia setelah aplikasi ditutup dan dibuka kembali.

## 7. Implementasi Advanced Features

Pada pengembangan MVP, terdapat tiga advanced features yang dipilih sesuai kebutuhan aplikasi Brobean.

### A. Camera Integration

Fitur kamera digunakan untuk mengambil foto kemasan biji kopi secara langsung melalui perangkat pengguna.

Implementasi:
1. Pengguna membuka form Bean Management.
2. Pengguna memilih fitur ambil foto.
3. Browser meminta izin akses kamera.
4. Setelah izin diberikan, kamera perangkat dapat digunakan.
5. Pengguna mengambil foto biji kopi.
6. Foto ditampilkan sebagai preview.
7. Pengguna dapat menerima atau membatalkan foto.
8. Foto yang diterima disimpan bersama informasi biji kopi.

Manfaat:
- Membantu pengguna mengenali biji kopi yang dimiliki.
- Mempermudah identifikasi inventaris.
- Menyediakan dokumentasi visual setiap biji kopi.

Penanganan kondisi:
- Loading: Ketika kamera sedang diinisialisasi.
- Error: Ketika kamera tidak tersedia atau gagal diakses.
- Permission denied: Menampilkan informasi jika izin kamera ditolak.
- Cancel: Pengguna dapat membatalkan pengambilan foto tanpa menyimpan perubahan.
- Success: Foto berhasil ditampilkan dan disimpan.

### B. Geolocation Integration

Fitur geolocation digunakan untuk memperoleh koordinat lokasi roastery secara otomatis.

Implementasi:
1. Pengguna membuka form Roaster Management.
2. Pengguna memilih tombol ambil lokasi.
3. Browser meminta izin akses lokasi.
4. Setelah izin diberikan, aplikasi mengambil koordinat GPS.
5. Latitude dan longitude ditampilkan pada form.
6. Pengguna dapat memeriksa dan menyimpan lokasi.
7. Koordinat disimpan bersama informasi roastery.

Manfaat:
- Mempermudah pencatatan lokasi roastery.
- Mengurangi kebutuhan memasukkan koordinat secara manual.
- Membantu pengguna mengingat asal biji kopi yang dibeli.

Penanganan kondisi:
- Loading: Ketika aplikasi sedang mengambil koordinat.
- Error: Ketika GPS tidak tersedia atau gagal mendapatkan lokasi.
- Permission denied: Menampilkan informasi jika akses lokasi ditolak.
- Cancel: Pengguna dapat membatalkan pengambilan lokasi.
- Success: Koordinat berhasil diperoleh dan ditampilkan.

### C. Notification Integration

Fitur notifikasi digunakan untuk membantu pengguna mengingat aktivitas pencatatan dan evaluasi seduhan.

Implementasi:
1. Pengguna mengaktifkan fitur notifikasi.
2. Browser meminta izin menampilkan notifikasi.
3. Setelah izin diberikan, aplikasi dapat menampilkan notifikasi.
4. Pengguna dapat memperoleh pengingat untuk mencatat aktivitas seduhan.
5. Pengguna dapat membuka aplikasi untuk melanjutkan pencatatan.

Manfaat:
- Membantu pengguna konsisten mencatat aktivitas seduhan.
- Mengurangi kemungkinan lupa melakukan evaluasi.
- Meningkatkan pengalaman penggunaan aplikasi.

Penanganan kondisi:
- Loading: Ketika proses aktivasi notifikasi berlangsung.
- Error: Ketika notifikasi gagal diaktifkan.
- Permission denied: Memberikan informasi bahwa izin notifikasi ditolak.
- Cancel: Pengguna dapat membatalkan permintaan izin.
- Success: Notifikasi dapat ditampilkan setelah izin diberikan.

Catatan: Notifikasi pengingat terjadwal membutuhkan mekanisme penjadwalan tambahan. Notifikasi browser biasa tidak otomatis menjamin pengiriman ketika aplikasi sudah ditutup.

## 8. Penanganan Status Aplikasi

Seluruh fitur utama harus memiliki penanganan kondisi aplikasi.

### A. Loading State

Loading ditampilkan ketika:
- Mengambil daftar biji kopi.
- Mengambil riwayat seduhan.
- Menyimpan data.
- Memperbarui data.
- Menghapus data.
- Mengakses kamera atau lokasi.

### B. Empty State

Empty state ditampilkan ketika belum terdapat data.

Contoh:
- Belum ada biji kopi yang ditambahkan.
- Belum ada aktivitas penyeduhan.
- Belum ada catatan evaluasi.

Aplikasi menampilkan informasi dan tombol untuk menambahkan data baru.

### C. Error State

Error ditampilkan ketika:
- Backend tidak dapat diakses.
- Permintaan API gagal.
- Data tidak valid.
- Terjadi kegagalan penyimpanan.
- Fitur perangkat tidak dapat digunakan.

Aplikasi menampilkan pesan yang mudah dipahami dan menyediakan opsi untuk mencoba kembali apabila memungkinkan.

### D. Success State

Success ditampilkan ketika:
- Data berhasil ditambahkan.
- Data berhasil diperbarui.
- Data berhasil dihapus.
- Foto berhasil disimpan.
- Lokasi berhasil diperoleh.
- Notifikasi berhasil diaktifkan.

### E. Permission dan Cancellation

Aplikasi harus menangani izin perangkat secara tepat.

Pengguna memiliki hak untuk menerima atau menolak permintaan akses kamera, lokasi, dan notifikasi.

Apabila pengguna membatalkan proses, aplikasi harus kembali ke kondisi sebelumnya tanpa menyebabkan crash atau menyimpan data yang tidak diinginkan.

## 9. Alur Demonstrasi MVP

Untuk membuktikan bahwa aplikasi dapat digunakan secara menyeluruh, demonstrasi dilakukan dengan urutan berikut:

1. Membuka aplikasi Brobean.
2. Mengakses Dashboard.
3. Membuka halaman Roaster Management.
4. Menambahkan informasi roastery dan mengambil lokasi menggunakan GPS.
5. Membuka Bean Management.
6. Menambahkan biji kopi beserta foto menggunakan kamera.
7. Membuka detail biji kopi.
8. Membuat catatan penyeduhan melalui Brew Journal.
9. Mengisi parameter penyeduhan.
10. Memberikan rating dan tasting notes.
11. Menyimpan seluruh informasi.
12. Memeriksa riwayat penyeduhan.
13. Memastikan data tetap tersedia setelah aplikasi dimuat ulang.
14. Menguji notifikasi dan penanganan izin perangkat.

## 10. Kesimpulan

Pengembangan MVP Brobean berfokus pada penyelesaian seluruh fitur inti, mulai dari pengelolaan roastery, inventaris biji kopi, jurnal penyeduhan, hingga evaluasi hasil seduhan.

Selain fitur utama, aplikasi dirancang untuk mengintegrasikan tiga advanced features, yaitu kamera, geolocation, dan notifikasi.

Ketiga fitur tersebut memberikan manfaat tambahan dalam pengelolaan inventaris, pencatatan lokasi, dan pengingat aktivitas penyeduhan.

Dengan melengkapi navigasi, form, validasi, penyimpanan data, serta penanganan loading, empty, error, permission, dan cancellation, Brobean diharapkan dapat menjadi aplikasi MVP yang dapat digunakan dan didemonstrasikan secara menyeluruh.