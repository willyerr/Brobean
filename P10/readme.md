# Brobean --- P10 Release Candidate

## Bug Report dan GitHub Issues

**Project:** Brobean\
**Repository:** https://github.com/willyerr/Brobean\
**Branch acuan:** `master`\
**Tahap:** P10 --- Release Candidate\
**Tanggal dokumentasi:** 22 November 2026

------------------------------------------------------------------------

## 1. Ringkasan

Dokumen ini mengumpulkan temuan audit dan pekerjaan yang perlu
diselesaikan sebelum Brobean dipersiapkan sebagai Release Candidate.

  Kategori                      Jumlah
  --------------------------- --------
  Bug / defect yang dicatat          8
  Release dan QA tasks               4
  **Total issues**              **12**

**Catatan validasi:** Temuan #6 telah dikonfirmasi melalui pemeriksaan
Git lokal. Temuan bug lainnya berasal dari inspeksi source code dan
perlu direproduksi melalui pengujian lokal sebelum dinyatakan sebagai
bug runtime yang terkonfirmasi. Karena itu, dokumen ini membedakan
temuan audit kode dari hasil reproduksi.

------------------------------------------------------------------------

## 2. Bug dan Defect

### Issue #6 --- Database SQLite ikut ter-commit ke repository

-   **Kategori:** Bug / Data safety
-   **Prioritas:** Critical
-   **Status validasi:** Terkonfirmasi melalui Git
-   **Masalah:** File database runtime dan file pendamping SQLite masih
    dilacak Git.
-   **File yang terdeteksi:**
    -   `apps/api/data/brobean.sqlite`
    -   `brobean.sqlite`
    -   `brobean.sqlite-shm`
    -   `brobean.sqlite-wal`
-   **Dampak:** Data lokal/runtime dapat ikut tersebar melalui
    repository. Perubahan database juga dapat menciptakan konflik dan
    membuat data runtime tercampur dengan source code.
-   **Expected:** Database runtime tidak dilacak Git. Repository hanya
    menyimpan migration dan mekanisme inisialisasi database.
-   **Tindak lanjut:** Tambahkan pola SQLite ke `.gitignore`, keluarkan
    file database dari Git tracking tanpa menghapus salinan lokal, dan
    pastikan migration tetap dapat membuat database baru.
-   **Bukti:** `git ls-files | Select-String "sqlite|\.db"` menampilkan
    empat file di atas.

### Issue #7 --- Archived bean tidak tersedia saat mengedit Brew Log

-   **Kategori:** Bug / Data integrity
-   **Prioritas:** High
-   **Status validasi:** Temuan inspeksi kode; perlu reproduksi
-   **Masalah:** Form edit hanya memuat bean aktif. Brew Log lama yang
    merujuk bean yang telah diarsipkan berpotensi tidak dapat diedit
    dengan benar.
-   **Dampak:** Pengguna dapat kehilangan kemampuan memperbarui catatan
    seduhan lama setelah bean diarsipkan.
-   **Expected:** Bean yang sudah diarsipkan tetap dapat ditampilkan dan
    dipertahankan ketika mengedit Brew Log lama, tetapi tidak ditawarkan
    untuk catatan baru.
-   **Skenario uji:** Buat Brew Log dengan bean aktif, arsipkan bean
    tersebut, lalu buka dan edit Brew Log lama.

### Issue #8 --- Mengganti brewing method tanpa `values` dapat mempertahankan parameter lama

-   **Kategori:** Bug / Data integrity
-   **Prioritas:** High
-   **Status validasi:** Temuan inspeksi kode; perlu reproduksi
-   **Masalah:** Jalur update API berpotensi mempertahankan nilai
    parameter dari brewing method sebelumnya ketika request mengganti
    preparation tetapi tidak mengirim `values`.
-   **Dampak:** Data seduhan dapat menampilkan parameter yang tidak
    sesuai dengan metode penyeduhan yang dipilih.
-   **Expected:** Ketika brewing method berubah, nilai parameter metode
    sebelumnya harus dibersihkan atau diganti dengan nilai yang valid
    untuk metode baru.
-   **Skenario uji:** Buat Brew Log dengan V60 dan beberapa parameter,
    lalu kirim request update yang mengganti preparation tanpa
    menyertakan `values`. Periksa nilai parameter setelah update.

### Issue #9 --- Invalid JSON menghasilkan HTTP 500

-   **Kategori:** Bug / API error handling
-   **Prioritas:** Medium
-   **Status validasi:** Temuan inspeksi kode; perlu reproduksi
-   **Masalah:** Request dengan body JSON yang tidak valid berpotensi
    ditangani sebagai internal server error.
-   **Dampak:** Client menerima status error yang tidak tepat dan log
    server dapat mengaburkan perbedaan antara kesalahan input dan
    kegagalan internal.
