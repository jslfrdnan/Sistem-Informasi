-- ============================================
-- Database Schema untuk Sistem Informasi
-- Perkebunan Kelapa Sawit
-- ============================================

CREATE DATABASE IF NOT EXISTS sawit_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE sawit_db;

-- ============================================
-- Tabel Users (Pembeli dan Admin)
-- ============================================
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('buyer', 'admin', 'staff', 'security') DEFAULT 'buyer',
    company_name VARCHAR(200),
    address TEXT,
    nib VARCHAR(50), -- Nomor Induk Berusaha
    phone VARCHAR(20),
    status ENUM('active', 'inactive') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_username (username),
    INDEX idx_role (role)
) ENGINE=InnoDB;

-- ============================================
-- Tabel Kebun (Lokasi Perkebunan)
-- ============================================
CREATE TABLE kebun (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nama_kebun VARCHAR(200) NOT NULL,
    lokasi VARCHAR(255) NOT NULL,
    luas_hektar DECIMAL(10,2),
    koordinat VARCHAR(100), -- Format: lat,long
    status ENUM('active', 'inactive') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ============================================
-- Tabel Stok TBS (Tandan Buah Segar)
-- ============================================
CREATE TABLE stok_tbs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    kebun_id INT NOT NULL,
    tanggal_panen DATE NOT NULL,
    jumlah_kg DECIMAL(12,2) NOT NULL DEFAULT 0,
    jumlah_tersedia DECIMAL(12,2) NOT NULL DEFAULT 0, -- Stok yang belum dibeli
    grade ENUM('A', 'B', 'C') DEFAULT 'A',
    kadar_minyak DECIMAL(5,2), -- Persentase
    harga_per_kg DECIMAL(10,2) NOT NULL,
    keterangan TEXT,
    status ENUM('available', 'reserved', 'sold_out') DEFAULT 'available',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (kebun_id) REFERENCES kebun(id) ON DELETE CASCADE,
    INDEX idx_tanggal (tanggal_panen),
    INDEX idx_status (status),
    INDEX idx_grade (grade)
) ENGINE=InnoDB;

-- ============================================
-- Tabel Purchase Order (PO)
-- ============================================
CREATE TABLE purchase_orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    po_number VARCHAR(50) UNIQUE NOT NULL,
    buyer_id INT NOT NULL,
    stok_id INT NOT NULL,
    kebun_id INT NOT NULL,
    jumlah_kg DECIMAL(12,2) NOT NULL,
    grade_diminta ENUM('A', 'B', 'C') NOT NULL,
    harga_per_kg DECIMAL(10,2) NOT NULL,
    total_harga DECIMAL(15,2) NOT NULL,
    tanggal_pengambilan DATE,
    lokasi_pengambilan VARCHAR(255),
    metode_pembayaran ENUM('tunai', 'transfer', 'termin') DEFAULT 'transfer',
    status ENUM('pending', 'approved', 'rejected', 'loading', 'completed', 'cancelled') DEFAULT 'pending',
    catatan TEXT,
    approved_by INT, -- ID admin yang approve
    approved_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (buyer_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (stok_id) REFERENCES stok_tbs(id) ON DELETE CASCADE,
    FOREIGN KEY (kebun_id) REFERENCES kebun(id) ON DELETE CASCADE,
    FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_po_number (po_number),
    INDEX idx_buyer (buyer_id),
    INDEX idx_status (status),
    INDEX idx_tanggal (tanggal_pengambilan)
) ENGINE=InnoDB;

-- ============================================
-- Tabel Jadwal Pengambilan
-- ============================================
CREATE TABLE jadwal_pengambilan (
    id INT AUTO_INCREMENT PRIMARY KEY,
    po_id INT NOT NULL,
    nomor_antrian INT NOT NULL,
    waktu_loading DATETIME NOT NULL,
    plat_nomor VARCHAR(20),
    nama_sopir VARCHAR(100),
    status ENUM('scheduled', 'in_progress', 'completed', 'cancelled') DEFAULT 'scheduled',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (po_id) REFERENCES purchase_orders(id) ON DELETE CASCADE,
    INDEX idx_waktu (waktu_loading),
    INDEX idx_status (status)
) ENGINE=InnoDB;

