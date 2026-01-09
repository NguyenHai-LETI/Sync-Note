# Build Stage
FROM node:22-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

# Build the app
RUN npm run build

# We don't need a runtime here if we are just using the artifacts
# But to make this container useful in compose as a "builder" that populates a volume:
CMD ["sh", "-c", "cp -r dist/* /frontend_build/"]
