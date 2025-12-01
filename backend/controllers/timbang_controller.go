package controllers

import (
	"database/sql"
	"fmt"
	"net/http"
	"sawit-backend/config"
	"sawit-backend/models"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
)

// CreateJadwal creates loading schedule
func CreateJadwal(c *gin.Context) {
	var req models.CreateJadwalRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Check if PO is approved
	var poStatus string
	err := config.DB.QueryRow("SELECT status FROM purchase_orders WHERE id = ?", req.POID).Scan(&poStatus)
	if err == sql.ErrNoRows {
		c.JSON(http.StatusNotFound, gin.H{"error": "Purchase order not found"})
		return
	}
	if poStatus != "approved" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "PO must be approved first"})
		return
	}

	// Generate queue number
	var nomorAntrian int
	config.DB.QueryRow(`
		SELECT COALESCE(MAX(nomor_antrian), 0) + 1
		FROM jadwal_pengambilan
		WHERE DATE(waktu_loading) = DATE(?)
	`, req.WaktuLoading).Scan(&nomorAntrian)

	// Insert jadwal
	result, err := config.DB.Exec(`
		INSERT INTO jadwal_pengambilan (po_id, nomor_antrian, waktu_loading, plat_nomor, nama_sopir, status)
		VALUES (?, ?, ?, ?, ?, 'scheduled')
	`, req.POID, nomorAntrian, req.WaktuLoading, req.PlatNomor, req.NamaSopir)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create schedule"})
		return
	}

	jadwalID, _ := result.LastInsertId()

	// Update PO status to loading
	config.DB.Exec("UPDATE purchase_orders SET status = 'loading' WHERE id = ?", req.POID)

	// Create timbangan record
	_, err = config.DB.Exec(`
		INSERT INTO timbangan (po_id, jadwal_id, plat_nomor, status)
		VALUES (?, ?, ?, 'weigh_in')
	`, req.POID, jadwalID, req.PlatNomor)
	
	if err != nil {
		// Log error but don't fail the request since jadwal already created
		fmt.Printf("Warning: Failed to create timbangan record: %v\n", err)
	}

	c.JSON(http.StatusCreated, gin.H{
		"message":        "Schedule created successfully",
		"jadwal_id":      jadwalID,
		"nomor_antrian":  nomorAntrian,
	})
}

// GetJadwalList returns list of loading schedules
func GetJadwalList(c *gin.Context) {
	status := c.Query("status")
	date := c.Query("date")

	query := `
		SELECT j.id, j.po_id, j.nomor_antrian, j.waktu_loading, j.plat_nomor,
		       j.nama_sopir, j.status, j.created_at, j.updated_at
		FROM jadwal_pengambilan j
		WHERE 1=1
	`
	args := []interface{}{}

	if status != "" {
		query += " AND j.status = ?"
		args = append(args, status)
	}
	if date != "" {
		query += " AND DATE(j.waktu_loading) = ?"
		args = append(args, date)
	}

	query += " ORDER BY j.waktu_loading ASC"

	rows, err := config.DB.Query(query, args...)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch schedules"})
		return
	}
	defer rows.Close()

	jadwalList := make([]models.JadwalPengambilan, 0)
	for rows.Next() {
		var jadwal models.JadwalPengambilan
		err := rows.Scan(
			&jadwal.ID, &jadwal.POID, &jadwal.NomorAntrian, &jadwal.WaktuLoading,
			&jadwal.PlatNomor, &jadwal.NamaSopir, &jadwal.Status,
			&jadwal.CreatedAt, &jadwal.UpdatedAt,
		)
		if err != nil {
			continue
		}
		jadwalList = append(jadwalList, jadwal)
	}

	c.JSON(http.StatusOK, jadwalList)
}

// WeighIn records truck weight when entering
func WeighIn(c *gin.Context) {
	timbangID := c.Param("id")
	userID, _ := c.Get("user_id")

	var req models.WeighInRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	now := time.Now()
	_, err := config.DB.Exec(`
		UPDATE timbangan
		SET berat_masuk = ?, waktu_masuk = ?, petugas_masuk = ?, status = 'loading'
		WHERE id = ?
	`, req.BeratMasuk, now, userID, timbangID)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to record weigh-in"})
		return
	}

	// Update jadwal status
	config.DB.Exec(`
		UPDATE jadwal_pengambilan j
		JOIN timbangan t ON j.id = t.jadwal_id
		SET j.status = 'in_progress'
		WHERE t.id = ?
	`, timbangID)

	c.JSON(http.StatusOK, gin.H{"message": "Weigh-in recorded successfully"})
}

