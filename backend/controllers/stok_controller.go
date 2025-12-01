package controllers

import (
	"database/sql"
	"net/http"
	"sawit-backend/config"
	"sawit-backend/models"

	"github.com/gin-gonic/gin"
)

// GetStokList returns list of available TBS stock
func GetStokList(c *gin.Context) {
	status := c.DefaultQuery("status", "available")
	grade := c.Query("grade")
	kebunID := c.Query("kebun_id")

	query := `
		SELECT s.id, s.kebun_id, s.tanggal_panen, s.jumlah_kg, s.jumlah_tersedia,
		       s.grade, s.kadar_minyak, s.harga_per_kg, s.keterangan, s.status,
		       s.created_at, s.updated_at, k.nama_kebun, k.lokasi
		FROM stok_tbs s
		JOIN kebun k ON s.kebun_id = k.id
		WHERE s.status = ?
	`
	args := []interface{}{status}

	if grade != "" {
		query += " AND s.grade = ?"
		args = append(args, grade)
	}
	if kebunID != "" {
		query += " AND s.kebun_id = ?"
		args = append(args, kebunID)
	}

	query += " ORDER BY s.tanggal_panen DESC, s.grade ASC"

	rows, err := config.DB.Query(query, args...)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch stock"})
		return
	}
	defer rows.Close()

	stokList := make([]models.StokTBS, 0)
	for rows.Next() {
		var stok models.StokTBS
		var kadarMinyak sql.NullFloat64
		var keterangan sql.NullString
		err := rows.Scan(
			&stok.ID, &stok.KebunID, &stok.TanggalPanen, &stok.JumlahKg, &stok.JumlahTersedia,
			&stok.Grade, &kadarMinyak, &stok.HargaPerKg, &keterangan, &stok.Status,
			&stok.CreatedAt, &stok.UpdatedAt, &stok.NamaKebun, &stok.LokasiKebun,
		)
		if err != nil {
			continue
		}
		if kadarMinyak.Valid {
			stok.KadarMinyak = &kadarMinyak.Float64
		}
		if keterangan.Valid {
			stok.Keterangan = &keterangan.String
		}
		stokList = append(stokList, stok)
	}

	c.JSON(http.StatusOK, stokList)
}

// GetStokDetail returns detail of specific stock
func GetStokDetail(c *gin.Context) {
	stokID := c.Param("id")

	var stok models.StokTBS
	var kadarMinyak sql.NullFloat64
	var keterangan sql.NullString
	err := config.DB.QueryRow(`
		SELECT s.id, s.kebun_id, s.tanggal_panen, s.jumlah_kg, s.jumlah_tersedia,
		       s.grade, s.kadar_minyak, s.harga_per_kg, s.keterangan, s.status,
		       s.created_at, s.updated_at, k.nama_kebun, k.lokasi
		FROM stok_tbs s
		JOIN kebun k ON s.kebun_id = k.id
		WHERE s.id = ?
	`, stokID).Scan(
		&stok.ID, &stok.KebunID, &stok.TanggalPanen, &stok.JumlahKg, &stok.JumlahTersedia,
		&stok.Grade, &kadarMinyak, &stok.HargaPerKg, &keterangan, &stok.Status,
		&stok.CreatedAt, &stok.UpdatedAt, &stok.NamaKebun, &stok.LokasiKebun,
	)

	if kadarMinyak.Valid {
		stok.KadarMinyak = &kadarMinyak.Float64
	}
	if keterangan.Valid {
		stok.Keterangan = &keterangan.String
	}

	if err == sql.ErrNoRows {
		c.JSON(http.StatusNotFound, gin.H{"error": "Stock not found"})
		return
	}
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch stock detail"})
		return
	}

	c.JSON(http.StatusOK, stok)
}

// CreateStok creates new TBS stock (admin only)
func CreateStok(c *gin.Context) {
	var req struct {
		KebunID      int     `json:"kebun_id" binding:"required"`
		TanggalPanen string  `json:"tanggal_panen" binding:"required"`
		JumlahKg     float64 `json:"jumlah_kg" binding:"required,gt=0"`
		Grade        string  `json:"grade" binding:"required"`
		KadarMinyak  float64 `json:"kadar_minyak"`
		HargaPerKg   float64 `json:"harga_per_kg" binding:"required,gt=0"`
		Keterangan   string  `json:"keterangan"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	result, err := config.DB.Exec(`
		INSERT INTO stok_tbs (kebun_id, tanggal_panen, jumlah_kg, jumlah_tersedia, 
		                      grade, kadar_minyak, harga_per_kg, keterangan, status)
		VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'available')
	`, req.KebunID, req.TanggalPanen, req.JumlahKg, req.JumlahKg, req.Grade, 
	   req.KadarMinyak, req.HargaPerKg, req.Keterangan)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create stock"})
		return
	}

	stokID, _ := result.LastInsertId()

	// Log aktivitas
	userID, _ := c.Get("user_id")
	config.DB.Exec(`
		INSERT INTO log_aktivitas (user_id, aktivitas, modul, reference_id, ip_address)
		VALUES (?, 'Menambah stok TBS', 'stok', ?, ?)
	`, userID, stokID, c.ClientIP())

	c.JSON(http.StatusCreated, gin.H{
		"message": "Stock created successfully",
		"stok_id": stokID,
	})
}

// UpdateStok updates existing stock (admin only)
func UpdateStok(c *gin.Context) {
	stokID := c.Param("id")

	var req struct {
		JumlahTersedia float64 `json:"jumlah_tersedia"`
		HargaPerKg     float64 `json:"harga_per_kg"`
		Status         string  `json:"status"`
		Keterangan     string  `json:"keterangan"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	_, err := config.DB.Exec(`
		UPDATE stok_tbs 
		SET jumlah_tersedia = ?, harga_per_kg = ?, status = ?, keterangan = ?
		WHERE id = ?
	`, req.JumlahTersedia, req.HargaPerKg, req.Status, req.Keterangan, stokID)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update stock"})
		return
	}

	// Log aktivitas
	userID, _ := c.Get("user_id")
	config.DB.Exec(`
		INSERT INTO log_aktivitas (user_id, aktivitas, modul, reference_id, ip_address)
		VALUES (?, 'Mengupdate stok TBS', 'stok', ?, ?)
	`, userID, stokID, c.ClientIP())

	c.JSON(http.StatusOK, gin.H{"message": "Stock updated successfully"})
}

// GetKebunList returns list of kebun
func GetKebunList(c *gin.Context) {
	rows, err := config.DB.Query(`
		SELECT id, nama_kebun, lokasi, luas_hektar, koordinat, status, created_at, updated_at
		FROM kebun
		WHERE status = 'active'
		ORDER BY nama_kebun
	`)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch kebun"})
		return
	}
	defer rows.Close()

	kebunList := make([]models.Kebun, 0)
	for rows.Next() {
		var kebun models.Kebun
		err := rows.Scan(
			&kebun.ID, &kebun.NamaKebun, &kebun.Lokasi, &kebun.LuasHektar,
			&kebun.Koordinat, &kebun.Status, &kebun.CreatedAt, &kebun.UpdatedAt,
		)
		if err != nil {
			continue
		}
		kebunList = append(kebunList, kebun)
	}

	c.JSON(http.StatusOK, kebunList)
}
