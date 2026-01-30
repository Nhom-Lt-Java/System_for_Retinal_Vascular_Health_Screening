import axiosClient from "./axiosClient";

// --- CÁC HÀM CŨ (GIỮ NGUYÊN) ---

export async function createAnalysis(file: File) {
  const form = new FormData();
  form.append("file", file);
  const res = await axiosClient.post("/analyses", form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
}

export async function getAnalysis(id: string) {
  const res = await axiosClient.get(`/analyses/${id}`);
  return res.data;
}

export async function listMyAnalyses() {
  const res = await axiosClient.get("/analyses/my");
  return res.data;
}

export async function createBulkAnalyses(files: File[], userId: string | number) {
  const form = new FormData();
  files.forEach((f) => form.append("files", f));
  form.append("userId", String(userId));
  const res = await axiosClient.post("/analyses/bulk", form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
}

// USER upload multiple images for themselves (server will infer userId from JWT)
export async function createBulkMyAnalyses(files: File[]) {
  const form = new FormData();
  files.forEach((f) => form.append("files", f));
  const res = await axiosClient.post("/analyses/bulk", form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
}

// --- BỔ SUNG MỚI CHO BÁC SĨ ---

// 1. Lấy danh sách bệnh nhân được phân công cho bác sĩ
export async function getAssignedAnalyses() {
  const res = await axiosClient.get("/analyses/doctor/assigned");
  return res.data;
}

// 2. Gửi kết quả đánh giá/kết luận của bác sĩ
export async function submitReview(id: string, data: {
  reviewResult: "APPROVED" | "CORRECTED";
  correctedLabel?: string;
  conclusion: string;
  advice?: string;
  note?: string;
}) {
  const res = await axiosClient.post(`/analyses/${id}/review`, data);
  return res.data;
}