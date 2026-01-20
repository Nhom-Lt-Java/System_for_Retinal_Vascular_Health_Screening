// src/types/index.ts

export interface User {
  id: number;
  email: string;
  name?: string;
  role: 'USER' | 'DOCTOR' | 'CLINIC_ADMIN' | 'SUPER_ADMIN';
  clinicId?: number;
}

export interface Clinic {
  id: number;
  name: string;
  address: string;
  status: 'PENDING' | 'ACTIVE' | 'REJECTED';
  expiryDate: string;
}

export interface MedicalRecord {
  id: number;
  patientName: string;
  imageUrl: string;
  diagnosis?: string;
  riskLevel?: 'LOW' | 'MEDIUM' | 'HIGH';
  createdAt: string;
  // 👇 ĐÃ SỬA: Thêm 'REVIEWED' vào đây để Dashboard không báo lỗi nữa
  status: 'PENDING' | 'COMPLETED' | 'REVIEWED';
}