# 📂 Struktur Proyek - Sistem Informasi Perkebunan Kelapa Sawit

```
SistemInformasi/
│
├── 📄 README.md                    # Dokumentasi utama
├── 📄 QUICKSTART.md                # Panduan cepat setup
├── 📄 API_DOCUMENTATION.md         # API endpoints documentation
├── 📄 PROJECT_STRUCTURE.md         # File ini
│
├── 🚀 start-backend.bat            # Script untuk run backend
├── 🚀 start-frontend.bat           # Script untuk run frontend
├── 🚀 start-all.bat                # Script untuk run semua services
│
├── 🗄️ database/
│   └── schema.sql                  # Database schema + sample data
│
├── ⚙️ backend/                     # Backend Golang
│   ├── config/
│   │   ├── config.go               # App configuration
│   │   └── database.go             # Database connection
│   │
│   ├── controllers/
│   │   ├── auth_controller.go      # Login, register, profile
│   │   ├── stok_controller.go      # Stok TBS management
│   │   ├── po_controller.go        # Purchase order management
│   │   ├── timbang_controller.go   # Weighing process
│   │   └── pembayaran_controller.go # Payment management
│   │
│   ├── middleware/
│   │   ├── auth.go                 # JWT authentication
│   │   └── logger.go               # Request logging
│   │
│   ├── models/
│   │   └── models.go               # Data models & DTOs
│   │
│   ├── routes/
│   │   └── routes.go               # API routes configuration
│   │
│   ├── uploads/                    # Upload directory (auto-created)
│   │
│   ├── main.go                     # Entry point
│   ├── go.mod                      # Go dependencies
│   ├── .env                        # Environment variables
│   ├── .env.example                # Environment template
│   └── .gitignore                  # Git ignore rules
│
└── 🎨 frontend/                    # Frontend React.js
    ├── public/
    │
    ├── src/
    │   ├── components/
    │   │   ├── Navbar.jsx          # Navigation bar
    │   │   ├── Navbar.css
    │   │   └── ProtectedRoute.jsx  # Route protection
    │   │
    │   ├── context/
    │   │   └── AuthContext.jsx     # Authentication context
    │   │
    │   ├── pages/
    │   │   ├── Login.jsx           # Login page
    │   │   ├── Register.jsx        # Register page
    │   │   ├── Dashboard.jsx       # Dashboard
    │   │   ├── StokTBS.jsx         # Stok list page
    │   │   ├── CreateOrder.jsx     # Create PO page
    │   │   ├── MyOrders.jsx        # Buyer orders page
    │   │   ├── Auth.css            # Auth pages styling
    │   │   ├── Dashboard.css
    │   │   ├── StokTBS.css
    │   │   ├── CreateOrder.css
    │   │   └── MyOrders.css
    │   │
    │   ├── services/
    │   │   └── api.js              # API service & axios config
    │   │
    │   ├── styles/
    │   │   └── global.css          # Global CSS styles
    │   │
    │   ├── App.jsx                 # Main app component
    │   └── main.jsx                # Entry point
    │
    ├── index.html                  # HTML template
    ├── package.json                # NPM dependencies
    ├── vite.config.js              # Vite configuration
    ├── .env                        # Environment variables
    ├── .env.example                # Environment template
    └── .gitignore                  # Git ignore rules
```

---

## 📋 Penjelasan File Penting

### Backend

#### **main.go**
Entry point aplikasi backend. Menginisialisasi database, router, middleware, dan menjalankan server.

#### **config/database.go**
Konfigurasi koneksi database MySQL. Mengelola connection pool dan health check.

#### **config/config.go**
Load environment variables dan konfigurasi aplikasi.

#### **controllers/**
- `auth_controller.go` - Handle login, register, get/update profile
- `stok_controller.go` - CRUD stok TBS, filter, get kebun list
- `po_controller.go` - CRUD purchase order, approval, cancellation
- `timbang_controller.go` - Weigh-in, weigh-out, jadwal, dokumen
- `pembayaran_controller.go` - Payment, verification, reports

#### **middleware/auth.go**
- Generate JWT token
- Validate JWT token
- Check user role/permission

#### **models/models.go**
Definisi struct untuk semua entities:
- User, Kebun, StokTBS
- PurchaseOrder, JadwalPengambilan
- Timbangan, DokumenPenjualan
- Pembayaran, LogAktivitas
- Request/Response DTOs

#### **routes/routes.go**
Definisi semua API endpoints dengan middleware protection.

---

### Frontend

#### **src/main.jsx**
Entry point React app. Render App component ke DOM.

#### **src/App.jsx**
Main app component. Setup routing dengan React Router dan AuthProvider.

#### **src/context/AuthContext.jsx**
Global authentication state management:
- Login/logout functions
- User data storage
- Token management
- Authentication checks

#### **src/services/api.js**
Axios configuration dan API functions:
- Base URL setup
- Request/response interceptors
- JWT token injection
- All API endpoints

