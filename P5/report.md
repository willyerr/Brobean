# Laporan Implementasi Local Data & Persistence — Proyek Brobean

Dokumen ini menyajikan rincian teknis, alur implementasi, serta panduan bagi *reviewer* untuk memverifikasi fitur **Local Data & Persistence** pada aplikasi **Brobean** berbasis *Progressive Web App* (PWA).

---

## 1. Ringkasan Kepatuhan Tugas (Checklist)

| Kriteria Tugas | Status | Implementasi pada Proyek Brobean |
| :--- | :---: | :--- |
| **Local Data** | ✅ Selesai | Menggunakan API standar browser: `localStorage` |
| **Data Model** | ✅ Selesai | Entitas tipe data terstruktur TypeScript (`Bean`) |
| **CRUD** | ✅ Selesai | Create, Read, Update, Delete berjalan utuh secara lokal |
| **Persistence Test** | ✅ Selesai | Data tetap aman dan utuh setelah browser ditutup / di-*refresh* (F5) |
| **Teknologi PWA** | ✅ Selesai | 100% berjalan di sisi *Frontend* tanpa *dependency* tambahan |

---

## 2. Panduan untuk Reviewer: Posisi Kode Local Data & Persistence

Bagi *reviewer* atau dosen yang ingin memeriksa secara langsung letak kode sumber fitur ini, seluruh logika *persistence* diisolasi menggunakan *Repository Pattern* agar bersih dari komponen UI:

1. **Penyimpanan & Logika CRUD Lokal (`Repository Layer`):**
   * **Lokasi File:** `apps/web/src/services/beanRepository.ts`
   * **Penjelasan:** File ini berisi fungsi-fungsi asinkron yang langsung berinteraksi dengan browser storage menggunakan *key* unik `brobean_local_data`. Setiap operasi CRUD memodifikasi *string JSON* yang tersimpan di dalam memori lokal browser.

2. **Manajemen State Global (`State Management`):**
   * **Lokasi File:** `apps/web/src/store/useBeanStore.ts`
   * **Penjelasan:** Menggunakan **Zustand** untuk menyebarkan data `beans`, status `isLoading`, serta mengeksekusi aksi penyimpanan agar langsung merespons perubahan antarmuka secara *reaktif*.

3. **Antarmuka Pengguna (`UI Presentation Layer`):**
   * **Lokasi File:** `apps/web/src/pages/BeanCatalog.tsx`
   * **Penjelasan:** Menyediakan tombol interaktif untuk *Create* (Form Tambah), *Read* (Daftar Grid Kopi), *Update* (Mode Edit data terpilih), dan *Delete* (Tombol Hapus).

---

## 3. Detail Teknis & Model Data

### A. Data Model (`packages/shared/src/models/Bean.ts`)
Entitas data divalidasi menggunakan interface TypeScript bersama agar konsisten:
```typescript
export interface Bean {
  id?: number;          # Primary identifier (menggunakan Date.now())
  name: string;         # Nama biji kopi
  roastery: string;     # Asal penyangrai
  latitude?: number;    # Data sensor lokasi opsional
  longitude?: number;
  photoBase64?: string; # Data gambar opsional
}
```

### B. Mekanisme Repository Storage (`beanRepository.ts`)
Cuplikan kode inti bagaimana penyimpanan lokal diimplementasikan:
```typescript
const STORAGE_KEY = 'brobean_local_data';

const getLocalData = (): Bean[] => {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
};

const saveLocalData = (data: Bean[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
};
```

---

## 4. Cara Pengujian (*Persistence & CRUD Demo*)

Untuk mendemonstrasikan fitur ini kepada penguji, ikuti langkah-langkah berikut:

1. **Jalankan Aplikasi:**
   Buka terminal di direktori web, lalu jalankan perintah:
   ```bash
   npm run dev
   ```
   Akses aplikasi melalui peramban di `http://localhost:5173`.

2. **Uji Create (Tambah Data):**
   * Masukkan nama kopi (misal: *Gayo Natural*) dan roastery (*Senja Coffee*).
   * Klik tombol **Simpan Biji Kopi**. Data akan langsung muncul di bawah.

3. **Uji Persistence Test (Penyimpanan Tetap):**
   * Tekan tombol **F5** (atau *refresh* tab peramban).
   * **Hasil:** Data *Gayo Natural* tidak hilang dan langsung termuat kembali dari `localStorage`.

4. **Uji Update (Ubah Data):**
   * Klik tombol **Edit** pada kartu kopi yang sudah dibuat. Ubah namanya, lalu simpan. Perubahan akan langsung diperbarui secara persisten.

5. **Uji Delete (Hapus Data):**
   * Klik tombol **Hapus**, data akan terhapus permanen dari memori lokal browser.

---
*Dokumentasi ini disusun untuk memenuhi lembar kerja praktikum modul Local Data & Persistence.*