package controllers

import (
	"database/sql"
	"fmt"
	"net/http"
	"sawit-backend/config"
	"sawit-backend/models"

	"github.com/gin-gonic/gin"
)

// CreatePembayaran creates new payment record
func CreatePembayaran(c *gin.Context) {
	userID, _ := c.Get("user_id")

	var req models.CreatePembayaranRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Get dokumen and PO info
	var poID int
	err := config.DB.QueryRow("SELECT po_id FROM dokumen_penjualan WHERE id = ?", req.DokumenID).Scan(&poID)
	if err == sql.ErrNoRows {
		c.JSON(http.StatusNotFound, gin.H{"error": "Document not found"})
		return
	}

	// Insert pembayaran
	result, err := config.DB.Exec(`
		INSERT INTO pembayaran (
			dokumen_id, po_id, jumlah_bayar, metode_pembayaran,
			bank_pengirim, nomor_rekening, nama_pengirim,
			tanggal_pembayaran, tanggal_jatuh_tempo, status, catatan
		) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?)
	`, req.DokumenID, poID, req.JumlahBayar, req.MetodePembayaran,
		req.BankPengirim, req.NomorRekening, req.NamaPengirim,
		req.TanggalPembayaran, req.TanggalJatuhTempo, req.Catatan)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create payment"})
		return
	}

	pembayaranID, _ := result.LastInsertId()

	// Log aktivitas
	config.DB.Exec(`
		INSERT INTO log_aktivitas (user_id, aktivitas, modul, reference_id, ip_address)
		VALUES (?, 'Membuat pembayaran', 'pembayaran', ?, ?)
	`, userID, pembayaranID, c.ClientIP())

	c.JSON(http.StatusCreated, gin.H{
		"message":       "Payment created successfully",
		"pembayaran_id": pembayaranID,
	})
}

