import React, { useState } from 'react';
import { Table, Tag, Button, Input, Select, Card, Row, Col, Statistic, Progress } from 'antd';
import { SearchOutlined, FolderOpenOutlined, UsergroupAddOutlined, AlertOutlined, CheckCircleOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Option } = Select;

const DoctorDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [searchText, setSearchText] = useState('');

  // Dữ liệu mẫu phong phú hơn
  const initialData = [
    { key: '1', id: 'P2025-001', name: 'Le Van Cuong', age: 45, risk: 'HIGH', date: '10/12/2025', status: 'Pending' },
    { key: '2', id: 'P2025-002', name: 'Tran Thi Dung', age: 32, risk: 'LOW', date: '11/12/2025', status: 'Reviewed' },
    { key: '3', id: 'P2025-003', name: 'Nguyen Van Em', age: 60, risk: 'MEDIUM', date: '12/12/2025', status: 'Pending' },
    { key: '4', id: 'P2025-004', name: 'Pham Thi F', age: 28, risk: 'LOW', date: '12/12/2025', status: 'Reviewed' },
    { key: '5', id: 'P2025-005', name: 'Hoang Van G', age: 72, risk: 'HIGH', date: '13/12/2025', status: 'Pending' },
  ];

  const filteredData = initialData.filter(item => 
    item.name.toLowerCase().includes(searchText.toLowerCase()) || 
    item.id.toLowerCase().includes(searchText.toLowerCase())
  );

  const columns = [
    { title: 'Mã BN', dataIndex: 'id', key: 'id', render: (t: string) => <span className="font-mono font-semibold">{t}</span> },
    { title: 'Họ và Tên', dataIndex: 'name', key: 'name', render: (t: string) => <a className="font-medium text-indigo-600">{t}</a> },
    { title: 'Tuổi', dataIndex: 'age', key: 'age' },
    { 
      title: 'Nguy cơ AI', 
      dataIndex: 'risk', 
      key: 'risk',
      render: (risk: string) => {
        let color = risk === 'HIGH' ? 'red' : risk === 'MEDIUM' ? 'orange' : 'green';
        return <Tag color={color} className="font-bold px-3 py-1 rounded-full">{risk}</Tag>;
      }
    },
    { 
      title: 'Độ tin cậy', 
      key: 'confidence', 
      render: (_: any, record: any) => (
        <div style={{ width: 100 }}>
            <Progress percent={record.risk === 'HIGH' ? 92 : 85} size="small" status={record.risk === 'HIGH' ? 'exception' : 'active'} showInfo={false} />
        </div>
      )
    },
    { title: 'Ngày chụp', dataIndex: 'date', key: 'date' },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      render: (status: string) => (
        <BadgeStatus status={status} />
      )
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_: any, record: any) => (
        <Button 
            type="primary" ghost size="small"
            icon={<FolderOpenOutlined />}
            onClick={() => navigate(`/doctor/patient/${record.id}`)} 
        >
            Chi tiết
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* 1. SECTION THỐNG KÊ (STATISTIC CARDS) */}
      <Row gutter={16}>
        <Col span={6}>
            <Card bordered={false} className="shadow-sm hover:shadow-md transition-shadow">
                <Statistic title="Bệnh nhân hôm nay" value={12} prefix={<UsergroupAddOutlined />} valueStyle={{ color: '#3f8600' }} />
            </Card>
        </Col>
        <Col span={6}>
            <Card bordered={false} className="shadow-sm hover:shadow-md transition-shadow">
                <Statistic title="Ca nguy cơ cao" value={3} prefix={<AlertOutlined />} valueStyle={{ color: '#cf1322' }} />
            </Card>
        </Col>
        <Col span={6}>
            <Card bordered={false} className="shadow-sm hover:shadow-md transition-shadow">
                <Statistic title="Đã duyệt" value={8} prefix={<CheckCircleOutlined />} valueStyle={{ color: '#1890ff' }} />
            </Card>
        </Col>
        <Col span={6}>
            <Card bordered={false} className="shadow-sm hover:shadow-md transition-shadow">
                <Statistic title="Chờ xử lý" value={4} prefix={<ClockCircleOutlined />} valueStyle={{ color: '#faad14' }} />
            </Card>
        </Col>
      </Row>

      {/* 2. SECTION CÔNG CỤ LỌC & TÌM KIẾM */}
      <Card className="shadow-sm border-gray-100" title={<span className="text-lg font-bold text-gray-700">Danh sách bệnh nhân</span>}>
        <div className="flex justify-between items-center mb-6">
            <div className="flex gap-4">
                <Input 
                    placeholder="Tìm theo tên hoặc mã hồ sơ..." 
                    prefix={<SearchOutlined className="text-gray-400" />} 
                    onChange={e => setSearchText(e.target.value)}
                    className="w-80 rounded-md"
                    size="large"
                />
                <Select defaultValue="all" size="large" className="w-40">
                    <Option value="all">Tất cả mức độ</Option>
                    <Option value="high">Nguy cơ cao</Option>
                </Select>
            </div>
            <Button type="primary" size="large" icon={<UsergroupAddOutlined />}>Thêm hồ sơ mới</Button>
        </div>
        
        <Table 
            columns={columns} 
            dataSource={filteredData} 
            pagination={{ pageSize: 6 }} 
            rowClassName="hover:bg-blue-50 cursor-pointer transition-colors"
        />
      </Card>
    </div>
  );
};

// Component nhỏ hiển thị trạng thái đẹp hơn
const BadgeStatus = ({ status }: { status: string }) => {
    const isPending = status === 'Pending';
    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${isPending ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${isPending ? 'bg-yellow-500' : 'bg-green-500'}`}></span>
            {isPending ? 'Chờ duyệt' : 'Đã duyệt'}
        </span>
    );
};

export default DoctorDashboard;