-- ============================================
-- Tabel Timbangan (Weighbridge)
-- ============================================
CREATE TABLE timbangan (
    id INT AUTO_INCREMENT PRIMARY KEY,
    po_id INT NOT NULL,
    jadwal_id INT NOT NULL,
    plat_nomor VARCHAR(20) NOT NULL,
    
    -- Timbang Masuk
    berat_masuk DECIMAL(12,2), -- kg (berat truk kosong)
    waktu_masuk DATETIME,
    petugas_masuk INT, -- ID staff yang timbang
    
    -- Timbang Keluar
    berat_keluar DECIMAL(12,2), -- kg (berat truk + muatan)
    waktu_keluar DATETIME,
    petugas_keluar INT, -- ID staff yang timbang
    
    -- Hasil
    berat_bersih DECIMAL(12,2), -- berat_keluar - berat_masuk
    grade_aktual ENUM('A', 'B', 'C'),
    kadar_air DECIMAL(5,2),
    kadar_sampah DECIMAL(5,2),
    tingkat_kematangan VARCHAR(50),
    
    -- Status
    status ENUM('weigh_in', 'loading', 'weigh_out', 'completed') DEFAULT 'weigh_in',
    catatan TEXT,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (po_id) REFERENCES purchase_orders(id) ON DELETE CASCADE,
    FOREIGN KEY (jadwal_id) REFERENCES jadwal_pengambilan(id) ON DELETE CASCADE,
    FOREIGN KEY (petugas_masuk) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (petugas_keluar) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_plat (plat_nomor),
    INDEX idx_status (status)
) ENGINE=InnoDB;

-- ============================================
-- Tabel Dokumen Penjualan
-- ============================================
CREATE TABLE dokumen_penjualan (
    id INT AUTO_INCREMENT PRIMARY KEY,
    po_id INT NOT NULL,
    timbang_id INT NOT NULL,
    
    -- Nomor Dokumen
    nomor_surat_jalan VARCHAR(50) UNIQUE NOT NULL,
    nomor_invoice VARCHAR(50) UNIQUE NOT NULL,
    nomor_bukti_timbang VARCHAR(50) UNIQUE NOT NULL,
    
    -- Data Transaksi
    tanggal_dokumen DATE NOT NULL,
    jumlah_kg DECIMAL(12,2) NOT NULL,
    harga_per_kg DECIMAL(10,2) NOT NULL,
    total_harga DECIMAL(15,2) NOT NULL,
    
    -- Penyesuaian harga berdasarkan kualitas
    penyesuaian_harga DECIMAL(15,2) DEFAULT 0,
    total_akhir DECIMAL(15,2) NOT NULL,
    
    -- File Path (opsional untuk simpan PDF)
    file_surat_jalan VARCHAR(255),
    file_invoice VARCHAR(255),
    file_bukti_timbang VARCHAR(255),
    file_quality_report VARCHAR(255),
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (po_id) REFERENCES purchase_orders(id) ON DELETE CASCADE,
    FOREIGN KEY (timbang_id) REFERENCES timbangan(id) ON DELETE CASCADE,
    INDEX idx_invoice (nomor_invoice),
    INDEX idx_surat_jalan (nomor_surat_jalan)
) ENGINE=InnoDB;

-- ============================================
-- Tabel Pembayaran
-- ============================================
CREATE TABLE pembayaran (
    id INT AUTO_INCREMENT PRIMARY KEY,
    dokumen_id INT NOT NULL,
    po_id INT NOT NULL,
    
    jumlah_bayar DECIMAL(15,2) NOT NULL,
    metode_pembayaran ENUM('tunai', 'transfer', 'termin') NOT NULL,
    
    -- Untuk Transfer
    bank_pengirim VARCHAR(100),
    nomor_rekening VARCHAR(50),
    nama_pengirim VARCHAR(100),
    bukti_transfer VARCHAR(255), -- Path file bukti
    
    -- Untuk Termin
    tanggal_jatuh_tempo DATE,
    
    tanggal_pembayaran DATE NOT NULL,
    status ENUM('pending', 'verified', 'completed', 'rejected') DEFAULT 'pending',
    verified_by INT, -- ID admin yang verifikasi
    verified_at TIMESTAMP NULL,
    catatan TEXT,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (dokumen_id) REFERENCES dokumen_penjualan(id) ON DELETE CASCADE,
    FOREIGN KEY (po_id) REFERENCES purchase_orders(id) ON DELETE CASCADE,
    FOREIGN KEY (verified_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_status (status),
    INDEX idx_tanggal (tanggal_pembayaran)
) ENGINE=InnoDB;

-- ============================================
-- Tabel Log Aktivitas (Audit Trail)
-- ============================================
CREATE TABLE log_aktivitas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    aktivitas VARCHAR(255) NOT NULL,
    modul VARCHAR(50), -- 'po', 'timbang', 'stok', 'pembayaran', dll
    reference_id INT, -- ID dari tabel terkait
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_user (user_id),
    INDEX idx_modul (modul),
    INDEX idx_created (created_at)
) ENGINE=InnoDB;

