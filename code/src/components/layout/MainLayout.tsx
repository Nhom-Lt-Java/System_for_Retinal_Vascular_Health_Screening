import React, { useEffect, useState } from 'react';
import { Layout, Menu, Button, Avatar, Badge, Dropdown, MenuProps, Popover, List, Typography, message } from 'antd';
import { 
  BellOutlined, LogoutOutlined, UserOutlined, 
  MenuFoldOutlined, MenuUnfoldOutlined, DownOutlined,
  UploadOutlined, HistoryOutlined, DashboardOutlined, 
  TeamOutlined, MedicineBoxOutlined, FileSearchOutlined
} from '@ant-design/icons';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';

const { Header, Sider, Content } = Layout;
const { Text } = Typography;

const MainLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [role, setRole] = useState<string>('');

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
        try {
            const u = JSON.parse(userStr);
            setUser(u);
            setRole(u.role);
        } catch (e) { console.error(e); }
    } else {
        navigate('/login');
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    message.success('Đăng xuất thành công!');
    navigate('/login');
  };

  const notificationContent = (
    <List
      itemLayout="horizontal"
      dataSource={[{ title: 'Thông báo', desc: 'Chào mừng quay trở lại!', time: 'Mới' }]}
      renderItem={(item) => (
        <List.Item className="hover:bg-gray-50 cursor-pointer p-2 rounded">
          <List.Item.Meta
            avatar={<Avatar style={{ backgroundColor: '#1890ff' }} icon={<BellOutlined />} />}
            title={<Text strong className="text-sm">{item.title}</Text>}
            description={<span className="text-xs text-gray-500">{item.desc}</span>}
          />
        </List.Item>
      )}
      style={{ width: 250 }}
    />
  );

  let sidebarItems: MenuProps['items'] = [];
  if (role === 'DOCTOR') {
    sidebarItems = [
        { key: '/doctor/dashboard', icon: <DashboardOutlined />, label: 'Dashboard' },
        { key: '/doctor/patients', icon: <TeamOutlined />, label: 'Bệnh nhân' },
        { key: '/doctor/chat', icon: <MedicineBoxOutlined />, label: 'Tư vấn' },
    ];
  } else if (role === 'ADMIN') {
    sidebarItems = [
        { key: '/admin/dashboard', icon: <DashboardOutlined />, label: 'Tổng quan' },
        { key: '/admin/users', icon: <TeamOutlined />, label: 'Người dùng' },
        { key: '/admin/reports', icon: <FileSearchOutlined />, label: 'Báo cáo' },
    ];
  } else {
    sidebarItems = [
        { key: '/patient/dashboard', icon: <UploadOutlined />, label: 'Sàng lọc AI' },
        { key: '/patient/history', icon: <HistoryOutlined />, label: 'Lịch sử' },
        { key: '/patient/profile', icon: <UserOutlined />, label: 'Hồ sơ' },
    ];
  }

  const userMenuProps: MenuProps = {
    items: [
      { key: '1', label: 'Hồ sơ cá nhân', icon: <UserOutlined />, onClick: () => navigate('/patient/profile') },
      { type: 'divider' },
      { key: '2', label: 'Đăng xuất', icon: <LogoutOutlined />, danger: true, onClick: handleLogout },
    ]
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      {/* SIDEBAR */}
      <Sider 
        trigger={null} 
        collapsible 
        collapsed={collapsed} 
        theme="light" 
        width={260}
        style={{
          overflow: 'auto',
          height: '100vh',
          position: 'fixed',
          left: 0,
          top: 0,
          bottom: 0,
          zIndex: 100,
          boxShadow: '2px 0 8px rgba(0,0,0,0.05)'
        }}
      >
        <div className="h-16 flex items-center justify-center border-b border-gray-100 bg-white">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold mr-2">A</div>
            {!collapsed && <span className="text-xl font-bold text-indigo-700">AURA</span>}
        </div>
        <Menu mode="inline" selectedKeys={[location.pathname]} items={sidebarItems} onClick={(e) => navigate(e.key)} className="border-none mt-4 px-2" />
      </Sider>

      {/* CONTENT WRAPPER - Đẩy margin trái để tránh bị Sidebar đè */}
      <Layout style={{ marginLeft: collapsed ? 80 : 260, transition: 'all 0.2s' }}>
        <Header className="bg-white sticky top-0 z-50 px-6 flex justify-between items-center shadow-sm h-16 w-full">
          <div className="flex items-center gap-4">
             <Button type="text" icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />} onClick={() => setCollapsed(!collapsed)} />
          </div>

          <div className="flex items-center gap-6">
            <Popover content={notificationContent} title="Thông báo" trigger="click" placement="bottomRight">
                <Badge dot className="cursor-pointer">
                  <BellOutlined className="text-gray-600 text-xl hover:text-indigo-600 transition-colors" />
                </Badge>
            </Popover>
            
            <Dropdown menu={userMenuProps} trigger={['click']}>
              <div className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-1.5 px-3 rounded-full transition-all border border-transparent hover:border-gray-200">
                <Avatar style={{ backgroundColor: '#1c5abcff' }} icon={<UserOutlined />} />
                <div className="hidden md:block leading-tight text-right">
                  <p className="text-sm font-bold text-gray-700 m-0">{user?.fullName || 'User'}</p>
                  <p className="text-xs text-indigo-500 m-0 font-medium capitalize">{role?.toLowerCase()}</p>
                </div>
                <DownOutlined className="text-xs text-gray-400" />
              </div>
            </Dropdown>
          </div>
        </Header>

        <Content className="p-6 bg-[#f3f4f6] min-h-[calc(100vh-64px)] overflow-y-auto">
           {/* Outlet bọc trong div để đảm bảo padding */}
           <div className="animate-fade-in w-full">
              <Outlet />
           </div>
        </Content>
      </Layout>
    </Layout>
  );
};
export default MainLayout;