package handlers

import (
	"net/http"

	"sapras-api/config"
	"sapras-api/models"

	"github.com/gin-gonic/gin"
	"golang.org/x/crypto/bcrypt"
)

// GetAllUsers - GET /api/users (admin only)
func GetAllUsers(c *gin.Context) {
	var users []models.User
	query := config.DB.Order("created_at DESC")

	// Filter by status
	status := c.Query("status")
	if status != "" {
		query = query.Where("status = ?", status)
	}

	// Filter by role
	role := c.Query("role")
	if role != "" {
		query = query.Where("role = ?", role)
	}

	// Filter by jabatan
	jabatan := c.Query("jabatan")
	if jabatan != "" {
		query = query.Where("jabatan = ?", jabatan)
	}

	query.Find(&users)

	c.JSON(http.StatusOK, gin.H{
		"status": "success",
		"data":   users,
	})
}

// GetUserByID - GET /api/users/:id (admin only)
func GetUserByID(c *gin.Context) {
	id := c.Param("id")
	var user models.User

	result := config.DB.First(&user, id)
	if result.Error != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"status":  "error",
			"message": "User tidak ditemukan",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"status": "success",
		"data":   user,
	})
}

// UpdateUser - PUT /api/users/:id (admin only)
func UpdateUser(c *gin.Context) {
	id := c.Param("id")
	var user models.User

	if err := config.DB.First(&user, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"status":  "error",
			"message": "User tidak ditemukan",
		})
		return
	}

	// Block edit if user status is pending
	if user.Status == "pending" {
		c.JSON(http.StatusBadRequest, gin.H{
			"status":  "error",
			"message": "Akun yang belum disetujui (pending) tidak dapat diedit",
		})
		return
	}

	var req struct {
		Nama    string `json:"nama"`
		Email   string `json:"email"`
		Role    string `json:"role"`
		Jabatan string `json:"jabatan"`
		NIP     string `json:"nip"`
		NISN    string `json:"nisn"`
		Kelas   string `json:"kelas"`
		Status  string `json:"status"`
		Password string `json:"password"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"status":  "error",
			"message": "Data tidak valid",
		})
		return
	}

	// Block changing Jabatan, NIP, or NISN if they are already set and differ
	if user.Jabatan != "" && req.Jabatan != user.Jabatan {
		c.JSON(http.StatusBadRequest, gin.H{
			"status":  "error",
			"message": "Jabatan tidak dapat diubah setelah terdaftar",
		})
		return
	}
	if user.NIP != "" && req.NIP != user.NIP {
		c.JSON(http.StatusBadRequest, gin.H{
			"status":  "error",
			"message": "NIP tidak dapat diubah setelah terdaftar",
		})
		return
	}
	if user.NISN != "" && req.NISN != user.NISN {
		c.JSON(http.StatusBadRequest, gin.H{
			"status":  "error",
			"message": "NISN tidak dapat diubah setelah terdaftar",
		})
		return
	}

	// Validate NIP/NISN required fields based on jabatan
	if req.Jabatan == "guru" && req.NIP == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"status":  "error",
			"message": "NIP wajib diisi untuk guru",
		})
		return
	}
	if req.Jabatan == "siswa" && req.NISN == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"status":  "error",
			"message": "NISN wajib diisi untuk siswa",
		})
		return
	}

	// Validate NIP uniqueness if changed
	if req.NIP != "" && req.NIP != user.NIP {
		var count int64
		config.DB.Model(&models.User{}).Where("n_ip = ? AND id != ?", req.NIP, user.ID).Count(&count)
		if count > 0 {
			c.JSON(http.StatusBadRequest, gin.H{
				"status":  "error",
				"message": "NIP sudah terdaftar oleh pengguna lain",
			})
			return
		}
	}

	// Validate NISN uniqueness if changed
	if req.NISN != "" && req.NISN != user.NISN {
		var count int64
		config.DB.Model(&models.User{}).Where("nisn = ? AND id != ?", req.NISN, user.ID).Count(&count)
		if count > 0 {
			c.JSON(http.StatusBadRequest, gin.H{
				"status":  "error",
				"message": "NISN sudah terdaftar oleh pengguna lain",
			})
			return
		}
	}

	updates := map[string]interface{}{}
	if req.Nama != "" {
		updates["nama"] = req.Nama
	}
	if req.Email != "" {
		updates["email"] = req.Email
	}
	if req.Role != "" {
		updates["role"] = req.Role
	}
	if req.Status != "" {
		updates["status"] = req.Status
	}

	// Jabatan, NIP, NISN, and Kelas can be cleared (set to empty string), so update them unconditionally
	updates["jabatan"] = req.Jabatan
	updates["n_ip"] = req.NIP
	updates["nisn"] = req.NISN
	updates["kelas"] = req.Kelas
	if req.Password != "" {
		if !validatePassword(req.Password) {
			c.JSON(http.StatusBadRequest, gin.H{
				"status":  "error",
				"message": "Password harus mengandung huruf besar, huruf kecil, dan angka (minimal 6 karakter)",
			})
			return
		}
		hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"status":  "error",
				"message": "Gagal memproses password",
			})
			return
		}
		updates["password"] = string(hashedPassword)
	}

	config.DB.Model(&user).Updates(updates)

	// Log activity
	adminID, _ := c.Get("user_id")
	LogActivity(config.DB, adminID.(uint), "Update User", "Admin mengubah data user: "+user.Nama, c.ClientIP())

	config.DB.First(&user, id)

	c.JSON(http.StatusOK, gin.H{
		"status":  "success",
		"message": "Data user berhasil diperbarui",
		"data":    user,
	})
}

// DeleteUser - DELETE /api/users/:id (admin only)
func DeleteUser(c *gin.Context) {
	id := c.Param("id")
	var user models.User

	if err := config.DB.First(&user, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"status":  "error",
			"message": "User tidak ditemukan",
		})
		return
	}

	// Block delete if user status is pending
	if user.Status == "pending" {
		c.JSON(http.StatusBadRequest, gin.H{
			"status":  "error",
			"message": "Akun yang belum disetujui (pending) tidak dapat dihapus",
		})
		return
	}

	// Don't allow deleting admin
	if user.Role == "admin" {
		c.JSON(http.StatusBadRequest, gin.H{
			"status":  "error",
			"message": "Tidak bisa menghapus akun admin",
		})
		return
	}

	// Delete associated data and user in a transaction
	tx := config.DB.Begin()
	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
		}
	}()

	if err := tx.Where("user_id = ?", user.ID).Delete(&models.Notification{}).Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{
			"status":  "error",
			"message": "Gagal menghapus notifikasi pengguna: " + err.Error(),
		})
		return
	}

	if err := tx.Where("user_id = ?", user.ID).Delete(&models.ActivityLog{}).Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{
			"status":  "error",
			"message": "Gagal menghapus log aktivitas pengguna: " + err.Error(),
		})
		return
	}

	if err := tx.Where("user_id = ?", user.ID).Delete(&models.Peminjaman{}).Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{
			"status":  "error",
			"message": "Gagal menghapus data peminjaman pengguna: " + err.Error(),
		})
		return
	}

	if err := tx.Delete(&user).Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{
			"status":  "error",
			"message": "Gagal menghapus pengguna: " + err.Error(),
		})
		return
	}

	if err := tx.Commit().Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"status":  "error",
			"message": "Gagal menyimpan perubahan penghapusan: " + err.Error(),
		})
		return
	}

	// Log before delete (using config.DB or after commit)
	adminID, _ := c.Get("user_id")
	LogActivity(config.DB, adminID.(uint), "Delete User", "Admin menghapus user: "+user.Nama+" ("+user.Email+")", c.ClientIP())

	c.JSON(http.StatusOK, gin.H{
		"status":  "success",
		"message": "User berhasil dihapus",
	})
}

// ApproveUser - PUT /api/users/:id/approve (admin only)
func ApproveUser(c *gin.Context) {
	id := c.Param("id")
	var user models.User

	if err := config.DB.First(&user, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"status":  "error",
			"message": "User tidak ditemukan",
		})
		return
	}

	if user.Status != "pending" {
		c.JSON(http.StatusBadRequest, gin.H{
			"status":  "error",
			"message": "User tidak dalam status pending",
		})
		return
	}

	config.DB.Model(&user).Update("status", "active")

	// Log activity
	adminID, _ := c.Get("user_id")
	LogActivity(config.DB, adminID.(uint), "Approve User", "Admin menyetujui pendaftaran: "+user.Nama, c.ClientIP())

	// Notify user
	notif := models.Notification{
		UserID:  user.ID,
		Title:   "Akun Disetujui",
		Message: "Selamat! Akun Anda telah disetujui oleh admin. Silakan login.",
		Type:    "info",
	}
	config.DB.Create(&notif)

	c.JSON(http.StatusOK, gin.H{
		"status":  "success",
		"message": "User berhasil disetujui",
		"data":    user,
	})
}

// RejectUser - PUT /api/users/:id/reject (admin only)
func RejectUser(c *gin.Context) {
	id := c.Param("id")
	var user models.User

	if err := config.DB.First(&user, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"status":  "error",
			"message": "User tidak ditemukan",
		})
		return
	}

	if user.Status != "pending" {
		c.JSON(http.StatusBadRequest, gin.H{
			"status":  "error",
			"message": "User tidak dalam status pending",
		})
		return
	}

	config.DB.Model(&user).Update("status", "rejected")

	// Log activity
	adminID, _ := c.Get("user_id")
	LogActivity(config.DB, adminID.(uint), "Reject User", "Admin menolak pendaftaran: "+user.Nama, c.ClientIP())

	c.JSON(http.StatusOK, gin.H{
		"status":  "success",
		"message": "User berhasil ditolak",
	})
}
