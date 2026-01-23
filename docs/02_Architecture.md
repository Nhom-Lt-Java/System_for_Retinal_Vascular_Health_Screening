# Architecture Design

## 1. High-level Architecture
AURA theo kiến trúc **microservices** với 3 thành phần chính:

- **Web Client (React + TS)**
- **Backend API (Spring Boot)**
- **AI Core (Python/FastAPI)**

Kèm theo:
- **PostgreSQL**: lưu dữ liệu nghiệp vụ (users, analyses, billing, chat, notifications...)
- **MinIO**: lưu file ảnh + outputs AI (heatmap, overlay, segmentation)

## 2. Data Flow (CDS)
1. USER/CLINIC upload ảnh
2. Backend tạo `analysis` ở trạng thái QUEUED và lưu file vào MinIO
3. Worker đọc queue, gọi AI Core `/predict`
4. AI Core trả về `prediction_label/score`, URLs outputs
5. Backend cập nhật analysis COMPLETED + risk + advice, phát Notification
6. Doctor review/correct (audit)

## 3. RBAC & Access Scope
- USER: chỉ truy cập dữ liệu của chính mình
- DOCTOR: chỉ truy cập bệnh nhân **assigned** (strict)
- CLINIC: truy cập người dùng trong clinic
- ADMIN: toàn quyền

## 4. Deployment
Local demo: Docker Compose (postgres, minio, ai-core, backend, frontend)

Production gợi ý:
- Nginx/Traefik reverse proxy + TLS
- Scale AI-core theo horizontal replicas
- Centralized logging (ELK/Promtail+Loki) và monitoring (Prometheus+Grafana)

## 5. Key Interfaces
- Backend ↔ AI Core: REST (`/health`, `/predict`)
- Client ↔ Backend: REST (`/api/*`)
- Storage: S3-compatible (MinIO)
