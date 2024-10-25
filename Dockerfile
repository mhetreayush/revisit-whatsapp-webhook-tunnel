# Use the official Node.js image
FROM node:22-alpine

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of your application code
COPY . .

# Expose the application port
EXPOSE 3003

# Command to run the application using nodemon
CMD ["npx", "nodemon", "src/app.js"]
