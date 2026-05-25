# SAPRAS - Sistem Aplikasi Sarana & Prasarana SMKN 2 Singosari

SAPRAS adalah sistem manajemen inventarisasi sarana dan prasarana sekolah yang dirancang khusus untuk mempermudah proses peminjaman barang, pengelolaan stok barang, serta pemantauan log aktivitas pengguna di lingkungan SMKN 2 Singosari.

---

## 🚀 Fitur Utama

- **Dashboard Informatif**: Statistik real-time mengenai total barang, barang tersedia, permohonan peminjaman aktif, peminjaman disetujui, dan pengguna pending.
- **Manajemen Peminjaman**: 
  - Alur peminjaman multi-role yang jelas (Siswa/Guru mengajukan permohonan, Admin memverifikasi).
  - Validasi ketat tanggal peminjaman (tidak boleh sebelum hari ini) dan tanggal kembali wajib diisi.
  - Alur pengembalian barang terintegrasi dengan konfirmasi mandiri oleh pengguna dan verifikasi oleh Admin Sarpras.
- **Manajemen Inventaris**: Pengelolaan stok barang lengkap dengan kategori, lokasi penyimpanan, kode barang unik, dan status ketersediaan barang otomatis.
- **Manajemen Pengguna (User Management)**:
  - Pendaftaran akun terverifikasi (akun baru berstatus *pending* dan harus disetujui oleh Admin).
  - Pengaturan profil mandiri, termasuk foto profil (unggah/hapus foto dengan sinkronisasi real-time).
- **Log Aktivitas & Audit Keamanan**: Pencatatan lengkap setiap tindakan penting pengguna beserta alamat IP client demi keamanan dan integritas data audit.

---

## 🛠️ Arsitektur & Teknologi

Sistem dibangun menggunakan arsitektur modern yang memisahkan Frontend dan Backend (Decoupled Architecture):

### 1. Backend (RESTful API Server)
* **Bahasa & Framework**: Go (Golang) v1.20+ dengan **Gin Gonic** untuk performa routing API yang tinggi.
* **ORM & Database**: **GORM** terhubung dengan database **PostgreSQL**.
* **Keamanan**: JWT (JSON Web Token) untuk otentikasi stateless, enkripsi password Bcrypt, dan middleware otorisasi berbasis Role (Admin/Peminjam).

### 2. Frontend (Single Page Application)
* **Bahasa & Library**: Javascript dengan **React.js** v18+ dan **Vite** untuk build tool super cepat.
* **Desain & Styling**: Vanilla CSS & TailwindCSS untuk tampilan premium, modern, dan sepenuhnya responsif (mobile-friendly).
* **Ikon**: **Lucide React** untuk koleksi ikon modern yang konsisten.
* **HTTP Client**: **Axios** terkonfigurasi dengan interceptor JWT Token.

---

## 📁 Struktur Proyek

```text
First PKL/
├── backend/                  # Source code API Server (Go)
│   ├── config/               # Konfigurasi database & environment
│   ├── database/             # Skema migrasi SQL & database seeder
│   ├── handlers/             # Controller logika bisnis API
│   ├── middleware/           # Middleware JWT & Auth
│   ├── models/               # Definisi tabel GORM / struct data
│   ├── uploads/              # Penyimpanan lokal file foto profil
│   └── main.go               # Entry point aplikasi backend
│
└── frontend/                 # Source code aplikasi client (React)
    ├── src/
    │   ├── assets/           # Aset visual (Logo sekolah, dll.)
    │   ├── components/       # Komponen global (Navbar, Sidebar, StatusBadge)
    │   ├── context/          # Context API global (AuthContext, PopupContext)
    │   ├── pages/            # Halaman utama aplikasi (Dashboard, History, dll.)
    │   └── api/              # Konfigurasi instans Axios
    ├── index.html            # File HTML utama
    └── package.json          # File konfigurasi npm dependencies
```

---

## ⚙️ Petunjuk Instalasi & Menjalankan Aplikasi

### Persyaratan Awal (Prerequisites)
Pastikan perangkat Anda sudah terinstal:
* [Go (Golang)](https://go.dev/dl/) v1.20 atau versi terbaru
* [Node.js & npm](https://nodejs.org/en/download/) v16 atau versi terbaru
* [PostgreSQL](https://www.postgresql.org/download/) terinstal dan berjalan

### Langkah 1: Pengaturan Database & Backend
1. Buat database kosong bernama `sapras_db` di PostgreSQL Anda.
2. Masuk ke direktori backend:
   ```bash
   cd backend
   ```
3. Sesuaikan konfigurasi koneksi database di file `config/database.go` atau file konfigurasi `.env` Anda.
4. Jalankan migrasi database (jika ada script SQL di `database/migrations/001_init.sql` untuk inisialisasi tabel).
5. Unduh library dependencies Go:
   ```bash
   go mod tidy
   ```
6. Jalankan server backend:
   ```bash
   go run main.go
   ```
   Server backend akan aktif di alamat `http://localhost:8080`.

### Langkah 2: Pengaturan Frontend
1. Buka terminal baru dan masuk ke direktori frontend:
   ```bash
   cd frontend
   ```
2. Instal semua paket npm:
   ```bash
   npm install
   ```
3. Jalankan server development Vite:
   ```bash
   npm run dev
   ```
   Aplikasi frontend akan aktif di alamat `http://localhost:5173`.
