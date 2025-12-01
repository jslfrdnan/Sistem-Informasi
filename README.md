# 🌴 Sistem Informasi Perkebunan Kelapa Sawit

Platform digital untuk mengelola pembelian dan penjualan TBS (Tandan Buah Segar) dari perkebunan kelapa sawit.

## 📋 Deskripsi

Sistem ini mengimplementasikan alur kerja lengkap pembeli (buyer) dalam membeli kelapa sawit, mulai dari:
1. **Login/Registrasi** - Autentikasi pengguna
2. **Melihat Stok TBS** - Cek ketersediaan, kualitas, dan harga
3. **Membuat Purchase Order** - Ajukan pembelian
4. **Verifikasi Admin** - Approval dari admin kebun
5. **Jadwal Pengambilan** - Scheduling dan nomor antrian
6. **Timbang Masuk/Keluar** - Weighbridge system
7. **Dokumen Penjualan** - Invoice, surat jalan, bukti timbang
8. **Pembayaran** - Tunai, transfer, atau termin
9. **Laporan** - Sales report dan analytics

## 🛠️ Teknologi

### Backend
- **Golang** - Programming language
- **Gin Framework** - Web framework
- **MySQL** - Database
- **JWT** - Authentication
- **bcrypt** - Password hashing

### Frontend
- **React.js** - UI library
- **React Router** - Navigation
- **Axios** - HTTP client
- **Vite** - Build tool

## 📁 Struktur Proyek

```
SistemInformasi/
├── backend/
│   ├── config/          # Database & app configuration
│   ├── controllers/     # Request handlers
│   ├── middleware/      # Auth & logging middleware
│   ├── models/          # Data models & DTOs
│   ├── routes/          # API routes
│   ├── main.go          # Entry point
│   ├── go.mod           # Go dependencies
│   └── .env             # Environment variables
├── frontend/
│   ├── src/
│   │   ├── components/  # Reusable components
│   │   ├── context/     # React context (Auth)
│   │   ├── pages/       # Page components
│   │   ├── services/    # API services
│   │   ├── styles/      # CSS files
│   │   ├── App.jsx      # Main app component
│   │   └── main.jsx     # Entry point
│   ├── index.html       # HTML template
│   ├── package.json     # NPM dependencies
│   └── vite.config.js   # Vite configuration
└── database/
    └── schema.sql       # Database schema & sample data
```

## 🚀 Cara Setup dan Menjalankan

### Prerequisites

