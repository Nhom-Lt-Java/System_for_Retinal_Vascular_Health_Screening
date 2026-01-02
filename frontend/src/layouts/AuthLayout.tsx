import React from 'react';
import Logo from '../components/Logo';

export default function AuthLayout({ children, title }: { children: React.ReactNode, title: string }) {
  return (
    <div className="min-h-screen w-full relative flex flex-col font-sans overflow-hidden">
      
      {/* 1. ẢNH NỀN TOÀN MÀN HÌNH */}
      <div className="absolute inset-0 z-0">
        <img 
          src="https://images.unsplash.com/photo-1579684385127-1ef15d508118?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80" 
          alt="Medical Background" 
          className="w-full h-full object-cover"
        />
        {/* Lớp phủ màu xanh nhẹ để làm dịu ảnh */}
        <div className="absolute inset-0 bg-blue-900/30 mix-blend-multiply"></div>
      </div>

      {/* 2. HEADER TRẮNG Ở TRÊN (Giống UTH) */}
      <header className="relative z-20 h-16 bg-white shadow-sm flex items-center justify-between px-6 lg:px-12">
         <div className="flex items-center gap-2">
            <Logo className="w-8 h-8 text-blue-700" textSize="text-xl text-blue-800 font-bold" />
         </div>
         <div className="text-sm text-gray-500 hidden sm:block">
            Hệ thống Sàng lọc Sức khỏe Võng mạc
         </div>
      </header>

      {/* 3. KHUNG CHỨA NỔI (WHITE BOX OVERLAY) */}
      <div className="flex-1 relative z-10 flex items-center justify-center p-4 animate-fade-in">
        <div className="w-full max-w-[480px] bg-white rounded-2xl shadow-2xl overflow-hidden">
          
          {/* Tiêu đề hộp */}
          <div className="pt-8 px-8 pb-2 text-center">
             <h2 className="text-3xl font-bold text-gray-800">{title}</h2>
          </div>

          {/* Nội dung Form */}
          <div className="p-8 pt-6">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}