package controllers

import (
	"database/sql"
	"fmt"
	"net/http"
	"sawit-backend/config"
	"sawit-backend/models"
	"time"

	"github.com/gin-gonic/gin"
)

// CreatePurchaseOrder creates new purchase order
func CreatePurchaseOrder(c *gin.Context) {
	userID, _ := c.Get("user_id")

	var req models.CreatePORequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Get stock details
	var stok models.StokTBS
	err := config.DB.QueryRow(`
		SELECT id, kebun_id, jumlah_tersedia, grade, harga_per_kg, status
		FROM stok_tbs WHERE id = ?
	`, req.StokID).Scan(&stok.ID, &stok.KebunID, &stok.JumlahTersedia, 
		&stok.Grade, &stok.HargaPerKg, &stok.Status)

	if err == sql.ErrNoRows {
		c.JSON(http.StatusNotFound, gin.H{"error": "Stock not found"})
		return
	}
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch stock"})
		return
	}

	// Check stock availability
	if stok.Status != "available" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Stock not available"})
		return
	}
	if stok.JumlahTersedia < req.JumlahKg {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Insufficient stock"})
		return
	}

	// Generate PO number
	var poNumber string
	config.DB.QueryRow("CALL generate_po_number(@po_num)").Scan()
	config.DB.QueryRow("SELECT @po_num").Scan(&poNumber)

	// Get kebun location
	var lokasiPengambilan string
	config.DB.QueryRow("SELECT nama_kebun FROM kebun WHERE id = ?", stok.KebunID).Scan(&lokasiPengambilan)

	// Insert PO
	result, err := config.DB.Exec(`
		INSERT INTO purchase_orders (
			po_number, buyer_id, stok_id, kebun_id, jumlah_kg, grade_diminta,
			harga_per_kg, total_harga, tanggal_pengambilan, lokasi_pengambilan,
			metode_pembayaran, status, catatan
		) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?)
	`, poNumber, userID, req.StokID, stok.KebunID, req.JumlahKg, stok.Grade,
		stok.HargaPerKg, req.JumlahKg*stok.HargaPerKg, req.TanggalPengambilan,
		lokasiPengambilan, req.MetodePembayaran, req.Catatan)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create purchase order"})
		return
	}

	poID, _ := result.LastInsertId()

	// Reserve stock temporarily
	config.DB.Exec(`
		UPDATE stok_tbs SET jumlah_tersedia = jumlah_tersedia - ?
		WHERE id = ?
	`, req.JumlahKg, req.StokID)

	c.JSON(http.StatusCreated, gin.H{
		"message":   "Purchase order created successfully",
		"po_id":     poID,
		"po_number": poNumber,
	})
}

// GetPurchaseOrders returns list of purchase orders
func GetPurchaseOrders(c *gin.Context) {
	userID, _ := c.Get("user_id")
	role, _ := c.Get("role")
	status := c.Query("status")

	query := `
		SELECT po.id, po.po_number, po.buyer_id, po.stok_id, po.kebun_id,
		       po.jumlah_kg, po.grade_diminta, po.harga_per_kg, po.total_harga,
		       po.tanggal_pengambilan, po.lokasi_pengambilan, po.metode_pembayaran,
		       po.status, po.catatan, po.approved_by, po.approved_at,
		       po.created_at, po.updated_at, u.company_name, k.nama_kebun,
		       COALESCE(pb.status, 'unpaid') as payment_status
		FROM purchase_orders po
		JOIN users u ON po.buyer_id = u.id
		JOIN kebun k ON po.kebun_id = k.id
		LEFT JOIN dokumen_penjualan dp ON po.id = dp.po_id
		LEFT JOIN pembayaran pb ON dp.id = pb.dokumen_id
		WHERE 1=1
	`
	args := []interface{}{}

	// Filter by buyer if not admin
	if role == "buyer" {
		query += " AND po.buyer_id = ?"
		args = append(args, userID)
	}

	if status != "" {
		query += " AND po.status = ?"
		args = append(args, status)
	}

	query += " ORDER BY po.created_at DESC"

	rows, err := config.DB.Query(query, args...)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch purchase orders"})
		return
	}
	defer rows.Close()

	poList := make([]models.PurchaseOrder, 0)
	for rows.Next() {
		var po models.PurchaseOrder
		err := rows.Scan(
			&po.ID, &po.PONumber, &po.BuyerID, &po.StokID, &po.KebunID,
			&po.JumlahKg, &po.GradeDiminta, &po.HargaPerKg, &po.TotalHarga,
			&po.TanggalPengambilan, &po.LokasiPengambilan, &po.MetodePembayaran,
			&po.Status, &po.Catatan, &po.ApprovedBy, &po.ApprovedAt,
			&po.CreatedAt, &po.UpdatedAt, &po.BuyerCompany, &po.NamaKebun,
			&po.PaymentStatus,
		)
		if err != nil {
			continue
		}
		poList = append(poList, po)
	}

	c.JSON(http.StatusOK, poList)
}

