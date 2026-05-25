package handlers

import (
	"net/http"

	"sapras-api/config"
	"sapras-api/models"

	"github.com/gin-gonic/gin"
)

// GetAllKategori - GET /api/kategori
func GetAllKategori(c *gin.Context) {
	var kategoris []models.KategoriBarang
	config.DB.Order("nama ASC").Find(&kategoris)

	c.JSON(http.StatusOK, gin.H{
		"status": "success",
		"data":   kategoris,
	})
}

// CreateKategori - POST /api/kategori
func CreateKategori(c *gin.Context) {
	var kategori models.KategoriBarang
	if err := c.ShouldBindJSON(&kategori); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"status":  "error",
			"message": "Data tidak valid",
		})
		return
	}

	config.DB.Create(&kategori)

	c.JSON(http.StatusCreated, gin.H{
		"status":  "success",
		"message": "Kategori berhasil ditambahkan",
		"data":    kategori,
	})
}

// UpdateKategori - PUT /api/kategori/:id
func UpdateKategori(c *gin.Context) {
	id := c.Param("id")
	var kategori models.KategoriBarang

	if err := config.DB.First(&kategori, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"status":  "error",
			"message": "Kategori tidak ditemukan",
		})
		return
	}

	var input models.KategoriBarang
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"status":  "error",
			"message": "Data tidak valid",
		})
		return
	}

	config.DB.Model(&kategori).Updates(models.KategoriBarang{
		Nama:      input.Nama,
		Deskripsi: input.Deskripsi,
	})

	c.JSON(http.StatusOK, gin.H{
		"status":  "success",
		"message": "Kategori berhasil diperbarui",
		"data":    kategori,
	})
}

// DeleteKategori - DELETE /api/kategori/:id
func DeleteKategori(c *gin.Context) {
	id := c.Param("id")

	// Cek apakah ada barang di kategori ini
	var count int64
	config.DB.Model(&models.Barang{}).Where("kategori_id = ?", id).Count(&count)
	if count > 0 {
		c.JSON(http.StatusBadRequest, gin.H{
			"status":  "error",
			"message": "Tidak bisa menghapus kategori yang masih memiliki barang",
		})
		return
	}

	result := config.DB.Delete(&models.KategoriBarang{}, id)
	if result.RowsAffected == 0 {
		c.JSON(http.StatusNotFound, gin.H{
			"status":  "error",
			"message": "Kategori tidak ditemukan",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"status":  "success",
		"message": "Kategori berhasil dihapus",
	})
}
