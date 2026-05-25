package handlers

import (
	"net/http"

	"sapras-api/config"
	"sapras-api/models"

	"github.com/gin-gonic/gin"
)

type DashboardStats struct {
	TotalBarang         int64 `json:"total_barang"`
	BarangTersedia      int64 `json:"barang_tersedia"`
	TotalPeminjaman     int64 `json:"total_peminjaman"`
	PeminjamanAktif     int64 `json:"peminjaman_aktif"`
	MenungguPersetujuan int64 `json:"menunggu_persetujuan"`
	TotalUser           int64 `json:"total_user"`
	PendingUser         int64 `json:"pending_user"`
}

type PeminjamanTerbaru struct {
	ID            uint   `json:"id"`
	NamaPeminjam  string `json:"nama_peminjam"`
	NamaBarang    string `json:"nama_barang"`
	Jumlah        int    `json:"jumlah"`
	Status        string `json:"status"`
	TanggalPinjam string `json:"tanggal_pinjam"`
}

// GetDashboardStats - GET /api/dashboard/stats
func GetDashboardStats(c *gin.Context) {
	var stats DashboardStats
	userRole, _ := c.Get("user_role")
	userID, _ := c.Get("user_id")

	// Total barang (jenis) - same for everyone
	config.DB.Model(&models.Barang{}).Count(&stats.TotalBarang)

	// Barang yang tersedia (ada stok)
	config.DB.Model(&models.Barang{}).Where("jumlah_tersedia > 0").Count(&stats.BarangTersedia)

	if userRole == "admin" {
		// Admin sees everything
		config.DB.Model(&models.Peminjaman{}).Count(&stats.TotalPeminjaman)
		config.DB.Model(&models.Peminjaman{}).Where("status = ?", "disetujui").Count(&stats.PeminjamanAktif)
		config.DB.Model(&models.Peminjaman{}).Where("status = ?", "menunggu").Count(&stats.MenungguPersetujuan)
		config.DB.Model(&models.User{}).Count(&stats.TotalUser)
		config.DB.Model(&models.User{}).Where("status = ?", "pending").Count(&stats.PendingUser)
	} else {
		// User hanya melihat data sendiri
		config.DB.Model(&models.Peminjaman{}).Where("user_id = ?", userID).Count(&stats.TotalPeminjaman)
		config.DB.Model(&models.Peminjaman{}).Where("user_id = ? AND status = ?", userID, "disetujui").Count(&stats.PeminjamanAktif)
		config.DB.Model(&models.Peminjaman{}).Where("user_id = ? AND status = ?", userID, "menunggu").Count(&stats.MenungguPersetujuan)
	}

	c.JSON(http.StatusOK, gin.H{
		"status": "success",
		"data":   stats,
	})
}

// GetRecentPeminjaman - GET /api/dashboard/recent
func GetRecentPeminjaman(c *gin.Context) {
	var peminjamans []models.Peminjaman
	userRole, _ := c.Get("user_role")
	userID, _ := c.Get("user_id")

	query := config.DB.Preload("User").Preload("Barang").Where("status = ?", "menunggu")

	if userRole != "admin" {
		// User hanya melihat peminjaman sendiri
		query = query.Where("user_id = ?", userID)
	}

	query.Order("created_at DESC").
		Limit(10).
		Find(&peminjamans)

	c.JSON(http.StatusOK, gin.H{
		"status": "success",
		"data":   peminjamans,
	})
}
