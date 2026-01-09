import axiosClient from "./axiosClient";

const authApi = {
  login: async (username: string, password: string) => {
    const res: { token: string } = await axiosClient.post("/auth/login", { username, password });
    return res.token;
  },

  me: async () => {
    return axiosClient.get("/auth/me"); // {id, username, role}
  },
};

export default authApi;
