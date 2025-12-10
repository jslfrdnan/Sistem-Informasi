# FAQ - FREQUENTLY ASKED QUESTIONS
## Sistem Informasi Penjualan TBS Kelapa Sawit

**Versi 1.0 | Desember 2025**

---

## 📋 DAFTAR ISI

1. [Umum](#umum)
2. [Akses & Login](#akses--login)
3. [Buyer](#buyer)
4. [Admin](#admin)
5. [Staff Timbangan](#staff-timbangan)
6. [Teknis](#teknis)
7. [Keamanan](#keamanan)
8. [Troubleshooting](#troubleshooting)

---

## UMUM

### Q1: Apa itu Sistem Informasi Sawit?
**A:** Sistem berbasis web untuk mengelola proses penjualan TBS (Tandan Buah Segar) kelapa sawit, mulai dari manajemen stok, pemesanan, penimbangan, hingga pembayaran secara terintegrasi.

### Q2: Siapa saja yang bisa menggunakan sistem ini?
**A:** Sistem memiliki 4 role pengguna:
- **Buyer** - Pembeli TBS (perusahaan CPO)
- **Admin** - Pengelola sistem (approve PO, verifikasi pembayaran)
- **Staff** - Operator timbangan dan jadwal
- **Security** - Monitoring kendaraan (view-only)

### Q3: Apakah sistem bisa diakses dari mobile?
**A:** Ya, sistem responsive dan bisa diakses dari:
- Smartphone (Android/iOS)
- Tablet (iPad/Android)
- Desktop/Laptop

### Q4: Browser apa yang didukung?
**A:** Browser yang direkomendasikan:
- ✅ Chrome 120+ (Recommended)
- ✅ Firefox 121+
- ✅ Microsoft Edge 120+
- ✅ Safari 17+ (macOS/iOS)
- ❌ Internet Explorer (tidak didukung)

### Q5: Apakah data saya aman?
**A:** Ya, sistem menggunakan:
- HTTPS encryption untuk semua komunikasi
- JWT authentication untuk keamanan session
- Bcrypt untuk enkripsi password
- Role-based access control (RBAC)
- Audit trail untuk semua aktivitas

### Q6: Apakah ada biaya berlangganan?
**A:** Hubungi tim sales untuk informasi pricing dan paket berlangganan.

### Q7: Bagaimana cara mendapatkan pelatihan?
**A:** Tim kami menyediakan:
- Training session saat onboarding
- User manual lengkap
- Video tutorial
- Technical support via email/phone

---

## AKSES & LOGIN

### Q8: Bagaimana cara mendaftar/registrasi?
**A:** 
- **Buyer:** Bisa registrasi sendiri di halaman Register
- **Admin/Staff:** Didaftarkan oleh super admin perusahaan
- Isi form lengkap → Submit → Login dengan credentials yang dibuat

### Q9: Bagaimana cara login?
**A:** 
1. Akses URL sistem (contoh: http://sawit.company.com)
2. Masukkan Email dan Password
3. Klik "Login"
4. Sistem akan redirect ke Dashboard sesuai role Anda

### Q10: Lupa password, bagaimana cara reset?
**A:** 
1. Di halaman login, klik **"Lupa Password"**
2. Masukkan email terdaftar
3. Klik "Kirim Link Reset"
4. Cek email inbox (atau spam folder)
5. Klik link reset password
6. Masukkan password baru
7. Login dengan password baru

### Q11: Tidak menerima email reset password?
**A:** 
- Cek folder Spam/Junk
- Tunggu 5-10 menit
- Pastikan email yang diinput sudah terdaftar
- Jika masih belum terima, hubungi admin

### Q12: Berapa lama session login aktif?
**A:** JWT token aktif selama **72 jam** (3 hari). Setelah itu harus login ulang.

### Q13: Bisa login dari multiple device sekaligus?
**A:** Ya, bisa login dari beberapa device. Token independent per device.

### Q14: Bagaimana cara logout?
**A:** Klik **User Profile** (pojok kanan atas) → Pilih **"Logout"**

---

## BUYER

### Q15: Berapa lama PO saya diproses setelah submit?
**A:** Admin akan review dan approve/reject PO dalam **maksimal 24 jam kerja** (Senin-Jumat).

### Q16: Bagaimana cara mengubah PO yang sudah disubmit?
**A:** 
- PO yang sudah disubmit **tidak bisa diedit**
- Jika masih status "Pending", bisa **cancel** lalu buat PO baru
- Jika sudah "Approved", hubungi admin untuk perubahan
- PO yang "Completed" tidak bisa diubah sama sekali

### Q17: Bisa cancel PO yang sudah approved?
**A:** Tidak bisa. PO yang sudah approved tidak bisa dicancel karena stok sudah di-reserve. Hubungi admin jika urgent.

### Q18: Kapan saya bisa download dokumen (Invoice, Surat Jalan)?
**A:** Setelah PO status **"Completed"** (sudah melalui proses timbangan keluar). Dokumen auto-generate setelah weigh-out.

### Q19: Format apa saja dokumen yang bisa didownload?
**A:** Semua dokumen dalam format **PDF**:
- Surat Jalan (SJ)
- Invoice (INV)
- Bukti Timbang (BT)

### Q20: Metode pembayaran apa saja yang tersedia?
**A:** 
- **Transfer Bank** (paling umum)
- **Tunai** (bayar di lokasi)
- **Termin** (cicilan, perlu approval khusus dari admin)

### Q21: Kapan saya harus upload bukti pembayaran?
**A:** Segera setelah PO status "Completed" dan Anda sudah melakukan pembayaran. Admin akan verifikasi dalam 1-2 hari kerja.

### Q22: File apa yang bisa diupload sebagai bukti transfer?
**A:** 
- Format: **JPG** atau **PNG**
- Ukuran maksimal: **5 MB**
- Pastikan foto/scan jelas dan terbaca

### Q23: Bagaimana jika bukti pembayaran saya ditolak?
**A:** 
- Admin akan memberikan alasan penolakan
- Upload ulang bukti yang valid
- Pastikan jumlah transfer sesuai invoice

### Q24: Bisa lihat histori pembelian saya?
**A:** Ya, di menu **"Pesanan Saya"** Anda bisa lihat semua PO (pending, completed, cancelled) dengan filter tanggal.

### Q25: Bagaimana cara filter stok yang available?
**A:** 
- Gunakan filter **Grade** (A/B/C)
- Filter **Kebun** (pilih lokasi tertentu)
- Search bar untuk cari kata kunci
- Hanya stok dengan status "Available" yang bisa di-order

---

## ADMIN

### Q26: Bagaimana cara menambah user baru?
**A:** 
1. Menu **Users** → **Add User**
2. Isi form (username, email, password, role)
3. Klik **"Save"**
4. User akan menerima email notifikasi

### Q27: Bagaimana cara approve/reject PO?
**A:** 
1. Menu **Manage Orders** → Filter "Pending"
2. Klik **"Detail"** pada PO
3. Review data (stok, buyer, jumlah)
4. Klik **"Approve"** atau **"Reject"**
5. Isi catatan (wajib untuk reject)
6. Konfirmasi

### Q28: Apa yang terjadi setelah PO di-approve?
**A:** 
- Stok TBS otomatis berkurang (jumlah_tersedia - jumlah_order)
- Status PO berubah ke "Approved"
- Buyer menerima notifikasi
- Staff bisa membuat jadwal loading

### Q29: Bagaimana cara verifikasi pembayaran?
**A:** 
1. Menu **Pembayaran** → Tab "Pending Verification"
2. Klik **"Detail"** untuk lihat bukti transfer
3. Cek jumlah, tanggal, dan kejelasan bukti
4. Klik **"Verify"** jika valid, atau **"Reject"** jika tidak valid
5. Isi catatan verifikasi

### Q30: Bagaimana cara export laporan?
**A:** 
1. Menu **Reports**
2. Pilih jenis laporan (Penjualan, Stok, Pembayaran)
3. Set filter (tanggal, kategori, dll)
4. Klik **"Generate"**
5. Review preview
6. Klik **"Export"** → Pilih format:
   - **Excel** (.xlsx) - untuk data processing
   - **PDF** - untuk print/share

### Q31: Bisa bulk update harga stok?
**A:** Ya:
1. Menu **Manage Stok**
2. Pilih checkbox pada multiple stok
3. Klik **"Bulk Update"**
4. Masukkan harga baru
5. Konfirmasi

### Q32: Bagaimana cara deactivate user?
**A:** 
1. Menu **Users**
2. Cari user yang ingin di-deactivate
3. Klik **"Edit"**
4. Ubah Status ke "Inactive"
5. User tidak bisa login lagi sampai di-activate kembali

### Q33: Bisa lihat log aktivitas user?
**A:** Ya, di menu **Log Aktivitas** atau **Audit Trail** (jika ada). Menampilkan semua aktivitas penting (login, approve PO, verifikasi pembayaran, dll).

---

## STAFF TIMBANGAN

### Q34: Bagaimana cara membuat jadwal loading?
**A:** 
1. Menu **Jadwal Pengambilan** → **"+ Buat Jadwal"**
2. Pilih PO yang sudah "Approved"
3. Isi: tanggal, waktu, plat nomor, nama sopir, HP sopir
4. Klik **"Simpan"**
5. Nomor antrian auto-generate

### Q35: Kapan saya bisa melakukan weigh-in?
**A:** Setelah:
- Jadwal loading sudah dibuat
- Truk kosong sudah tiba di lokasi timbangan
- Status jadwal "Scheduled"

### Q36: Bagaimana jika saya salah input berat timbangan?
**A:** 
- Data weigh-in/weigh-out **tidak bisa diedit** setelah disimpan
- Hubungi admin untuk koreksi data di database
- Pastikan double-check sebelum klik "Simpan"

### Q37: Apa yang terjadi setelah weigh-out?
**A:** Sistem otomatis:
- Hitung berat bersih (keluar - masuk)
- Generate 3 dokumen (Surat Jalan, Invoice, Bukti Timbang)
- Update status PO ke "Completed"
- Kirim notifikasi ke buyer

### Q38: Bagaimana jika grade aktual berbeda dari PO?
**A:** 
- Input grade aktual saat weigh-out
- Sistem akan **auto-adjust harga** berdasarkan grade aktual
- Hitung penyesuaian harga (adjustment)
- Update total akhir di invoice

### Q39: Berapa lama dokumen tergenerate?
**A:** **Instant** (< 2 detik) setelah weigh-out disimpan.

### Q40: Bisa reprint dokumen yang sudah tergenerate?
**A:** Ya, bisa download/print ulang kapan saja dari menu **Dokumen** atau detail PO.

### Q41: Apa itu kadar air dan kadar sampah?
**A:** 
- **Kadar Air**: Persentase kandungan air di TBS (normal: 18-25%)
- **Kadar Sampah**: Persentase kotoran/sampah (normal: < 5%)
- Kedua faktor ini mempengaruhi kualitas dan harga

### Q42: Bagaimana cara input quality metrics?
**A:** Saat weigh-out, ada form untuk input:
- Grade aktual (A/B/C)
- Kadar air (%)
- Kadar sampah (%)
- Tingkat kematangan (dropdown)
- Catatan observasi (opsional)

---

## TEKNIS

### Q43: Apa itu JWT token?
**A:** JSON Web Token - authentication method yang digunakan sistem untuk verifikasi identitas user. Token ini di-generate saat login dan di-attach di setiap request ke server.

### Q44: Kenapa saya sering diminta login ulang?
**A:** 
- Token expired (max 72 jam)
- Browser cache cleared
- Logout dari device lain dengan "logout all"
- Session interrupted

### Q45: Apa itu RBAC?
**A:** Role-Based Access Control - sistem keamanan yang membatasi akses fitur berdasarkan role user (Buyer, Admin, Staff, Security).

### Q46: Bisa akses API secara langsung?
**A:** API tersedia di `http://server:8080/api/...` namun butuh authentication (JWT token). Lihat dokumentasi API untuk detail endpoint.

### Q47: Bagaimana cara menggunakan Postman untuk testing?
**A:** 
1. Import file `Sawit_API.postman_collection.json`
2. Set environment variable `base_url`
3. Login via endpoint `/api/auth/login`
4. Token akan auto-save
5. Test endpoint lain (sudah include Bearer token)

### Q48: Database apa yang digunakan?
**A:** MySQL 8.0+ dengan:
- 10 tables
- Relational design (3NF normalized)
- Triggers untuk auto-calculation
- Indexes untuk performa

### Q49: Backend menggunakan bahasa apa?
**A:** 
- **Backend**: Golang (Go 1.21+) dengan Gin framework
- **Frontend**: React 18 dengan Vite
- **Database**: MySQL 8.0+

### Q50: Apakah ada API rate limiting?
**A:** Saat ini belum implement rate limiting. Planned untuk future update.

---

## KEAMANAN

### Q51: Bagaimana password saya disimpan?
**A:** Password di-hash menggunakan **bcrypt** dengan cost factor 10. Password plain text tidak pernah disimpan di database.

### Q52: Apakah komunikasi terenkripsi?
**A:** Ya, sistem menggunakan **HTTPS** (TLS/SSL) untuk encrypt semua komunikasi antara browser dan server.

### Q53: Siapa saja yang bisa lihat data saya?
**A:** 
- **Buyer**: Hanya bisa lihat data sendiri
- **Admin**: Bisa lihat semua data
- **Staff**: Bisa lihat data operasional (timbangan, jadwal)
- **Security**: View-only monitoring

### Q54: Apakah ada audit trail?
**A:** Ya, semua aktivitas penting dicatat di tabel `log_aktivitas`:
- Login/logout
- Create/update/delete PO
- Approve/reject
- Verifikasi pembayaran
- Weigh-in/weigh-out

### Q55: Bagaimana jika akun saya di-hack?
**A:** 
1. Segera hubungi admin via phone
2. Admin akan deactivate akun
3. Reset password
4. Review log aktivitas untuk cek aktivitas mencurigakan
5. Reactive akun dengan password baru

### Q56: Apakah sistem backup data?
**A:** Ya, automated backup:
- **Daily backup** database (2 AM)
- Retention: 30 hari
- Backup disimpan di secure storage

---

## TROUBLESHOOTING

### Q57: Error "Authorization header required"
**A:** 
- Token expired atau tidak ada
- **Solusi**: Logout, clear cache, login ulang

### Q58: Error "Invalid credentials"
**A:** 
- Email atau password salah
- **Solusi**: 
  - Periksa huruf besar/kecil (case-sensitive)
  - Coba reset password jika lupa
  - Pastikan akun sudah terdaftar

### Q59: Error "Stok tidak mencukupi"
**A:** 
- Jumlah order melebihi stok tersedia
- **Solusi**: Kurangi jumlah order atau pilih stok lain

### Q60: Error "Access forbidden" (403)
**A:** 
- Role Anda tidak punya akses ke endpoint tersebut
- **Solusi**: Gunakan akun dengan role yang sesuai

### Q61: Upload file gagal "File too large"
**A:** 
- File > 5 MB
- **Solusi**: 
  - Compress gambar
  - Resize image
  - Gunakan file lebih kecil

### Q62: Halaman loading terus-menerus
**A:** 
- **Solusi**:
  - Periksa koneksi internet
  - Refresh halaman (F5 atau Ctrl+R)
  - Clear browser cache (Ctrl+Shift+Del)
  - Coba browser lain
  - Restart browser

### Q63: Gambar/file tidak bisa didownload
**A:** 
- **Solusi**:
  - Periksa koneksi internet
  - Disable browser extensions (AdBlock, dll)
  - Try incognito mode
  - Hubungi support jika persisten

### Q64: Dashboard tidak menampilkan data
**A:** 
- **Solusi**:
  - Refresh halaman
  - Logout dan login ulang
  - Clear cache
  - Cek apakah ada error di browser console (F12)

### Q65: Notifikasi tidak muncul
**A:** 
- Browser notification mungkin di-block
- **Solusi**: 
  - Allow notification di browser settings
  - Check email untuk notifikasi alternatif

### Q66: Print dokumen hasil tidak bagus
**A:** 
- **Solusi**:
  - Download PDF terlebih dahulu
  - Print dari PDF reader (Adobe, Chrome PDF viewer)
  - Adjust print settings (portrait/landscape, margins)

### Q67: Grafik/chart tidak muncul
**A:** 
- JavaScript error atau ad-blocker
- **Solusi**:
  - Disable ad-blocker
  - Try incognito mode
  - Update browser ke versi terbaru

### Q68: Session expired terus-menerus
**A:** 
- **Solusi**:
  - Jangan tutup browser tab
  - Jangan clear cookies manual
  - Periksa system clock (harus akurat)

---

## KONTAK & SUPPORT

### 📞 Hotline Support
**Phone:** (021) 1234-5678  
**WhatsApp:** 0812-3456-7890  
**Email:** support@sawit.company.com

### ⏰ Jam Operasional
Senin - Jumat: 08:00 - 17:00 WIB  
Sabtu: 08:00 - 12:00 WIB  
Minggu & Libur: Closed

### 📧 Email Support
Untuk bantuan teknis, sertakan:
- Screenshot error (jika ada)
- Langkah yang sudah dilakukan
- Username/email akun
- Browser dan versi yang digunakan

### 🚀 Feature Request
Punya ide fitur baru? Kirim ke: feature-request@sawit.company.com

### 🐛 Bug Report
Menemukan bug? Laporkan ke: bugs@sawit.company.com dengan detail:
- Langkah reproduce bug
- Expected behavior vs Actual behavior
- Screenshot/video (jika mungkin)

---

**END OF FAQ**

**Last Updated:** Desember 2025  
**Version:** 1.0  
**Maintained by:** Tim Support Sawit System
