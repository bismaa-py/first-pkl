package handlers

import (
	"net/http"
	"time"

	"sapras-api/config"
	"sapras-api/models"

	"github.com/gin-gonic/gin"
)

// GetAllPeminjaman - GET /api/peminjaman
func GetAllPeminjaman(c *gin.Context) {
	var peminjamans []models.Peminjaman
	query := config.DB.Preload("User").Preload("Barang").Preload("Barang.Kategori")

	// Filter by status
	status := c.Query("status")
	if status != "" {
		query = query.Where("status = ?", status)
	}

	// Privacy: non-admin users can only see their own data
	userRole, _ := c.Get("user_role")
	userID, _ := c.Get("user_id")

	if userRole != "admin" {
		query = query.Where("user_id = ?", userID)
	} else {
		// Admin can filter by user_id if specified
		filterUserID := c.Query("user_id")
		if filterUserID != "" {
			query = query.Where("user_id = ?", filterUserID)
		}
	}

	query.Order("created_at DESC").Find(&peminjamans)

	c.JSON(http.StatusOK, gin.H{
		"status": "success",
		"data":   peminjamans,
	})
}

// GetPeminjamanByID - GET /api/peminjaman/:id
func GetPeminjamanByID(c *gin.Context) {
	id := c.Param("id")
	var peminjaman models.Peminjaman

	result := config.DB.Preload("User").Preload("Barang").Preload("Barang.Kategori").First(&peminjaman, id)
	if result.Error != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"status":  "error",
			"message": "Peminjaman tidak ditemukan",
		})
		return
	}

	// Privacy check
	userRole, _ := c.Get("user_role")
	userID, _ := c.Get("user_id")
	if userRole != "admin" && peminjaman.UserID != userID.(uint) {
		c.JSON(http.StatusForbidden, gin.H{
			"status":  "error",
			"message": "Anda tidak memiliki akses ke data ini",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"status": "success",
		"data":   peminjaman,
	})
}

// CreatePeminjaman - POST /api/peminjaman
func CreatePeminjaman(c *gin.Context) {
	var req models.PeminjamanRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"status":  "error",
			"message": "Data tidak valid: " + err.Error(),
		})
		return
	}

	// Ambil user_id dari JWT token
	userID, _ := c.Get("user_id")

	// Cek ketersediaan barang
	var barang models.Barang
	if err := config.DB.First(&barang, req.BarangID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"status":  "error",
			"message": "Barang tidak ditemukan",
		})
		return
	}

	if barang.JumlahTersedia < req.Jumlah {
		c.JSON(http.StatusBadRequest, gin.H{
			"status":  "error",
			"message": "Stok barang tidak mencukupi. Tersedia: " + string(rune(barang.JumlahTersedia+'0')),
		})
		return
	}

	// Parse tanggal
	tanggalPinjam, err := time.Parse("2006-01-02", req.TanggalPinjam)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"status":  "error",
			"message": "Format tanggal pinjam tidak valid (YYYY-MM-DD)",
		})
		return
	}

	// Validasi: tanggal pinjam tidak boleh sebelum hari ini (tanggal realtime)
	now := time.Now()
	today := time.Date(now.Year(), now.Month(), now.Day(), 0, 0, 0, 0, now.Location())
	if tanggalPinjam.Before(today) {
		c.JSON(http.StatusBadRequest, gin.H{
			"status":  "error",
			"message": "Tanggal pinjam tidak boleh sebelum tanggal hari ini",
		})
		return
	}

	if req.TanggalKembali == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"status":  "error",
			"message": "Tanggal kembali wajib diisi",
		})
		return
	}

	t, err := time.Parse("2006-01-02", req.TanggalKembali)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"status":  "error",
			"message": "Format tanggal kembali tidak valid (YYYY-MM-DD)",
		})
		return
	}
	// Validasi: tanggal kembali tidak boleh sebelum tanggal pinjam
	if t.Before(tanggalPinjam) {
		c.JSON(http.StatusBadRequest, gin.H{
			"status":  "error",
			"message": "Tanggal kembali tidak boleh sebelum tanggal pinjam",
		})
		return
	}
	tanggalKembali := &t

	peminjaman := models.Peminjaman{
		UserID:         userID.(uint),
		BarangID:       req.BarangID,
		Jumlah:         req.Jumlah,
		TanggalPinjam:  tanggalPinjam,
		TanggalKembali: tanggalKembali,
		Status:         "menunggu",
		Catatan:        req.Catatan,
	}

	config.DB.Create(&peminjaman)

	// Load relations
	config.DB.Preload("User").Preload("Barang").Preload("Barang.Kategori").First(&peminjaman, peminjaman.ID)

	// Log activity
	LogActivity(config.DB, userID.(uint), "Peminjaman", "Mengajukan peminjaman: "+peminjaman.Barang.Nama+" ("+string(rune(peminjaman.Jumlah+'0'))+" unit)", c.ClientIP())

	c.JSON(http.StatusCreated, gin.H{
		"status":  "success",
		"message": "Peminjaman berhasil diajukan",
		"data":    peminjaman,
	})
}

