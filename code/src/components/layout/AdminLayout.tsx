import { Layout, Menu, Avatar, Dropdown } from 'antd';
import { UserOutlined, DashboardOutlined, TeamOutlined, BankOutlined, LogoutOutlined } from '@ant-design/icons';
import { Outlet, useNavigate, Link } from 'react-router-dom';

const { Header, Sider, Content } = Layout;

const AdminLayout = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  const menuItems = [
    { key: '1', icon: <DashboardOutlined />, label: <Link to="/admin/dashboard">Dashboard</Link> },
    { key: '2', icon: <TeamOutlined />, label: <Link to="/admin/users">Quản lý User</Link> },
    { key: '3', icon: <BankOutlined />, label: <Link to="/admin/clinics">Duyệt Phòng khám</Link> },
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider theme="dark" collapsible>
        <div className="h-16 text-white text-xl font-bold flex items-center justify-center">AURA ADMIN</div>
        <Menu theme="dark" mode="inline" defaultSelectedKeys={['1']} items={menuItems} />
      </Sider>
      <Layout>
        <Header className="bg-white flex justify-end items-center px-6 shadow-sm">
           <Button type="text" icon={<LogoutOutlined />} onClick={handleLogout}>Logout</Button>
        </Header>
        <Content className="m-4 bg-white p-6 rounded shadow">
          <Outlet /> {/* Nội dung thay đổi ở đây */}
        </Content>
      </Layout>
    </Layout>
  );
};
export default AdminLayout;