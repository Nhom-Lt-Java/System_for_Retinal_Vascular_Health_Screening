import { Table, Button, Tag, Space, Modal, Form, Input, Select } from 'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { useState } from 'react';

const UserManagement = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id' },
    { title: 'Họ tên', dataIndex: 'name', key: 'name' },
    { title: 'Email', dataIndex: 'email', key: 'email' },
    { 
      title: 'Role', 
      dataIndex: 'role', 
      key: 'role',
      render: (role: string) => {
        let color = role === 'DOCTOR' ? 'blue' : role === 'ADMIN' ? 'gold' : 'green';
        return <Tag color={color}>{role}</Tag>;
      }
    },
    {
      title: 'Action',
      key: 'action',
      render: () => (
        <Space size="middle">
          <Button icon={<EditOutlined />} />
          <Button icon={<DeleteOutlined />} danger />
        </Space>
      ),
    },
  ];

  const data = [
    { key: '1', id: 'U001', name: 'Dr. Strange', email: 'doctor@aura.com', role: 'DOCTOR' },
    { key: '2', id: 'U002', name: 'Tony Stark', email: 'patient@aura.com', role: 'PATIENT' },
  ];

  return (
    <div>
      <div className="flex justify-between mb-4">
        <h3 className="text-lg font-bold">Quản lý tài khoản</h3>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsModalOpen(true)}>
          Thêm người dùng mới
        </Button>
      </div>
      
      <Table columns={columns} dataSource={data} />

      {/* Modal thêm user (FR-32 phân quyền) */}
      <Modal title="Tạo tài khoản mới" open={isModalOpen} onCancel={() => setIsModalOpen(false)}>
        <Form layout="vertical">
          <Form.Item label="Họ tên" name="name"><Input /></Form.Item>
          <Form.Item label="Email" name="email"><Input /></Form.Item>
          <Form.Item label="Vai trò" name="role">
            <Select>
              <Select.Option value="PATIENT">Bệnh nhân</Select.Option>
              <Select.Option value="DOCTOR">Bác sĩ</Select.Option>
              <Select.Option value="CLINIC_ADMIN">Quản lý phòng khám</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};
export default UserManagement;