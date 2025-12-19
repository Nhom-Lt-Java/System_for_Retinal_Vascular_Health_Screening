import React, { useState, useEffect } from 'react';
import { Avatar, Button, Form, Input, Tabs, Row, Col, message } from 'antd';
import { UserOutlined, MailOutlined, PhoneOutlined, SafetyOutlined } from '@ant-design/icons';

const ProfilePage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [userInfo, setUserInfo] = useState<any>(null);
  const [form] = Form.useForm();

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
        const u = JSON.parse(userStr);
        setUserInfo(u);
        form.setFieldsValue({
            fullName: u.fullName,
            email: u.email,
            phone: '0987654321', // Số giả định
            address: ''
        });
    }
  }, [form]);

  const onUpdateProfile = (values: any) => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      const updatedUser = { ...userInfo, fullName: values.fullName };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUserInfo(updatedUser);
      message.success('Đã lưu thông tin mới!');
      window.location.reload(); 
    }, 1000);
  };

  return (
    <div className="max-w-5xl mx-auto pb-10">
      <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 flex items-center gap-8 mb-6">
          <Avatar size={100} icon={<UserOutlined />} className="bg-indigo-100 text-indigo-600 flex-shrink-0" />
          <div>
             <h1 className="text-3xl font-bold text-gray-800 m-0">{userInfo?.fullName || 'Khách'}</h1>
             <p className="text-gray-500 m-0 mt-1">{userInfo?.email}</p>
             <span className="inline-block mt-3 px-3 py-1 bg-indigo-50 text-indigo-700 text-xs font-bold rounded-full uppercase border border-indigo-100">{userInfo?.role}</span>
          </div>
      </div>

      <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
        <Tabs 
            defaultActiveKey="1" 
            size="large"
            items={[
                {
                    key: '1', 
                    label: 'Thông tin cá nhân', 
                    children: (
                        <Form layout="vertical" form={form} onFinish={onUpdateProfile} className="mt-6">
                            <Row gutter={24}>
                                <Col span={12}><Form.Item label="Họ tên" name="fullName" rules={[{required: true}]}><Input size="large" prefix={<UserOutlined className="text-gray-400"/>}/></Form.Item></Col>
                                <Col span={12}><Form.Item label="SĐT" name="phone"><Input size="large" prefix={<PhoneOutlined className="text-gray-400"/>}/></Form.Item></Col>
                                <Col span={24}><Form.Item label="Email" name="email"><Input size="large" disabled prefix={<MailOutlined className="text-gray-400"/>}/></Form.Item></Col>
                                <Col span={24}><Form.Item label="Địa chỉ" name="address"><Input.TextArea rows={3}/></Form.Item></Col>
                            </Row>
                            <Button type="primary" htmlType="submit" loading={loading} className="bg-indigo-600 h-11 px-8 font-medium">Lưu thay đổi</Button>
                        </Form>
                    )
                },
                {
                    key: '2', 
                    label: 'Đổi mật khẩu', 
                    children: (
                        <Form layout="vertical" className="max-w-md mt-6">
                            <Form.Item label="Mật khẩu cũ" name="old" rules={[{required: true}]}><Input.Password size="large"/></Form.Item>
                            <Form.Item label="Mật khẩu mới" name="new" rules={[{required: true}]}><Input.Password size="large"/></Form.Item>
                            <Button icon={<SafetyOutlined />} size="large" className="h-11">Cập nhật</Button>
                        </Form>
                    )
                }
            ]}
        />
      </div>
    </div>
  );
};
export default ProfilePage;