import axiosClient from "./axiosClient";

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