// ApprovePeminjaman - PUT /api/peminjaman/:id/approve
func ApprovePeminjaman(c *gin.Context) {
	id := c.Param("id")
	var peminjaman models.Peminjaman

	if err := config.DB.First(&peminjaman, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"status":  "error",
			"message": "Peminjaman tidak ditemukan",
		})
		return
	}

	if peminjaman.Status != "menunggu" {
		c.JSON(http.StatusBadRequest, gin.H{
			"status":  "error",
			"message": "Peminjaman tidak dalam status menunggu",
		})
		return
	}

	// Kurangi stok barang
	var barang models.Barang
	config.DB.First(&barang, peminjaman.BarangID)

	if barang.JumlahTersedia < peminjaman.Jumlah {
		c.JSON(http.StatusBadRequest, gin.H{
			"status":  "error",
			"message": "Stok barang tidak mencukupi untuk disetujui",
		})
		return
	}

	// Update stok
	config.DB.Model(&barang).Update("jumlah_tersedia", barang.JumlahTersedia-peminjaman.Jumlah)

	// Update status peminjaman
	config.DB.Model(&peminjaman).Update("status", "disetujui")

	config.DB.Preload("User").Preload("Barang").Preload("Barang.Kategori").First(&peminjaman, peminjaman.ID)

	// Log activity
	adminID, _ := c.Get("user_id")
	LogActivity(config.DB, adminID.(uint), "Approve Peminjaman", "Menyetujui peminjaman #"+id, c.ClientIP())

	// Notify user
	notif := models.Notification{
		UserID:  peminjaman.UserID,
		Title:   "Peminjaman Disetujui",
		Message: "Peminjaman " + peminjaman.Barang.Nama + " telah disetujui.",
		Type:    "info",
	}
	config.DB.Create(&notif)

	c.JSON(http.StatusOK, gin.H{
		"status":  "success",
		"message": "Peminjaman disetujui",
		"data":    peminjaman,
	})
}

// RejectPeminjaman - PUT /api/peminjaman/:id/reject
func RejectPeminjaman(c *gin.Context) {
	id := c.Param("id")
	var peminjaman models.Peminjaman

	if err := config.DB.First(&peminjaman, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"status":  "error",
			"message": "Peminjaman tidak ditemukan",
		})
		return
	}

	if peminjaman.Status != "menunggu" {
		c.JSON(http.StatusBadRequest, gin.H{
			"status":  "error",
			"message": "Peminjaman tidak dalam status menunggu",
		})
		return
	}

	config.DB.Model(&peminjaman).Update("status", "ditolak")

	config.DB.Preload("User").Preload("Barang").Preload("Barang.Kategori").First(&peminjaman, peminjaman.ID)

	// Log activity
	adminID, _ := c.Get("user_id")
	LogActivity(config.DB, adminID.(uint), "Reject Peminjaman", "Menolak peminjaman #"+id, c.ClientIP())

	// Notify user
	notif := models.Notification{
		UserID:  peminjaman.UserID,
		Title:   "Peminjaman Ditolak",
		Message: "Peminjaman " + peminjaman.Barang.Nama + " telah ditolak.",
		Type:    "info",
	}
	config.DB.Create(&notif)

	c.JSON(http.StatusOK, gin.H{
		"status":  "success",
		"message": "Peminjaman ditolak",
		"data":    peminjaman,
	})
}

