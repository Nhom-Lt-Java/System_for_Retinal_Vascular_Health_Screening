# Installation Guide

## 1. Prerequisites
- Docker Desktop / Docker Engine
- Ports: 5173 (FE), 8080 (BE), 8000 (AI), 9000/9001 (MinIO), 5432 (Postgres)

## 2. Configure (optional)
### 2.1 Google Login
- Set env:
  - `GOOGLE_CLIENT_ID` (backend)
  - `VITE_GOOGLE_CLIENT_ID` (frontend)

Ví dụ (Windows PowerShell):
```powershell
$env:GOOGLE_CLIENT_ID="..."; $env:VITE_GOOGLE_CLIENT_ID="..."; docker compose up -d --build
```

### 2.2 Add AI model weights
Copy weights vào:
`ai-core/artifacts/models/`

Mặc định compose dùng:
- `disease_cls_rgb.pt`
- `b_unet.pt`

## 3. Run
```bash
docker compose down -v
docker compose up -d --build
```

## 4. Verify
- Frontend: http://localhost:5173
- Backend ping: http://localhost:8080/api/auth/ping
- AI health: http://localhost:8000/health

## 5. Seed demo data
Bạn có thể insert clinic/user mẫu bằng psql (xem README root).
