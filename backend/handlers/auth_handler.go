package handlers

import (
	"fmt"
	"log"
	"net/http"
	"os"
	"path/filepath"
	"regexp"
	"strings"
	"time"

	"sapras-api/config"
	"sapras-api/middleware"
	"sapras-api/models"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"
)

// validatePassword checks that password contains at least one digit, one lowercase, and one uppercase letter
func validatePassword(password string) bool {
	hasUpper := regexp.MustCompile(`[A-Z]`).MatchString(password)
	hasLower := regexp.MustCompile(`[a-z]`).MatchString(password)
	hasDigit := regexp.MustCompile(`[0-9]`).MatchString(password)
	return hasUpper && hasLower && hasDigit && len(password) >= 6
}

func Register(c *gin.Context) {
	var req models.RegisterRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"status":  "error",
			"message": "Data tidak valid: " + err.Error(),
		})
		return
	}

	// Validate password strength
	if !validatePassword(req.Password) {
		c.JSON(http.StatusBadRequest, gin.H{
			"status":  "error",
			"message": "Password harus mengandung huruf besar, huruf kecil, dan angka (minimal 6 karakter)",
		})
		return
	}

	// Validate jabatan
	if req.Jabatan != "guru" && req.Jabatan != "siswa" {
		c.JSON(http.StatusBadRequest, gin.H{
			"status":  "error",
			"message": "Jabatan harus guru atau siswa",
		})
		return
	}

	// Validate NIP/NISN based on jabatan and check uniqueness
	if req.Jabatan == "guru" {
		if req.NIP == "" {
			c.JSON(http.StatusBadRequest, gin.H{
				"status":  "error",
				"message": "NIP wajib diisi untuk guru",
			})
			return
		}
		var count int64
		config.DB.Model(&models.User{}).Where("n_ip = ?", req.NIP).Count(&count)
		if count > 0 {
			c.JSON(http.StatusBadRequest, gin.H{
				"status":  "error",
				"message": "NIP sudah terdaftar",
			})
			return
		}
	}
	if req.Jabatan == "siswa" {
		if req.NISN == "" {
			c.JSON(http.StatusBadRequest, gin.H{
				"status":  "error",
				"message": "NISN wajib diisi untuk siswa",
			})
			return
		}
		var count int64
		config.DB.Model(&models.User{}).Where("nisn = ?", req.NISN).Count(&count)
		if count > 0 {
			c.JSON(http.StatusBadRequest, gin.H{
				"status":  "error",
				"message": "NISN sudah terdaftar",
			})
			return
		}
	}

	// Hash password
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"status":  "error",
			"message": "Gagal memproses password",
		})
		return
	}

	user := models.User{
		Nama:     req.Nama,
		Email:    req.Email,
		Password: string(hashedPassword),
		Role:     "peminjam",
		Jabatan:  req.Jabatan,
		NIP:      req.NIP,
		NISN:     req.NISN,
		Kelas:    req.Kelas,
		Status:   "pending",
	}

	result := config.DB.Create(&user)
	if result.Error != nil {
		log.Println("Gagal membuat user:", result.Error)
		errMsg := "Pendaftaran gagal"
		errStr := result.Error.Error()
		if strings.Contains(errStr, "email") || strings.Contains(errStr, "unique") || strings.Contains(errStr, "duplicate key") {
			errMsg = "Email sudah terdaftar"
		} else {
			errMsg = "Pendaftaran gagal: " + errStr
		}
		c.JSON(http.StatusBadRequest, gin.H{
			"status":  "error",
			"message": errMsg,
		})
		return
	}

	// Log activity
	LogActivity(config.DB, user.ID, "Register", "Pendaftaran akun baru: "+user.Nama+" ("+user.Jabatan+")", c.ClientIP())

	// Create notification for all admins
	var admins []models.User
	config.DB.Where("role = ? AND status = ?", "admin", "active").Find(&admins)
	for _, admin := range admins {
		notif := models.Notification{
			UserID:  admin.ID,
			Title:   "Pendaftaran Baru",
			Message: user.Nama + " (" + user.Jabatan + ") mendaftar dan menunggu persetujuan.",
			Type:    "info",
		}
		config.DB.Create(&notif)
	}

	c.JSON(http.StatusCreated, gin.H{
		"status":  "success",
		"message": "Pendaftaran berhasil! Akun Anda menunggu persetujuan admin sarpras.",
		"data":    user,
	})
}

