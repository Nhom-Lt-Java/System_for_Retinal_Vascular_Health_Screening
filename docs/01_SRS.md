# Software Requirements Specification (SRS)

**Project**: System for Retinal Vascular Health Screening (AURA)  
**Abbreviation**: SP26SE025

## 1. Purpose
AURA là hệ thống hỗ trợ quyết định lâm sàng (CDS) dựa trên phân tích ảnh đáy mắt (Fundus) / OCT để ước lượng nguy cơ bệnh lý liên quan mạch máu võng mạc (ví dụ: DR, Glaucoma...) và rủi ro liên quan (tăng huyết áp, biến chứng đái tháo đường...). Hệ thống **hỗ trợ bác sĩ**, không thay thế.

## 2. Scope
Hệ thống gồm 3 khối chính:
- **Web Application** (React + TypeScript): UI cho User/Doctor/Clinic/Admin.
- **Backend API** (Spring Boot + PostgreSQL): RBAC, lưu trữ, lịch sử, báo cáo, billing, chat.
- **AI Core Microservice** (Python): inference phân loại + segmentation + explainability.

## 3. Users & Roles
- **USER** (Bệnh nhân): upload ảnh, xem kết quả, lịch sử, xuất báo cáo, chat.
- **DOCTOR**: xem bệnh nhân assigned, review/correct, ghi chú, xu hướng.
- **CLINIC**: quản lý bác sĩ, bulk upload, tổng quan.
- **ADMIN**: quản trị hệ thống, duyệt clinic, quản lý user, cấu hình AI, gói dịch vụ.

## 4. Functional Requirements (Trace)
Bảng tóm tắt trạng thái theo mã FR (DONE/PARTIAL/MISSING) – cập nhật theo code:

| FR | Nội dung | Trạng thái |
|---|---|---|
| FR-1 | Register/Login email + Google/social | **DONE (Email + Google)** / Social: PARTIAL |
| FR-2 | Upload single/multiple images | **DONE** |
| FR-3 | View AI results + risk levels | **DONE** (khi có weights AI) |
| FR-4 | Annotated images | **DONE** (khi có outputs AI) |
| FR-5 | Recommendations/warnings | **DONE** |
| FR-6 | Analysis history | **DONE** |
| FR-7 | Export report PDF/CSV | **DONE** |
| FR-8 | Profile + medical info | **DONE** |
| FR-9 | Notifications | **DONE** |
| FR-10 | In-app messaging | **DONE** |
| FR-11 | Purchase packages | **DONE (demo)** |
| FR-12 | Payment history/credits | **DONE (demo)** |
| FR-13-21 | Doctor functions | **DONE / PARTIAL** (trend UI: DONE) |
| FR-22-30 | Clinic functions | **PARTIAL** (verification docs/campaign report: docs-level) |
| FR-31-39 | Admin functions | **DONE / PARTIAL** (permission config động: PARTIAL) |

## 5. Non-functional Requirements (Summary)
- **Performance**: AI inference mục tiêu 10–20s/ảnh; bulk có queue.
- **Reliability**: worker retry; lưu ảnh khi fail.
- **Security**: TLS khi deploy, JWT + RBAC; hạn chế truy cập doctor theo assigned.
- **Maintainability**: microservice separation; migrations; version fields.

## 6. Assumptions & Out of Scope
- Social login ngoài Google (Facebook/Apple) có thể triển khai tương tự.
- Integrate trực tiếp camera: phạm vi demo là cloud upload.
