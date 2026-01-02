import axiosClient from './axiosClient';

const authApi = {
  login: (data: any) => {
    const url = '/auth/login';
    return axiosClient.post(url, data);
  },

  register: (data: any) => {
    const url = '/auth/register';
    return axiosClient.post(url, data);
  },

  forgotPassword: (email: string) => {
    const url = '/auth/forgot-password';
    return axiosClient.post(url, { email });
  },

  getProfile: () => {
    const url = '/auth/me';
    return axiosClient.get(url);
  }
};

export default authApi;