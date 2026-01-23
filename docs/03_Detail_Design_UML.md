# Detail Design (UML 2.0)

Tài liệu này cung cấp **mã PlantUML** để bạn có thể render ra sơ đồ UML 2.0.

> Bạn có thể dùng PlantUML extension (VSCode) hoặc trang render PlantUML nội bộ.

## 1. Use Case Diagram (tóm tắt)

```plantuml
@startuml
left to right direction
actor User
actor Doctor
actor Clinic
actor Admin

rectangle AURA {
  usecase "Register/Login" as UC1
  usecase "Upload Images" as UC2
  usecase "View Results" as UC3
  usecase "Export Report" as UC4
  usecase "Chat" as UC5
  usecase "Review/Correct AI" as UC6
  usecase "Bulk Upload" as UC7
  usecase "Manage Users" as UC8
  usecase "AI Settings" as UC9
  usecase "Manage Packages" as UC10
  usecase "Manage Templates" as UC11
}

User --> UC1
User --> UC2
User --> UC3
User --> UC4
User --> UC5

Doctor --> UC1
Doctor --> UC3
Doctor --> UC6
Doctor --> UC5

Clinic --> UC1
Clinic --> UC7
Clinic --> UC3

Admin --> UC8
Admin --> UC9
Admin --> UC10
Admin --> UC11
@enduml
```

## 2. Sequence Diagram – Upload & Async Analysis

```plantuml
@startuml
actor User
participant "Web UI" as WEB
participant "Backend API" as BE
participant "Worker" as WK
participant "AI Core" as AI
participant "MinIO" as S3
database "PostgreSQL" as DB

User -> WEB: chọn ảnh + upload
WEB -> BE: POST /api/analyses (multipart)
BE -> S3: lưu original image
BE -> DB: insert Analysis(status=QUEUED)
BE --> WEB: 202 Accepted + analysisId

loop polling
  WEB -> BE: GET /api/analyses/{id}
  BE -> DB: select Analysis
  BE --> WEB: status
end

WK -> DB: pick QUEUED
WK -> AI: POST /predict (image)
AI -> S3: lưu overlay/heatmap
AI --> WK: prediction + urls
WK -> DB: update Analysis(status=COMPLETED, risk, advice, urls)
WK -> DB: insert Notification

@enduml
```

## 3. Class Diagram (rút gọn)

```plantuml
@startuml
class User {
  +id: Long
  +username: String
  +email: String
  +role: Role
  +enabled: boolean
  +clinic: Clinic
  +assignedDoctorId: Long
}

class Clinic {
  +id: Long
  +name: String
  +status: ClinicStatus
}

class Analysis {
  +id: UUID
  +user: User
  +status: AnalysisStatus
  +predLabel: String
  +predScore: double
  +riskLevel: RiskLevel
  +adviceJson: String
  +heatmapUrl: String
  +heatmapOverlayUrl: String
}

User "1" -- "0..*" Analysis
Clinic "1" -- "0..*" User
@enduml
```

## 4. Notes
- UML chỉ mô tả cốt lõi; bạn có thể bổ sung các entity: Payment, Package, ChatMessage, Notification, Feedback...
