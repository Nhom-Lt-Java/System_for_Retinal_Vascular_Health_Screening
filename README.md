# AURA Retinal Screening

📸 Luồng 1: User Upload Ảnh và Phân tích AI

```mermaid
sequenceDiagram
    participant U as User
    participant FE as Frontend (React)
    participant BC as Backend Controller (Java/Spring)
    participant S as Service (AnalysisService)
    participant R as Repository (AnalysisRepository)
    participant DB as Database (PostgreSQL)
    participant CS as Cloud Storage
    participant AI as AI Core Microservice (Python)

    U->>FE: (1) Chọn ảnh, nhấn Upload & Analyze
    FE->>BC: (2) POST /api/analyses (multipart/form-data)
    BC->>S: (3) validate request, map DTO & (4) createAndRequestAI(dto)
    S->>R: (5) repository.save(analysis PENDING)
    R->>DB: (6) INSERT vào DB (analysis, status=PENDING)
    S->>CS: (7) Upload ảnh
    S->>AI: (8) Gửi request (HTTP)
    Note over AI: (9) Chạy model, tạo result + heatmap
    AI->>BC: (10) Gửi callback POST /api/ai-callback
    BC->>S: (11) updateWithAIResult(...)
    S->>R: (12) repository.update(analysis COMPLETED + store result)
    R->>DB: Cập nhật trạng thái và kết quả
    loop FE polling
        FE->>BC: (13) GET /api/analyses/{id} (Kiểm tra trạng thái)
        BC->>DB: Trả về trạng thái
        alt status = COMPLETED
            DB->>BC: Trả về kết quả
            BC->>FE: Trả về kết quả
            FE->>U: Hiển thị kết quả
            break
        else status = PENDING
            BC->>FE: Trả về trạng thái chờ
        end
    end
```

👨‍⚕️ Luồng 2: Doctor Review (Đánh giá của Bác sĩ)
 ```mermaid
sequenceDiagram
    participant D as Doctor
    participant FE as Frontend (Doctor Portal)
    participant BCD as Backend Controller (Doctor)
    participant SD as Service (DoctorAnalysisService)
    participant R as Repository
    participant DB as Database
    participant BCC as Backend Controller
    participant S as Service

    D->>FE: (1) Mở danh sách phân tích
    FE->>BCD: (2) GET /api/doctor/analyses?filters
    BCD->>SD: (3) doctorAnalysisService.getAnalyses()
    SD->>R: (4) analysisRepository.findByClinicOrDoctor(...)
    R->>DB: Truy vấn danh sách
    DB->>FE: (5) Trả kết quả danh sách
    D->>FE: Doctor chọn 1 analysis
    FE->>BCD: (6) GET /api/doctor/analyses/{id}
    BCD->>SD: Gọi Service
    SD->>R: Gọi Repository
    R->>DB: Truy vấn chi tiết
    DB->>FE: (7) Trả chi tiết analysis + kết quả AI
    D->>FE: (8) Doctor nhập chẩn đoán, note, confirm/override
    FE->>BCD: (9) POST /api/doctor/analyses/{id}/review
    BCD->>SD: (10) doctorAnalysisService.saveReview()
    SD->>R: Cập nhật
    R->>DB: Lưu review (chẩn đoán, note, trạng thái)
    DB->>U: (11) Cập nhật trạng thái review (User có thể xem)
```
