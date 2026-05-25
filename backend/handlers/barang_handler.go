package handlers

import (
	"net/http"
	"strings"

	"sapras-api/config"
	"sapras-api/models"

	"github.com/gin-gonic/gin"
)

// GetAllBarang - GET /api/barang
func GetAllBarang(c *gin.Context) {
	var barangs []models.Barang
	query := config.DB.Preload("Kategori")

	// Search by nama
	search := c.Query("search")
	if search != "" {
		query = query.Where("nama ILIKE ? OR kode_barang ILIKE ?", "%"+search+"%", "%"+search+"%")
	}

	// Filter by kategori
	kategoriID := c.Query("kategori_id")
	if kategoriID != "" {
		query = query.Where("kategori_id = ?", kategoriID)
	}

	query.Order("created_at DESC").Find(&barangs)

	c.JSON(http.StatusOK, gin.H{
		"status": "success",
		"data":   barangs,
	})
}

// GetBarangByID - GET /api/barang/:id
func GetBarangByID(c *gin.Context) {
	id := c.Param("id")
	var barang models.Barang

	result := config.DB.Preload("Kategori").First(&barang, id)
	if result.Error != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"status":  "error",
			"message": "Barang tidak ditemukan",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"status": "success",
		"data":   barang,
	})
}

// CreateBarang - POST /api/barang
func CreateBarang(c *gin.Context) {
	var req models.BarangRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"status":  "error",
			"message": "Data tidak valid: " + err.Error(),
		})
		return
	}

	// Validate Lokasi based on Kategori
	if req.KategoriID != nil {
		var kategori models.KategoriBarang
		if err := config.DB.First(&kategori, req.KategoriID).Error; err != nil {
			c.JSON(http.StatusBadRequest, gin.H{
				"status":  "error",
				"message": "Kategori tidak ditemukan",
			})
			return
		}
		if strings.ToUpper(kategori.Nama) == "ATK" {
			if req.Lokasi != "Ruang TU" {
				c.JSON(http.StatusBadRequest, gin.H{
					"status":  "error",
					"message": "Barang dengan kategori ATK hanya boleh berlokasi di Ruang TU",
				})
				return
			}
		} else {
			if req.Lokasi != "Ruang Sarpras" && req.Lokasi != "Gudang Olahraga" {
				c.JSON(http.StatusBadRequest, gin.H{
					"status":  "error",
					"message": "Barang non-ATK hanya boleh berlokasi di Ruang Sarpras atau Gudang Olahraga",
				})
				return
			}
		}
	} else {
		if req.Lokasi != "Ruang Sarpras" && req.Lokasi != "Gudang Olahraga" {
			c.JSON(http.StatusBadRequest, gin.H{
				"status":  "error",
				"message": "Lokasi barang hanya boleh di Ruang Sarpras atau Gudang Olahraga",
			})
			return
		}
	}

	kondisi := req.Kondisi
	if kondisi == "" {
		kondisi = "Baik"
	}

	barang := models.Barang{
		Nama:           req.Nama,
		KodeBarang:     req.KodeBarang,
		KategoriID:     req.KategoriID,
		JumlahTotal:    req.JumlahTotal,
		JumlahTersedia: req.JumlahTotal, // awalnya semua tersedia
		Kondisi:        kondisi,
		Lokasi:         req.Lokasi,
		Deskripsi:      req.Deskripsi,
	}

	result := config.DB.Create(&barang)
	if result.Error != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"status":  "error",
			"message": "Gagal menambahkan barang. Kode barang mungkin sudah ada.",
		})
		return
	}

	// Load kategori relation
	config.DB.Preload("Kategori").First(&barang, barang.ID)

	c.JSON(http.StatusCreated, gin.H{
		"status":  "success",
		"message": "Barang berhasil ditambahkan",
		"data":    barang,
	})
}

