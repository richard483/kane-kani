FROM node:22-alpine AS builder

WORKDIR /app

COPY package.json package.json
COPY package-lock.json package-lock.json

RUN npm install

COPY . .

ENV GEMINI_API_KEY=dummy_value

RUN npm run build

FROM node:22-alpine AS runner

WORKDIR /app

COPY --from=builder /app/package.json ./
COPY --from=builder /app/package-lock.json ./
RUN npm install --omit=dev

COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.ts ./next.config.ts
COPY --from=builder /app/node_modules/sharp ./node_modules/sharp

COPY src/middleware.ts ./src/middleware.ts
COPY src/app/types/Bill.ts ./src/app/types/Bill.ts