-- ============================================
-- Insert Data Awal (Sample Data)
-- ============================================

-- Insert Admin User (password: admin123)
-- Staff User (password: staff123)
INSERT INTO users (username, email, password, role, company_name, phone, status) VALUES
('admin', 'admin@sawit.com', '$2a$10$0sJK.ByxugLVMb/Z8W/2reoyh065dJjiJbxAXS77ksKSpHdeMEFHC', 'admin', 'PT Sawit Perkebunan', '081234567890', 'active'),
('staff_weighing', 'staff@sawit.com', '$2a$10$CMdIoEFHMJhyfily0woA4OhR0wwO6DpUiPGxB8/dnEE.NndezVOT6', 'staff', 'PT Sawit Perkebunan', '081234567891', 'active'),
('security', 'security@sawit.com', '$2a$10$0sJK.ByxugLVMb/Z8W/2reoyh065dJjiJbxAXS77ksKSpHdeMEFHC', 'security', 'PT Sawit Perkebunan', '081234567892', 'active');

-- Insert Sample Buyer (password: buyer123)
INSERT INTO users (username, email, password, role, company_name, address, nib, phone, status) VALUES
('buyer1', 'buyer1@company.com', '$2a$10$wDRq.xs3Uw9zgSO0Ld6r1e7XnmxrrqHd8IrUMGfuAHY5Gn/Huui0y', 'buyer', 'PT CPO Indonesia', 'Jakarta Selatan', '1234567890123', '081234567893', 'active'),
('buyer2', 'buyer2@company.com', '$2a$10$wDRq.xs3Uw9zgSO0Ld6r1e7XnmxrrqHd8IrUMGfuAHY5Gn/Huui0y', 'buyer', 'CV Minyak Sawit', 'Medan', '9876543210123', '081234567894', 'active');

-- Insert Kebun
INSERT INTO kebun (nama_kebun, lokasi, luas_hektar, koordinat, status) VALUES
('Kebun Sawit A', 'Riau, Pekanbaru', 150.50, '0.533333,101.447777', 'active'),
('Kebun Sawit B', 'Sumatera Utara, Medan', 200.00, '3.595196,98.672226', 'active'),
('Kebun Sawit C', 'Kalimantan Barat', 175.75, '-0.026611,109.342453', 'active');

-- Insert Stok TBS
INSERT INTO stok_tbs (kebun_id, tanggal_panen, jumlah_kg, jumlah_tersedia, grade, kadar_minyak, harga_per_kg, status) VALUES
(1, '2025-11-26', 50000.00, 50000.00, 'A', 22.50, 1800, 'available'),
(1, '2025-11-27', 45000.00, 45000.00, 'A', 23.00, 1850, 'available'),
(2, '2025-11-26', 60000.00, 60000.00, 'B', 20.00, 1600, 'available'),
(2, '2025-11-27', 55000.00, 55000.00, 'A', 22.00, 1800, 'available'),
(3, '2025-11-25', 40000.00, 40000.00, 'B', 19.50, 1550, 'available'),
(3, '2025-11-26', 48000.00, 48000.00, 'A', 21.50, 1750, 'available');

-- ============================================
-- Views untuk Laporan
-- ============================================

-- View: Ringkasan Stok TBS per Kebun
CREATE VIEW v_stok_summary AS
SELECT 
    k.id AS kebun_id,
    k.nama_kebun,
    k.lokasi,
    COUNT(s.id) AS jumlah_batch,
    SUM(s.jumlah_kg) AS total_stok_kg,
    SUM(s.jumlah_tersedia) AS total_tersedia_kg,
    AVG(s.harga_per_kg) AS rata_rata_harga,
    MAX(s.tanggal_panen) AS panen_terakhir
FROM kebun k
LEFT JOIN stok_tbs s ON k.id = s.kebun_id AND s.status = 'available'
GROUP BY k.id, k.nama_kebun, k.lokasi;

-- View: Ringkasan Purchase Order
CREATE VIEW v_po_summary AS
SELECT 
    po.id,
    po.po_number,
    po.status,
    u.company_name AS buyer_company,
    k.nama_kebun,
    po.jumlah_kg,
    po.grade_diminta,
    po.total_harga,
    po.tanggal_pengambilan,
    po.metode_pembayaran,
    po.created_at,
    COALESCE(pb.status, 'unpaid') AS payment_status
