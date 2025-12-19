import React from 'react';
import ReactDOM from 'react-dom/client';
import { ConfigProvider } from 'antd'; // Import cái này
import App from './App.tsx';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#0ea5e9', // Màu xanh da trời hiện đại (Sky Blue)
          borderRadius: 8,         // Bo góc mềm mại hơn
          fontFamily: "'Inter', sans-serif",
          colorBgContainer: '#ffffff',
        },
        components: {
          Button: {
            controlHeight: 40, // Nút bấm cao hơn, dễ bấm hơn
            fontWeight: 600,
          },
          Card: {
            boxShadow: '0 4px 12px rgba(0,0,0,0.05)', // Card nào cũng có bóng mờ đẹp
          },
          Layout: {
            bodyBg: '#f0f9ff', // Nền web màu xanh cực nhạt cho dịu mắt
          }
        },
      }}
    >
      <App />
    </ConfigProvider>
  </React.StrictMode>,
);