package models

import (
	"database/sql"
	"encoding/json"
	"time"
)

// NullString is a wrapper around sql.NullString that marshals to JSON properly
type NullString struct {
	sql.NullString
}

// MarshalJSON converts null to empty string in JSON
func (ns NullString) MarshalJSON() ([]byte, error) {
	if ns.Valid {
		return json.Marshal(ns.String)
	}
	return json.Marshal("")
}

// UnmarshalJSON handles JSON unmarshaling
func (ns *NullString) UnmarshalJSON(data []byte) error {
	var s *string
	if err := json.Unmarshal(data, &s); err != nil {
		return err
	}
	if s != nil {
		ns.Valid = true
		ns.String = *s
	} else {
		ns.Valid = false
	}
	return nil
}

type User struct {
	ID          int       `json:"id"`
	Username    string    `json:"username"`
	Email       string    `json:"email"`
	Password    string    `json:"-"` // Don't send password in JSON
	Role        string    `json:"role"`
	CompanyName *string   `json:"company_name,omitempty"`
	Address     *string   `json:"address,omitempty"`
	NIB         *string   `json:"nib,omitempty"`
	Phone       *string   `json:"phone,omitempty"`
	Status      string    `json:"status"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

type Kebun struct {
	ID          int       `json:"id"`
	NamaKebun   string    `json:"nama_kebun"`
	Lokasi      string    `json:"lokasi"`
	LuasHektar  float64   `json:"luas_hektar"`
	Koordinat   string    `json:"koordinat"`
	Status      string    `json:"status"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

type StokTBS struct {
	ID               int       `json:"id"`
	KebunID          int       `json:"kebun_id"`
	TanggalPanen     string    `json:"tanggal_panen"`
	JumlahKg         float64   `json:"jumlah_kg"`
	JumlahTersedia   float64   `json:"jumlah_tersedia"`
	Grade            string    `json:"grade"`
	KadarMinyak      *float64  `json:"kadar_minyak,omitempty"`
	HargaPerKg       float64   `json:"harga_per_kg"`
	Keterangan       *string   `json:"keterangan,omitempty"`
	Status           string    `json:"status"`
	CreatedAt        time.Time `json:"created_at"`
	UpdatedAt        time.Time `json:"updated_at"`
	// Joined fields
	NamaKebun        string    `json:"nama_kebun,omitempty"`
	LokasiKebun      string    `json:"lokasi_kebun,omitempty"`
}

type PurchaseOrder struct {
	ID                  int       `json:"id"`
	PONumber            string    `json:"po_number"`
	BuyerID             int       `json:"buyer_id"`
	StokID              int       `json:"stok_id"`
	KebunID             int       `json:"kebun_id"`
	JumlahKg            float64   `json:"jumlah_kg"`
	GradeDiminta        string    `json:"grade_diminta"`
	HargaPerKg          float64   `json:"harga_per_kg"`
	TotalHarga          float64   `json:"total_harga"`
	TanggalPengambilan  string    `json:"tanggal_pengambilan"`
	LokasiPengambilan   string    `json:"lokasi_pengambilan"`
	MetodePembayaran    string    `json:"metode_pembayaran"`
	Status              string    `json:"status"`
	Catatan             string    `json:"catatan"`
	ApprovedBy          *int      `json:"approved_by"`
	ApprovedAt          *time.Time `json:"approved_at"`
	CreatedAt           time.Time `json:"created_at"`
	UpdatedAt           time.Time `json:"updated_at"`
	// Joined fields
	BuyerCompany        string    `json:"buyer_company,omitempty"`
	NamaKebun           string    `json:"nama_kebun,omitempty"`
	PaymentStatus       string    `json:"payment_status,omitempty"`
}

type JadwalPengambilan struct {
	ID           int       `json:"id"`
	POID         int       `json:"po_id"`
	NomorAntrian int       `json:"nomor_antrian"`
	WaktuLoading time.Time `json:"waktu_loading"`
	PlatNomor    string    `json:"plat_nomor"`
	NamaSopir    string    `json:"nama_sopir"`
	Status       string    `json:"status"`
	CreatedAt    time.Time `json:"created_at"`
	UpdatedAt    time.Time `json:"updated_at"`
}

type Timbangan struct {
	ID                 int         `json:"id"`
	POID               int         `json:"po_id"`
	JadwalID           int         `json:"jadwal_id"`
	PlatNomor          string      `json:"plat_nomor"`
	BeratMasuk         *float64    `json:"berat_masuk"`
	WaktuMasuk         *time.Time  `json:"waktu_masuk"`
	PetugasMasuk       *int        `json:"petugas_masuk"`
	BeratKeluar        *float64    `json:"berat_keluar"`
	WaktuKeluar        *time.Time  `json:"waktu_keluar"`
	PetugasKeluar      *int        `json:"petugas_keluar"`
	BeratBersih        *float64    `json:"berat_bersih"`
	GradeAktual        NullString  `json:"grade_aktual"`
	KadarAir           *float64    `json:"kadar_air"`
	KadarSampah        *float64    `json:"kadar_sampah"`
	TingkatKematangan  NullString  `json:"tingkat_kematangan"`
	Status             string      `json:"status"`
	Catatan            NullString  `json:"catatan"`
	CreatedAt          time.Time   `json:"created_at"`
	UpdatedAt          time.Time   `json:"updated_at"`
}

type DokumenPenjualan struct {
	ID                  int       `json:"id"`
	POID                int       `json:"po_id"`
	TimbangID           int       `json:"timbang_id"`
	NomorSuratJalan     string    `json:"nomor_surat_jalan"`
	NomorInvoice        string    `json:"nomor_invoice"`
	NomorBuktiTimbang   string    `json:"nomor_bukti_timbang"`
	TanggalDokumen      string    `json:"tanggal_dokumen"`
	JumlahKg            float64   `json:"jumlah_kg"`
	HargaPerKg          float64   `json:"harga_per_kg"`
	TotalHarga          float64   `json:"total_harga"`
	PenyesuaianHarga    float64   `json:"penyesuaian_harga"`
	TotalAkhir          float64   `json:"total_akhir"`
	FileSuratJalan      string    `json:"file_surat_jalan"`
	FileInvoice         string    `json:"file_invoice"`
	FileBuktiTimbang    string    `json:"file_bukti_timbang"`
	FileQualityReport   string    `json:"file_quality_report"`
	CreatedAt           time.Time `json:"created_at"`
	UpdatedAt           time.Time `json:"updated_at"`
}

type Pembayaran struct {
	ID                 int        `json:"id"`
	DokumenID          int        `json:"dokumen_id"`
	POID               int        `json:"po_id"`
	JumlahBayar        float64    `json:"jumlah_bayar"`
	MetodePembayaran   string     `json:"metode_pembayaran"`
	BankPengirim       string     `json:"bank_pengirim"`
	NomorRekening      string     `json:"nomor_rekening"`
	NamaPengirim       string     `json:"nama_pengirim"`
	BuktiTransfer      string     `json:"bukti_transfer"`
	TanggalJatuhTempo  *string    `json:"tanggal_jatuh_tempo"`
	TanggalPembayaran  string     `json:"tanggal_pembayaran"`
	Status             string     `json:"status"`
	VerifiedBy         *int       `json:"verified_by"`
	VerifiedAt         *time.Time `json:"verified_at"`
	Catatan            string     `json:"catatan"`
	CreatedAt          time.Time  `json:"created_at"`
	UpdatedAt          time.Time  `json:"updated_at"`
}

type LogAktivitas struct {
	ID          int       `json:"id"`
	UserID      *int      `json:"user_id"`
	Aktivitas   string    `json:"aktivitas"`
	Modul       string    `json:"modul"`
	ReferenceID *int      `json:"reference_id"`
	IPAddress   string    `json:"ip_address"`
	UserAgent   string    `json:"user_agent"`
	CreatedAt   time.Time `json:"created_at"`
}

// DTOs (Data Transfer Objects)

type LoginRequest struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required"`
}

