# Stage 1: Install dependencies and build the project
FROM node:21-alpine AS builder

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json (or yarn.lock)
COPY package.json package.json
COPY package-lock.json package-lock.json

# Install dependencies
RUN npm install

# Copy the rest of your application's source code
COPY . .


# Build the Next.js application
RUN npm run build

# Stage 2: Create a minimal production image
FROM node:21-alpine AS runner

# Set the working directory in the container
WORKDIR /app

# Copy production dependencies from the builder stage
COPY --from=builder /app/package.json ./
COPY --from=builder /app/package-lock.json ./
RUN npm install --omit=dev

# Copy the Next.js build output from the builder stage
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.ts ./next.config.ts
COPY --from=builder /app/node_modules/sharp ./node_modules/sharp

# Copy middleware and type definitions
COPY src/middleware.ts ./src/middleware.ts
COPY src/app/types/Bill.ts ./src/app/types/Bill.ts

# Expose the application port
EXPOSE 3000

# Set the command to run the application
CMD ["npm", "start"]