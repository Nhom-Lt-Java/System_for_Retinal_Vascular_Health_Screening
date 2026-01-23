import axiosClient from "./axiosClient";

export type ClinicDoctor = {
  id: number;
  username: string;
  fullName?: string;
  phone?: string;
};

export type ClinicPatient = {
  id: number;
  username: string;
  fullName?: string;
  assignedDoctorId?: number | null;
};

export async function getClinicDashboard() {
  const res = await axiosClient.get("/clinic/dashboard");
  return res.data as any;
}

export async function listClinicDoctors() {
  const res = await axiosClient.get("/clinic/doctors");
  return res.data as ClinicDoctor[];
}

export async function createClinicDoctor(payload: { username: string; password: string; fullName: string; phone?: string }) {
  const res = await axiosClient.post("/clinic/doctors", payload);
  return res.data as ClinicDoctor;
}

export async function listClinicPatients() {
  const res = await axiosClient.get("/clinic/patients");
  return res.data as ClinicPatient[];
}

export async function assignDoctorToPatient(patientId: number, doctorId: number) {
  const res = await axiosClient.put(`/clinic/patients/${patientId}/assign-doctor`, null, {
    params: { doctorId },
  });
  return res.data as ClinicPatient;
}

// FR-22: clinic verification document
export async function getClinicVerificationDocument() {
  const res = await axiosClient.get("/clinic/verification-document");
  return res.data as { fileId: string | null; url: string | null };
}

export async function uploadClinicVerificationDocument(file: File) {
  const form = new FormData();
  form.append("file", file);
  const res = await axiosClient.post("/clinic/verification-document", form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data as { fileId: string; url: string };
}
