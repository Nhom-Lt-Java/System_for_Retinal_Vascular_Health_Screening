# Backend (Spring Boot)
FROM eclipse-temurin:17-jdk-alpine

WORKDIR /app

# copy file jar đã build
COPY target/*.jar app.jar

EXPOSE 8080

CMD ["java", "-jar", "app.jar"]
