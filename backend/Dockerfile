# --- Build Stage ---
FROM node:20-alpine AS builder

WORKDIR /usr/src/app

# Copy dependency files
COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies (including devDependencies)
RUN npm ci

# Copy the rest of the application source code
COPY . .

# Generate Prisma Client and build TypeScript source
RUN npx prisma generate
RUN npm run build

# Prune development dependencies to keep the image slim
RUN npm prune --production

# --- Runtime Stage ---
FROM node:20-alpine AS runner

# Set production environment
ENV NODE_ENV=production
WORKDIR /usr/src/app

# Securely run as a non-root user
USER node

# Copy build artifacts and dependencies from the builder stage
COPY --from=builder --chown=node:node /usr/src/app/package*.json ./
COPY --from=builder --chown=node:node /usr/src/app/node_modules ./node_modules
COPY --from=builder --chown=node:node /usr/src/app/dist ./dist
COPY --from=builder --chown=node:node /usr/src/app/prisma ./prisma

# Expose port and run server
EXPOSE 4000
CMD ["node", "dist/index.js"]
