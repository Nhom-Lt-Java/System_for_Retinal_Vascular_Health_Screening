import axiosClient from "./axiosClient";

export type PatientSummary = {
  id: number;
  username: string;
  latestAnalysisId?: string | null;
  latestStatus?: string | null;
  predLabel?: string | null;
  predConf?: number | null;
  lastAnalyzedAt?: string | null;
};

export type RecentAnalysis = {
  analysisId: string;
  patientId?: number | null;
  patientUsername?: string | null;
  status?: string | null;
  predLabel?: string | null;
  predConf?: number | null;
  createdAt?: string | null;
};

const doctorApi = {
  listPatients: (): Promise<PatientSummary[]> => {
    return axiosClient.get("/api/doctor/patients");
  },

  recentAnalyses: (): Promise<RecentAnalysis[]> => {
    return axiosClient.get("/api/doctor/recent-analyses");
  },

  analysesByPatient: (patientId: number): Promise<RecentAnalysis[]> => {
    return axiosClient.get(`/api/doctor/patients/${patientId}/analyses`);
  },
};

export default doctorApi;