-   **Expected:** Request JSON malformed ditolak dengan HTTP 400 Bad
    Request dan pesan error yang aman serta jelas.
-   **Skenario uji:** Kirim body JSON malformed ke endpoint API yang
    menggunakan JSON parser.

### Issue #10 --- Foto bean tidak dapat dihapus melalui alur edit

-   **Kategori:** Bug / Bean Library
-   **Prioritas:** Medium
-   **Status validasi:** Temuan inspeksi kode; perlu reproduksi
-   **Masalah:** Alur edit berpotensi tetap mengirim foto lama atau
    mengirim `undefined`, sedangkan repository mengabaikan nilai
    `undefined`.
-   **Dampak:** Pengguna tidak dapat menghapus foto bean yang sudah
    tersimpan melalui form edit.
-   **Expected:** Pengguna dapat menghapus foto, menyimpan perubahan,
    dan melihat bean tanpa foto.
-   **Skenario uji:** Buat bean dengan foto, edit bean, hapus foto
    melalui UI, simpan, lalu periksa hasilnya setelah halaman dimuat
    ulang.

### Issue #11 --- Menghapus bean yang digunakan Brew Log dapat menghasilkan HTTP 500

-   **Kategori:** Bug / Referential integrity
-   **Prioritas:** High
-   **Status validasi:** Temuan inspeksi kode; perlu reproduksi
-   **Masalah:** Penghapusan bean yang masih direferensikan oleh Brew
    Log berpotensi memunculkan error database yang tidak ditangani
    dengan baik.
-   **Dampak:** API mengembalikan internal server error dan pengguna
    tidak memperoleh penjelasan atau perilaku yang konsisten.
-   **Expected:** Sistem mencegah penghapusan bean yang masih digunakan,
    atau menerapkan kebijakan penghapusan/arsip yang menjaga riwayat
    Brew Log.
-   **Skenario uji:** Buat bean, buat Brew Log yang memakai bean
    tersebut, kemudian coba hapus bean melalui API dan UI.

### Issue #16 --- Field opsional Bean tidak dapat dikosongkan saat edit

-   **Kategori:** Bug / Bean Library
-   **Prioritas:** Medium
-   **Status validasi:** Temuan inspeksi kode; perlu reproduksi
-   **Masalah:** Mekanisme update berpotensi mengabaikan nilai kosong
    atau `undefined`, sehingga field opsional yang sebelumnya terisi
    tidak dapat dibersihkan.
-   **Dampak:** Pengguna tidak dapat menghapus informasi opsional yang
    sudah tidak relevan.
-   **Expected:** Pengguna dapat mengosongkan field opsional dan
    perubahan tersimpan secara konsisten.
-   **Skenario uji:** Isi field opsional pada bean, edit dan kosongkan
    field tersebut, simpan, lalu muat ulang data.

### Issue #17 --- API menerima bean yang sudah diarsipkan

-   **Kategori:** Bug / Business rule validation
-   **Prioritas:** High
-   **Status validasi:** Temuan inspeksi kode; perlu reproduksi
-   **Masalah:** Endpoint pembuatan Brew Log berpotensi menerima ID bean
    yang statusnya sudah diarsipkan.
-   **Dampak:** Aturan bahwa bean arsip tidak digunakan untuk catatan
    baru dapat dilewati melalui request API langsung.
-   **Expected:** API menolak bean yang diarsipkan untuk Brew Log baru,
    dengan status error validasi yang sesuai. Riwayat lama tetap dapat
    merujuk bean tersebut.
-   **Skenario uji:** Arsipkan bean, lalu kirim request
    `POST /api/brews` dengan ID bean tersebut.

------------------------------------------------------------------------

## 3. Release dan QA Tasks

### Issue #12 --- Implementasi runtime logging

-   **Kategori:** Release / Observability
-   **Prioritas:** High
-   **Tujuan:** Menyediakan log saat aplikasi berjalan agar masalah
    dapat ditelusuri tanpa hanya mengandalkan error saat development.
-   **Ruang lingkup:**
    -   Log startup dan shutdown API.
    -   Log HTTP request penting: method, path, status, dan durasi.
    -   Log error backend beserta stack trace di lingkungan development.
    -   Hindari mencatat password, token, atau data sensitif.
    -   Tentukan kebijakan penyimpanan dan rotasi log.
-   **Acceptance criteria:** Error runtime dapat ditelusuri melalui log;
    informasi sensitif tidak tercatat; logging tetap aktif pada
    konfigurasi production.

### Issue #13 --- Menggunakan environment configuration untuk API base URL

-   **Kategori:** Release / Configuration
-   **Prioritas:** High
-   **Masalah:** API base URL frontend masih menggunakan
    `http://localhost:3000/api`.
