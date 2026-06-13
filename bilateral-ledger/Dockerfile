# Stage 1: Build
FROM eclipse-temurin:21-jdk AS build
WORKDIR /app
COPY . .
RUN chmod +x mvnw
RUN ./mvnw clean package -DskipTests

# Stage 2: Runtime
FROM eclipse-temurin:21-jre
WORKDIR /app
# Copy the built jar from the build stage
COPY --from=build /app/target/ledger-0.0.1-SNAPSHOT.jar app.jar
# Create a directory for file uploads
RUN mkdir -p uploads
EXPOSE 8080
CMD ["java", "-jar", "app.jar"]