func Login(c *gin.Context) {
	var req models.LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"status":  "error",
			"message": "Email dan password harus diisi",
		})
		return
	}

	// Cari user berdasarkan email
	var user models.User
	result := config.DB.Where("email = ?", req.Email).First(&user)
	if result.Error != nil {
		c.JSON(http.StatusUnauthorized, gin.H{
			"status":  "error",
			"message": "Email atau password salah",
		})
		return
	}

	// Check user status
	if user.Status == "pending" {
		c.JSON(http.StatusForbidden, gin.H{
			"status":  "error",
			"message": "Akun Anda menunggu persetujuan admin sarpras. Silakan hubungi admin.",
		})
		return
	}
	if user.Status == "rejected" {
		c.JSON(http.StatusForbidden, gin.H{
			"status":  "error",
			"message": "Akun Anda ditolak oleh admin. Silakan hubungi admin untuk informasi lebih lanjut.",
		})
		return
	}

	// Verifikasi password
	err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(req.Password))
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{
			"status":  "error",
			"message": "Email atau password salah",
		})
		return
	}

	// Generate JWT token
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"user_id": user.ID,
		"email":   user.Email,
		"role":    user.Role,
		"nama":    user.Nama,
		"exp":     time.Now().Add(24 * time.Hour).Unix(),
	})

	tokenString, err := token.SignedString(middleware.JWTSecret)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"status":  "error",
			"message": "Gagal membuat token",
		})
		return
	}

	// Log activity
	LogActivity(config.DB, user.ID, "Login", "Login berhasil", c.ClientIP())

	// Check for late returns and create notifications
	CheckLateReturns(user.ID)

	c.JSON(http.StatusOK, gin.H{
		"status":  "success",
		"message": "Login berhasil",
		"data": gin.H{
			"token": tokenString,
			"user":  user,
		},
	})
}

func GetProfile(c *gin.Context) {
	userID, _ := c.Get("user_id")

	var user models.User
	config.DB.First(&user, userID)

	c.JSON(http.StatusOK, gin.H{
		"status": "success",
		"data":   user,
	})
}

func UpdateProfile(c *gin.Context) {
	userID, _ := c.Get("user_id")

	var user models.User
	if err := config.DB.First(&user, userID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"status":  "error",
			"message": "User tidak ditemukan",
		})
		return
	}

	var req struct {
		Nama string `json:"nama"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"status":  "error",
			"message": "Data tidak valid",
		})
		return
	}

	if req.Nama != "" {
		config.DB.Model(&user).Update("nama", req.Nama)
	}

	config.DB.First(&user, userID)

	LogActivity(config.DB, userID.(uint), "Update Profil", "Mengubah nama profil", c.ClientIP())

	c.JSON(http.StatusOK, gin.H{
		"status":  "success",
		"message": "Profil berhasil diperbarui",
		"data":    user,
	})
}

func UploadFotoProfil(c *gin.Context) {
	userID, _ := c.Get("user_id")

	file, err := c.FormFile("foto")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"status":  "error",
			"message": "File foto tidak valid",
		})
		return
	}

	// Validate file size (max 2MB)
	if file.Size > 2*1024*1024 {
		c.JSON(http.StatusBadRequest, gin.H{
			"status":  "error",
			"message": "Ukuran file maksimal 2MB",
		})
		return
	}

	// Save file
	filename := fmt.Sprintf("profil_%d_%d%s", userID, time.Now().Unix(), filepath.Ext(file.Filename))
	savePath := filepath.Join("uploads", "profil", filename)

	// Ensure directory exists
	os.MkdirAll(filepath.Join("uploads", "profil"), os.ModePerm)

	if err := c.SaveUploadedFile(file, savePath); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"status":  "error",
			"message": "Gagal menyimpan file",
		})
		return
	}

	// Update user foto_profil
	photoURL := "/uploads/profil/" + filename
	config.DB.Model(&models.User{}).Where("id = ?", userID).Update("foto_profil", photoURL)

	var user models.User
	config.DB.First(&user, userID)

	LogActivity(config.DB, userID.(uint), "Upload Foto", "Mengubah foto profil", c.ClientIP())

	c.JSON(http.StatusOK, gin.H{
		"status":  "success",
		"message": "Foto profil berhasil diperbarui",
		"data":    user,
	})
}

func DeleteFotoProfil(c *gin.Context) {
	userID, _ := c.Get("user_id")

	var user models.User
	if err := config.DB.First(&user, userID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"status":  "error",
			"message": "User tidak ditemukan",
		})
		return
	}

	// Delete file from disk if it exists
	if user.FotoProfil != "" {
		filePath := filepath.Clean(filepath.Join(".", user.FotoProfil))
		if _, err := os.Stat(filePath); err == nil {
			if err := os.Remove(filePath); err != nil {
				// Log the error but don't fail the overall operation
				fmt.Printf("[Warning] Gagal menghapus file fisik foto profil %s: %v\n", filePath, err)
			}
		} else {
			fmt.Printf("[Warning] File foto profil tidak ditemukan di disk: %s\n", filePath)
		}
	}

	// Set FotoProfil to empty string in DB
	if err := config.DB.Model(&models.User{}).Where("id = ?", userID).Update("foto_profil", "").Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"status":  "error",
			"message": "Gagal menghapus foto profil di database: " + err.Error(),
		})
		return
	}

	// Fetch updated user data
	if err := config.DB.First(&user, userID).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"status":  "error",
			"message": "Gagal mengambil data user terbaru",
		})
		return
	}

	LogActivity(config.DB, userID.(uint), "Hapus Foto", "Menghapus foto profil", c.ClientIP())

	c.JSON(http.StatusOK, gin.H{
		"status":  "success",
		"message": "Foto profil berhasil dihapus",
		"data":    user,
	})
}

