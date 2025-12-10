# PANDUAN PENGGUNAAN SISTEM INFORMASI SAWIT

**Versi 1.0 | Desember 2025**

---

## BAB 1: PENDAHULUAN

### 1.1 Tentang Sistem

Sistem Informasi Penjualan TBS Kelapa Sawit adalah aplikasi berbasis web yang dirancang untuk mengelola seluruh proses penjualan TBS (Tandan Buah Segar) kelapa sawit, mulai dari manajemen stok, pemesanan, penimbangan, hingga pembayaran.

**Fitur Utama:**
- 📦 Manajemen Stok TBS
- 🛒 Purchase Order (PO) Management
- ⚖️ Sistem Timbangan Digital
- 📄 Generate Dokumen Otomatis
- 💳 Verifikasi Pembayaran
- 📊 Laporan & Dashboard

### 1.2 Cara Mengakses Sistem

**URL Sistem:** `http://sawit.company.com` atau `http://localhost:3000` (development)

**Persyaratan Sistem:**
- Browser: Chrome 120+, Firefox 121+, Edge 120+, Safari 17+
- Koneksi Internet: Minimal 1 Mbps
- Resolusi Layar: Minimal 1280x720 px

### 1.3 Login ke Sistem

**Langkah-langkah Login:**

1. Buka browser dan akses URL sistem
2. Anda akan melihat halaman login
3. Masukkan **Email** dan **Password**
4. Klik tombol **"Login"**
5. Sistem akan mengarahkan ke Dashboard sesuai role Anda

**Default Credentials (untuk testing):**
```
Admin:
  Email: admin@sawit.com
  Password: admin123

Staff:
  Email: staff@sawit.com
  Password: staff123

Buyer:
  Email: buyer@sawit.com
  Password: buyer123
```

**Troubleshooting Login Gagal:**

| Masalah | Solusi |
|---------|--------|
| "Invalid credentials" | Periksa email dan password, pastikan huruf besar/kecil benar |
| "Authorization header required" | Hapus cache browser (Ctrl+Shift+Del), login ulang |
| Halaman loading terus | Periksa koneksi internet, refresh halaman (F5) |
| "User not found" | Pastikan akun sudah terdaftar, hubungi admin |

### 1.4 Navigasi Dashboard

Setelah login berhasil, Anda akan melihat:

**Navbar (Bagian Atas):**
- Logo Sistem (klik untuk ke Dashboard)
- Menu navigasi sesuai role
- User Profile dropdown (pojok kanan)
- Tombol Logout

**Sidebar/Menu:**
- Dashboard
- Fitur-fitur sesuai role (lihat BAB 2-4)

**Footer:**
- Copyright information
- Link bantuan

---

## BAB 2: PANDUAN UNTUK BUYER

### 2.1 Registrasi Akun Buyer

**Langkah Registrasi:**

1. Di halaman Login, klik **"Register"** atau **"Daftar"**
2. Isi form registrasi:
   - **Username**: Nama pengguna unik
   - **Email**: Email valid perusahaan
   - **Password**: Minimal 8 karakter, kombinasi huruf & angka
   - **Confirm Password**: Ulangi password
   - **Nama Perusahaan**: Nama resmi perusahaan
   - **NIB**: Nomor Induk Berusaha (13 digit)
   - **Alamat**: Alamat lengkap perusahaan
   - **Nomor Telepon**: Format: 08xxxxxxxxxx
3. Centang "Saya setuju dengan syarat & ketentuan"
4. Klik **"Daftar"**
5. Sistem akan menampilkan pesan sukses
6. Login dengan email dan password yang baru dibuat

**Catatan:**
- Email harus unik (tidak boleh duplikat)
- Username harus unik
- NIB akan diverifikasi oleh admin

### 2.2 Melihat Stok TBS Tersedia

**Akses:** Dashboard → **Stok TBS**

**Fitur Filter:**

1. **Filter berdasarkan Grade:**
   - Pilih dropdown "Grade"
   - Pilih: A (Premium), B (Standar), atau C (Reguler)
   - Klik "Apply Filter"

2. **Filter berdasarkan Kebun:**
   - Pilih dropdown "Kebun"
   - Pilih nama kebun yang diinginkan
   - Klik "Apply Filter"

