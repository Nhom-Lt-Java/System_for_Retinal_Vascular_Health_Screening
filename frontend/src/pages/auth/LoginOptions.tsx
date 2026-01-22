import React from 'react';
import { useNavigate } from 'react-router-dom';
const LoginOptions = () => {
    const navigate = useNavigate();
    return (
        <div className="auth-container">
            <div className="auth-form-card">
                <h2 className="auth-title">Hệ Thống Aura AI</h2>
                <div style={{display:'flex', flexDirection:'column', gap:'15px'}}>
                    <button className="auth-button" onClick={() => navigate('/auth/login/client')}>👤 Khách Hàng / Bệnh Nhân</button>
                    <button className="auth-button" style={{background:'white', color:'#1a73e8', border:'1px solid #1a73e8'}} onClick={() => navigate('/auth/login/admin')}>🛡️ Bác Sĩ / Admin</button>
                </div>
            </div>
        </div>
    );
};
export default LoginOptions;