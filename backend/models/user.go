package models

import "time"

type User struct {
	ID        uint      `json:"id" gorm:"primaryKey"`
	Nama      string    `json:"nama" gorm:"size:100;not null"`
	Email     string    `json:"email" gorm:"size:100;uniqueIndex;not null"`
	Password  string    `json:"-" gorm:"size:255;not null"`
	Role      string    `json:"role" gorm:"size:20;default:peminjam"`
	Jabatan   string    `json:"jabatan" gorm:"size:20"`
	NIP       string    `json:"nip" gorm:"size:30"`
	NISN      string    `json:"nisn" gorm:"size:20"`
	Kelas     string    `json:"kelas" gorm:"size:20"`
	Status    string    `json:"status" gorm:"size:20;default:pending"`
	FotoProfil string   `json:"foto_profil" gorm:"size:255"`
	CreatedAt time.Time `json:"created_at"`
}

type LoginRequest struct {
	Email    string `json:"email" binding:"required"`
	Password string `json:"password" binding:"required"`
}

type RegisterRequest struct {
	Nama     string `json:"nama" binding:"required"`
	Email    string `json:"email" binding:"required"`
	Password string `json:"password" binding:"required"`
	Role     string `json:"role"`
	Jabatan  string `json:"jabatan" binding:"required"`
	NIP      string `json:"nip"`
	NISN     string `json:"nisn"`
	Kelas    string `json:"kelas"`
}
