# Use an official Liberica runtime as a parent image
FROM bellsoft/liberica-openjdk-alpine:17.0.13

# Set the working directory
WORKDIR /app

# Copy the JAR file into the container
COPY target/bgs.jar app.jar

# Copy properties files to a specific directory
COPY config/application.properties /app/config/application.properties
COPY config/application-private.properties /app/config/application-private.properties

# Expose the port the app runs on
EXPOSE 8080

# Run the application
ENTRYPOINT ["java", "-jar", "/app/app.jar", "--spring.config.location=/app/config/application.properties"]