#### **src/components/**
- `Navbar.jsx` - Top navigation bar dengan user info
- `ProtectedRoute.jsx` - Route wrapper untuk authentication check

#### **src/pages/**
- `Login.jsx` - Login form
- `Register.jsx` - Registration form
- `Dashboard.jsx` - Dashboard dengan statistik
- `StokTBS.jsx` - List stok dengan filter
- `CreateOrder.jsx` - Form create purchase order
- `MyOrders.jsx` - Buyer's order list

#### **src/styles/global.css**
Global CSS dengan:
- CSS variables (colors, spacing)
- Utility classes
- Responsive utilities
- Component base styles

---

## 🔄 Flow Data

### 1. User Authentication Flow
```
Login Page → AuthContext → API Service → Backend Auth Controller
  ↓
JWT Token → localStorage → Header Injection → Protected Routes
```

### 2. Create Purchase Order Flow
```
Stok List → Select Stok → Create Order Form
  ↓
POST /purchase-orders → Backend validation
  ↓
Reserve Stock → Create PO → Return PO Number
  ↓
Redirect to My Orders
```

### 3. Admin Approval Flow
```
Manage Orders Page → View Pending PO
  ↓
Approve/Reject → PUT /purchase-orders/{id}/status
  ↓
Update Stock Status → Trigger notification
  ↓
Create Schedule → Generate Queue Number
```

### 4. Weighing Process Flow
```
Jadwal Pengambilan → Truck Arrival
  ↓
Weigh-In (Empty truck) → POST /timbangan/{id}/weigh-in
  ↓
Loading Process → Quality Check
  ↓
Weigh-Out (Full truck) → POST /timbangan/{id}/weigh-out
  ↓
Calculate Net Weight → Generate Documents
  ↓
Create Invoice, Surat Jalan, Bukti Timbang
```

---

## 🎯 Key Features per File

### Backend Controllers

| Controller | Endpoints | Features |
|------------|-----------|----------|
| **auth_controller.go** | 4 endpoints | Register, Login, Get/Update Profile |
| **stok_controller.go** | 5 endpoints | List, Detail, Create, Update Stok, Get Kebun |
| **po_controller.go** | 5 endpoints | List, Detail, Create, Update Status, Cancel PO |
| **timbang_controller.go** | 6 endpoints | Weigh-in, Weigh-out, Jadwal, Dokumen, Timbangan List |
| **pembayaran_controller.go** | 4 endpoints | Create, List, Verify Payment, Reports |

### Frontend Pages

| Page | Route | Role | Features |
|------|-------|------|----------|
| **Login** | `/login` | Public | Email/password login |
| **Register** | `/register` | Public | New buyer registration |
| **Dashboard** | `/dashboard` | All | Statistics, quick links |
| **StokTBS** | `/stok` | All | List, filter, buy button |
| **CreateOrder** | `/create-order` | Buyer | Order form, price calculation |
| **MyOrders** | `/my-orders` | Buyer | Order list, status, cancel |

---

## 🔐 Security Features

1. **Password Hashing** - bcrypt dengan salt
2. **JWT Token** - Expire 72 jam
3. **Role-based Access** - Admin, Staff, Buyer
4. **SQL Injection Protection** - Prepared statements
5. **CORS** - Configured for localhost
6. **Audit Trail** - Log semua aktivitas
7. **Input Validation** - Server & client side

---

## 📱 Responsive Design

### Breakpoints
- **Mobile**: < 480px
- **Tablet**: 480px - 768px
- **Desktop**: > 768px

### Responsive Components
- Navigation → Hamburger menu di mobile
- Tables → Scroll horizontal di mobile
- Grids → Stack menjadi 1 kolom di mobile
- Forms → Full width di mobile
- Buttons → Full width di mobile

---

## 🛠️ Development Tools

### Backend
- Go 1.21+
- Gin Framework
- MySQL Driver
- JWT Library
- bcrypt

### Frontend
- React 18
- React Router 6
- Axios
- Vite (Build tool)

### Database
- MySQL 8.0+
- phpMyAdmin (via XAMPP)

---

## 📊 Database Schema

11 tabel utama:
1. **users** - Authentication & user info
2. **kebun** - Plantation data
3. **stok_tbs** - TBS stock with grades
4. **purchase_orders** - Buyer orders
5. **jadwal_pengambilan** - Loading schedule
6. **timbangan** - Weighbridge records
7. **dokumen_penjualan** - Sales documents
8. **pembayaran** - Payment records
9. **log_aktivitas** - Audit trail
10. **v_stok_summary** - View: Stock summary
11. **v_po_summary** - View: PO summary

---

## 🚀 Deployment

### Backend Build
```powershell
cd backend
go build -o sawit-server.exe main.go
```

### Frontend Build
```powershell
cd frontend
npm run build
# Output: dist/
```

### Production
- Backend: Run executable `sawit-server.exe`
- Frontend: Serve `dist/` folder dengan web server
- Database: MySQL production server

---

**File ini memberikan overview lengkap struktur proyek untuk memudahkan development dan maintenance.**
