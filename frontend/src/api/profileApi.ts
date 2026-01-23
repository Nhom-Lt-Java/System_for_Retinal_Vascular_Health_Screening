import axiosClient from "./axiosClient";

export type Profile = {
  id: number;
  username: string;
  role: string;
  enabled: boolean;
  email?: string | null;
  phone?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  fullName?: string | null;
  address?: string | null;
  dateOfBirth?: string | null; // YYYY-MM-DD
  gender?: string | null;
  emergencyContact?: string | null;
  medicalInfo?: any;
};

export type ProfileUpdate = {
  email?: string | null;
  phone?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  fullName?: string | null;
  address?: string | null;
  dateOfBirth?: string | null;
  gender?: string | null;
  emergencyContact?: string | null;
  medicalInfo?: any;
};

const profileApi = {
  async getMe(): Promise<Profile> {
    const res = await axiosClient.get("/profile/me");
    return res.data;
  },

  async updateMe(payload: ProfileUpdate): Promise<Profile> {
    const res = await axiosClient.put("/profile/me", payload);
    return res.data;
  },
};

export default profileApi;
