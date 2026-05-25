package config

import (
	"fmt"
	"log"
	"time"

	"sapras-api/models"

	"golang.org/x/crypto/bcrypt"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

var DB *gorm.DB

func ConnectDatabase() {
	dsn := "host=localhost user=postgres password=12345678 dbname=sapras_db port=5432 sslmode=disable TimeZone=Asia/Jakarta"

	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{
		Logger: logger.Default.LogMode(logger.Info),
	})
	if err != nil {
		log.Fatal("Gagal koneksi ke database: ", err)
	}

	// Auto migrate semua model
	err = db.AutoMigrate(
		&models.User{},
		&models.KategoriBarang{},
		&models.Barang{},
		&models.Peminjaman{},
		&models.ActivityLog{},
		&models.Notification{},
	)
	if err != nil {
		log.Fatal("Gagal migrasi database: ", err)
	}

	DB = db
	fmt.Println("Database berhasil terkoneksi!")

	// Seed data awal
	seedData(db)

	// Update existing users without status to 'active'
	// This handles existing users that got default 'pending' from new column
	db.Model(&models.User{}).Where("status IS NULL OR status = '' OR status = 'pending'").
		Where("role = ?", "admin").Update("status", "active")
	// Also activate any pre-existing non-admin users
	db.Model(&models.User{}).Where("status IS NULL OR status = ''").Update("status", "active")

	// Start background cleanup goroutine for old activity logs
	go startLogCleanup(db)
}

func seedData(db *gorm.DB) {
	// Cek apakah sudah ada admin
	var count int64
	db.Model(&models.User{}).Where("role = ?", "admin").Count(&count)
	if count > 0 {
		return // Sudah ada data, skip seeding
	}

	fmt.Println("Menjalankan seed data...")

	// Seed admin
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte("Admin123"), bcrypt.DefaultCost)
	if err != nil {
		log.Println("Gagal meng-hash password admin:", err)
	} else {
		adminUser := models.User{
			Nama:     "Admin SAPRAS",
			Email:    "admin@sekolah.id",
			Password: string(hashedPassword),
			Role:     "admin",
			Status:   "active",
		}
		db.Create(&adminUser)
	}

	// Seed kategori
	kategoris := []models.KategoriBarang{
		{Nama: "Elektronik", Deskripsi: "Peralatan elektronik seperti proyektor, laptop, speaker"},
		{Nama: "Olahraga", Deskripsi: "Peralatan olahraga seperti bola, raket, net"},
		{Nama: "Laboratorium", Deskripsi: "Peralatan laboratorium seperti mikroskop, tabung reaksi"},
		{Nama: "Furniture", Deskripsi: "Perabotan seperti meja, kursi, lemari"},
		{Nama: "ATK", Deskripsi: "Alat tulis kantor seperti spidol, penghapus, penggaris"},
	}
	db.Create(&kategoris)

	// Seed barang
	barangs := []models.Barang{
		{Nama: "Proyektor Epson EB-X51", KodeBarang: "ELK-001", KategoriID: &kategoris[0].ID, JumlahTotal: 5, JumlahTersedia: 5, Kondisi: "Baik", Lokasi: "Ruang Sarpras", Deskripsi: "Proyektor untuk presentasi kelas"},
		{Nama: "Laptop Lenovo IdeaPad", KodeBarang: "ELK-002", KategoriID: &kategoris[0].ID, JumlahTotal: 10, JumlahTersedia: 10, Kondisi: "Baik", Lokasi: "Ruang Sarpras", Deskripsi: "Laptop untuk kegiatan belajar"},
		{Nama: "Speaker Portable JBL", KodeBarang: "ELK-003", KategoriID: &kategoris[0].ID, JumlahTotal: 3, JumlahTersedia: 3, Kondisi: "Baik", Lokasi: "Ruang Sarpras", Deskripsi: "Speaker untuk acara sekolah"},
		{Nama: "Bola Sepak Mikasa", KodeBarang: "OLR-001", KategoriID: &kategoris[1].ID, JumlahTotal: 8, JumlahTersedia: 8, Kondisi: "Baik", Lokasi: "Gudang Olahraga", Deskripsi: "Bola sepak standar"},
		{Nama: "Raket Badminton Yonex", KodeBarang: "OLR-002", KategoriID: &kategoris[1].ID, JumlahTotal: 12, JumlahTersedia: 12, Kondisi: "Baik", Lokasi: "Gudang Olahraga", Deskripsi: "Raket badminton untuk ekskul"},
		{Nama: "Net Voli", KodeBarang: "OLR-003", KategoriID: &kategoris[1].ID, JumlahTotal: 2, JumlahTersedia: 2, Kondisi: "Baik", Lokasi: "Gudang Olahraga", Deskripsi: "Net voli standar"},
		{Nama: "Mikroskop Binokuler", KodeBarang: "LAB-001", KategoriID: &kategoris[2].ID, JumlahTotal: 15, JumlahTersedia: 15, Kondisi: "Baik", Lokasi: "Ruang Sarpras", Deskripsi: "Mikroskop untuk praktikum"},
		{Nama: "Meja Lipat", KodeBarang: "FRN-001", KategoriID: &kategoris[3].ID, JumlahTotal: 20, JumlahTersedia: 20, Kondisi: "Baik", Lokasi: "Ruang Sarpras", Deskripsi: "Meja lipat untuk acara"},
		{Nama: "Spidol Snowman", KodeBarang: "ATK-001", KategoriID: &kategoris[4].ID, JumlahTotal: 50, JumlahTersedia: 50, Kondisi: "Baik", Lokasi: "Ruang TU", Deskripsi: "Spidol whiteboard"},
	}
	db.Create(&barangs)

	fmt.Println("Seed data berhasil!")
}

// startLogCleanup runs a background goroutine that cleans up old activity logs every 24 hours
func startLogCleanup(db *gorm.DB) {
	ticker := time.NewTicker(24 * time.Hour)
	defer ticker.Stop()

	for range ticker.C {
		sevenDaysAgo := time.Now().AddDate(0, 0, -7)
		result := db.Where("created_at < ?", sevenDaysAgo).Delete(&models.ActivityLog{})
		if result.RowsAffected > 0 {
			fmt.Printf("Cleanup: %d log aktivitas lama dihapus\n", result.RowsAffected)
		}
	}
}
