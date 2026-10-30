# DOKUMENTASI INTEGRASI API DAN UNIT TEST
## Project Brobean – Coffee Bean Tracker

### 1. Deskripsi Proyek

Brobean merupakan aplikasi berbasis web yang dirancang untuk membantu penikmat kopi, home brewer, dan barista dalam mengelola inventaris biji kopi serta mencatat informasi mengenai biji kopi yang dimiliki.

Aplikasi ini bertujuan untuk memudahkan pengguna dalam menyimpan informasi biji kopi, seperti nama kopi, roastery, asal kopi, proses pengolahan, dan tingkat sangrai.

### 2. Tujuan Integrasi API

Integrasi API dilakukan untuk menghubungkan antarmuka pengguna (Frontend) dengan server (Backend), sehingga proses pengelolaan data tidak hanya dilakukan pada sisi aplikasi, tetapi juga melalui komunikasi HTTP.

Pada proyek Brobean, fitur yang dipilih sebagai implementasi utama adalah **Bean Management**, yaitu fitur untuk mengelola data biji kopi.

Fitur ini mencakup:
- Menampilkan daftar biji kopi.
- Menambahkan data biji kopi.
- Memperbarui informasi biji kopi.
- Menghapus data biji kopi.

### 3. Teknologi yang Digunakan

| Teknologi | Fungsi |
|---|---|
| React | Membangun antarmuka pengguna |
| TypeScript | Menentukan tipe data |
| Vite | Development server dan build frontend |
| Node.js | Menjalankan backend |
| Express.js | Membuat REST API |
| Axios | Menghubungkan frontend dengan API |
| Vitest | Menjalankan unit test |

### 4. Arsitektur Integrasi API

Proyek menggunakan pemisahan antara frontend, backend, dan shared model.

**A. Frontend**

Frontend menggunakan React dan TypeScript untuk menampilkan informasi kepada pengguna serta menerima input data.

**B. Repository**

File `apps/web/src/services/beanRepository.ts` berfungsi sebagai penghubung antara frontend dan backend.

Repository bertanggung jawab untuk:
- Mengambil daftar biji kopi melalui GET.
- Mengirim data baru melalui POST.
- Memperbarui data melalui PUT.
- Menghapus data melalui DELETE.

Repository menggunakan Axios dengan alamat dasar API:

`http://localhost:3000/api`

**C. Model**

File `packages/shared/src/models/Bean.ts` mendefinisikan struktur data Bean yang digunakan bersama oleh frontend dan backend.

Struktur model Bean:

```typescript
export interface Bean {
  id?: number;
  name: string;
  roastery: string;
  latitude?: number;
  longitude?: number;
  photoBase64?: string;
  origin?: string;
  process?: string;
  roastLevel?: string;
  createdAt?: Date;
}
```

**D. Backend**

Backend menggunakan Express.js untuk menerima permintaan dari frontend dan memproses data biji kopi.

Data saat ini disimpan menggunakan array sementara di dalam variabel `beansDB`.

### 5. Implementasi REST API

Backend menyediakan empat endpoint utama untuk pengelolaan data biji kopi.

| Method | Endpoint | Fungsi |
|---|---|---|
| GET | `/api/beans` | Mengambil seluruh data biji kopi |
| POST | `/api/beans` | Menambahkan biji kopi |
| PUT | `/api/beans/:id` | Memperbarui biji kopi |
| DELETE | `/api/beans/:id` | Menghapus biji kopi |

**A. GET – Mengambil Data**

Frontend mengirimkan permintaan GET untuk mendapatkan daftar biji kopi dari backend.

```typescript
getBeans: async (): Promise<Bean[]> => {
  const response = await api.get('/beans');
  return response.data;
}
```

**B. POST – Menambahkan Data**

Ketika pengguna menambahkan biji kopi, frontend mengirimkan data melalui POST.

```typescript
createBean: async (data: Partial<Bean>): Promise<Bean> => {
  const response = await api.post('/beans', data);
  return response.data;
}
```

**C. PUT – Memperbarui Data**

