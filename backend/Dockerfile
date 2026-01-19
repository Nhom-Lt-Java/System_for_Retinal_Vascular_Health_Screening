# --- GIAI ĐOẠN 1: Dùng Maven để Build ra file .jar ---
FROM maven:3.9.6-eclipse-temurin-17 AS build
WORKDIR /app
COPY . .
# Lệnh này sẽ tự động tạo thư mục target và file .jar
RUN mvn clean package -DskipTests

# --- GIAI ĐOẠN 2: Chạy ứng dụng (Chỉ lấy file .jar đã tạo ở trên) ---
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
# Copy file từ Giai đoạn 1 sang
COPY --from=build /app/target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java","-jar","app.jar"]