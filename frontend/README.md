# SAPRAS - Frontend Client Application

Ini adalah direktori frontend dari aplikasi **SAPRAS (Sistem Sarana & Prasarana SMKN 2 Singosari)** yang dibangun menggunakan **React.js v18** dan **Vite**.

Untuk petunjuk lengkap mengenai instalasi, konfigurasi, arsitektur sistem, dan cara menjalankan backend API server beserta frontend client, silakan merujuk pada file dokumen utama **[README.md](../README.md)** yang berada di folder root proyek ini.

## Perintah Pengembangan (Scripts)

Di dalam direktori ini, Anda dapat menjalankan perintah berikut:

### `npm install`
Mengunduh dan menginstal semua modul dependensi yang dibutuhkan oleh aplikasi frontend.

### `npm run dev`
Menjalankan server pengembangan frontend secara lokal di alamat `http://localhost:5173`. Perubahan kode akan secara otomatis di-reload (Hot Module Replacement).

### `npm run build`
Melakukan build/bundling aplikasi ke dalam folder `dist/` untuk keperluan produksi (production deployment). Kode akan diperkecil (minified) dan dioptimalkan secara otomatis oleh Vite.

### `npm run preview`
Menjalankan review lokal terhadap hasil build produksi (`dist/`) sebelum di-deploy ke server live.