3. **Search:**
   - Gunakan search box untuk cari kata kunci

**Informasi Stok yang Ditampilkan:**
- Nama Kebun
- Tanggal Panen
- Jumlah Tersedia (kg)
- Grade (A/B/C)
- Kadar Minyak (%)
- Harga per kg
- Status (Available/Reserved/Sold Out)

**Melihat Detail Stok:**
1. Klik tombol **"Detail"** pada stok yang diinginkan
2. Popup modal akan muncul dengan informasi lengkap:
   - Lokasi kebun
   - Koordinat GPS
   - Histori panen
   - Quality metrics
3. Klik **"Tutup"** untuk menutup detail

### 2.3 Membuat Purchase Order (PO)

**Langkah Membuat PO:**

1. Pilih stok yang ingin dibeli (dari menu **Stok TBS**)
2. Klik tombol **"Buat PO"**
3. Form PO akan terbuka, isi data:
   - **Jumlah (kg)**: Masukkan jumlah yang ingin dibeli
     - Tidak boleh melebihi stok tersedia
   - **Tanggal Pengambilan**: Pilih tanggal dari calendar
     - Minimal H+2 dari hari ini
   - **Metode Pembayaran**: Pilih Transfer/Tunai/Termin
   - **Catatan** (opsional): Instruksi khusus

4. Review ringkasan:
   - Harga per kg
   - Total kg
   - **Total Harga** (auto-calculated)

5. Klik **"Submit PO"**

6. Sistem akan menampilkan konfirmasi:
   - Nomor PO (contoh: PO-20251201-0001)
   - Status: Pending
   - Pesan: "PO berhasil dibuat, menunggu approval admin"

**Catatan Penting:**
- PO yang sudah disubmit **tidak bisa diedit**
- Hanya bisa dicancel jika status masih "Pending"
- Admin akan review dalam max 24 jam kerja

### 2.4 Tracking Status Pesanan

**Akses:** Dashboard → **Pesanan Saya**

**Status PO yang Mungkin:**

| Status | Deskripsi | Tindakan |
|--------|-----------|----------|
| **Pending** | Menunggu approval admin | Bisa cancel |
| **Approved** | Disetujui admin | Siapkan pembayaran |
| **Rejected** | Ditolak admin | Lihat alasan penolakan |
| **Loading** | Proses pengambilan | Kendaraan di perjalanan |
| **Completed** | Selesai ditimbang | Download dokumen, upload pembayaran |
| **Cancelled** | Dibatalkan | - |

**Melihat Detail Pesanan:**
1. Klik **"Detail"** pada PO yang diinginkan
2. Informasi lengkap akan ditampilkan:
   - Data PO
   - Timeline proses
   - Catatan admin (jika ada)
   - Dokumen (jika sudah completed)
   - Status pembayaran

**Filter Pesanan:**
- Filter by Status
- Filter by Date Range
- Search by PO Number

### 2.5 Upload Bukti Pembayaran

**Syarat:**
- PO status harus **"Completed"**
- Dokumen invoice sudah tersedia

**Langkah Upload:**

1. Buka **Pesanan Saya**
2. Cari PO yang ingin dibayar
3. Klik tombol **"Upload Pembayaran"**
4. Form pembayaran akan muncul:
   - **Jumlah Bayar**: Sesuai invoice (auto-filled)
   - **Metode Pembayaran**: Transfer/Tunai
   - **Bank Pengirim**: Nama bank (contoh: BCA, Mandiri)
   - **Nomor Rekening**: Rekening pengirim
   - **Nama Pengirim**: Nama di rekening
   - **Tanggal Pembayaran**: Tanggal transfer
   - **Bukti Transfer**: Upload file (JPG/PNG, max 5MB)
   - **Catatan**: Info tambahan

5. Klik **"Upload Bukti"**
6. Sistem menyimpan dan mengirim notifikasi ke admin
7. Status pembayaran: **"Pending Verification"**

**Tips:**
- Foto/scan bukti transfer harus jelas
- Pastikan jumlah transfer sesuai invoice
- File maksimal 5 MB
- Format: JPG atau PNG

### 2.6 Download Dokumen

**Dokumen yang Tersedia (setelah PO Completed):**

1. **Surat Jalan** (SJ-YYYYMMDD-XXXX)
   - Bukti pengiriman barang
   - Informasi kendaraan & sopir
   - Tanda tangan penerima