-   **Dampak:** `localhost` pada perangkat Android menunjuk ke perangkat
    itu sendiri, bukan komputer atau server tempat API berjalan.
    Konfigurasi ini tidak cocok untuk APK yang terhubung ke backend
    terpisah.
-   **Expected:** URL API dikonfigurasi melalui environment/build
    configuration, bukan hardcoded.
-   **Acceptance criteria:** Frontend dapat diarahkan ke API lokal untuk
    development dan API hosting untuk production tanpa mengubah source
    code.

### Issue #14 --- Automated API integration tests

-   **Kategori:** QA / Testing
-   **Prioritas:** High
-   **Tujuan:** Membuat pengujian otomatis untuk memeriksa kontrak dan
    perilaku endpoint API.
-   **Ruang lingkup minimum:**
    -   Bean CRUD dan validasi.
    -   Preparation dan parameter.
    -   Brew Log create, read, update, delete.
    -   Archived bean dan archived preparation.
    -   Invalid request dan error handling.
    -   Relasi data dan konsistensi parameter ketika preparation
        berubah.
-   **Acceptance criteria:** Test dapat dijalankan dengan satu perintah,
    menggunakan database test terpisah, dan tidak mengubah database
    development.

### Issue #15 --- Menyiapkan Android APK/AAB menggunakan Capacitor

-   **Kategori:** Release / Android
-   **Prioritas:** High
-   **Tujuan:** Menyiapkan build Android yang dapat dipasang dan diuji
    pada perangkat fisik.
-   **Catatan arsitektur:** Capacitor membungkus frontend web menjadi
    aplikasi Android. Backend Express + SQLite tidak otomatis ikut
    berjalan di dalam APK.
-   **Keputusan yang diperlukan:** Tentukan apakah backend akan di-host
    online atau aplikasi membutuhkan arsitektur backend/lokal khusus
    Android.
-   **Acceptance criteria:**
    -   Build Android berhasil.
    -   Aplikasi dapat dipasang di perangkat fisik.
    -   Frontend dapat mengakses API dari perangkat.
    -   Fitur utama Bean Library dan Brew Log dapat diuji.
    -   Konfigurasi release dan signing terdokumentasi.
-   **Tahap lanjutan:** Jika targetnya Google Play Store, siapkan
    Android App Bundle (AAB), listing aplikasi, privacy policy, dan
    persyaratan publikasi yang berlaku.

------------------------------------------------------------------------

## 4. Prioritas Pengerjaan

Urutan yang disarankan:

1.  **#6 --- Database SQLite di repository:** amankan data dan bersihkan
    Git tracking.
2.  **#8, #11, #17 --- Konsistensi data dan aturan bisnis:** uji relasi
    Bean dan Brew Log serta perubahan brewing method.
3.  **#7, #9, #10, #16 --- Perbaikan alur pengguna dan API error
    handling.**
4.  **#14 --- Automated API integration tests:** buat regression test
    untuk bug yang diperbaiki.
5.  **#12 --- Runtime logging:** siapkan observability untuk pengujian
    aplikasi berjalan.
6.  **#13 --- API environment configuration:** pisahkan konfigurasi
    development dan production.
7.  **#15 --- Android build:** siapkan APK untuk internal testing
    sebelum publikasi Play Store.

------------------------------------------------------------------------

## 5. Checklist Release Candidate

-   [ ] File database runtime tidak lagi dilacak Git.
-   [ ] Migration dapat membuat database baru dari kondisi bersih.
-   [ ] Seluruh bug yang dicatat telah direproduksi atau ditandai
    sebagai tidak terbukti.
-   [ ] Bug yang terkonfirmasi telah diperbaiki.
-   [ ] Automated API tests berjalan menggunakan database test.
-   [ ] Runtime logs tersedia dan tidak memuat data sensitif.
-   [ ] API base URL dapat dikonfigurasi untuk production.
-   [ ] APK dapat dipasang pada perangkat Android fisik.
-   [ ] Koneksi frontend Android ke backend berhasil.
-   [ ] Alur Bean Library dan Brew Log lulus regression testing.
-   [ ] Prosedur build dan release terdokumentasi.

------------------------------------------------------------------------

## 6. Catatan Penutup

Daftar ini memenuhi target administratif minimal 10 issues: 8 bug/defect
dan 4 release/QA tasks. Namun, jumlah issue tidak otomatis berarti
seluruh bug sudah berhasil direproduksi atau diperbaiki.

Untuk laporan akademik atau evaluasi proyek, gunakan istilah **temuan
audit kode** untuk temuan yang belum diuji langsung, dan **bug
terkonfirmasi** hanya setelah skenario reproduksi berhasil dijalankan
dan hasil aktual berbeda dari perilaku yang diharapkan.