Endpoint PUT digunakan untuk memperbarui informasi biji kopi berdasarkan ID.

```typescript
updateBean: async (id: number, data: Partial<Bean>) => {
  const response = await api.put(`/beans/${id}`, data);
  return response.data;
}
```

**D. DELETE – Menghapus Data**

Endpoint DELETE digunakan untuk menghapus data biji kopi berdasarkan ID.

```typescript
deleteBean: async (id: number): Promise<void> => {
  await api.delete(`/beans/${id}`);
}
```

### 6. Alur Integrasi Frontend dan Backend

Proses komunikasi data pada aplikasi Brobean berlangsung sebagai berikut:

1. Pengguna membuka halaman Bean Management.
2. Frontend meminta daftar biji kopi melalui `beanRepository`.
3. Repository mengirimkan HTTP request menggunakan Axios.
4. Backend menerima permintaan melalui Express.js.
5. Backend mengambil data dari `beansDB`.
6. Backend mengembalikan respons dalam format JSON.
7. Repository menerima respons dan mengembalikan data kepada frontend.
8. Frontend menampilkan data kepada pengguna.

Untuk proses penambahan, perubahan, dan penghapusan, frontend mengirimkan request ke endpoint yang sesuai.

### 7. Penanganan Status UI

Dalam integrasi API, antarmuka pengguna perlu memberikan informasi mengenai kondisi proses pengambilan dan pengelolaan data.

Status yang perlu ditangani:

**A. Loading**

Ditampilkan ketika frontend sedang menunggu respons dari backend.

Contoh: Menampilkan indikator loading ketika daftar biji kopi sedang dimuat.

**B. Empty State**

Ditampilkan ketika backend berhasil memberikan respons, tetapi belum terdapat data biji kopi.

Contoh: Menampilkan pesan "Belum ada data biji kopi".

**C. Error State**

Ditampilkan ketika terjadi kegagalan komunikasi dengan backend, seperti server tidak tersedia atau HTTP error.

Contoh: Menampilkan pesan "Gagal mengambil data biji kopi".

**D. Success State**

Ditampilkan ketika proses pengambilan, penambahan, perubahan, atau penghapusan data berhasil.

**E. Retry**

Menyediakan tombol untuk mencoba kembali permintaan API apabila proses sebelumnya mengalami kegagalan.

Catatan: Kelima status tersebut merupakan kebutuhan implementasi UI. Keberadaan dan keberfungsian masing-masing status pada komponen frontend perlu diverifikasi secara langsung.

### 8. Unit Testing

Pengujian unit dilakukan menggunakan Vitest untuk memastikan fungsi repository dan struktur data dapat bekerja sesuai dengan kebutuhan.

File pengujian:

`apps/web/src/services/beanRepository.test.ts`

Pengujian menggunakan mock Axios sehingga proses komunikasi dengan backend dapat disimulasikan tanpa harus menjalankan server secara langsung.

Terdapat enam skenario pengujian:

**Test 1 – Model Valid**

Memastikan objek Bean memiliki struktur data yang sesuai.

Contoh:

```typescript
const validBean: Bean = {
  id: 1,
  name: 'Gayo',
  roastery: 'Kopi Kenangan'
};

expect(validBean.name).toBe('Gayo');
expect(validBean.roastery).toBeDefined();
```

Hasil yang diharapkan: Data Bean memiliki informasi nama dan roastery.

**Test 2 – Model Invalid**

Memastikan data yang memiliki tipe tidak sesuai dapat dikenali sebagai data tidak valid.

Contoh:

```typescript
const invalidBean: any = {
  name: 123
};

const isValid = (b: any) =>
  typeof b.name === 'string' &&
  typeof b.roastery === 'string';

expect(isValid(invalidBean)).toBe(false);
```

Hasil yang diharapkan: Data dengan tipe yang tidak sesuai dinyatakan tidak valid.

**Test 3 – API Sukses**

Memastikan fungsi `getBeans()` berhasil mengambil dan mengembalikan data dari API.

