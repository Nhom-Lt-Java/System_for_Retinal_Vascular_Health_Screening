import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const ClientLogin = () => {
    const navigate = useNavigate();
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await axios.post("http://localhost:8080/api/auth/login", { 
                username, 
                password 
            });

            const token = res.data.token;
            // SỬA LỖI: Ép role về chữ hoa ngay khi nhận từ Server
            const role = res.data.role ? res.data.role.toUpperCase() : "USER"; 

            // Lưu vào localStorage (Dùng khóa chuẩn 'token' và 'role')
            localStorage.setItem("token", token);
            localStorage.setItem("role", role);
            
            // Lưu thông tin user để AuthContext đọc được
            localStorage.setItem("user", JSON.stringify({ username, role }));

            // Điều hướng
            if (role === "SUPER_ADMIN") navigate("/admin/dashboard");
            else if (role === "CLINIC_ADMIN") navigate("/clinic/dashboard");
            else if (role === "DOCTOR") navigate("/doctor/dashboard");
            else navigate("/user/dashboard");

            // Reload để Navbar cập nhật trạng thái
            window.location.reload();
            
        } catch (err: any) {
            console.error(err);
            alert(err.response?.data || "Đăng nhập thất bại. Vui lòng thử lại!");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex justify-center items-center h-screen bg-gray-100">
             <form onSubmit={handleLogin} className="p-8 bg-white shadow-lg rounded-lg w-96">
                <h2 className="text-2xl font-bold mb-6 text-center text-blue-600">Đăng nhập</h2>
                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2">Tài khoản</label>
                    <input 
                        type="text" value={username} onChange={(e) => setUsername(e.target.value)}
                        className="border p-2 w-full rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
                        placeholder="Nhập tài khoản"
                    />
                </div>
                <div className="mb-6">
                    <label className="block text-gray-700 text-sm font-bold mb-2">Mật khẩu</label>
                    <input 
                        type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                        className="border p-2 w-full rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
                        placeholder="Nhập mật khẩu"
                    />
                </div>
                <button 
                    type="submit" disabled={loading}
                    className={`w-full p-2 text-white rounded font-bold transition ${loading ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'}`}
                >
                    {loading ? "Đang xử lý..." : "Đăng nhập"}
                </button>
             </form>
        </div>
    );
};

export default ClientLogin;