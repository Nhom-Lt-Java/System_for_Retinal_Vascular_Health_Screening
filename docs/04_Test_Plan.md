# Test Plan & Test Cases

## 1. Scope
Kiểm thử tập trung vào:
- RBAC (USER/DOCTOR/CLINIC/ADMIN)
- Upload single/multi + queue worker
- Kết quả AI + risk/advice
- Xuất report PDF/CSV
- Chat + notifications
- Admin manage users/packages/settings/templates

## 2. Environment
- Local docker compose
- PostgreSQL + MinIO + Backend + AI-core + Frontend

## 3. Smoke Test Checklist (Manual)
1) **Auth**
   - POST /api/auth/login → 200
   - POST /api/auth/google (nếu cấu hình GOOGLE_CLIENT_ID) → 200
2) **User Upload**
   - POST /api/analyses (single) → QUEUED
   - POST /api/analyses/bulk (multi) → list of analyses
3) **Worker**
   - Status chuyển QUEUED→RUNNING→COMPLETED
4) **RBAC**
   - User không xem được analysis của user khác (403)
   - Doctor chỉ xem bệnh nhân assigned (403 nếu không assigned)
5) **Report**
   - GET /api/reports/{analysisId}.pdf
   - GET /api/reports/{analysisId}.csv

## 4. Sample API Test Commands
> Dùng token đã login.

```bash
curl -H "Authorization: Bearer $TOKEN" http://localhost:8080/api/profile/me
```

## 5. Acceptance Criteria
- Không có lộ dữ liệu giữa các role
- FE không lỗi compile/run
- Bulk upload hoạt động
- Reports tải được