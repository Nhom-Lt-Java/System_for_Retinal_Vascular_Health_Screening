# AURA – System for Retinal Vascular Health Screening (SP26SE025)

## 1) Chạy nhanh bằng Docker Compose

Yêu cầu: **Docker + Docker Compose**.

```bash
cd ah
docker compose up -d --build
```

Sau khi lên container:
- Frontend (React): http://localhost:5173
- Backend (Spring Boot): http://localhost:8080
- AI Core (FastAPI): http://localhost:8000
- MinIO Console: http://localhost:9001 (user/pass: minioadmin / minioadmin123)
- PgAdmin: http://localhost:5050 (email/pass: admin@gmail.com / 123456)

DB Postgres:
- host: localhost
- port: 5432
- db: retinal_system
- user: postgres
- pass: 123456

## 2) Tài khoản demo

Backend có seeding admin + gói dịch vụ mẫu:
- **Admin**: `admin` / `admin123`

Bạn có thể tạo thêm:
- **Bệnh nhân (USER)**: đăng ký tab **Bệnh nhân**
- **Phòng khám (CLINIC)**: đăng ký tab **Phòng khám** (status mặc định `PENDING`)

Admin cần vào **Quản trị → Admin Dashboard** để **Approve** clinic.

## 3) Luồng demo theo FR/NFR

### 3.1 Payment demo (Mode 1 – ghi DB thật)
1. USER/CLINIC đăng nhập
2. Vào **Gói dịch vụ** → mua gói (ghi DB: `order_transactions`, `user_credit`)
3. Xem **Lịch sử thanh toán** ngay trong trang.

### 3.2 Upload & phân tích (async queue)
- USER: **Phân tích ảnh** → upload 1 ảnh → hệ thống tạo **job** (queue) và xử lý nền.
- CLINIC: **Bulk upload** → chọn ≥100 ảnh (có thể) → tạo nhiều job.

### 3.3 Kết quả + export PDF/CSV
- Vào **Result** của 1 analysis
- Export:
  - PDF: `/api/reports/pdf/{analysisId}`
  - CSV: `/api/reports/csv/{analysisId}`

### 3.4 Doctor review/validate
- Clinic tạo doctor trong **Bác sĩ**
- Clinic gán doctor cho patient trong **Bệnh nhân**
- Doctor đăng nhập → danh sách bệnh nhân → mở result → nhập kết luận/notes → **Duyệt**

### 3.5 Notifications + Chat
- Khi analysis hoàn tất hoặc fail: tạo notification trong DB
- Trang **Thông báo** đọc/đánh dấu đã đọc
- Chat patient–doctor: lưu DB (messages)

### 3.6 Admin modules
- Admin Dashboard: tổng quan hệ thống, clinic pending, audit logs
- AI settings: model_version + thresholds (lưu DB)
- Pricing: CRUD gói dịch vụ

## 4) Ghi chú kỹ thuật

- RBAC: ADMIN / CLINIC / DOCTOR / USER
- Tất cả dữ liệu lấy từ PostgreSQL (không mock)
- Bulk upload: async queue (table `analysis_jobs`) + scheduler worker
- Storage ảnh: MinIO (S3 compatible)

## 5) Google Login (FR-1)
Hệ thống hỗ trợ đăng nhập Google bằng **Google Identity Services ID token**.

Thiết lập biến môi trường (tùy chọn):
- Backend: `GOOGLE_CLIENT_ID`
- Frontend: `VITE_GOOGLE_CLIENT_ID`

Ví dụ (bash):
```bash
export GOOGLE_CLIENT_ID="YOUR_GOOGLE_OAUTH_CLIENT_ID"
export VITE_GOOGLE_CLIENT_ID="YOUR_GOOGLE_OAUTH_CLIENT_ID"
docker compose up -d --build
```

## 6) Tài liệu nộp đồ án
Xem thư mục `docs/`:
- `01_SRS.md`
- `02_Architecture.md`
- `03_Detail_Design_UML.md`
- `04_Test_Plan.md`
- `05_Installation_Guide.md`
- `06_User_Manual.md`

## 7) Backup dữ liệu (NFR-6)
```bash
./scripts/backup_postgres.sh
./scripts/restore_postgres.sh ./backups/retinal_system_YYYYMMDD_HHMMSS.sql
```

