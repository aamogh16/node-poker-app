FROM node:20.11.0-alpine3.19

WORKDIR /app

# Enable Corepack to manage Yarn versions
RUN corepack enable

# Set Yarn version to match project
RUN corepack prepare yarn@4.2.2 --activate

# Copy root workspace files
COPY package.json yarn.lock .yarnrc.yml ./
COPY backend/package.json ./backend/

# Install dependencies
RUN yarn config set enableScripts false && yarn install

# Copy backend source code
COPY backend/ ./backend

# Set working directory to backend
WORKDIR /app/backend

# Build the application
RUN yarn build

# Expose the port the app runs on
EXPOSE 3002

# Start the application
CMD ["yarn", "start"]