// UpdateBarang - PUT /api/barang/:id
func UpdateBarang(c *gin.Context) {
	id := c.Param("id")
	var barang models.Barang

	if err := config.DB.First(&barang, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"status":  "error",
			"message": "Barang tidak ditemukan",
		})
		return
	}

	var req models.BarangRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"status":  "error",
			"message": "Data tidak valid: " + err.Error(),
		})
		return
	}

	// Validate Lokasi based on Kategori
	if req.KategoriID != nil {
		var kategori models.KategoriBarang
		if err := config.DB.First(&kategori, req.KategoriID).Error; err != nil {
			c.JSON(http.StatusBadRequest, gin.H{
				"status":  "error",
				"message": "Kategori tidak ditemukan",
			})
			return
		}
		if strings.ToUpper(kategori.Nama) == "ATK" {
			if req.Lokasi != "Ruang TU" {
				c.JSON(http.StatusBadRequest, gin.H{
					"status":  "error",
					"message": "Barang dengan kategori ATK hanya boleh berlokasi di Ruang TU",
				})
				return
			}
		} else {
			if req.Lokasi != "Ruang Sarpras" && req.Lokasi != "Gudang Olahraga" {
				c.JSON(http.StatusBadRequest, gin.H{
					"status":  "error",
					"message": "Barang non-ATK hanya boleh berlokasi di Ruang Sarpras atau Gudang Olahraga",
				})
				return
			}
		}
	} else {
		if req.Lokasi != "Ruang Sarpras" && req.Lokasi != "Gudang Olahraga" {
			c.JSON(http.StatusBadRequest, gin.H{
				"status":  "error",
				"message": "Lokasi barang hanya boleh di Ruang Sarpras atau Gudang Olahraga",
			})
			return
		}
	}

	// Hitung selisih jumlah untuk update jumlah_tersedia
	selisih := req.JumlahTotal - barang.JumlahTotal
	newTersedia := barang.JumlahTersedia + selisih
	if newTersedia < 0 {
		newTersedia = 0
	}

	config.DB.Model(&barang).Updates(map[string]interface{}{
		"nama":             req.Nama,
		"kode_barang":      req.KodeBarang,
		"kategori_id":      req.KategoriID,
		"jumlah_total":     req.JumlahTotal,
		"jumlah_tersedia":  newTersedia,
		"kondisi":          req.Kondisi,
		"lokasi":           req.Lokasi,
		"deskripsi":        req.Deskripsi,
	})

	config.DB.Preload("Kategori").First(&barang, barang.ID)

	c.JSON(http.StatusOK, gin.H{
		"status":  "success",
		"message": "Barang berhasil diperbarui",
		"data":    barang,
	})
}

// DeleteBarang - DELETE /api/barang/:id
func DeleteBarang(c *gin.Context) {
	id := c.Param("id")

	// Cek apakah ada peminjaman aktif
	var count int64
	config.DB.Model(&models.Peminjaman{}).
		Where("barang_id = ? AND status IN ?", id, []string{"menunggu", "disetujui", "dipinjam"}).
		Count(&count)

	if count > 0 {
		c.JSON(http.StatusBadRequest, gin.H{
			"status":  "error",
			"message": "Tidak bisa menghapus barang yang masih dipinjam",
		})
		return
	}

	result := config.DB.Delete(&models.Barang{}, id)
	if result.RowsAffected == 0 {
		c.JSON(http.StatusNotFound, gin.H{
			"status":  "error",
			"message": "Barang tidak ditemukan",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"status":  "success",
		"message": "Barang berhasil dihapus",
	})
}

// GetBarangStats - untuk dropdown di form peminjaman
func GetBarangTersedia(c *gin.Context) {
	var barangs []models.Barang
	config.DB.Where("jumlah_tersedia > 0").Preload("Kategori").Find(&barangs)

	// Map untuk response sederhana
	type BarangOption struct {
		ID             uint   `json:"id"`
		Nama           string `json:"nama"`
		KodeBarang     string `json:"kode_barang"`
		JumlahTersedia int    `json:"jumlah_tersedia"`
	}

	options := make([]BarangOption, len(barangs))
	for i, b := range barangs {
		options[i] = BarangOption{
			ID:             b.ID,
			Nama:           b.Nama,
			KodeBarang:     b.KodeBarang,
			JumlahTersedia: b.JumlahTersedia,
		}
	}

	c.JSON(http.StatusOK, gin.H{
		"status": "success",
		"data":   options,
	})
}
