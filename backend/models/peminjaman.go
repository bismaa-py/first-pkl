package models

import "time"

type Peminjaman struct {
	ID                  uint      `json:"id" gorm:"primaryKey"`
	UserID              uint      `json:"user_id"`
	User                User      `json:"user" gorm:"foreignKey:UserID"`
	BarangID            uint      `json:"barang_id"`
	Barang              Barang    `json:"barang" gorm:"foreignKey:BarangID"`
	Jumlah              int       `json:"jumlah" gorm:"default:1"`
	TanggalPinjam       time.Time `json:"tanggal_pinjam" gorm:"type:date"`
	TanggalKembali      *time.Time `json:"tanggal_kembali" gorm:"type:date"`
	TanggalDikembalikan *time.Time `json:"tanggal_dikembalikan" gorm:"type:date"`
	Status              string    `json:"status" gorm:"size:30;default:menunggu"`
	Catatan             string    `json:"catatan" gorm:"type:text"`
	CreatedAt           time.Time `json:"created_at"`
	UpdatedAt           time.Time `json:"updated_at"`
}

type PeminjamanRequest struct {
	BarangID       uint   `json:"barang_id" binding:"required"`
	Jumlah         int    `json:"jumlah" binding:"required"`
	TanggalPinjam  string `json:"tanggal_pinjam" binding:"required"`
	TanggalKembali string `json:"tanggal_kembali" binding:"required"`
	Catatan        string `json:"catatan" binding:"required"`
}
