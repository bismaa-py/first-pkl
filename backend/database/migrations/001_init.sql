-- =============================================
-- Sistem Peminjaman Barang SAPRAS
-- Database Migration
-- =============================================

-- Buat database (jalankan manual jika belum ada)
-- CREATE DATABASE sapras_db;

-- Tabel users
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    nama VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'peminjam',
    kelas VARCHAR(20),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Tabel kategori_barang
CREATE TABLE IF NOT EXISTS kategori_barangs (
    id SERIAL PRIMARY KEY,
    nama VARCHAR(100) NOT NULL,
    deskripsi TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabel barang
CREATE TABLE IF NOT EXISTS barangs (
    id SERIAL PRIMARY KEY,
    nama VARCHAR(150) NOT NULL,
    kode_barang VARCHAR(50) UNIQUE NOT NULL,
    kategori_id INTEGER REFERENCES kategori_barangs(id) ON DELETE SET NULL,
    jumlah_total INTEGER NOT NULL DEFAULT 0,
    jumlah_tersedia INTEGER NOT NULL DEFAULT 0,
    kondisi VARCHAR(30) DEFAULT 'Baik',
    lokasi VARCHAR(100),
    deskripsi TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabel peminjaman
CREATE TABLE IF NOT EXISTS peminjamans (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    barang_id INTEGER REFERENCES barangs(id) ON DELETE CASCADE,
    jumlah INTEGER NOT NULL DEFAULT 1,
    tanggal_pinjam DATE NOT NULL DEFAULT CURRENT_DATE,
    tanggal_kembali DATE,
    tanggal_dikembalikan DATE,
    status VARCHAR(30) DEFAULT 'menunggu',
    catatan TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- =============================================
-- Seed Data
-- =============================================

-- Admin user (password: admin123 - bcrypt hash)
INSERT INTO users (nama, email, password, role) VALUES
('Admin SAPRAS', 'admin@sekolah.id', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'admin')
ON CONFLICT (email) DO NOTHING;

-- Kategori barang
INSERT INTO kategori_barangs (nama, deskripsi) VALUES
('Elektronik', 'Peralatan elektronik seperti proyektor, laptop, speaker'),
('Olahraga', 'Peralatan olahraga seperti bola, raket, net'),
('Laboratorium', 'Peralatan laboratorium seperti mikroskop, tabung reaksi'),
('Furniture', 'Perabotan seperti meja, kursi, lemari'),
('ATK', 'Alat tulis kantor seperti spidol, penghapus, penggaris')
ON CONFLICT DO NOTHING;

-- Barang
INSERT INTO barangs (nama, kode_barang, kategori_id, jumlah_total, jumlah_tersedia, kondisi, lokasi, deskripsi) VALUES
('Proyektor Epson EB-X51', 'ELK-001', 1, 5, 5, 'Baik', 'Gudang Lantai 1', 'Proyektor untuk presentasi kelas'),
('Laptop Lenovo IdeaPad', 'ELK-002', 1, 10, 10, 'Baik', 'Lab Komputer', 'Laptop untuk kegiatan belajar'),
('Speaker Portable JBL', 'ELK-003', 1, 3, 3, 'Baik', 'Gudang Lantai 1', 'Speaker untuk acara sekolah'),
('Bola Sepak Mikasa', 'OLR-001', 2, 8, 8, 'Baik', 'Gudang Olahraga', 'Bola sepak standar'),
('Raket Badminton Yonex', 'OLR-002', 2, 12, 12, 'Baik', 'Gudang Olahraga', 'Raket badminton untuk ekskul'),
('Net Voli', 'OLR-003', 2, 2, 2, 'Baik', 'Gudang Olahraga', 'Net voli standar'),
('Mikroskop Binokuler', 'LAB-001', 3, 15, 15, 'Baik', 'Lab Biologi', 'Mikroskop untuk praktikum'),
('Meja Lipat', 'FRN-001', 4, 20, 20, 'Baik', 'Gudang Lantai 2', 'Meja lipat untuk acara'),
('Spidol Snowman', 'ATK-001', 5, 50, 50, 'Baik', 'Ruang TU', 'Spidol whiteboard')
ON CONFLICT (kode_barang) DO NOTHING;