FROM purchase_orders po
JOIN users u ON po.buyer_id = u.id
JOIN kebun k ON po.kebun_id = k.id
LEFT JOIN dokumen_penjualan dp ON po.id = dp.po_id
LEFT JOIN pembayaran pb ON dp.id = pb.dokumen_id;

-- View: Laporan Penjualan Harian
CREATE VIEW v_daily_sales AS
SELECT 
    DATE(dp.tanggal_dokumen) AS tanggal,
    COUNT(DISTINCT dp.id) AS jumlah_transaksi,
    SUM(dp.jumlah_kg) AS total_kg,
    SUM(dp.total_akhir) AS total_pendapatan,
    AVG(dp.harga_per_kg) AS rata_rata_harga
FROM dokumen_penjualan dp
GROUP BY DATE(dp.tanggal_dokumen)
ORDER BY tanggal DESC;

-- ============================================
-- Stored Procedures
-- ============================================

DELIMITER //

-- Procedure: Generate PO Number
CREATE PROCEDURE generate_po_number(OUT new_po_number VARCHAR(50))
BEGIN
    DECLARE counter INT;
    DECLARE today VARCHAR(8);
    
    SET today = DATE_FORMAT(NOW(), '%Y%m%d');
    
    SELECT COUNT(*) + 1 INTO counter
    FROM purchase_orders
    WHERE DATE(created_at) = CURDATE();
    
    SET new_po_number = CONCAT('PO-', today, '-', LPAD(counter, 4, '0'));
END //

-- Procedure: Update Stok setelah PO Approved
CREATE PROCEDURE update_stok_after_po(IN p_stok_id INT, IN p_jumlah DECIMAL(12,2))
BEGIN
    UPDATE stok_tbs 
    SET jumlah_tersedia = jumlah_tersedia - p_jumlah,
        status = CASE 
            WHEN (jumlah_tersedia - p_jumlah) <= 0 THEN 'sold_out'
            WHEN (jumlah_tersedia - p_jumlah) < jumlah_kg * 0.1 THEN 'reserved'
            ELSE 'available'
        END
    WHERE id = p_stok_id;
END //

-- Procedure: Hitung Berat Bersih Timbangan
CREATE PROCEDURE hitung_berat_bersih(IN p_timbang_id INT)
BEGIN
    UPDATE timbangan
    SET berat_bersih = berat_keluar - berat_masuk
    WHERE id = p_timbang_id;
END //

DELIMITER ;

-- ============================================
-- Triggers
-- ============================================

DELIMITER //

-- Trigger: Log aktivitas saat PO dibuat
CREATE TRIGGER after_po_insert
AFTER INSERT ON purchase_orders
FOR EACH ROW
BEGIN
    INSERT INTO log_aktivitas (user_id, aktivitas, modul, reference_id)
    VALUES (NEW.buyer_id, CONCAT('Membuat Purchase Order: ', NEW.po_number), 'po', NEW.id);
END //

-- Trigger: Update stok saat PO approved
CREATE TRIGGER after_po_approved
AFTER UPDATE ON purchase_orders
FOR EACH ROW
BEGIN
    IF NEW.status = 'approved' AND OLD.status != 'approved' THEN
        CALL update_stok_after_po(NEW.stok_id, NEW.jumlah_kg);
    END IF;
END //

-- Trigger: Hitung total harga saat insert PO
CREATE TRIGGER before_po_insert
BEFORE INSERT ON purchase_orders
FOR EACH ROW
BEGIN
    SET NEW.total_harga = NEW.jumlah_kg * NEW.harga_per_kg;
END //

-- Trigger: Hitung berat bersih saat timbang keluar
CREATE TRIGGER after_timbang_keluar
AFTER UPDATE ON timbangan
FOR EACH ROW
BEGIN
    IF NEW.berat_keluar IS NOT NULL AND OLD.berat_keluar IS NULL THEN
        CALL hitung_berat_bersih(NEW.id);
    END IF;
END //

DELIMITER ;

-- ============================================
-- Indexes untuk optimasi performance
-- ============================================
CREATE INDEX idx_stok_composite ON stok_tbs(status, grade, tanggal_panen);
CREATE INDEX idx_po_composite ON purchase_orders(status, buyer_id, tanggal_pengambilan);
CREATE INDEX idx_timbangan_composite ON timbangan(status, waktu_masuk);

-- ============================================
-- Selesai
-- ============================================