2. **Invoice** (INV-YYYYMMDD-XXXX)
   - Detail tagihan
   - Total harga
   - Metode pembayaran
   - Due date

3. **Bukti Timbang** (BT-YYYYMMDD-XXXX)
   - Berat masuk & keluar
   - Berat bersih
   - Grade aktual
   - Quality metrics (kadar air, sampah)

**Cara Download:**

1. Buka **Pesanan Saya**
2. Klik **"Detail"** pada PO yang completed
3. Scroll ke section **"Dokumen"**
4. Klik icon **Download** pada dokumen yang diinginkan
5. File PDF akan terdownload ke komputer

**Troubleshooting:**
- Jika download gagal: Refresh halaman, coba lagi
- Jika file tidak ada: Hubungi admin/staff timbangan

---

## BAB 3: PANDUAN UNTUK ADMIN

### 3.1 Manage Stok TBS

**Akses:** Dashboard → **Manage Stok**

#### 3.1.1 Tambah Stok Baru

1. Klik tombol **"+ Tambah Stok"**
2. Form input stok akan muncul:
   - **Kebun**: Pilih dari dropdown
   - **Tanggal Panen**: Pilih tanggal
   - **Jumlah (kg)**: Input berat total
   - **Grade**: Pilih A/B/C
   - **Kadar Minyak (%)**: Input persentase (contoh: 22.5)
   - **Harga per kg**: Input harga (contoh: 5500)
   - **Keterangan**: Info tambahan (opsional)
3. Klik **"Simpan"**
4. Stok baru akan muncul di list dengan status "Available"

#### 3.1.2 Edit Stok

1. Cari stok yang ingin diedit
2. Klik icon **Edit** (pensil)
3. Ubah data yang diperlukan
4. Klik **"Update"**

**Field yang bisa diedit:**
- Harga per kg (untuk update harga pasar)
- Keterangan
- Status (manual override jika perlu)

**Field yang tidak bisa diedit:**
- Jumlah kg (auto-update by system)
- Tanggal panen (historis)
- Kebun (karena relasi)

#### 3.1.3 Lihat Histori Stok

1. Klik **"Histori"** pada stok
2. Akan menampilkan:
   - PO yang menggunakan stok ini
   - Jumlah terjual
   - Sisa stok
   - Timeline transaksi

#### 3.1.4 Update Harga

**Bulk Update Harga:**
1. Pilih checkbox multiple stok
2. Klik **"Bulk Update"**
3. Masukkan harga baru
4. Konfirmasi
5. Sistem akan update semua stok terpilih

### 3.2 Approve/Reject Purchase Order

**Akses:** Dashboard → **Manage Orders**

#### Review PO Pending

**Filter:** Status = "Pending"

**Informasi yang Perlu Diperiksa:**
- ✅ Stok tersedia mencukupi
- ✅ Data buyer valid
- ✅ Jumlah order reasonable
- ✅ Tanggal pengambilan feasible

#### Approve PO

1. Klik **"Detail"** pada PO pending
2. Review semua informasi
3. Klik tombol **"Approve"**
4. Modal konfirmasi muncul:
   - Isi **Catatan Approval** (opsional)
   - Contoh: "Stok tersedia, disetujui"
5. Klik **"Konfirmasi Approve"**
6. Sistem akan:
   - Update status PO → "Approved"
   - Kurangi stok tersedia
   - Kirim notifikasi ke buyer
   - Log aktivitas

#### Reject PO

1. Klik **"Detail"** pada PO pending
2. Klik tombol **"Reject"**
3. Modal muncul:
   - **Wajib** isi alasan penolakan
   - Contoh: "Stok tidak mencukupi" atau "Data buyer tidak valid"
4. Klik **"Konfirmasi Reject"**
5. Sistem akan:
   - Update status → "Rejected"
   - Simpan alasan
   - Kirim notifikasi ke buyer

**Best Practices:**
- Proses PO maksimal 24 jam kerja
- Berikan alasan jelas jika reject
- Double-check stok sebelum approve

### 3.3 Verifikasi Pembayaran

**Akses:** Dashboard → **Pembayaran** → Tab **"Pending Verification"**

#### Review Bukti Pembayaran

