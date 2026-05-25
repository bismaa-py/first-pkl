package handlers

import (
	"net/http"
	"time"

	"sapras-api/config"
	"sapras-api/models"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

// LogActivity logs a user action to the activity_logs table
func LogActivity(db *gorm.DB, userID uint, action string, detail string, ipAddress string) {
	log := models.ActivityLog{
		UserID:    userID,
		Action:    action,
		Detail:    detail,
		IPAddress: ipAddress,
	}
	db.Create(&log)
}

// GetActivityLogs - GET /api/activity-logs (admin only)
func GetActivityLogs(c *gin.Context) {
	var logs []models.ActivityLog

	// First, cleanup old logs (> 7 days)
	CleanupOldLogs()

	query := config.DB.Preload("User").Order("created_at DESC")

	// Filter by user_id
	userID := c.Query("user_id")
	if userID != "" {
		query = query.Where("user_id = ?", userID)
	}

	// Filter by action
	action := c.Query("action")
	if action != "" {
		query = query.Where("action = ?", action)
	}

	query.Limit(500).Find(&logs)

	c.JSON(http.StatusOK, gin.H{
		"status": "success",
		"data":   logs,
	})
}

// CleanupOldLogs deletes activity logs older than 7 days
func CleanupOldLogs() {
	sevenDaysAgo := time.Now().AddDate(0, 0, -7)
	config.DB.Where("created_at < ?", sevenDaysAgo).Delete(&models.ActivityLog{})
}
