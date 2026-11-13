# P9 – Test dan Refactoring Brobean

## 1. Tujuan Refactoring

Refactoring dilakukan pada aplikasi Brobean untuk meningkatkan kualitas dan keteraturan struktur kode.

Fokus utama refactoring adalah mengurangi penumpukan tanggung jawab dalam satu komponen dan memisahkan bagian program berdasarkan fungsinya masing-masing.

Tujuan dari perubahan ini adalah:
- Menghindari duplikasi kode.
- Memisahkan tanggung jawab setiap bagian program.
- Membuat kode lebih mudah dibaca dan dipahami.
- Mempermudah proses testing dan maintenance.
- Mempermudah pengembangan fitur di kemudian hari.

## 2. Struktur Kode Sebelum dan Sesudah Refactoring

### Sebelum Refactoring

Sebelum refactoring, sebagian besar pengelolaan form dan interaksi pengguna berada di dalam `BeanCatalog.tsx`.

Hal tersebut membuat komponen utama memiliki beberapa tanggung jawab sekaligus, seperti:
- Mengelola input dan form.
- Menangani validasi input.
- Mengelola status tampilan.
- Menangani proses pengiriman data.
- Mengatur interaksi dengan data katalog.

### Sesudah Refactoring

Setelah refactoring, tanggung jawab program dipisahkan ke dalam beberapa file sesuai fungsinya.

Struktur yang digunakan:

```text
apps/web/src/
│
├── components/
│   └── BeanForm.tsx
│
├── pages/
│   └── BeanCatalog.tsx
│
├── services/
│   └── beanRepository.ts
│
└── utils/
    └── validation.ts
```

Pembagian tersebut membuat setiap bagian program memiliki fokus pekerjaan yang lebih jelas.

## 3. Pemisahan Tanggung Jawab (Separation of Responsibilities)

Refactoring dilakukan dengan membagi tanggung jawab ke dalam beberapa bagian berikut.

### A. BeanForm.tsx

Berfungsi untuk mengelola form dan interaksi input pengguna, termasuk:
- Mengelola nilai input form.
- Menampilkan status UI.
- Menangani proses submit.
- Mengelola interaksi GPS dan foto.
- Menampilkan validasi pada form.

### B. validation.ts

Berfungsi untuk memusatkan aturan validasi input agar tidak tercampur dengan tampilan komponen.

Aturan validasi yang diterapkan:
- Nama kopi wajib diisi.
- Nama kopi minimal 2 karakter.
- Nama roastery wajib diisi.

### C. beanRepository.ts

Berfungsi untuk menangani komunikasi dengan API dan operasi data bean, seperti:
- Mengambil data kopi.
- Menambahkan data kopi.
- Memperbarui data kopi.
- Menghapus data kopi.

### D. BeanCatalog.tsx

Berfungsi sebagai halaman utama katalog yang mengatur data koleksi dan mengoordinasikan komponen form dengan proses pengelolaan data.

## Kesimpulan

Refactoring P9 menghasilkan struktur kode yang lebih terorganisasi dengan pemisahan tanggung jawab antara komponen form, validasi, repository, dan halaman katalog.

Pemisahan ini diharapkan mempermudah pemeliharaan, pengujian, serta pengembangan aplikasi Brobean selanjutnya.