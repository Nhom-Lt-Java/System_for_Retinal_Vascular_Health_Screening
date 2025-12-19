import React, { useState } from 'react';
import { Form, Input, Button, Checkbox, message, Tabs, Card, Typography } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined, IdcardOutlined, GoogleOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;

const AuthPage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('login');

  const onLogin = (values: any) => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      let role = 'PATIENT';
      const u = values.username?.toLowerCase() || '';
      if (u.includes('doctor')) role = 'DOCTOR';
      if (u.includes('admin')) role = 'ADMIN';

      const user = { fullName: 'Demo User', role: role, email: values.username };
      localStorage.setItem('user', JSON.stringify(user));
      message.success('Đăng nhập thành công!');

      if (role === 'ADMIN') navigate('/admin/dashboard');
      else if (role === 'DOCTOR') navigate('/doctor/dashboard');
      else navigate('/patient/dashboard');
    }, 1000);
  };

  const onRegister = (values: any) => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      const newUser = { fullName: values.fullname, email: values.email, role: 'PATIENT' };
      localStorage.setItem('user', JSON.stringify(newUser));
      message.success('Đăng ký thành công!');
      setActiveTab('login');
    }, 1500);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f0f2f5] p-4">
      {/* CARD Ở GIỮA MÀN HÌNH */}
      <Card 
        className="w-full max-w-[450px] shadow-lg rounded-xl border-none" 
        bodyStyle={{ padding: '40px' }}
      >
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-indigo-600 rounded-lg flex items-center justify-center text-white text-2xl font-bold mx-auto mb-3 shadow-lg">A</div>
          <Title level={3} className="!mb-1 !text-gray-800">AURA Health</Title>
          <Text type="secondary">Đăng nhập để tiếp tục</Text>
        </div>

        <Tabs 
          activeKey={activeTab} 
          onChange={setActiveTab} 
          centered 
          size="large"
          items={[
            {
              key: 'login',
              label: 'Đăng Nhập',
              children: (
                <Form layout="vertical" onFinish={onLogin} size="large" className="mt-4">
                  <Form.Item name="username" rules={[{ required: true, message: 'Nhập tài khoản!' }]}>
                    <Input prefix={<UserOutlined className="text-gray-400"/>} placeholder="Email / Tên đăng nhập" className="rounded-lg"/>
                  </Form.Item>
                  <Form.Item name="password" rules={[{ required: true, message: 'Nhập mật khẩu!' }]}>
                    <Input.Password prefix={<LockOutlined className="text-gray-400"/>} placeholder="Mật khẩu" className="rounded-lg"/>
                  </Form.Item>
                  <div className="flex justify-between items-center mb-4">
                    <Form.Item name="remember" valuePropName="checked" noStyle><Checkbox>Ghi nhớ</Checkbox></Form.Item>
                    <a className="text-indigo-600 text-sm hover:underline" href="#">Quên mật khẩu?</a>
                  </div>
                  <Button type="primary" htmlType="submit" block loading={loading} className="h-11 bg-indigo-600 hover:bg-indigo-700 font-bold rounded-lg border-none">ĐĂNG NHẬP</Button>
                  <div className="relative my-6 text-center">
                    <span className="bg-white px-2 text-gray-400 text-sm relative z-10">Hoặc tiếp tục với</span>
                    <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-100"></div></div>
                  </div>
                  <Button block icon={<GoogleOutlined />} className="h-10 rounded-lg">Google</Button>
                </Form>
              )
            },
            {
              key: 'register',
              label: 'Đăng Ký',
              children: (
                <Form layout="vertical" onFinish={onRegister} size="large" className="mt-4">
                  <Form.Item name="fullname" rules={[{ required: true, message: 'Nhập họ tên!' }]}>
                    <Input prefix={<IdcardOutlined className="text-gray-400"/>} placeholder="Họ và tên" className="rounded-lg"/>
                  </Form.Item>
                  <Form.Item name="email" rules={[{ required: true, type: 'email', message: 'Email sai định dạng!' }]}>
                    <Input prefix={<MailOutlined className="text-gray-400"/>} placeholder="Email" className="rounded-lg"/>
                  </Form.Item>
                  <Form.Item name="password" rules={[{ required: true, message: 'Tạo mật khẩu!' }]}>
                    <Input.Password prefix={<LockOutlined className="text-gray-400"/>} placeholder="Mật khẩu" className="rounded-lg"/>
                  </Form.Item>
                  <Button type="primary" htmlType="submit" block loading={loading} className="h-11 bg-green-600 hover:bg-green-700 font-bold rounded-lg border-none mt-2">ĐĂNG KÝ NGAY</Button>
                </Form>
              )
            }
          ]} 
        />
      </Card>
    </div>
  );
};

export default AuthPage;