# 1. Sử dụng Node.js để chạy
FROM node:18-alpine

# 2. Tạo thư mục làm việc bên trong Docker
WORKDIR /app

# 3. Copy file danh sách thư viện (package.json) vào trước
COPY package*.json ./

# 4. Cài đặt các thư viện
RUN npm install

# 5. Copy toàn bộ code còn lại vào
COPY . .

# 6. Mở cổng 5173 (Cổng mặc định của Vite)
EXPOSE 5173

# 7. Chạy lệnh khởi động (giống như bạn gõ npm run dev)
CMD ["npm", "run", "dev", "--", "--host"]