// GetPurchaseOrderDetail returns detail of specific PO
func GetPurchaseOrderDetail(c *gin.Context) {
	poID := c.Param("id")
	userID, _ := c.Get("user_id")
	role, _ := c.Get("role")

	var po models.PurchaseOrder
	err := config.DB.QueryRow(`
		SELECT po.id, po.po_number, po.buyer_id, po.stok_id, po.kebun_id,
		       po.jumlah_kg, po.grade_diminta, po.harga_per_kg, po.total_harga,
		       po.tanggal_pengambilan, po.lokasi_pengambilan, po.metode_pembayaran,
		       po.status, po.catatan, po.approved_by, po.approved_at,
		       po.created_at, po.updated_at, u.company_name, k.nama_kebun,
		       COALESCE(pb.status, 'unpaid') as payment_status
		FROM purchase_orders po
		JOIN users u ON po.buyer_id = u.id
		JOIN kebun k ON po.kebun_id = k.id
		LEFT JOIN dokumen_penjualan dp ON po.id = dp.po_id
		LEFT JOIN pembayaran pb ON dp.id = pb.dokumen_id
		WHERE po.id = ?
	`, poID).Scan(
		&po.ID, &po.PONumber, &po.BuyerID, &po.StokID, &po.KebunID,
		&po.JumlahKg, &po.GradeDiminta, &po.HargaPerKg, &po.TotalHarga,
		&po.TanggalPengambilan, &po.LokasiPengambilan, &po.MetodePembayaran,
		&po.Status, &po.Catatan, &po.ApprovedBy, &po.ApprovedAt,
		&po.CreatedAt, &po.UpdatedAt, &po.BuyerCompany, &po.NamaKebun,
		&po.PaymentStatus,
	)

	if err == sql.ErrNoRows {
		c.JSON(http.StatusNotFound, gin.H{"error": "Purchase order not found"})
		return
	}
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch purchase order"})
		return
	}

	// Check authorization for buyers
	if role == "buyer" && po.BuyerID != userID.(int) {
		c.JSON(http.StatusForbidden, gin.H{"error": "Access denied"})
		return
	}

	c.JSON(http.StatusOK, po)
}

// UpdatePOStatus updates purchase order status (admin only)
func UpdatePOStatus(c *gin.Context) {
	poID := c.Param("id")
	userID, _ := c.Get("user_id")

	var req models.UpdatePOStatusRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Get current PO
	var currentStatus string
	err := config.DB.QueryRow("SELECT status FROM purchase_orders WHERE id = ?", poID).Scan(&currentStatus)
	if err == sql.ErrNoRows {
		c.JSON(http.StatusNotFound, gin.H{"error": "Purchase order not found"})
		return
	}

	// Update PO status
	if req.Status == "approved" {
		now := time.Now()
		_, err = config.DB.Exec(`
			UPDATE purchase_orders 
			SET status = ?, catatan = ?, approved_by = ?, approved_at = ?
			WHERE id = ?
		`, req.Status, req.Catatan, userID, now, poID)
	} else {
		_, err = config.DB.Exec(`
			UPDATE purchase_orders 
			SET status = ?, catatan = ?
			WHERE id = ?
		`, req.Status, req.Catatan, poID)
	}

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update purchase order"})
		return
	}

	// If rejected, restore stock
	if req.Status == "rejected" && currentStatus == "pending" {
		config.DB.Exec(`
			UPDATE stok_tbs s
			JOIN purchase_orders po ON s.id = po.stok_id
			SET s.jumlah_tersedia = s.jumlah_tersedia + po.jumlah_kg
			WHERE po.id = ?
		`, poID)
	}

	// Log aktivitas
	config.DB.Exec(`
		INSERT INTO log_aktivitas (user_id, aktivitas, modul, reference_id, ip_address)
		VALUES (?, ?, 'po', ?, ?)
	`, userID, fmt.Sprintf("Update status PO menjadi %s", req.Status), poID, c.ClientIP())

	c.JSON(http.StatusOK, gin.H{"message": "Purchase order updated successfully"})
}

// CancelPurchaseOrder cancels a purchase order
func CancelPurchaseOrder(c *gin.Context) {
	poID := c.Param("id")
	userID, _ := c.Get("user_id")
	role, _ := c.Get("role")

	// Get PO details
	var po models.PurchaseOrder
	err := config.DB.QueryRow(`
		SELECT id, buyer_id, stok_id, jumlah_kg, status
		FROM purchase_orders WHERE id = ?
	`, poID).Scan(&po.ID, &po.BuyerID, &po.StokID, &po.JumlahKg, &po.Status)

	if err == sql.ErrNoRows {
		c.JSON(http.StatusNotFound, gin.H{"error": "Purchase order not found"})
		return
	}

	// Check authorization
	if role == "buyer" && po.BuyerID != userID.(int) {
		c.JSON(http.StatusForbidden, gin.H{"error": "Access denied"})
		return
	}

	// Check if can be cancelled
	if po.Status != "pending" && po.Status != "approved" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Cannot cancel this purchase order"})
		return
	}

	// Update status to cancelled
	_, err = config.DB.Exec(`
		UPDATE purchase_orders SET status = 'cancelled' WHERE id = ?
	`, poID)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to cancel purchase order"})
		return
	}

	// Restore stock
	config.DB.Exec(`
		UPDATE stok_tbs SET jumlah_tersedia = jumlah_tersedia + ?
		WHERE id = ?
	`, po.JumlahKg, po.StokID)

	c.JSON(http.StatusOK, gin.H{"message": "Purchase order cancelled successfully"})
}
