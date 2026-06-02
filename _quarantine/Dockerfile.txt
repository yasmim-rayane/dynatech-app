FROM eclipse-temurin:25-jdk
RUN apt-get update && apt-get install -y curl unzip && \
    curl -s https://ngrok-agent.s3.amazonaws.com/ngrok.asc | tee /etc/apt/trusted.gpg.d/ngrok.asc >/dev/null && \
    echo "deb https://ngrok-agent.s3.amazonaws.com buster main" | tee /etc/apt/sources.list.d/ngrok.list && \
    apt-get update && apt-get install -y ngrok
WORKDIR /app
COPY apps/backend/target/*.jar app.jar
ENTRYPOINT ["java", "-jar", "app.jar"]