// GetPembayaran returns list of payments
func GetPembayaran(c *gin.Context) {
	poID := c.Query("po_id")
	status := c.Query("status")

	query := `
		SELECT 
			p.id as bayar_id,
			p.dokumen_id,
			p.po_id,
			p.jumlah_bayar,
			p.metode_pembayaran,
			p.bank_pengirim,
			p.nomor_rekening,
			p.nama_pengirim,
			p.bukti_transfer as bukti_bayar,
			p.tanggal_jatuh_tempo,
			p.tanggal_pembayaran as tanggal_bayar,
			p.status as status_verifikasi,
			p.verified_by,
			p.verified_at,
			p.catatan,
			p.created_at,
			p.updated_at,
			d.nomor_invoice,
			u.username as buyer_name
		FROM pembayaran p
		LEFT JOIN dokumen_penjualan d ON p.dokumen_id = d.id
		LEFT JOIN purchase_orders po ON p.po_id = po.id
		LEFT JOIN users u ON po.buyer_id = u.id
		WHERE 1=1
	`
	args := []interface{}{}

	if poID != "" {
		query += " AND p.po_id = ?"
		args = append(args, poID)
	}
	if status != "" {
		query += " AND p.status = ?"
		args = append(args, status)
	}

	query += " ORDER BY p.created_at DESC"

	rows, err := config.DB.Query(query, args...)
	if err != nil {
		fmt.Printf("GetPembayaran Query Error: %v\n", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch payments", "details": err.Error()})
		return
	}
	defer rows.Close()

	pembayaranList := make([]map[string]interface{}, 0)
	for rows.Next() {
		var bayarID, dokumenID, poID int
		var jumlahBayar float64
		var metodePembayaran string
		var bankPengirim, nomorRekening, namaPengirim, catatan sql.NullString
		var buktiTransfer, tanggalJatuhTempo, verifiedAt sql.NullString
		var verifiedBy sql.NullInt64
		var tanggalBayar, createdAt, updatedAt string
		var statusVerifikasi, nomorInvoice, buyerName sql.NullString

		err := rows.Scan(
			&bayarID, &dokumenID, &poID, &jumlahBayar, &metodePembayaran,
			&bankPengirim, &nomorRekening, &namaPengirim, &buktiTransfer,
			&tanggalJatuhTempo, &tanggalBayar, &statusVerifikasi, &verifiedBy,
			&verifiedAt, &catatan, &createdAt, &updatedAt,
			&nomorInvoice, &buyerName,
		)
		if err != nil {
			fmt.Printf("GetPembayaran Scan Error: %v\n", err)
			continue
		}

		payment := map[string]interface{}{
			"bayar_id":          bayarID,
			"dokumen_id":        dokumenID,
			"po_id":             poID,
			"jumlah_bayar":      jumlahBayar,
			"metode_pembayaran": metodePembayaran,
			"tanggal_bayar":     tanggalBayar,
			"created_at":        createdAt,
			"updated_at":        updatedAt,
		}

		if bankPengirim.Valid {
			payment["bank_pengirim"] = bankPengirim.String
		} else {
			payment["bank_pengirim"] = ""
		}
		if nomorRekening.Valid {
			payment["nomor_rekening"] = nomorRekening.String
		} else {
			payment["nomor_rekening"] = ""
		}
		if namaPengirim.Valid {
			payment["nama_pengirim"] = namaPengirim.String
		} else {
			payment["nama_pengirim"] = ""
		}
		if catatan.Valid {
			payment["catatan"] = catatan.String
		} else {
			payment["catatan"] = ""
		}
		if buktiTransfer.Valid {
			payment["bukti_bayar"] = buktiTransfer.String
		}
		if tanggalJatuhTempo.Valid {
			payment["tanggal_jatuh_tempo"] = tanggalJatuhTempo.String
		}
		if verifiedAt.Valid {
			payment["verified_at"] = verifiedAt.String
		}
		if verifiedBy.Valid {
			payment["verified_by"] = verifiedBy.Int64
		}
		if statusVerifikasi.Valid {
			payment["status_verifikasi"] = statusVerifikasi.String
		} else {
			payment["status_verifikasi"] = "pending"
		}
		if nomorInvoice.Valid {
			payment["nomor_invoice"] = nomorInvoice.String
		}
		if buyerName.Valid {
			payment["buyer_name"] = buyerName.String
		}

		pembayaranList = append(pembayaranList, payment)
	}

	c.JSON(http.StatusOK, pembayaranList)
}

// VerifyPembayaran verifies payment (admin only)
func VerifyPembayaran(c *gin.Context) {
	pembayaranID := c.Param("id")
	userID, _ := c.Get("user_id")

	var req struct {
		Status  string `json:"status" binding:"required"`
		Catatan string `json:"catatan"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	_, err := config.DB.Exec(`
		UPDATE pembayaran
		SET status = ?, catatan = ?, verified_by = ?, verified_at = NOW()
		WHERE id = ?
	`, req.Status, req.Catatan, userID, pembayaranID)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to verify payment"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Payment verified successfully"})
}

// GetDailySales returns daily sales report
func GetDailySales(c *gin.Context) {
	startDate := c.Query("start_date")
	endDate := c.Query("end_date")

	query := `
		SELECT DATE(dp.tanggal_dokumen) as tanggal,
		       COUNT(DISTINCT dp.id) as jumlah_transaksi,
		       SUM(dp.jumlah_kg) as total_kg,
		       SUM(total_akhir) as total_pendapatan,
		       AVG(dp.harga_per_kg) as rata_rata_harga,
		       SUM(CASE WHEN t.grade_aktual = 'A' THEN dp.jumlah_kg ELSE 0 END) as grade_a,
		       SUM(CASE WHEN t.grade_aktual = 'B' THEN dp.jumlah_kg ELSE 0 END) as grade_b,
		       SUM(CASE WHEN t.grade_aktual = 'C' THEN dp.jumlah_kg ELSE 0 END) as grade_c
		FROM dokumen_penjualan dp
		LEFT JOIN timbangan t ON dp.timbang_id = t.id
		WHERE 1=1
	`
	args := []interface{}{}

	if startDate != "" {
		query += " AND DATE(dp.tanggal_dokumen) >= ?"
		args = append(args, startDate)
	}
	if endDate != "" {
		query += " AND DATE(dp.tanggal_dokumen) <= ?"
		args = append(args, endDate)
	}

	query += " GROUP BY DATE(dp.tanggal_dokumen) ORDER BY tanggal DESC"

	rows, err := config.DB.Query(query, args...)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch sales report"})
		return
	}
	defer rows.Close()

	salesList := make([]map[string]interface{}, 0)
	for rows.Next() {
		var tanggal string
		var jumlahTransaksi int
		var totalKg, totalPendapatan, rataHarga float64
		var gradeA, gradeB, gradeC sql.NullFloat64

		err := rows.Scan(&tanggal, &jumlahTransaksi, &totalKg, &totalPendapatan, &rataHarga, &gradeA, &gradeB, &gradeC)
		if err != nil {
			continue
		}

		salesList = append(salesList, map[string]interface{}{
			"tanggal":           tanggal,
			"jumlah_transaksi":  jumlahTransaksi,
			"total_kg":          totalKg,
			"total_pendapatan":  totalPendapatan,
			"rata_rata_harga":   rataHarga,
			"grade_a":           gradeA.Float64,
			"grade_b":           gradeB.Float64,
			"grade_c":           gradeC.Float64,
		})
	}

	c.JSON(http.StatusOK, salesList)
}

// GetDashboardStats returns dashboard statistics
func GetDashboardStats(c *gin.Context) {
	role, _ := c.Get("role")
	userID, _ := c.Get("user_id")

	stats := make(map[string]interface{})

	if role == "buyer" {
		// Buyer statistics
		var totalPO, pendingPO, approvedPO, completedPO int
		var totalSpent float64

		config.DB.QueryRow("SELECT COUNT(*) FROM purchase_orders WHERE buyer_id = ?", userID).Scan(&totalPO)
		config.DB.QueryRow("SELECT COUNT(*) FROM purchase_orders WHERE buyer_id = ? AND status = 'pending'", userID).Scan(&pendingPO)
		config.DB.QueryRow("SELECT COUNT(*) FROM purchase_orders WHERE buyer_id = ? AND status = 'approved'", userID).Scan(&approvedPO)
		config.DB.QueryRow("SELECT COUNT(*) FROM purchase_orders WHERE buyer_id = ? AND status = 'completed'", userID).Scan(&completedPO)
		config.DB.QueryRow("SELECT COALESCE(SUM(total_harga), 0) FROM purchase_orders WHERE buyer_id = ? AND status = 'completed'", userID).Scan(&totalSpent)

		stats["total_po"] = totalPO
		stats["pending_po"] = pendingPO
		stats["approved_po"] = approvedPO
		stats["completed_po"] = completedPO
		stats["total_spent"] = totalSpent
	} else {
		// Admin statistics
		var totalStok, totalKebun, totalBuyer int
		var totalPendingPO, totalRevenue float64

		config.DB.QueryRow("SELECT COUNT(*) FROM stok_tbs WHERE status = 'available'").Scan(&totalStok)
		config.DB.QueryRow("SELECT COUNT(*) FROM kebun WHERE status = 'active'").Scan(&totalKebun)
		config.DB.QueryRow("SELECT COUNT(*) FROM users WHERE role = 'buyer' AND status = 'active'").Scan(&totalBuyer)
		config.DB.QueryRow("SELECT COUNT(*) FROM purchase_orders WHERE status = 'pending'").Scan(&totalPendingPO)
		config.DB.QueryRow("SELECT COALESCE(SUM(total_akhir), 0) FROM dokumen_penjualan WHERE MONTH(tanggal_dokumen) = MONTH(CURDATE())").Scan(&totalRevenue)

		stats["total_stok"] = totalStok
		stats["total_kebun"] = totalKebun
		stats["total_buyer"] = totalBuyer
		stats["pending_po"] = totalPendingPO
		stats["revenue_month"] = totalRevenue
	}

	c.JSON(http.StatusOK, stats)
}
