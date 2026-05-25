package handlers

import (
	"fmt"
	"net/http"
	"time"

	"sapras-api/config"
	"sapras-api/models"

	"github.com/gin-gonic/gin"
)

// GetNotifications - GET /api/notifications
func GetNotifications(c *gin.Context) {
	userID, _ := c.Get("user_id")

	var notifications []models.Notification
	config.DB.Where("user_id = ?", userID).
		Order("created_at DESC").
		Limit(50).
		Find(&notifications)

	c.JSON(http.StatusOK, gin.H{
		"status": "success",
		"data":   notifications,
	})
}

// GetUnreadCount - GET /api/notifications/unread-count
func GetUnreadCount(c *gin.Context) {
	userID, _ := c.Get("user_id")

	var count int64
	config.DB.Model(&models.Notification{}).
		Where("user_id = ? AND is_read = ?", userID, false).
		Count(&count)

	c.JSON(http.StatusOK, gin.H{
		"status": "success",
		"data":   count,
	})
}

// MarkAsRead - PUT /api/notifications/:id/read
func MarkAsRead(c *gin.Context) {
	id := c.Param("id")
	userID, _ := c.Get("user_id")

	var notif models.Notification
	if err := config.DB.Where("id = ? AND user_id = ?", id, userID).First(&notif).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"status":  "error",
			"message": "Notifikasi tidak ditemukan",
		})
		return
	}

	config.DB.Model(&notif).Update("is_read", true)

	c.JSON(http.StatusOK, gin.H{
		"status":  "success",
		"message": "Notifikasi telah dibaca",
	})
}

// MarkAllAsRead - PUT /api/notifications/read-all
func MarkAllAsRead(c *gin.Context) {
	userID, _ := c.Get("user_id")

	config.DB.Model(&models.Notification{}).
		Where("user_id = ? AND is_read = ?", userID, false).
		Update("is_read", true)

	c.JSON(http.StatusOK, gin.H{
		"status":  "success",
		"message": "Semua notifikasi telah dibaca",
	})
}

// CheckLateReturns checks for overdue borrowings and creates notifications
func CheckLateReturns(userID uint) {
	var peminjamans []models.Peminjaman
	config.DB.Preload("Barang").
		Where("user_id = ? AND status = ? AND tanggal_kembali < ?",
			userID, "disetujui", time.Now()).
		Find(&peminjamans)

	for _, p := range peminjamans {
		// Check if notification already exists for this peminjaman today
		var count int64
		today := time.Now().Format("2006-01-02")
		config.DB.Model(&models.Notification{}).
			Where("user_id = ? AND type = ? AND message LIKE ? AND DATE(created_at) = ?",
				userID, "keterlambatan", fmt.Sprintf("%%peminjaman #%d%%", p.ID), today).
			Count(&count)

		if count == 0 {
			daysLate := int(time.Since(*p.TanggalKembali).Hours() / 24)
			notif := models.Notification{
				UserID:  userID,
				Title:   "Keterlambatan Pengembalian",
				Message: fmt.Sprintf("Anda terlambat %d hari mengembalikan %s (peminjaman #%d). Segera kembalikan barang.", daysLate, p.Barang.Nama, p.ID),
				Type:    "keterlambatan",
			}
			config.DB.Create(&notif)
		}
	}
}
