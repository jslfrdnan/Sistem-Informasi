# API ENDPOINTS DOCUMENTATION

**Base URL:** `http://localhost:8080/api`

---

## 📋 TABLE OF CONTENTS

1. [Health Check](#health-check)
2. [Authentication](#authentication)
3. [Profile](#profile)
4. [Kebun](#kebun)
5. [Stok TBS](#stok-tbs)
6. [Purchase Orders](#purchase-orders)
7. [Jadwal Pengambilan](#jadwal-pengambilan)
8. [Timbangan](#timbangan)
9. [Dokumen Penjualan](#dokumen-penjualan)
10. [Pembayaran](#pembayaran)
11. [Reports & Dashboard](#reports--dashboard)
12. [Log Aktivitas](#log-aktivitas)

---

## HEALTH CHECK

### Get Server Status
```
GET /health
```

**Auth Required:** No

**Response:**
```json
{
  "status": "ok",
  "message": "Sistem Informasi Perkebunan Kelapa Sawit API"
}
```

---

## AUTHENTICATION

### Register Buyer
```
POST /api/auth/register
```

**Auth Required:** No

**Request Body:**
```json
{
  "username": "buyer_test",
  "email": "buyer@test.com",
  "password": "password123",
  "company_name": "PT Test Indonesia",
  "nib": "1234567890123",
  "address": "Jl. Test No. 123",
  "phone": "081234567890"
}
```

**Response:**
```json
{
  "message": "User registered successfully",
  "user": {
    "id": 1,
    "username": "buyer_test",
    "email": "buyer@test.com",
    "role": "buyer"
  }
}
```

---

### Login
```
POST /api/auth/login
```

**Auth Required:** No

**Request Body:**
```json
{
  "email": "buyer@test.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "username": "buyer_test",
    "email": "buyer@test.com",
    "role": "buyer"
  }
}
```

---

## PROFILE

### Get Profile
```
GET /api/profile
```

**Auth Required:** Yes (All roles)

**Headers:**
```
Authorization: Bearer {token}
```

**Response:**
```json
{
  "id": 1,
  "username": "buyer_test",
  "email": "buyer@test.com",
  "role": "buyer",
  "company_name": "PT Test Indonesia",
  "nib": "1234567890123",
  "address": "Jl. Test No. 123",
  "phone": "081234567890"
}
```

---

### Update Profile
```
PUT /api/profile
```

**Auth Required:** Yes (All roles)

**Headers:**
```
Authorization: Bearer {token}
```

**Request Body:**
```json
{
  "username": "buyer_updated",
  "phone": "081234567899",
  "address": "Jl. Updated No. 456"
}
```

---

## KEBUN

### Get Kebun List
```
GET /api/kebun
```

**Auth Required:** Yes (All roles)

**Headers:**
```
Authorization: Bearer {token}
```

**Response:**
```json
{
  "kebun": [
    {
      "id": 1,
      "nama_kebun": "Kebun Makmur",
      "lokasi": "Riau",
      "luas_ha": 150.5
    }
  ]
}
```

---

## STOK TBS

### Get Stok List
```
GET /api/stok
```

**Auth Required:** Yes (All roles)

**Headers:**
```
Authorization: Bearer {token}
```

**Query Parameters:**
- `grade` (optional): Filter by grade (A, B, C)
- `kebun_id` (optional): Filter by kebun
- `status` (optional): Filter by status

**Response:**
```json
{
  "stok": [
    {
      "id": 1,
      "kebun_id": 1,
      "kebun_nama": "Kebun Makmur",
      "tanggal_panen": "2025-12-01",
      "jumlah_kg": 5000.0,
      "tersedia_kg": 5000.0,
      "grade": "A",
      "kadar_minyak": 22.5,
      "harga_per_kg": 5500.0,
      "status": "available"
    }
  ]
}
```

---

### Get Stok Detail
```
GET /api/stok/:id
```

**Auth Required:** Yes (All roles)

**Headers:**
```
Authorization: Bearer {token}
```

**Response:**
```json
{
  "id": 1,
  "kebun_id": 1,
  "tanggal_panen": "2025-12-01",
  "jumlah_kg": 5000.0,
  "tersedia_kg": 5000.0,
  "grade": "A",
  "kadar_minyak": 22.5,
  "harga_per_kg": 5500.0,
  "status": "available",
  "keterangan": "Panen perdana"
}
```

---

### Create Stok
```
POST /api/stok
```

**Auth Required:** Yes (Admin, Staff only)

**Headers:**
```
Authorization: Bearer {token}
```

**Request Body:**
```json
{
  "kebun_id": 1,
  "tanggal_panen": "2025-12-01",
  "jumlah_kg": 5000.0,
  "grade": "A",
  "kadar_minyak": 22.5,
  "harga_per_kg": 5500.0,
  "keterangan": "Panen perdana bulan Desember"
}
```

**Response:**
```json
{
  "message": "Stok created successfully",
  "stok": {
    "id": 1,
    "kebun_id": 1,
    "grade": "A",
    "jumlah_kg": 5000.0
  }
}
```

---

### Update Stok
```
PUT /api/stok/:id
```

**Auth Required:** Yes (Admin, Staff only)

**Headers:**
```
Authorization: Bearer {token}
```

**Request Body:**
```json
{
  "harga_per_kg": 6000.0,
  "keterangan": "Harga updated"
}
```

---

## PURCHASE ORDERS

### Get Purchase Orders
```
GET /api/purchase-orders
```

**Auth Required:** Yes

**Headers:**
```
Authorization: Bearer {token}
```

**Query Parameters:**
- `status` (optional): pending, approved, rejected, loading, completed

**Response:**
```json
{
  "purchase_orders": [
    {
      "id": 1,
      "nomor_po": "PO-2025-001",
      "buyer_id": 2,
      "buyer_name": "PT Test Indonesia",
      "stok_id": 1,
      "kebun_nama": "Kebun Makmur",
      "grade": "A",
      "jumlah_kg": 1000.0,
      "harga_per_kg": 5500.0,
      "total_harga": 5500000.0,
      "status": "pending",
      "tanggal_order": "2025-12-01T10:00:00Z",
      "tanggal_pengambilan": "2025-12-15"
    }
  ]
}
```

---

### Get Purchase Order Detail
```
GET /api/purchase-orders/:id
```

**Auth Required:** Yes

**Headers:**
```
Authorization: Bearer {token}
```

**Response:**
```json
{
  "id": 1,
  "nomor_po": "PO-2025-001",
  "buyer_id": 2,
  "stok_id": 1,
  "jumlah_kg": 1000.0,
  "harga_per_kg": 5500.0,
  "total_harga": 5500000.0,
  "status": "pending",
  "tanggal_order": "2025-12-01T10:00:00Z",
  "tanggal_pengambilan": "2025-12-15",
  "metode_pembayaran": "transfer",
  "catatan": "Mohon diproses cepat"
}
```

---

### Create Purchase Order
```
POST /api/purchase-orders
```

**Auth Required:** Yes (Buyer only)

**Headers:**
```
Authorization: Bearer {token}
```

**Request Body:**
```json
{
  "stok_id": 1,
  "jumlah_kg": 1000.0,
  "tanggal_pengambilan": "2025-12-15",
  "metode_pembayaran": "transfer",
  "catatan": "Mohon diproses cepat"
}
```

**Response:**
```json
{
  "message": "Purchase order created successfully",
  "purchase_order": {
    "id": 1,
    "nomor_po": "PO-2025-001",
    "total_harga": 5500000.0
  }
}
```

---

### Update PO Status (Approve/Reject)
```
PUT /api/purchase-orders/:id/status
```

**Auth Required:** Yes (Admin, Staff only)

**Headers:**
```
Authorization: Bearer {token}
```

**Request Body:**
```json
{
  "status": "approved",
  "catatan": "Stok tersedia, disetujui"
}
```

**Valid Status Values:**
- `approved`
- `rejected`
- `loading`
- `completed`

---

### Cancel Purchase Order
```
DELETE /api/purchase-orders/:id
```

**Auth Required:** Yes (Buyer who created it)

**Headers:**
```
Authorization: Bearer {token}
```

**Response:**
```json
{
  "message": "Purchase order cancelled successfully"
}
```

---

## JADWAL PENGAMBILAN

### Get Jadwal List
```
GET /api/jadwal
```

**Auth Required:** Yes

**Headers:**
```
Authorization: Bearer {token}
```

**Query Parameters:**
- `tanggal` (optional): Filter by date (YYYY-MM-DD)
- `status` (optional): scheduled, in_progress, completed

**Response:**
```json
{
  "jadwal": [
    {
      "id": 1,
      "po_id": 1,
      "nomor_po": "PO-2025-001",
      "buyer_name": "PT Test Indonesia",
      "tanggal_loading": "2025-12-15",
      "waktu_loading": "08:00",
      "nomor_antrian": 1,
      "plat_nomor": "B1234XYZ",
      "nama_sopir": "Budi",
      "status": "scheduled"
    }
  ]
}
```

---

### Create Jadwal
```
POST /api/jadwal
```

**Auth Required:** Yes (Admin, Staff only)

**Headers:**
```
Authorization: Bearer {token}
```

**Request Body:**
```json
{
  "po_id": 1,
  "tanggal_loading": "2025-12-15",
  "waktu_loading": "08:00",
  "plat_nomor": "B1234XYZ",
  "nama_sopir": "Budi",
  "nomor_hp_sopir": "081234567890"
}
```

---

## TIMBANGAN

### Get Timbangan List
```
GET /api/timbangan
```

**Auth Required:** Yes

**Headers:**
```
Authorization: Bearer {token}
```

**Query Parameters:**
- `status` (optional): weigh_in, loading, weigh_out, completed

**Response:**
```json
{
  "timbangan": [
    {
      "id": 1,
      "po_id": 1,
      "nomor_po": "PO-2025-001",
      "plat_nomor": "B1234XYZ",
      "berat_masuk": 15000.5,
      "berat_keluar": 18750.75,
      "berat_bersih": 3750.25,
      "grade_aktual": "A",
      "status": "completed",
      "waktu_masuk": "2025-12-15T08:15:00Z",
      "waktu_keluar": "2025-12-15T10:30:00Z"
    }
  ]
}
```

---

### Weigh-In
```
POST /api/timbangan/:id/weigh-in
```

**Auth Required:** Yes (Staff, Admin only)

**Headers:**
```
Authorization: Bearer {token}
```

**Request Body:**
```json
{
  "berat_masuk": 15000.5,
  "catatan": "Kendaraan dalam kondisi baik"
}
```

---

### Weigh-Out
```
POST /api/timbangan/:id/weigh-out
```

**Auth Required:** Yes (Staff, Admin only)

**Headers:**
```
Authorization: Bearer {token}
```

**Request Body:**
```json
{
  "berat_keluar": 18750.75,
  "grade_aktual": "A",
  "kadar_air": 21.5,
  "kadar_sampah": 2.3,
  "tingkat_kematangan": "Matang sempurna",
  "catatan": "Kualitas sangat baik"
}
```

---

## DOKUMEN PENJUALAN

### Get Dokumen List
```
GET /api/dokumen
```

**Auth Required:** Yes

**Headers:**
```
Authorization: Bearer {token}
```

**Query Parameters:**
- `po_id` (optional): Filter by PO

**Response:**
```json
{
  "dokumen": [
    {
      "id": 1,
      "po_id": 1,
      "nomor_po": "PO-2025-001",
      "nomor_invoice": "INV-2025-001",
      "nomor_surat_jalan": "SJ-2025-001",
      "nomor_bukti_timbang": "BT-2025-001",
      "tanggal_dokumen": "2025-12-15",
      "total_harga": 5500000.0,
      "file_invoice": "/uploads/invoice/INV-2025-001.pdf",
      "file_surat_jalan": "/uploads/sj/SJ-2025-001.pdf",
      "file_bukti_timbang": "/uploads/bt/BT-2025-001.pdf"
    }
  ]
}
```

---

## PEMBAYARAN

### Get Pembayaran List
```
GET /api/pembayaran
```

**Auth Required:** Yes

**Headers:**
```
Authorization: Bearer {token}
```

**Query Parameters:**
- `status` (optional): pending, verified, rejected

**Response:**
```json
{
  "pembayaran": [
    {
      "id": 1,
      "po_id": 1,
      "nomor_po": "PO-2025-001",
      "invoice_id": 1,
      "nomor_invoice": "INV-2025-001",
      "jumlah_bayar": 5500000.0,
      "metode_pembayaran": "transfer",
      "bank_tujuan": "BCA",
      "nomor_rekening": "1234567890",
      "tanggal_bayar": "2025-12-15",
      "bukti_transfer": "/uploads/payment/bukti-1.jpg",
      "status": "pending",
      "verified_at": null
    }
  ]
}
```

---

### Create Pembayaran (Upload Bukti Transfer)
```
POST /api/pembayaran
```

**Auth Required:** Yes (Buyer only)

**Headers:**
```
Authorization: Bearer {token}
Content-Type: multipart/form-data
```

**Request Body (Form Data):**
```
po_id: 1
invoice_id: 1
jumlah_bayar: 5500000
metode_pembayaran: transfer
bank_tujuan: BCA
nomor_rekening: 1234567890
tanggal_bayar: 2025-12-15
bukti_transfer: [file]
catatan: Pembayaran via BCA
```

---

### Verify Pembayaran
```
PUT /api/pembayaran/:id/verify
```

**Auth Required:** Yes (Admin, Staff only)

**Headers:**
```
Authorization: Bearer {token}
```

**Request Body:**
```json
{
  "status": "verified",
  "catatan_verifikasi": "Pembayaran terverifikasi, jumlah sesuai"
}
```

**Valid Status Values:**
- `verified`
- `rejected`

---

## REPORTS & DASHBOARD

### Get Dashboard Stats
```
GET /api/reports/dashboard
```

**Auth Required:** Yes (All roles)

**Headers:**
```
Authorization: Bearer {token}
```

**Response:**
```json
{
  "total_stok_kg": 50000.0,
  "total_stok_value": 275000000.0,
  "total_po": 25,
  "pending_po": 5,
  "approved_po": 12,
  "completed_po": 8,
  "total_revenue": 120000000.0,
  "unpaid_invoices": 3,
  "total_unpaid": 15000000.0
}
```

---

### Get Daily Sales Report
```
GET /api/reports/daily-sales
```

**Auth Required:** Yes (Admin, Staff only)

**Headers:**
```
Authorization: Bearer {token}
```

**Query Parameters:**
- `start_date`: Start date (YYYY-MM-DD)
- `end_date`: End date (YYYY-MM-DD)

**Response:**
```json
{
  "period": {
    "start_date": "2025-12-01",
    "end_date": "2025-12-31"
  },
  "summary": {
    "total_transactions": 25,
    "total_kg": 25000.0,
    "total_revenue": 137500000.0,
    "average_price": 5500.0
  },
  "daily_data": [
    {
      "date": "2025-12-01",
      "transactions": 3,
      "kg": 3000.0,
      "revenue": 16500000.0
    }
  ],
  "by_grade": {
    "A": {
      "count": 15,
      "kg": 15000.0,
      "revenue": 82500000.0
    },
    "B": {
      "count": 8,
      "kg": 8000.0,
      "revenue": 40000000.0
    },
    "C": {
      "count": 2,
      "kg": 2000.0,
      "revenue": 15000000.0
    }
  }
}
```

---

## LOG AKTIVITAS

### Get Activity Logs
```
GET /api/logs
```

**Auth Required:** Yes (Admin only)

**Headers:**
```
Authorization: Bearer {token}
```

**Query Parameters:**
- `user_id`: Filter by user ID (optional)
- `aktivitas`: Filter by activity type (optional, partial match)
- `start_date`: Start date (YYYY-MM-DD, optional)
- `end_date`: End date (YYYY-MM-DD, optional)
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 50)

**Response:**
```json
{
  "logs": [
    {
      "id": 1,
      "user_id": 2,
      "username": "buyer_test",
      "role": "buyer",
      "aktivitas": "LOGIN",
      "detail": "User logged in successfully",
      "ip_address": "192.168.1.100",
      "user_agent": "Mozilla/5.0...",
      "waktu_aktivitas": "2025-12-09T10:30:00Z"
    },
    {
      "id": 2,
      "user_id": 2,
      "username": "buyer_test",
      "role": "buyer",
      "aktivitas": "CREATE_PURCHASE_ORDER",
      "detail": "Created PO #PO-20251209-001 for 1000kg",
      "ip_address": "192.168.1.100",
      "user_agent": "Mozilla/5.0...",
      "waktu_aktivitas": "2025-12-09T10:35:00Z"
    }
  ],
  "total": 150,
  "page": 1,
  "limit": 50,
  "pages": 3
}
```

---

### Get Log Statistics
```
GET /api/logs/statistics
```

**Auth Required:** Yes (Admin only)

**Headers:**
```
Authorization: Bearer {token}
```

**Query Parameters:**
- `start_date`: Start date (YYYY-MM-DD, optional)
- `end_date`: End date (YYYY-MM-DD, optional)

**Response:**
```json
{
  "activity_summary": [
    {
      "aktivitas": "LOGIN",
      "jumlah": 45
    },
    {
      "aktivitas": "CREATE_PURCHASE_ORDER",
      "jumlah": 23
    },
    {
      "aktivitas": "UPDATE_PO_STATUS",
      "jumlah": 18
    }
  ],
  "top_users": [
    {
      "username": "admin",
      "role": "admin",
      "jumlah": 125
    },
    {
      "username": "buyer_test",
      "role": "buyer",
      "jumlah": 78
    }
  ]
}
```

---

## ERROR RESPONSES

### 400 Bad Request
```json
{
  "error": "Invalid request body"
}
```

### 401 Unauthorized
```json
{
  "error": "Authorization header required"
}
```

or

```json
{
  "error": "Invalid or expired token"
}
```

### 403 Forbidden
```json
{
  "error": "Access denied. Required role: admin"
}
```

### 404 Not Found
```json
{
  "error": "Resource not found"
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal server error"
}
```

---

## AUTHENTICATION HEADER FORMAT

All protected endpoints require JWT token in Authorization header:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE3MzMwNjg4MDAsInVzZXJfaWQiOjF9.xyz123
```

---

## ROLE-BASED ACCESS CONTROL

| Endpoint | Admin | Staff | Buyer |
|----------|-------|-------|-------|
| GET /api/stok | ✅ | ✅ | ✅ |
| POST /api/stok | ✅ | ✅ | ❌ |
| POST /api/purchase-orders | ❌ | ❌ | ✅ |
| PUT /api/purchase-orders/:id/status | ✅ | ✅ | ❌ |
| POST /api/jadwal | ✅ | ✅ | ❌ |
| POST /api/timbangan/:id/weigh-in | ✅ | ✅ | ❌ |
| POST /api/pembayaran | ❌ | ❌ | ✅ |
| PUT /api/pembayaran/:id/verify | ✅ | ✅ | ❌ |
| GET /api/reports/daily-sales | ✅ | ✅ | ❌ |
| GET /api/logs | ✅ | ❌ | ❌ |
| GET /api/logs/statistics | ✅ | ❌ | ❌ |

---

## POSTMAN COLLECTION

Import the collection from: `postman_collection.json`

Or access online documentation at: `http://localhost:8080/health`

---

**Last Updated:** December 2024  
**API Version:** 1.0.0  
**Base URL:** http://localhost:8080/api
