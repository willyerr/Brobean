# DOKUMENTASI P11 – BROBEAN
## GitHub Issues, Branching, Unit Testing, dan CI/CD Android

**Repository:** https://github.com/willyerr/Brobean  
**Platform:** GitHub, React, TypeScript, Vitest, Capacitor, Android Gradle  
**Tanggal dokumentasi:** 27 November 2026

---

## 1. Tujuan P11

Pada P11, pengembangan aplikasi Brobean dilakukan dengan menerapkan pengelolaan bug dan fitur menggunakan GitHub Issues, pengelolaan versi melalui Git Branch, serta pengujian otomatis menggunakan Unit Testing.

Selain itu, diterapkan sistem CI/CD menggunakan GitHub Actions agar setiap perubahan kode dapat diuji secara otomatis. Apabila seluruh unit test berhasil, sistem akan melanjutkan proses build aplikasi Android dan menghasilkan file APK yang dapat digunakan untuk pengujian.

Tujuan utama:
1. Mendokumentasikan minimal 10 Issues, dengan minimal 5 bug.
2. Memisahkan versi aplikasi berdasarkan branch.
3. Menjalankan minimal 200 Unit Tests.
4. Membuktikan kondisi Unit Test berhasil dan gagal.
5. Mengotomatisasi proses build APK setelah seluruh test berhasil.
6. Menyediakan APK sebagai artefak untuk pengujian aplikasi.

## 2. Pembuatan GitHub Issues

Pengelolaan bug dan pengembangan fitur dilakukan menggunakan GitHub Issues.

Hasil pemeriksaan repository menunjukkan terdapat **12 Issues**, terdiri dari 8 bug dan 4 pengembangan fitur, QA, serta release.

### 2.1 Daftar Bug

| No. | Issue | Permasalahan |
|---|---|---|
| #6 | Repository mengandung file database SQLite dan WAL/SHM | Database runtime ikut terlacak oleh Git. |
| #7 | Form edit Brew Log tidak menyediakan bean yang sudah diarsipkan | Bean historis tidak tersedia ketika mengedit Brew Log. |
| #8 | Mengganti preparation melalui API tanpa values mempertahankan parameter lama | Parameter metode sebelumnya tidak dibersihkan. |
| #9 | Invalid JSON request ditangani sebagai HTTP 500 | Request JSON yang tidak valid menghasilkan status error yang tidak sesuai. |
| #10 | Pengguna tidak dapat menghapus foto bean saat mengedit | Foto lama tidak dapat dihapus melalui form edit. |
| #11 | Menghapus bean yang masih direferensikan Brew Log menghasilkan HTTP 500 | Foreign key conflict tidak ditangani dengan respons yang sesuai. |
| #16 | Form edit Bean tidak dapat mengosongkan field opsional | Field opsional yang dikosongkan tetap menyimpan nilai lama. |
| #17 | API Brew Log menerima bean yang sudah diarsipkan | API tidak memvalidasi status arsip bean. |

### 2.2 Daftar Pengembangan Fitur, QA, dan Release

| No. | Issue | Tujuan |
|---|---|---|
| #12 | Tambahkan runtime logging terstruktur | Mempermudah pelacakan error pada API dan frontend. |
| #13 | Pindahkan API base URL ke konfigurasi environment | Memisahkan konfigurasi API development dan production. |
| #14 | Tambahkan automated API integration tests | Menguji aturan bisnis dan integrasi API. |
| #15 | Siapkan distribusi Android melalui Capacitor | Menyiapkan APK/AAB untuk pengujian dan distribusi. |

**Hasil:** Persyaratan minimal 10 Issues dan minimal 5 bug telah terpenuhi.

Repository Issues: https://github.com/willyerr/Brobean/issues

## 3. Pengelolaan Branch

Pengembangan menggunakan pemisahan branch untuk membedakan versi stabil, pengembangan, dan versi lanjutan.

| Branch | Fungsi |
|---|---|
| `v1.0` | Versi baseline/release yang dinyatakan stabil untuk referensi tugas. |
| `v1.0_dev` | Pengembangan fitur, perbaikan bug, dan pengujian. |
| `V1.1` | Branch versi lanjutan setelah baseline pengembangan. |

Branch yang terdeteksi pada repository GitHub saat pemeriksaan adalah `main`, `master`, `v1.0_dev`, dan `V1.1`. Branch `v1.0` perlu dikonfirmasi kembali apakah direpresentasikan sebagai tag release atau branch terpisah.

## 4. Implementasi Unit Testing

Pengujian otomatis dilakukan menggunakan Vitest pada aplikasi web Brobean.

Unit test digunakan untuk memeriksa fungsi dan komponen aplikasi, termasuk:
- Validasi input.
- Bean Form.
- Brew Form.
- Brew Card.
- Brew Parameter Fields.
- Brew Rating.
- Bean Repository.
- Brew Repository.
- Local Repository.

Perintah untuk menjalankan seluruh unit test:

```bash
npm run test:web
```

### 4.1 Hasil Pengujian Berhasil

Pada pengujian terakhir secara lokal, seluruh unit test berhasil dijalankan.

**Target hasil:**

```text
Test Files  9 passed (9)
Tests       200 passed (200)
```

Dengan demikian, terdapat 200 unit test yang berhasil dijalankan tanpa kegagalan.

### 4.2 Demonstrasi Unit Test Failed

Untuk membuktikan bahwa sistem dapat mendeteksi kesalahan, dibuat satu unit test yang sengaja menghasilkan kegagalan.

Contoh kode:

```typescript
import { describe, it, expect } from 'vitest';

describe('P11 - Demonstrasi Unit Test Failed', () => {
  it('should fail intentionally to demonstrate CI/CD failure', () => {
    expect(1 + 1).toBe(3);
  });
});
```

Test tersebut sengaja dibuat salah karena hasil `1 + 1` adalah `2`, bukan `3`.

Hasil pengujian pada GitHub Actions:

- 200 test berhasil.
- 1 test gagal.
- Total 201 test.
- Workflow berstatus Failure.

Hal ini membuktikan bahwa GitHub Actions dapat mendeteksi unit test yang gagal.

### 4.3 Dampak Kegagalan Unit Test

Apabila terdapat unit test yang gagal, job `Run Web Unit Tests` akan berstatus Failure.

Karena job `Build Brobean Android APK` memiliki dependency terhadap job unit test melalui konfigurasi `needs: unit-tests`, proses build APK otomatis dilewati.

Dengan demikian, APK tidak dihasilkan dari perubahan kode yang belum lolos pengujian.

Setelah demonstrasi selesai, test yang sengaja dibuat gagal dihapus dan pengujian lokal kembali menunjukkan 200 test berhasil.

## 5. Implementasi CI/CD Menggunakan GitHub Actions

CI/CD dikonfigurasi melalui file:

```text
.github/workflows/android-apk.yml
```

Workflow dijalankan ketika terdapat:
- Push ke branch `v1.0_dev` atau `V1.1`.
- Pull Request menuju branch tersebut.
- Pemanggilan manual melalui `workflow_dispatch`.
- Push tag dengan pola `v*`.

### 5.1 Alur CI/CD

```text
Developer melakukan perubahan kode
                |
                v
        Push ke GitHub
                |
                v
       GitHub Actions berjalan
                |
                v
          Install Dependencies