// WeighOut records truck weight when exiting
func WeighOut(c *gin.Context) {
	timbangID := c.Param("id")
	userID, _ := c.Get("user_id")

	fmt.Printf("WeighOut - Timbang ID: %s, User ID: %v\n", timbangID, userID)

	var req models.WeighOutRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		fmt.Printf("WeighOut Error - Invalid request body: %v\n", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	fmt.Printf("WeighOut Request - Berat Keluar: %.2f, Grade: %s\n", req.BeratKeluar, req.GradeAktual)

	// Get current timbangan data
	var beratMasuk sql.NullFloat64
	var poID, jadwalID int
	err := config.DB.QueryRow(`
		SELECT berat_masuk, po_id, jadwal_id FROM timbangan WHERE id = ?
	`, timbangID).Scan(&beratMasuk, &poID, &jadwalID)

	if err != nil {
		fmt.Printf("WeighOut Error - Failed to get timbangan: %v\n", err)
		c.JSON(http.StatusNotFound, gin.H{"error": "Weighing record not found"})
		return
	}

	if !beratMasuk.Valid || beratMasuk.Float64 == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Berat masuk belum dicatat. Silakan lakukan weigh-in terlebih dahulu."})
		return
	}

	// Calculate net weight
	beratBersih := req.BeratKeluar - beratMasuk.Float64
	fmt.Printf("WeighOut - Berat Masuk: %.2f, Berat Keluar: %.2f, Berat Bersih: %.2f\n", beratMasuk.Float64, req.BeratKeluar, beratBersih)

	now := time.Now()
	_, err = config.DB.Exec(`
		UPDATE timbangan
		SET berat_keluar = ?, waktu_keluar = ?, petugas_keluar = ?,
		    berat_bersih = ?, grade_aktual = ?, kadar_air = ?, kadar_sampah = ?,
		    tingkat_kematangan = ?, catatan = ?, status = 'completed'
		WHERE id = ?
	`, req.BeratKeluar, now, userID, beratBersih, req.GradeAktual,
		req.KadarAir, req.KadarSampah, req.TingkatKematangan, req.Catatan, timbangID)

	if err != nil {
		fmt.Printf("WeighOut Error - Failed to UPDATE timbangan: %v\n", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to record weigh-out: " + err.Error()})
		return
	}

	// Update jadwal status
	config.DB.Exec("UPDATE jadwal_pengambilan SET status = 'completed' WHERE id = ?", jadwalID)

	// Update PO status
	config.DB.Exec("UPDATE purchase_orders SET status = 'completed' WHERE id = ?", poID)

	// Convert timbangID to int
	timbangIDInt, err := strconv.Atoi(timbangID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid timbang ID"})
		return
	}

	// Create dokumen penjualan
	err = createDokumenPenjualan(poID, timbangIDInt, beratBersih, req.GradeAktual)
	if err != nil {
		fmt.Printf("WeighOut Error - Failed to create dokumen: %v\n", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create sales document: " + err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message":      "Weigh-out recorded successfully",
		"berat_bersih": beratBersih,
	})
}

// createDokumenPenjualan creates sales documents
func createDokumenPenjualan(poID, timbangID int, beratBersih float64, gradeAktual string) error {
	// Get PO details
	var hargaPerKg, gradeDiminta string
	err := config.DB.QueryRow(`
		SELECT harga_per_kg, grade_diminta FROM purchase_orders WHERE id = ?
	`, poID).Scan(&hargaPerKg, &gradeDiminta)

	if err != nil {
		return err
	}

	// Calculate price adjustment based on grade
	var penyesuaian float64
	hargaFloat := 0.0
	fmt.Sscan(hargaPerKg, &hargaFloat)

	if gradeAktual != gradeDiminta {
		// Grade B: -10%, Grade C: -20%
		if gradeAktual == "B" {
			penyesuaian = -0.10 * hargaFloat * beratBersih
		} else if gradeAktual == "C" {
			penyesuaian = -0.20 * hargaFloat * beratBersih
		}
	}

	totalHarga := hargaFloat * beratBersih
	totalAkhir := totalHarga + penyesuaian

	// Generate document numbers
	today := time.Now().Format("20060102")
	var counter int
	config.DB.QueryRow(`
		SELECT COUNT(*) + 1 FROM dokumen_penjualan WHERE DATE(tanggal_dokumen) = CURDATE()
	`).Scan(&counter)

	nomorSJ := fmt.Sprintf("SJ-%s-%04d", today, counter)
	nomorInv := fmt.Sprintf("INV-%s-%04d", today, counter)
	nomorBT := fmt.Sprintf("BT-%s-%04d", today, counter)

	// Insert dokumen
	_, err = config.DB.Exec(`
		INSERT INTO dokumen_penjualan (
			po_id, timbang_id, nomor_surat_jalan, nomor_invoice, nomor_bukti_timbang,
			tanggal_dokumen, jumlah_kg, harga_per_kg, total_harga, penyesuaian_harga, total_akhir
		) VALUES (?, ?, ?, ?, ?, CURDATE(), ?, ?, ?, ?, ?)
	`, poID, timbangID, nomorSJ, nomorInv, nomorBT, beratBersih, hargaFloat, totalHarga, penyesuaian, totalAkhir)

	return err
}

// GetTimbangan returns weighing records
func GetTimbangan(c *gin.Context) {
	poID := c.Query("po_id")
	status := c.Query("status")

	query := `
		SELECT id, po_id, jadwal_id, plat_nomor, berat_masuk, waktu_masuk, petugas_masuk,
		       berat_keluar, waktu_keluar, petugas_keluar, berat_bersih, grade_aktual,
		       kadar_air, kadar_sampah, tingkat_kematangan, status, catatan, created_at, updated_at
		FROM timbangan
		WHERE 1=1
	`
	args := []interface{}{}

	if poID != "" {
		query += " AND po_id = ?"
		args = append(args, poID)
	}
	if status != "" {
		query += " AND status = ?"
		args = append(args, status)
	}

	query += " ORDER BY created_at DESC"

	fmt.Printf("GetTimbangan Query: %s\n", query)
	fmt.Printf("GetTimbangan Args: %v\n", args)

	rows, err := config.DB.Query(query, args...)
	if err != nil {
		fmt.Printf("GetTimbangan Error: %v\n", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch weighing records"})
		return
	}
	defer rows.Close()

	timbangList := make([]models.Timbangan, 0)
	for rows.Next() {
		var t models.Timbangan
		err := rows.Scan(
			&t.ID, &t.POID, &t.JadwalID, &t.PlatNomor, &t.BeratMasuk, &t.WaktuMasuk, &t.PetugasMasuk,
			&t.BeratKeluar, &t.WaktuKeluar, &t.PetugasKeluar, &t.BeratBersih, &t.GradeAktual,
			&t.KadarAir, &t.KadarSampah, &t.TingkatKematangan, &t.Status, &t.Catatan, &t.CreatedAt, &t.UpdatedAt,
		)
		if err != nil {
			fmt.Printf("GetTimbangan Scan Error: %v\n", err)
			continue
		}
		timbangList = append(timbangList, t)
	}

	fmt.Printf("GetTimbangan Found %d records\n", len(timbangList))
	c.JSON(http.StatusOK, timbangList)
}

// GetDokumen returns sales documents
func GetDokumen(c *gin.Context) {
	poID := c.Query("po_id")
	startDate := c.Query("start_date")
	endDate := c.Query("end_date")

	query := `
		SELECT dp.id, dp.po_id, dp.timbang_id, dp.nomor_surat_jalan, dp.nomor_invoice, dp.nomor_bukti_timbang,
		       dp.tanggal_dokumen, dp.jumlah_kg, dp.harga_per_kg, dp.total_harga, dp.penyesuaian_harga, dp.total_akhir,
		       dp.file_surat_jalan, dp.file_invoice, dp.file_bukti_timbang, dp.file_quality_report,
		       dp.created_at, dp.updated_at,
		       po.po_number, po.grade_diminta, u.username as buyer_name, u.company_name as perusahaan
		FROM dokumen_penjualan dp
		JOIN purchase_orders po ON dp.po_id = po.id
		JOIN users u ON po.buyer_id = u.id
		WHERE 1=1
	`
	args := []interface{}{}

	if poID != "" {
		query += " AND dp.po_id = ?"
		args = append(args, poID)
	}

	if startDate != "" {
		query += " AND DATE(dp.tanggal_dokumen) >= ?"
		args = append(args, startDate)
	}

	if endDate != "" {
		query += " AND DATE(dp.tanggal_dokumen) <= ?"
		args = append(args, endDate)
	}

	query += " ORDER BY dp.created_at DESC"

	rows, err := config.DB.Query(query, args...)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch documents"})
		return
	}
	defer rows.Close()

	dokumenList := make([]map[string]interface{}, 0)
	for rows.Next() {
		var id, poID, timbangID int
		var nomorSJ, nomorInvoice, nomorBukti, poNumber, grade, buyerName, perusahaan string
		var tanggalDokumen, createdAt, updatedAt string
		var jumlahKg, hargaPerKg, totalHarga, penyesuaianHarga, totalAkhir float64
		var fileSJ, fileInvoice, fileBukti, fileQuality sql.NullString

		err := rows.Scan(
			&id, &poID, &timbangID, &nomorSJ, &nomorInvoice, &nomorBukti,
			&tanggalDokumen, &jumlahKg, &hargaPerKg, &totalHarga, &penyesuaianHarga, &totalAkhir,
			&fileSJ, &fileInvoice, &fileBukti, &fileQuality,
			&createdAt, &updatedAt,
			&poNumber, &grade, &buyerName, &perusahaan,
		)
		if err != nil {
			continue
		}

		dokumen := map[string]interface{}{
			"id":                   id,
			"dokumen_id":           id,
			"po_id":                poID,
			"timbang_id":           timbangID,
			"nomor_surat_jalan":    nomorSJ,
			"nomor_invoice":        nomorInvoice,
			"nomor_bukti_timbang":  nomorBukti,
			"tanggal_dokumen":      tanggalDokumen,
			"total_berat_kg":       jumlahKg,
			"jumlah_kg":            jumlahKg,
			"harga_per_kg":         hargaPerKg,
			"total_harga":          totalAkhir,
			"total_akhir":          totalAkhir,
			"created_at":           createdAt,
			"updated_at":           updatedAt,
			"po_number":            poNumber,
			"nomor_po":             poNumber,
			"grade":                grade,
			"buyer_name":           buyerName,
			"perusahaan":           perusahaan,
		}

		dokumenList = append(dokumenList, dokumen)
	}

	c.JSON(http.StatusOK, dokumenList)
}
