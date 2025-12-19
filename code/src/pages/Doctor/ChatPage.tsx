import React, { useState } from 'react';
import { List, Avatar, Input, Button, Badge, Typography } from 'antd';
import { SendOutlined, UserOutlined, SearchOutlined, PaperClipOutlined } from '@ant-design/icons';
// Đã xóa import Layout thừa

const { Text } = Typography;

const ChatPage: React.FC = () => {
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [messageInput, setMessageInput] = useState('');
  const [messages, setMessages] = useState([
    { id: 1, sender: 'user', text: 'Chào bác sĩ, tôi mới chụp ảnh xong.' },
    { id: 2, sender: 'me', text: 'Chào bạn, tôi đang xem hồ sơ của bạn đây.' },
  ]);

  const users = [
    { id: 1, name: 'Nguyễn Văn A', msg: 'Bác sĩ ơi, tôi thấy mắt hơi mờ...', time: '10:30', unread: 2 },
  ];

  const handleSend = () => {
    if (!messageInput.trim()) return;
    setMessages([...messages, { id: Date.now(), sender: 'me', text: messageInput }]);
    setMessageInput('');
  };

  return (
    <div className="h-[80vh] bg-white border border-gray-200 rounded-xl overflow-hidden flex shadow-sm">
      <div className="w-80 border-r border-gray-100 flex flex-col bg-gray-50">
        <div className="p-4 border-b border-gray-200 bg-white"><Input prefix={<SearchOutlined className="text-gray-400" />} placeholder="Tìm kiếm..." className="rounded-full bg-gray-100 border-none" /></div>
        <div className="flex-1 overflow-y-auto">
          <List itemLayout="horizontal" dataSource={users} renderItem={(item) => (
              <List.Item className={`cursor-pointer hover:bg-white p-4 ${selectedUser?.id === item.id ? 'bg-white border-l-4 border-l-indigo-500' : ''}`} onClick={() => setSelectedUser(item)}>
                <List.Item.Meta avatar={<Badge count={item.unread} size="small"><Avatar size="large" icon={<UserOutlined />} className="bg-indigo-100 text-indigo-600" /></Badge>} title={<Text strong>{item.name}</Text>} description={<Text ellipsis className="text-gray-500 text-xs">{item.msg}</Text>} />
              </List.Item>
            )}
          />
        </div>
      </div>
      <div className="flex-1 flex flex-col bg-white">
        {selectedUser ? (
          <>
            <div className="p-4 border-b border-gray-100 flex items-center gap-3 shadow-sm z-10"><Avatar size="large" icon={<UserOutlined />} className="bg-indigo-600" /><h4 className="font-bold m-0 text-gray-800">{selectedUser.name}</h4></div>
            <div className="flex-1 overflow-y-auto p-4 bg-slate-50 space-y-4">
              {messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}><div className={`max-w-[70%] p-3 rounded-2xl shadow-sm ${msg.sender === 'me' ? 'bg-indigo-500 text-white rounded-br-none' : 'bg-gray-100 text-gray-700 border border-gray-200 rounded-bl-none'}`}>{msg.text}</div></div>
              ))}
            </div>
            <div className="p-4 border-t border-gray-100 bg-white flex gap-2"><Button shape="circle" icon={<PaperClipOutlined />} /><Input className="rounded-full" value={messageInput} onChange={e => setMessageInput(e.target.value)} onPressEnter={handleSend} /><Button type="primary" shape="circle" icon={<SendOutlined />} onClick={handleSend} /></div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-400"><UserOutlined className="text-6xl mb-4 opacity-20" /><p>Chọn bệnh nhân để chat</p></div>
        )}
      </div>
    </div>
  );
};
export default ChatPage;