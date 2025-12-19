import React from 'react';
import { Card, Statistic, Row, Col, Table, Tag } from 'antd';
import { UsergroupAddOutlined, RiseOutlined, AuditOutlined, CloudServerOutlined } from '@ant-design/icons';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts';

// Dữ liệu giả lập cho biểu đồ
const monthlyData = [
  { name: 'T1', scans: 400, errors: 24 },
  { name: 'T2', scans: 300, errors: 13 },
  { name: 'T3', scans: 550, errors: 38 },
  { name: 'T4', scans: 800, errors: 20 },
  { name: 'T5', scans: 1200, errors: 45 },
  { name: 'T6', scans: 1500, errors: 30 },
];

const AdminDashboard: React.FC = () => {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Tổng quan hệ thống (System Overview)</h2>

      {/* 1. CARDS THỐNG KÊ (FR-35) */}
      <Row gutter={16} className="mb-6">
        <Col span={6}>
          <Card bordered={false} className="shadow-sm">
            <Statistic title="Tổng người dùng" value={1128} prefix={<UsergroupAddOutlined className="text-blue-500"/>} />
          </Card>
        </Col>
        <Col span={6}>
          <Card bordered={false} className="shadow-sm">
            <Statistic title="Ảnh đã phân tích" value={9345} prefix={<CloudServerOutlined className="text-green-500"/>} />
          </Card>
        </Col>
        <Col span={6}>
          <Card bordered={false} className="shadow-sm">
            <Statistic title="Tỷ lệ bệnh lý" value={18.2} precision={1} suffix="%" prefix={<RiseOutlined className="text-red-500"/>} />
          </Card>
        </Col>
        <Col span={6}>
          <Card bordered={false} className="shadow-sm">
            <Statistic title="Phòng khám Active" value={12} prefix={<AuditOutlined className="text-purple-500"/>} />
          </Card>
        </Col>
      </Row>

      {/* 2. BIỂU ĐỒ (FR-36) */}
      <Row gutter={16}>
        <Col span={16}>
            <Card title="Xu hướng sử dụng hệ thống (6 tháng qua)" className="shadow-sm mb-6">
                <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={monthlyData}>
                            <defs>
                                <linearGradient id="colorScans" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.8}/>
                                    <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <XAxis dataKey="name" />
                            <YAxis />
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <Tooltip />
                            <Area type="monotone" dataKey="scans" stroke="#0ea5e9" fillOpacity={1} fill="url(#colorScans)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </Card>
        </Col>
        <Col span={8}>
            <Card title="Tỷ lệ lỗi AI" className="shadow-sm mb-6">
                 <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={monthlyData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="errors" fill="#ff4d4f" name="Lỗi/Thất bại" />
                        </BarChart>
                    </ResponsiveContainer>
                 </div>
            </Card>
        </Col>
      </Row>

      {/* 3. BẢNG HOẠT ĐỘNG GẦN ĐÂY */}
      <Card title="Hoạt động gần đây" className="shadow-sm">
         <Table 
            dataSource={[
                { key:1, user: 'Dr. Minh', action: 'Upload 50 images', time: '10 phút trước', status: 'Success' },
                { key:2, user: 'Patient Hoa', action: 'View Result', time: '15 phút trước', status: 'Active' },
                { key:3, user: 'Clinic ABC', action: 'Register', time: '1 giờ trước', status: 'Pending' },
            ]}
            columns={[
                { title: 'User', dataIndex: 'user' },
                { title: 'Hành động', dataIndex: 'action' },
                { title: 'Thời gian', dataIndex: 'time', className: 'text-gray-400' },
                { title: 'Trạng thái', dataIndex: 'status', render: (s) => <Tag color={s==='Success'?'green':(s==='Pending'?'orange':'blue')}>{s}</Tag> }
            ]}
            pagination={false}
         />
      </Card>
    </div>
  );
};

export default AdminDashboard;