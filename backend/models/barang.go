package models

import "time"

type Barang struct {
	ID              uint           `json:"id" gorm:"primaryKey"`
	Nama            string         `json:"nama" gorm:"size:150;not null"`
	KodeBarang      string         `json:"kode_barang" gorm:"size:50;uniqueIndex;not null"`
	KategoriID      *uint          `json:"kategori_id"`
	Kategori        KategoriBarang `json:"kategori" gorm:"foreignKey:KategoriID"`
	JumlahTotal     int            `json:"jumlah_total" gorm:"default:0"`
	JumlahTersedia  int            `json:"jumlah_tersedia" gorm:"default:0"`
	Kondisi         string         `json:"kondisi" gorm:"size:30;default:Baik"`
	Lokasi          string         `json:"lokasi" gorm:"size:100"`
	Deskripsi       string         `json:"deskripsi" gorm:"type:text"`
	CreatedAt       time.Time      `json:"created_at"`
	UpdatedAt       time.Time      `json:"updated_at"`
}

type BarangRequest struct {
	Nama           string `json:"nama" binding:"required"`
	KodeBarang     string `json:"kode_barang" binding:"required"`
	KategoriID     *uint  `json:"kategori_id"`
	JumlahTotal    int    `json:"jumlah_total" binding:"required"`
	Kondisi        string `json:"kondisi"`
	Lokasi         string `json:"lokasi"`
	Deskripsi      string `json:"deskripsi"`
}