type RegisterRequest struct {
	Username    string `json:"username" binding:"required"`
	Email       string `json:"email" binding:"required,email"`
	Password    string `json:"password" binding:"required,min=6"`
	CompanyName string `json:"company_name" binding:"required"`
	Address     string `json:"address"`
	NIB         string `json:"nib"`
	Phone       string `json:"phone"`
}

type LoginResponse struct {
	Token string `json:"token"`
	User  User   `json:"user"`
}

type CreatePORequest struct {
	StokID             int     `json:"stok_id" binding:"required"`
	JumlahKg           float64 `json:"jumlah_kg" binding:"required,gt=0"`
	TanggalPengambilan string  `json:"tanggal_pengambilan" binding:"required"`
	MetodePembayaran   string  `json:"metode_pembayaran" binding:"required"`
	Catatan            string  `json:"catatan"`
}

type UpdatePOStatusRequest struct {
	Status  string `json:"status" binding:"required"`
	Catatan string `json:"catatan"`
}

type CreateJadwalRequest struct {
	POID         int    `json:"po_id" binding:"required"`
	WaktuLoading string `json:"waktu_loading" binding:"required"`
	PlatNomor    string `json:"plat_nomor" binding:"required"`
	NamaSopir    string `json:"nama_sopir" binding:"required"`
}

type WeighInRequest struct {
	BeratMasuk float64 `json:"berat_masuk" binding:"required,gt=0"`
}

type WeighOutRequest struct {
	BeratKeluar        float64 `json:"berat_keluar" binding:"required,gt=0"`
	GradeAktual        string  `json:"grade_aktual" binding:"required"`
	KadarAir           float64 `json:"kadar_air"`
	KadarSampah        float64 `json:"kadar_sampah"`
	TingkatKematangan  string  `json:"tingkat_kematangan"`
	Catatan            string  `json:"catatan"`
}

type CreatePembayaranRequest struct {
	DokumenID         int     `json:"dokumen_id" binding:"required"`
	JumlahBayar       float64 `json:"jumlah_bayar" binding:"required,gt=0"`
	MetodePembayaran  string  `json:"metode_pembayaran" binding:"required"`
	BankPengirim      string  `json:"bank_pengirim"`
	NomorRekening     string  `json:"nomor_rekening"`
	NamaPengirim      string  `json:"nama_pengirim"`
	TanggalPembayaran string  `json:"tanggal_pembayaran" binding:"required"`
	TanggalJatuhTempo string  `json:"tanggal_jatuh_tempo"`
	Catatan           string  `json:"catatan"`
}