1. Klik **"Detail"** pada pembayaran pending
2. Informasi yang ditampilkan:
   - Data PO & Invoice
   - Jumlah yang harus dibayar
   - Bukti transfer (gambar)
   - Detail transfer (bank, rekening, tanggal)
3. Klik gambar bukti transfer untuk **zoom/enlarge**

#### Verify Pembayaran

**Checklist Verifikasi:**
- ☑ Jumlah transfer sesuai invoice
- ☑ Tanggal transfer valid
- ☑ Bukti transfer jelas & valid
- ☑ Nomor rekening tujuan benar

**Jika Semua Valid:**
1. Klik tombol **"Verify"**
2. Isi catatan verifikasi:
   - Contoh: "Pembayaran terverifikasi, jumlah sesuai"
3. Klik **"Konfirmasi"**
4. Status pembayaran → "Verified"

#### Reject Pembayaran

**Jika Ada Masalah:**
1. Klik tombol **"Reject"**
2. Isi alasan penolakan (wajib):
   - Contoh: "Jumlah tidak sesuai, kurang Rp 100.000"
   - Contoh: "Bukti transfer tidak jelas, mohon upload ulang"
3. Klik **"Konfirmasi"**
4. Buyer akan menerima notifikasi untuk upload ulang

### 3.4 Manage Users

**Akses:** Dashboard → **Users Management**

**Fitur:**
- View daftar user (all roles)
- Activate/Deactivate user
- Reset password
- Ubah role (dengan hati-hati)

**Best Practice:**
- Jangan ubah role user tanpa approval
- Log semua perubahan user data
- Review inactive users setiap bulan

### 3.5 Generate Reports

**Akses:** Dashboard → **Reports**

**Jenis Laporan:**

1. **Laporan Penjualan Harian**
   - Filter: Start Date - End Date
   - Data: Transaksi, kg, revenue per hari
   - Export: Excel, PDF

2. **Laporan Stok**
   - Group by: Kebun, Grade
   - Data: Stok tersedia, reserved, sold
   - Export: Excel, PDF

3. **Laporan Pembayaran**
   - Filter: Status, Date Range
   - Data: Verified, pending, rejected
   - Export: Excel, PDF

**Cara Generate:**
1. Pilih jenis laporan
2. Set filter (tanggal, kategori, dll)
3. Klik **"Generate"**
4. Preview laporan di browser
5. Klik **"Export"** → Pilih format (Excel/PDF)

### 3.6 Monitor Log Aktivitas

**Akses:** Dashboard → **📋 Log Aktivitas**

**Fungsi:**
Fitur ini memungkinkan admin untuk memonitor semua aktivitas pengguna dalam sistem untuk tujuan audit, keamanan, dan troubleshooting.

#### 3.6.1 Melihat Log Aktivitas

**Tampilan Halaman:**

1. **Statistik Overview**
   - Total aktivitas dalam periode
   - Jenis aktivitas yang tercatat
   - Jumlah pengguna aktif
   
2. **Ringkasan Aktivitas**
   - Daftar jenis aktivitas dengan jumlah kejadian
   - Visualisasi aktivitas paling sering dilakukan
   - Contoh: LOGIN (45x), CREATE_PO (23x), APPROVE_PO (18x)

3. **Pengguna Paling Aktif**
   - Top 10 user dengan aktivitas terbanyak
   - Menampilkan username, role, dan jumlah aktivitas
   - Berguna untuk identifikasi pola penggunaan

#### 3.6.2 Filter Log

**Filter yang Tersedia:**

1. **Jenis Aktivitas**
   - Ketik kata kunci untuk mencari aktivitas tertentu
   - Contoh: "LOGIN", "CREATE", "APPROVE", "PAYMENT"

2. **Tanggal Mulai & Tanggal Akhir**
   - Filter log berdasarkan periode tertentu
   - Format: YYYY-MM-DD

3. **Items per Halaman**
   - Pilih: 10, 20, 50, atau 100 log per halaman

**Cara Menggunakan Filter:**
1. Isi filter yang diinginkan
2. Sistem akan otomatis refresh hasil
3. Klik **"Reset Filter"** untuk menghapus semua filter

#### 3.6.3 Membaca Detail Log

**Informasi dalam Setiap Log:**

