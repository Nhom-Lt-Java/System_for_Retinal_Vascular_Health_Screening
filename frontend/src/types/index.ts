// src/types/index.ts

export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: 'USER' | 'DOCTOR' | 'ADMIN';
}

export interface MedicalRecord {
  id: number;
  patientName: string;
  doctorName?: string;
  imageUrl: string;      // Link ảnh mắt
  diagnosis?: string;    // Kết quả chẩn đoán (VD: Nguy cơ cao)
  riskLevel?: 'LOW' | 'MEDIUM' | 'HIGH'; // Mức độ nguy hiểm
  createdAt: string;     // Ngày khám
  status: 'PENDING' | 'COMPLETED' | 'REVIEWED'; // Trạng thái
}