// ConfirmReturn - PUT /api/peminjaman/:id/confirm-return (user confirms they returned the item)
func ConfirmReturn(c *gin.Context) {
	id := c.Param("id")
	userID, _ := c.Get("user_id")
	var peminjaman models.Peminjaman

	if err := config.DB.First(&peminjaman, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"status":  "error",
			"message": "Peminjaman tidak ditemukan",
		})
		return
	}

	// Check ownership
	if peminjaman.UserID != userID.(uint) {
		c.JSON(http.StatusForbidden, gin.H{
			"status":  "error",
			"message": "Anda tidak memiliki akses ke peminjaman ini",
		})
		return
	}

	if peminjaman.Status != "disetujui" {
		c.JSON(http.StatusBadRequest, gin.H{
			"status":  "error",
			"message": "Hanya peminjaman yang sudah disetujui yang bisa dikonfirmasi pengembaliannya",
		})
		return
	}

	config.DB.Model(&peminjaman).Update("status", "konfirmasi_kembali")

	config.DB.Preload("User").Preload("Barang").Preload("Barang.Kategori").First(&peminjaman, peminjaman.ID)

	// Log activity
	LogActivity(config.DB, userID.(uint), "Konfirmasi Pengembalian", "User mengkonfirmasi pengembalian peminjaman #"+id, c.ClientIP())

	// Notify all admins
	var admins []models.User
	config.DB.Where("role = ? AND status = ?", "admin", "active").Find(&admins)
	for _, admin := range admins {
		notif := models.Notification{
			UserID:  admin.ID,
			Title:   "Konfirmasi Pengembalian",
			Message: peminjaman.User.Nama + " mengkonfirmasi pengembalian " + peminjaman.Barang.Nama + ".",
			Type:    "info",
		}
		config.DB.Create(&notif)
	}

	c.JSON(http.StatusOK, gin.H{
		"status":  "success",
		"message": "Konfirmasi pengembalian berhasil. Menunggu verifikasi admin.",
		"data":    peminjaman,
	})
}

// ReturnPeminjaman - PUT /api/peminjaman/:id/return (admin verifies the return)
func ReturnPeminjaman(c *gin.Context) {
	id := c.Param("id")
	var peminjaman models.Peminjaman

	if err := config.DB.First(&peminjaman, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"status":  "error",
			"message": "Peminjaman tidak ditemukan",
		})
		return
	}

	if peminjaman.Status != "konfirmasi_kembali" && peminjaman.Status != "disetujui" {
		c.JSON(http.StatusBadRequest, gin.H{
			"status":  "error",
			"message": "Hanya peminjaman yang sudah dikonfirmasi atau disetujui yang bisa dikembalikan",
		})
		return
	}

	// Kembalikan stok barang
	var barang models.Barang
	config.DB.First(&barang, peminjaman.BarangID)
	config.DB.Model(&barang).Update("jumlah_tersedia", barang.JumlahTersedia+peminjaman.Jumlah)

	// Update status dan tanggal dikembalikan
	now := time.Now()
	config.DB.Model(&peminjaman).Updates(map[string]interface{}{
		"status":               "dikembalikan",
		"tanggal_dikembalikan": now,
	})

	config.DB.Preload("User").Preload("Barang").Preload("Barang.Kategori").First(&peminjaman, peminjaman.ID)

	// Log activity
	adminID, _ := c.Get("user_id")
	LogActivity(config.DB, adminID.(uint), "Return Peminjaman", "Admin memverifikasi pengembalian peminjaman #"+id, c.ClientIP())

	// Notify user
	notif := models.Notification{
		UserID:  peminjaman.UserID,
		Title:   "Barang Dikembalikan",
		Message: "Pengembalian " + peminjaman.Barang.Nama + " telah diverifikasi admin.",
		Type:    "info",
	}
	config.DB.Create(&notif)

	c.JSON(http.StatusOK, gin.H{
		"status":  "success",
		"message": "Barang berhasil dikembalikan",
		"data":    peminjaman,
	})
}

// GetPeminjamanHistory - GET /api/peminjaman/history (admin only - all history)
func GetPeminjamanHistory(c *gin.Context) {
	var peminjamans []models.Peminjaman
	query := config.DB.Preload("User").Preload("Barang").Preload("Barang.Kategori")

	// Filter by status
	status := c.Query("status")
	if status != "" {
		query = query.Where("status = ?", status)
	}

	// Filter by user
	userIDFilter := c.Query("user_id")
	if userIDFilter != "" {
		query = query.Where("user_id = ?", userIDFilter)
	}

	// Filter by date range
	dateFrom := c.Query("date_from")
	if dateFrom != "" {
		query = query.Where("tanggal_pinjam >= ?", dateFrom)
	}
	dateTo := c.Query("date_to")
	if dateTo != "" {
		query = query.Where("tanggal_pinjam <= ?", dateTo)
	}

	query.Order("created_at DESC").Find(&peminjamans)

	c.JSON(http.StatusOK, gin.H{
		"status": "success",
		"data":   peminjamans,
	})
}

// GetMyHistory - GET /api/peminjaman/my-history (user's own history)
func GetMyHistory(c *gin.Context) {
	userID, _ := c.Get("user_id")

	var peminjamans []models.Peminjaman
	query := config.DB.Preload("User").Preload("Barang").Preload("Barang.Kategori").
		Where("user_id = ?", userID)

	// Filter by status
	status := c.Query("status")
	if status != "" {
		query = query.Where("status = ?", status)
	}

	query.Order("created_at DESC").Find(&peminjamans)

	c.JSON(http.StatusOK, gin.H{
		"status": "success",
		"data":   peminjamans,
	})
}
