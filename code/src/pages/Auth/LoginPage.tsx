import { Form, Input, Button, Card, message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const LoginPage = () => {
  const navigate = useNavigate();

  const onFinish = (values: any) => {
    // Giả lập logic login
    console.log('Login:', values);
    
    // Giả lập backend trả về user
    const mockUser = { id: '1', fullName: 'Nguyen Van A', role: 'PATIENT', email: values.email }; // Hoặc role: 'DOCTOR'
    
    localStorage.setItem('access_token', 'fake-jwt-token');
    localStorage.setItem('user', JSON.stringify(mockUser));
    
    message.success('Đăng nhập thành công!');
    
    // Điều hướng dựa trên role
    if (mockUser.role === 'DOCTOR') navigate('/doctor/dashboard');
    else navigate('/patient/dashboard');
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <Card title="AURA Login" className="w-96 shadow-lg">
        <Form onFinish={onFinish} layout="vertical">
          <Form.Item name="email" rules={[{ required: true, type: 'email' }]}>
            <Input prefix={<UserOutlined />} placeholder="Email" />
          </Form.Item>
          <Form.Item name="password" rules={[{ required: true }]}>
            <Input.Password prefix={<LockOutlined />} placeholder="Password" />
          </Form.Item>
          <Button type="primary" htmlType="submit" block>Đăng nhập</Button>
        </Form>
      </Card>
    </div>
  );
};
export default LoginPage;