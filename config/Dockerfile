# Step 1: Download Maven and build the Spring Boot app
FROM maven:3.9.6-eclipse-temurin-17 AS build
WORKDIR /app
COPY pom.xml .
COPY src ./src
RUN mvn clean package -DskipTests

# Step 2: Run the compiled application on a lightweight Java server
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
ENV PORT=8080
EXPOSE 8080
# The -Xmx256m flag strictly limits memory so Render doesn't crash your free tier
ENTRYPOINT ["java", "-Xmx256m", "-jar", "app.jar"]