Pastikan sudah terinstall:
- **Go** (v1.21+) - [Download](https://golang.org/dl/)
- **Node.js** (v18+) - [Download](https://nodejs.org/)
- **XAMPP** - [Download](https://www.apachefriends.org/)
- **Git** (opsional)

### 1️⃣ Setup Database

1. **Jalankan XAMPP** dan aktifkan **MySQL**

2. **Buka phpMyAdmin** di browser: `http://localhost/phpmyadmin`

3. **Import Database Schema**:
   - Klik tab "SQL"
   - Copy paste isi file `database/schema.sql`
   - Klik "Go" untuk execute

   Atau via command line:
   ```powershell
   cd "d:\Tugas Semester 3\Sistem Informasi\Project\SistemInformasi\database"
   mysql -u root -p < schema.sql
   ```

4. **Verifikasi**:
   - Database `sawit_db` sudah terbuat
   - Terdapat sample data (admin, buyer, kebun, stok)

### 2️⃣ Setup Backend (Golang)

1. **Masuk ke folder backend**:
   ```powershell
   cd "d:\Tugas Semester 3\Sistem Informasi\Project\SistemInformasi\backend"
   ```

2. **Install dependencies**:
   ```powershell
   go mod download
   ```

3. **Konfigurasi environment** (file `.env` sudah ada):
   ```env
   DB_HOST=localhost
   DB_PORT=3306
   DB_USER=root
   DB_PASSWORD=
   DB_NAME=sawit_db
   
   SERVER_PORT=8080
   JWT_SECRET=sawit-secret-key-2025-change-in-production
   ```

4. **Jalankan backend server**:
   ```powershell
   go run main.go
   ```

   Server akan berjalan di: `http://localhost:8080`

### 3️⃣ Setup Frontend (React.js)

1. **Buka terminal baru**, masuk ke folder frontend:
   ```powershell
   cd "d:\Tugas Semester 3\Sistem Informasi\Project\SistemInformasi\frontend"
   ```

2. **Install dependencies**:
   ```powershell
   npm install
   ```

3. **Jalankan development server**:
   ```powershell
   npm run dev
   ```

   Frontend akan berjalan di: `http://localhost:3000`

4. **Buka browser** dan akses `http://localhost:3000`

## 👤 Akun Demo

### Admin/Staff
- **Email**: `admin@sawit.com`
- **Password**: `admin123`
- **Role**: Admin

### Buyer 1
- **Email**: `buyer1@company.com`
- **Password**: `buyer123`
- **Perusahaan**: PT CPO Indonesia

### Buyer 2
- **Email**: `buyer2@company.com`
- **Password**: `buyer123`
- **Perusahaan**: CV Minyak Sawit

## 📱 Fitur Utama

### Untuk Buyer (Pembeli)
✅ Registrasi dan login  
✅ Melihat stok TBS yang tersedia  
✅ Filter stok berdasarkan grade dan kebun  
✅ Membuat purchase order  
✅ Melihat status pesanan  
✅ Membatalkan pesanan  
✅ **Membuat pembayaran** (tunai/transfer/termin)  
✅ **Melihat dokumen penjualan**  
✅ Dashboard dengan statistik pembelian

### Untuk Admin
✅ **Kelola stok TBS** (Create/Update/Delete)  
✅ Approval/reject purchase order  
✅ **Membuat jadwal pengambilan**  
✅ Generate dokumen penjualan otomatis  
✅ **Verifikasi pembayaran**  
✅ Laporan penjualan harian  
✅ Dashboard analytics  
✅ Full access ke semua fitur

### Untuk Staff
✅ View purchase orders  
✅ **Membuat jadwal pengambilan**  
✅ **Timbang masuk** (weigh-in) - Exclusive  
✅ **Timbang keluar** (weigh-out) - Exclusive  
✅ **Verifikasi pembayaran**  
✅ **View dokumen penjualan**  
✅ Laporan penjualan

## 🔌 API Endpoints

### Authentication
```
POST   /api/auth/register     - Register buyer baru
POST   /api/auth/login        - Login
GET    /api/profile           - Get user profile
PUT    /api/profile           - Update profile
```

### Stok TBS
```
GET    /api/stok              - List stok (dengan filter)
GET    /api/stok/:id          - Detail stok
POST   /api/stok              - Create stok (admin)
PUT    /api/stok/:id          - Update stok (admin)
```

### Purchase Orders
```
GET    /api/purchase-orders           - List PO
GET    /api/purchase-orders/:id       - Detail PO
POST   /api/purchase-orders           - Create PO (buyer)
PUT    /api/purchase-orders/:id/status - Update status (admin)
DELETE /api/purchase-orders/:id       - Cancel PO
```

### Timbangan
```
GET    /api/timbangan                 - List timbangan
POST   /api/timbangan/:id/weigh-in    - Timbang masuk (staff)
POST   /api/timbangan/:id/weigh-out   - Timbang keluar (staff)
```

### Jadwal & Dokumen
```
GET    /api/jadwal            - List jadwal pengambilan
POST   /api/jadwal            - Create jadwal (admin)
GET    /api/dokumen           - List dokumen penjualan
```

### Pembayaran
```
GET    /api/pembayaran               - List pembayaran
POST   /api/pembayaran               - Create pembayaran (buyer)
PUT    /api/pembayaran/:id/verify    - Verify pembayaran (admin)
```

### Reports
```
GET    /api/reports/daily-sales      - Laporan penjualan harian
GET    /api/reports/dashboard        - Dashboard statistics
```

## 🎨 Tampilan Responsif

Website ini **fully responsive** dan dapat diakses dari:
- 💻 **Desktop** (1920x1080, 1366x768, dll)
- 📱 **Tablet** (768x1024, iPad, dll)
- 📱 **Mobile** (iPhone, Android, 360x640 - 414x896)

## 🗄️ Database Schema

Database terdiri dari 11 tabel utama:
- `users` - Data pengguna (buyer, admin, staff)
- `kebun` - Data perkebunan
- `stok_tbs` - Stok TBS dengan grade dan harga
- `purchase_orders` - Pesanan pembelian
- `jadwal_pengambilan` - Jadwal loading
- `timbangan` - Data timbangan masuk/keluar
- `dokumen_penjualan` - Invoice, surat jalan, dll
- `pembayaran` - Data pembayaran
- `log_aktivitas` - Audit trail

## 🔒 Keamanan

- ✅ Password di-hash menggunakan **bcrypt**
- ✅ JWT authentication untuk API
- ✅ Role-based access control (RBAC)
- ✅ SQL injection protection (prepared statements)
- ✅ CORS configuration
- ✅ Audit logging

## 🐛 Troubleshooting

### Backend tidak bisa connect ke database
```
Error: Error connecting to database
```
**Solusi**: 
- Pastikan MySQL di XAMPP sudah running
- Check username/password di file `.env`
- Pastikan database `sawit_db` sudah dibuat

### Port 8080 sudah digunakan
```
Error: bind: address already in use
```
**Solusi**: 
- Ubah `SERVER_PORT` di `.env` backend menjadi port lain (misal 8081)
- Ubah juga di `frontend/vite.config.js` pada bagian proxy target

### Frontend tidak bisa hit API
```
Error: Network Error
```
**Solusi**:
- Pastikan backend sudah running di port 8080
- Check CORS settings di backend
- Check proxy config di `vite.config.js`

### Go dependencies error
```
Error: cannot find module
```
**Solusi**:
```powershell
go mod tidy
go mod download
```

## 📝 Development

### Build untuk Production

**Backend**:
```powershell
cd backend
go build -o sawit-server.exe main.go
```

**Frontend**:
```powershell
cd frontend
npm run build
```
Output ada di folder `dist/`

### Run Production Build

**Backend**:
```powershell
./sawit-server.exe
```

**Frontend** (serve static files):
```powershell
npm run preview
```

## 📞 Support

Jika ada pertanyaan atau masalah, silakan:
1. Check dokumentasi ini
2. Review kode di folder masing-masing
3. Check error message di console/terminal

## 📄 License

Project ini dibuat untuk keperluan tugas kuliah Sistem Informasi.

---

**Dibuat dengan ❤️ menggunakan Golang & React.js**
