import axiosClient from "./axiosClient";

export type AnalysisResponse = {
  id: string;
  status: string;
  predLabel: string | null;
  predConf: number | null;
  probsJson: any | null;
  originalUrl: string | null;
  overlayUrl: string | null;
  maskUrl: string | null;
  heatmapUrl: string | null;
  heatmapOverlayUrl: string | null;
  createdAt: string;
};


const analysisApi = {
  create: async (file: File) => {
    const form = new FormData();
    form.append("file", file);

    const res: AnalysisResponse = await axiosClient.post("/api/analyses", form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res;
  },

  get: async (id: string) => {
    const res: AnalysisResponse = await axiosClient.get(`/api/analyses/${id}`);
    return res;
  },

  // NEW: list history theo user đang đăng nhập (DB)
  listMy: async () => {
    return axiosClient.get("/api/analyses/my");
  },


  // (Giữ lại để tương thích, nhưng backend hiện chưa có GET /api/analyses?userId=...)
  listByUser: async (userId: number) => {
    const res: AnalysisResponse[] = await axiosClient.get("/api/analyses", {
      params: { userId },
    });
    return res;
  },
};

export default analysisApi;
