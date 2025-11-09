FROM node:18

# Install Java 17
RUN apt-get update && \
    apt-get install -y openjdk-17-jdk && \
    rm -rf /var/lib/apt/lists/*

# Verify Java installation
RUN java -version

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy application files
COPY . .

# Build application
RUN npm run build

# Create uploads and tools directories
RUN mkdir -p uploads tools

# Expose port
EXPOSE 3000

# Set environment variables
ENV NODE_ENV=production

# Render uses PORT environment variable, Next.js will use it automatically
# But we set a default for local development
ENV PORT=3000

# Start application
# Next.js will use PORT from environment variable automatically
CMD ["npm", "start"]

