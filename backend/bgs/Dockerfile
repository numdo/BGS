# Use an official Liberica runtime as a parent image
FROM bellsoft/liberica-openjdk-alpine:17.0.13

# Install FFmpeg using apk
RUN apk update && apk add --no-cache ffmpeg

# Set the working directory
WORKDIR /app

# Copy the JAR file into the container
COPY target/bgs.jar app.jar

# Copy properties files to a specific directory
COPY config/application.properties /app/config/application.properties
COPY config/application-private.properties /app/config/application-private.properties

# Copy credentials files to a resources directory
COPY config/google-credentials.json /app/src/main/resources/google-credentials.json

# Expose the port the app runs on
EXPOSE 8080

# Run the application
ENTRYPOINT ["java", "-jar", "/app/app.jar", "--spring.config.location=/app/config/application.properties"]
