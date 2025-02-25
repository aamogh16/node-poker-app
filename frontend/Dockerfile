FROM node:20.11.0-alpine3.19

WORKDIR /app

# Enable Corepack to manage Yarn versions
RUN corepack enable

# Set Yarn version to match project
RUN corepack prepare yarn@4.2.2 --activate

# Copy configuration files first
COPY package.json yarn.lock .yarnrc.yml ./
COPY frontend/package.json ./frontend/

# Configure Yarn to use node-modules linker
RUN yarn config set nodeLinker node-modules

# Install dependencies
RUN yarn install

# Copy frontend source code
COPY frontend/ ./frontend/

# Set working directory to frontend
WORKDIR /app/frontend

# Install dependencies again to ensure everything is in place
RUN yarn install

# Build the application
RUN yarn build

# Expose the port the app runs on
EXPOSE 3000

# Start the application
CMD ["yarn", "start"]