| Kolom | Deskripsi |
|-------|-----------|
| **ID** | Nomor unik log |
| **Waktu** | Tanggal dan jam aktivitas (format: DD MMM YYYY, HH:MM:SS) |
| **User** | Username yang melakukan aktivitas |
| **Role** | Role user (Admin/Buyer/Staff) |
| **Aktivitas** | Jenis aktivitas dengan label warna |
| **Detail** | Deskripsi lengkap aktivitas |
| **IP Address** | Alamat IP user saat melakukan aktivitas |

**Label Warna Aktivitas:**
- 🔵 **Biru** - LOGIN, REGISTER (Autentikasi)
- 🟢 **Hijau** - CREATE, TAMBAH (Pembuatan data)
- 🟡 **Kuning** - UPDATE, EDIT (Perubahan data)
- 🔴 **Merah** - DELETE, HAPUS (Penghapusan data)
- 🟢 **Hijau Tua** - APPROVE, VERIFY (Persetujuan)
- 🔴 **Merah Muda** - REJECT, CANCEL (Penolakan)
- 🟣 **Ungu** - VIEW, READ (Akses baca)

#### 3.6.4 Use Cases Log Aktivitas

**1. Audit Trail**
- Track siapa yang approve/reject PO
- Identifikasi waktu dan alasan keputusan
- Dokumentasi untuk compliance

**2. Security Monitoring**
- Deteksi aktivitas mencurigakan
- Monitor login dari IP tidak biasa
- Track failed login attempts

**3. Troubleshooting**
- Cari aktivitas sebelum error terjadi
- Identifikasi user yang report masalah
- Timeline kejadian untuk debugging

**4. Performance Analysis**
- Identifikasi jam sibuk sistem
- User paling aktif per periode
- Jenis aktivitas paling sering

**5. User Behavior Analysis**
- Pola penggunaan fitur
- Efektivitas workflow
- Training needs identification

#### 3.6.5 Best Practices

**Keamanan:**
- ✅ Review log secara berkala (minimal mingguan)
- ✅ Perhatikan aktivitas di luar jam kerja
- ✅ Investigate IP address yang tidak dikenal
- ✅ Monitor multiple failed login attempts

**Maintenance:**
- 📅 Export log lama ke archive (setiap 3 bulan)
- 🗑️ Hapus log yang sudah di-archive (setelah backup)
- 📊 Buat laporan analisis log bulanan

**Privacy:**
- 🔒 Jangan share log details ke pihak tidak berwenang
- 🔐 Log mengandung data sensitif (treat as confidential)
- 📝 Document policy akses log aktivitas

#### 3.6.6 Troubleshooting

| Masalah | Solusi |
|---------|--------|
| Log tidak muncul | Periksa filter tanggal, reset filter |
| Data tidak lengkap | Cek koneksi backend, refresh halaman |
| Export gagal | Reduce date range, atau kurangi limit |
| Statistik tidak akurat | Clear cache, reload page |

---

## BAB 4: PANDUAN UNTUK STAFF TIMBANGAN

### 4.1 Membuat Jadwal Loading

**Akses:** Dashboard → **Jadwal Pengambilan**

**Syarat:**
- PO harus sudah status "Approved"

**Langkah:**
1. Klik **"+ Buat Jadwal"**
2. Form jadwal:
   - **Pilih PO**: Dropdown PO approved
   - **Tanggal Loading**: Pilih tanggal
   - **Waktu Loading**: Format 24 jam (contoh: 08:00)
   - **Plat Nomor**: Input plat kendaraan (contoh: B1234XYZ)
   - **Nama Sopir**: Nama lengkap sopir
   - **Nomor HP Sopir**: Format: 08xxxxxxxxxx
3. Klik **"Simpan Jadwal"**
4. Sistem akan:
   - Generate nomor antrian otomatis
   - Create record timbangan
   - Kirim notifikasi ke buyer

### 4.2 Proses Weigh-In (Timbang Masuk)

**Akses:** Dashboard → **Timbangan** → Tab **"Weigh-In"**

**Kapan:** Saat truk kosong tiba di lokasi timbangan

**Langkah:**
1. Cari jadwal yang sudah tiba (filter by tanggal hari ini)
2. Klik **"Weigh-In"** pada jadwal
3. Form weigh-in:
   - **Plat Nomor**: Auto-filled dari jadwal
   - **Berat Masuk (kg)**: Input berat truk kosong
     - Contoh: 3250.5
   - **Catatan**: Kondisi kendaraan (opsional)
