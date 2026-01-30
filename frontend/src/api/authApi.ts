import axiosClient from './axiosClient';

const authApi = {
  login: (data: any) => {
    const url = '/auth/login';
    return axiosClient.post(url, data);
  },

  googleLogin: (idToken: string) => {
    const url = '/auth/google';
    return axiosClient.post(url, { idToken });
  },

  // Cập nhật hàm register để nhận clinicId
  register: (data: any) => {
    const url = '/auth/register';
    // data bao gồm: username, password, fullName, phone, clinicId (optional)
    return axiosClient.post(url, data);
  },

  forgotPassword: (email: string) => {
    const url = '/auth/forgot-password';
    return axiosClient.post(url, { email });
  },

  getProfile: () => {
    const url = '/auth/me';
    return axiosClient.get(url);
  },

  // API Mới: Lấy danh sách phòng khám
  getClinics: () => {
    return axiosClient.get('/auth/clinics');
  }
};

export default authApi;