import axiosClient from "./axiosClient";

// =====================
// Dashboard (FR-35/36/37)
// =====================

export type AuditLog = {
  id: number;
  action: string;
  username?: string | null;
  ipAddress?: string | null;
  details?: string | null;
  timestamp?: string | null;
  method?: string | null;
  path?: string | null;
};

export async function getOverview() {
  const res = await axiosClient.get("/dashboard/overview");
  return res.data;
}

export async function getAuditLogs(limit = 50) {
  const res = await axiosClient.get("/dashboard/audit-logs", { params: { limit } });
  return res.data as AuditLog[];
}

// =====================
// Clinics (FR-38)
// =====================

export type Clinic = {
  id: number;
  name: string;
  status: string;
  address?: string | null;
  contactEmail?: string | null;
  phone?: string | null;
  createdAt?: string | null;
};

export async function listClinics() {
  const res = await axiosClient.get("/admin/clinics");
  return res.data as Clinic[];
}

export async function approveClinic(id: number) {
  const res = await axiosClient.put(`/admin/clinics/${id}/approve`);
  return res.data;
}

export async function suspendClinic(id: number) {
  const res = await axiosClient.put(`/admin/clinics/${id}/suspend`);
  return res.data;
}

// =====================
// AI settings (FR-33)
// =====================

export type AiSettings = Record<string, any>;

export async function getAiSettings(): Promise<AiSettings> {
  const res = await axiosClient.get("/admin/ai-settings");
  return (res.data || {}) as AiSettings;
}

export async function updateAiSetting(key: string, value: any) {
  const res = await axiosClient.put(`/admin/ai-settings/${key}`, value);
  return res.data;
}

// =====================
// Packages (FR-34)
// =====================

export type ServicePackageAdmin = {
  id?: number;
  name: string;
  description?: string | null;
  price: number | string;
  credits: number;
  durationDays?: number | null;
  active: boolean;
};

export async function adminListPackages() {
  const res = await axiosClient.get("/admin/packages");
  return res.data as ServicePackageAdmin[];
}

export async function adminCreatePackage(payload: ServicePackageAdmin) {
  const res = await axiosClient.post("/admin/packages", payload);
  return res.data as ServicePackageAdmin;
}

export async function adminUpdatePackage(id: number, payload: ServicePackageAdmin) {
  const res = await axiosClient.put(`/admin/packages/${id}`, payload);
  return res.data as ServicePackageAdmin;
}

export async function adminDeletePackage(id: number) {
  const res = await axiosClient.delete(`/admin/packages/${id}`);
  return res.data;
}

// =====================
// Users (FR-31/32)
// =====================

export type AdminUser = {
  id: number;
  username: string;
  email?: string | null;
  role: string;
  enabled?: boolean;
  clinicId?: number | null;
  assignedDoctorId?: number | null;
};

export async function listUsers() {
  const res = await axiosClient.get("/admin/users");
  return res.data as AdminUser[];
}

export async function updateUser(id: number, payload: Partial<AdminUser>) {
  const res = await axiosClient.put(`/admin/users/${id}`, payload);
  return res.data;
}

export async function enableUser(id: number) {
  const res = await axiosClient.put(`/admin/users/${id}/enable`);
  return res.data;
}

export async function disableUser(id: number) {
  const res = await axiosClient.put(`/admin/users/${id}/disable`);
  return res.data;
}

// =====================
// Notification templates (FR-39)
// =====================

export type NotificationTemplate = {
  id?: number;
  templateKey: string;
  titleTemplate: string;
  messageTemplate: string;
  type?: string | null;
  active: boolean;
};

export async function listNotificationTemplates() {
  const res = await axiosClient.get("/admin/notification-templates");
  return res.data as NotificationTemplate[];
}

export async function createNotificationTemplate(payload: NotificationTemplate) {
  const res = await axiosClient.post("/admin/notification-templates", payload);
  return res.data as NotificationTemplate;
}

export async function updateNotificationTemplate(id: number, payload: NotificationTemplate) {
  const res = await axiosClient.put(`/admin/notification-templates/${id}`, payload);
  return res.data as NotificationTemplate;
}

export default {
  getOverview,
  getAuditLogs,
  listClinics,
  approveClinic,
  suspendClinic,
  getAiSettings,
  updateAiSetting,
  adminListPackages,
  adminCreatePackage,
  adminUpdatePackage,
  adminDeletePackage,
  listUsers,
  updateUser,
  enableUser,
  disableUser,
  listNotificationTemplates,
  createNotificationTemplate,
  updateNotificationTemplate,
};
