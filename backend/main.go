package main

import (
	"fmt"
	"log"

	"sapras-api/config"
	"sapras-api/handlers"
	"sapras-api/middleware"

	"github.com/gin-gonic/gin"
)

func main() {
	// Koneksi database
	config.ConnectDatabase()

	// Setup Gin router
	r := gin.Default()

	// CORS middleware
	r.Use(middleware.CORSMiddleware())

	// Serve uploaded files
	r.Static("/uploads", "./uploads")

	// ============================
	// Public Routes (tanpa auth)
	// ============================
	api := r.Group("/api")
	{
		// Auth
		api.POST("/auth/register", handlers.Register)
		api.POST("/auth/login", handlers.Login)
	}

	// ============================
	// Protected Routes (perlu auth)
	// ============================
	protected := api.Group("")
	protected.Use(middleware.AuthMiddleware())
	{
		// Profile
		protected.GET("/auth/profile", handlers.GetProfile)
		protected.PUT("/auth/profile", handlers.UpdateProfile)
		protected.POST("/auth/profile/foto", handlers.UploadFotoProfil)
		protected.DELETE("/auth/profile/foto", handlers.DeleteFotoProfil)

		// Dashboard
		protected.GET("/dashboard/stats", handlers.GetDashboardStats)
		protected.GET("/dashboard/recent", handlers.GetRecentPeminjaman)

		// Barang
		protected.GET("/barang", handlers.GetAllBarang)
		protected.GET("/barang/tersedia", handlers.GetBarangTersedia)
		protected.GET("/barang/:id", handlers.GetBarangByID)

		// Kategori
		protected.GET("/kategori", handlers.GetAllKategori)

		// Peminjaman
		protected.GET("/peminjaman", handlers.GetAllPeminjaman)
		protected.GET("/peminjaman/:id", handlers.GetPeminjamanByID)
		protected.POST("/peminjaman", handlers.CreatePeminjaman)
		protected.PUT("/peminjaman/:id/confirm-return", handlers.ConfirmReturn)
		protected.GET("/peminjaman/my-history", handlers.GetMyHistory)

		// Notifications
		protected.GET("/notifications", handlers.GetNotifications)
		protected.GET("/notifications/unread-count", handlers.GetUnreadCount)
		protected.PUT("/notifications/:id/read", handlers.MarkAsRead)
		protected.PUT("/notifications/read-all", handlers.MarkAllAsRead)

		// ============================
		// Admin Only Routes
		// ============================
		admin := protected.Group("")
		admin.Use(middleware.AdminMiddleware())
		{
			// Barang CRUD (admin)
			admin.POST("/barang", handlers.CreateBarang)
			admin.PUT("/barang/:id", handlers.UpdateBarang)
			admin.DELETE("/barang/:id", handlers.DeleteBarang)

			// Kategori CRUD (admin)
			admin.POST("/kategori", handlers.CreateKategori)
			admin.PUT("/kategori/:id", handlers.UpdateKategori)
			admin.DELETE("/kategori/:id", handlers.DeleteKategori)

			// Peminjaman management (admin)
			admin.PUT("/peminjaman/:id/approve", handlers.ApprovePeminjaman)
			admin.PUT("/peminjaman/:id/reject", handlers.RejectPeminjaman)
			admin.PUT("/peminjaman/:id/return", handlers.ReturnPeminjaman)
			admin.GET("/peminjaman/history", handlers.GetPeminjamanHistory)

			// User management (admin)
			admin.GET("/users", handlers.GetAllUsers)
			admin.GET("/users/:id", handlers.GetUserByID)
			admin.PUT("/users/:id", handlers.UpdateUser)
			admin.DELETE("/users/:id", handlers.DeleteUser)
			admin.PUT("/users/:id/approve", handlers.ApproveUser)
			admin.PUT("/users/:id/reject", handlers.RejectUser)

			// Activity Logs (admin)
			admin.GET("/activity-logs", handlers.GetActivityLogs)
		}
	}

	// Start server
	port := ":8080"
	fmt.Printf("\n========================================\n")
	fmt.Printf("  SAPRAS API Server\n")
	fmt.Printf("  Running on http://localhost%s\n", port)
	fmt.Printf("========================================\n\n")

	log.Fatal(r.Run(port))
}
