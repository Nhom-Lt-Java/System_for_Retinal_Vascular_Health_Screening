
# AURA Retinal Screening - Technical Flow Diagrams

Tài liệu này mô tả kiến trúc và luồng dữ liệu chính của hệ thống sàng lọc võng mạc AURA, tập trung vào giao tiếp giữa các thành phần Front-end (React), Back-end (Java/Spring), và AI Microservice (Python/ML Model).

## 1. Luồng: User Upload Ảnh & Chạy AI

Luồng này mô tả quy trình từ khi người dùng tải ảnh lên cho đến khi nhận được kết quả phân tích tự động từ AI.

```text
User
  |
  | (1) Chọn ảnh, nhấn Upload & Analyze
  v
Frontend (React)
  |
  | (2) POST /api/analyses (multipart/form-data)
  v
Backend Controller (Java/Spring)
  |
  | (3) validate request, map DTO
  | (4) gọi analysisService.createAndRequestAI(dto)
  v
Service (AnalysisService)
  |
  | (5) repository.save(analysis PENDING)
  v
Repository (AnalysisRepository)
  |
  | (6) INSERT vào DB (analysis, status=PENDING)
  v
Database (PostgreSQL)
  ^
  |
Service (tiếp)
  |
  | (7) Upload ảnh → Cloud Storage
  | (8) Gửi request → AI Core (HTTP)
  v
AI Core Microservice (Python)
  |
  | (9) Chạy model, tạo result + heatmap
  | (10) Gửi callback POST /api/ai-callback
  v
Backend Controller (AI Callback)
  |
  | (11) gọi analysisService.updateWithAIResult(...)
  v
Service
  |
  | (12) repository.update(analysis COMPLETED + store result)
  v
Repository → Database
  |
  | (13) FE polling GET /api/analyses/{id}
  v
Frontend hiển thị kết quả cho User
```

## 2. Luồng: Doctor Review (Đánh giá của Bác sĩ)
Luồng này mô tả quá trình bác sĩ truy cập, xem xét chi tiết kết quả AI, và đưa ra chẩn đoán cuối cùng.
```text
Doctor
  |
  | (1) Mở danh sách phân tích
  v
Frontend (Doctor Portal)
  |
  | (2) GET /api/doctor/analyses?filters
  v
Backend Controller (Doctor)
  |
  | (3) doctorAnalysisService.getAnalyses()
  v
Service
  |
  | (4) analysisRepository.findByClinicOrDoctor(...)
  v
Repository → DB
  |
  | (5) Trả kết quả danh sách → FE
  v
Doctor chọn 1 analysis
  |
  | (6) GET /api/doctor/analyses/{id}
  v
Controller → Service → Repository → DB
  |
  | (7) Trả chi tiết analysis + kết quả AI
  v
Frontend
  |
  | (8) Doctor nhập chẩn đoán, note, confirm/override
  | (9) POST /api/doctor/analyses/{id}/review
  v
Backend Controller
  |
  | (10) doctorAnalysisService.saveReview()
  v
Service → Repository → DB
  |
  | (11) Cập nhật trạng thái review
  v
User có thể xem doctor review qua FE
```