Hasil yang diharapkan: Repository mengembalikan array yang berisi data biji kopi.

**Test 4 – Data Kosong**

Memastikan repository dapat menangani respons API berupa array kosong.

Hasil yang diharapkan: Repository mengembalikan array kosong tanpa menyebabkan error.

**Test 5 – HTTP Gagal**

Memastikan repository dapat menangani kegagalan komunikasi dengan server.

Contoh:

```typescript
mockedAxios.get.mockRejectedValueOnce(
  new Error('Network Error')
);

await expect(
  () => beanRepository.getBeans()
).rejects.toThrow('Network Error');
```

Hasil yang diharapkan: Repository meneruskan error ketika permintaan API gagal.

**Test 6 – JSON Rusak**

Memastikan respons API yang tidak berbentuk array dapat dikenali sebagai respons dengan format yang tidak sesuai.

Contoh pengujian yang sudah tersedia:

```typescript
mockedAxios.get.mockResolvedValueOnce({
  data: "<html>502 Bad Gateway</html>"
});

const result = await beanRepository.getBeans();

const isJsonArray = Array.isArray(result);

expect(isJsonArray).toBe(false);
```

Hasil yang diharapkan: Respons HTML tidak dikenali sebagai array data Bean.

Catatan: Pengujian ini masih perlu ditingkatkan dengan validasi respons dan assertion bahwa repository benar-benar melempar error untuk JSON atau format data yang tidak valid.

### 9. Cara Menjalankan Unit Test

Untuk menjalankan pengujian, buka terminal pada direktori utama proyek Brobean.

Jalankan perintah:

```bash
npm install
```

Kemudian jalankan unit test:

```bash
npm run test --workspace=@brobean/web
```

Vitest akan menjalankan seluruh skenario pengujian yang terdapat pada file `beanRepository.test.ts`.

Untuk menjalankan backend:

```bash
npm run dev:api
```

Untuk menjalankan frontend:

```bash
npm run dev:web
```

Backend berjalan pada:

`http://localhost:3000`

Endpoint API:

`http://localhost:3000/api/beans`

### 10. Hasil Pengujian dan Evaluasi

Berdasarkan implementasi yang tersedia, evaluasi terhadap kriteria tugas adalah sebagai berikut.

| Kriteria | Status |
|---|---|
| Koneksi frontend ke backend API | Sudah tersedia |
| Penggunaan repository | Sudah tersedia |
| Penggunaan model TypeScript | Sudah tersedia |
| API GET | Sudah tersedia |
| API POST | Sudah tersedia |
| API PUT | Sudah tersedia |
| API DELETE | Sudah tersedia |
| Unit test model valid | Sudah tersedia |
| Unit test model invalid | Sudah tersedia |
| Unit test API sukses | Sudah tersedia |
| Unit test data kosong | Sudah tersedia |
| Unit test HTTP gagal | Sudah tersedia |
| Unit test JSON rusak | Sudah tersedia, perlu penyempurnaan |
| Loading, empty, error, success, retry | Perlu verifikasi pada UI |
| Penyimpanan database permanen | Belum tersedia |

### 11. Kesimpulan

Proyek Brobean telah memiliki dasar integrasi API menggunakan arsitektur frontend, repository, model, dan backend.

Fitur Bean Management telah memiliki endpoint REST API untuk melakukan operasi Create, Read, Update, dan Delete (CRUD). Penggunaan Axios memudahkan komunikasi antara frontend dan backend, sedangkan model TypeScript membantu menjaga konsistensi struktur data.

Selain itu, proyek telah memiliki enam skenario unit testing menggunakan Vitest yang mencakup pengujian model valid, model invalid, API sukses, data kosong, HTTP gagal, dan JSON rusak.

Dengan implementasi tersebut, Brobean telah memenuhi dasar kebutuhan integrasi API dan unit testing. Namun, pengembangan lebih lanjut masih diperlukan, khususnya pada validasi respons API, penanganan seluruh status UI, serta penggunaan database permanen agar data tidak hilang ketika server dimulai ulang.