4. Klik **"Simpan Berat Masuk"**
5. Sistem akan:
   - Catat waktu masuk otomatis
   - Catat petugas (dari login user)
   - Update status → "Loading"

**Tips:**
- Pastikan timbangan sudah di-kalibrasi
- Catat berat dengan 1 desimal (contoh: 3250.5)
- Periksa plat nomor sesuai jadwal

### 4.3 Proses Weigh-Out (Timbang Keluar)

**Akses:** Dashboard → **Timbangan** → Tab **"Weigh-Out"**

**Kapan:** Saat truk sudah loaded (terisi TBS) siap keluar

**Langkah:**
1. Cari timbangan dengan status "Loading"
2. Klik **"Weigh-Out"**
3. Form weigh-out (lengkap):
   - **Berat Keluar (kg)**: Input berat truk loaded
     - Contoh: 18750.5
   - **Grade Aktual**: Pilih A/B/C (hasil inspeksi fisik)
   - **Kadar Air (%)**: Input hasil lab/estimasi
     - Range: 18-25%
   - **Kadar Sampah (%)**: Input hasil sortir
     - Range: 0-5%
   - **Tingkat Kematangan**: Pilih dropdown
     - "Mentah", "Setengah Matang", "Matang", "Matang Sempurna", "Lewat Matang"
   - **Catatan**: Observasi kualitas (opsional)

4. Preview otomatis:
   - **Berat Bersih** = Berat Keluar - Berat Masuk
   - Auto-calculated oleh sistem

5. Klik **"Simpan & Generate Dokumen"**

6. Sistem akan otomatis:
   - Hitung berat bersih
   - Generate 3 dokumen (SJ, Invoice, BT)
   - Update status PO → "Completed"
   - Simpan quality metrics
   - Catat waktu keluar & petugas

**Jika Grade Berbeda dari PO:**
- Sistem akan adjust harga otomatis
- Hitung penyesuaian harga
- Update total akhir di invoice

### 4.4 View Dokumen Timbangan

**Akses:** Dashboard → **Dokumen** atau **Timbangan** → **Detail**

**Dokumen yang Tersedia:**
1. **Bukti Timbang (BT)**
   - Berat masuk & keluar
   - Berat bersih
   - Quality metrics
   - Tanda tangan petugas

2. **Quality Report**
   - Grade aktual
   - Kadar air & sampah
   - Tingkat kematangan
   - Catatan observasi

3. **Surat Jalan (SJ)**
   - Data PO & buyer
   - Data kendaraan
   - Tanda tangan pengambilan

**Cara View/Download:**
1. Pilih timbangan yang sudah completed
2. Klik **"Lihat Dokumen"**
3. Dokumen ditampilkan di browser (preview PDF)
4. Klik **"Download"** untuk simpan file

---

## BAB 5: LAPORAN & DASHBOARD

### 5.1 Dashboard Overview

**KPI Cards (Metrics Utama):**

**Buyer Dashboard:**
- Total PO Saya
- PO Pending
- PO Completed
- Total Spending

**Admin Dashboard:**
- Total Stok TBS (kg)
- Total PO (all status)
- Pending Approval
- Total Revenue
- Active Buyers

**Staff Dashboard:**
- Today's Schedule
- Pending Weigh-In
- Pending Weigh-Out
- Completed Today

**Grafik:**
- Revenue Chart (7 hari terakhir)
- PO Status Distribution
- Stok by Grade

### 5.2 Laporan Penjualan

**Filter:**
- Date Range (Start - End)
- Grade (A/B/C/All)
- Kebun (All/Specific)
- Status PO

**Data Ditampilkan:**
- Total transaksi
- Total kg terjual
- Total revenue
- Average price/kg
- Daily breakdown

**Export:**
- Excel (.xlsx)
- PDF (formatted report)

### 5.3 Laporan Stok

**View:**
- Summary per Kebun
- Detail per Batch
- Histori stok

**Metrics:**
- Stok Available
- Stok Reserved
- Stok Sold Out
- Turnover rate

---

## BAB 6: TROUBLESHOOTING & FAQ

