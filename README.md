# AURA — System for Retinal Vascular Health Screening
Hệ thống demo sàng lọc sức khỏe mạch máu võng mạc gồm:
- **Frontend**: Vite + React (UI)
- **Backend**: Java Spring Boot (API + Auth + DB)
- **AI-core**: FastAPI (inference: phân loại + tách mạch)
- **PostgreSQL**: lưu dữ liệu hệ thống
- **MinIO**: lưu ảnh upload + file kết quả
- **pgAdmin**: quản trị DB

---

## 1) Yêu cầu
- Docker Desktop (Windows/Mac)

git clone 
cd AURA

---

docker compose up -d --build

---

docker exec -it aura_postgres psql -U postgres -d retinal_system -v ON_ERROR_STOP=1 -c "
WITH existing AS (
  SELECT id FROM clinics WHERE name='Demo Clinic' ORDER BY id LIMIT 1
),
ins AS (
  INSERT INTO clinics(name, status)
  SELECT 'Demo Clinic', 'APPROVED'
  WHERE NOT EXISTS (SELECT 1 FROM existing)
  RETURNING id
),
clinic AS (
  SELECT id FROM ins
  UNION ALL
  SELECT id FROM existing
)
INSERT INTO users(username, password, role, clinic_id)
SELECT u.username, u.password, u.role, clinic.id
FROM clinic
CROSS JOIN (VALUES
  ('doctor1','123456','DOCTOR'),
  ('user1','123456','USER')
) AS u(username,password,role)
ON CONFLICT (username) DO NOTHING;
"

---


