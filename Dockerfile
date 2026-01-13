# Multi-stage build for Expo Web
# Stage 1: Build the Expo web app
FROM --platform=$BUILDPLATFORM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install --legacy-peer-deps

# Copy source code
COPY . .

# Build arguments for environment variables
ARG EXPO_PUBLIC_SUPABASE_URL
ARG EXPO_PUBLIC_SUPABASE_ANON_KEY
ARG EXPO_PUBLIC_APP_NAME
ARG EXPO_PUBLIC_APP_VERSION

# Set environment variables for build
ENV EXPO_PUBLIC_SUPABASE_URL=$EXPO_PUBLIC_SUPABASE_URL
ENV EXPO_PUBLIC_SUPABASE_ANON_KEY=$EXPO_PUBLIC_SUPABASE_ANON_KEY
ENV EXPO_PUBLIC_APP_NAME=$EXPO_PUBLIC_APP_NAME
ENV EXPO_PUBLIC_APP_VERSION=$EXPO_PUBLIC_APP_VERSION

# Build the Expo web app
RUN npm run build:web

# Stage 2: Production - use nginx to serve
FROM --platform=$BUILDPLATFORM nginx:alpine

# Copy built assets from builder
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