### 6.1 Lupa Password

**Langkah Reset Password:**
1. Di halaman login, klik **"Lupa Password"**
2. Masukkan email terdaftar
3. Klik **"Kirim Link Reset"**
4. Cek email inbox (atau spam folder)
5. Klik link reset password di email
6. Masukkan password baru (min 8 karakter)
7. Konfirmasi password baru
8. Klik **"Reset Password"**
9. Login dengan password baru

**Jika tidak menerima email:**
- Cek spam/junk folder
- Tunggu 5-10 menit
- Hubungi admin jika masih belum terima

### 6.2 Error Messages Umum

| Error | Penyebab | Solusi |
|-------|----------|--------|
| "Authorization header required" | Token expired/tidak ada | Logout, login ulang |
| "Invalid credentials" | Email/password salah | Periksa huruf besar/kecil, coba lagi |
| "Stok tidak mencukupi" | Jumlah order > stok | Kurangi jumlah order |
| "Access forbidden" | Role tidak sesuai | Gunakan akun dengan role yang tepat |
| "File too large" | Upload > 5MB | Compress file atau gunakan file lebih kecil |
| "Invalid token" | Session expired | Logout dan login ulang |

### 6.3 Browser Compatibility

**Browser yang Didukung:**
- ✅ Chrome 120+ (Recommended)
- ✅ Firefox 121+
- ✅ Microsoft Edge 120+
- ✅ Safari 17+ (macOS, iOS)

**Browser Tidak Didukung:**
- ❌ Internet Explorer (all versions)
- ❌ Chrome < 100
- ❌ Firefox < 100

**Troubleshooting Browser:**
- Clear cache: Ctrl+Shift+Del
- Disable extensions yang mengganggu
- Update browser ke versi terbaru
- Try incognito/private mode

### 6.4 Kontak Support

**Email:** support@sawit.company.com  
**Phone:** (021) 1234-5678  
**WhatsApp:** 0812-3456-7890  
**Jam Operasional:** Senin-Jumat, 08:00-17:00 WIB

**Untuk Bantuan Teknis:**
- Sertakan screenshot error
- Jelaskan langkah yang sudah dilakukan
- Cantumkan username/email akun

### 6.5 FAQ (Frequently Asked Questions)

**Umum:**

**Q: Apakah bisa akses dari mobile?**  
A: Ya, sistem responsive dan bisa diakses dari smartphone/tablet.

**Q: Apakah data aman?**  
A: Ya, sistem menggunakan HTTPS encryption dan JWT authentication.

**Q: Berapa lama session login?**  
A: Token aktif 72 jam. Setelah itu harus login ulang.

**Buyer:**

**Q: Berapa lama PO saya diproses?**  
A: Maksimal 24 jam kerja setelah submit.

**Q: Bisa ubah PO yang sudah disubmit?**  
A: Tidak bisa edit. Hanya bisa cancel jika masih status "Pending". Hubungi admin untuk perubahan.

**Q: Kapan bisa download dokumen?**  
A: Setelah PO status "Completed" (sudah ditimbang keluar).

**Q: Metode pembayaran apa saja?**  
A: Transfer Bank, Tunai, atau Termin (nego dengan admin).

**Admin:**

**Q: Bagaimana cara menambah user baru?**  
A: Menu Users → Add User → Isi form → Save. User akan dapat email notifikasi.

**Q: Bisa bulk import stok?**  
A: Saat ini belum ada fitur bulk import. Input manual satu per satu.

**Q: Bagaimana cara export laporan?**  
A: Buka Reports → Pilih jenis laporan → Set filter → Klik "Export" → Pilih format (Excel/PDF).

**Staff:**

**Q: Bagaimana jika berat timbangan error?**  
A: Kalibrasi ulang timbangan. Jika masih error, hubungi teknisi.

**Q: Bisa edit data weigh-in yang sudah disimpan?**  
A: Tidak bisa edit. Hubungi admin untuk koreksi data.

**Q: Berapa lama dokumen otomatis tergenerate?**  
A: Instant (< 2 detik) setelah weigh-out disimpan.

---

**END OF USER MANUAL**

**Versi:** 1.0  
**Last Updated:** Desember 2025  
**Document Owner:** Tim IT Sawit System  
**For Support:** support@sawit.company.com
