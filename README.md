This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Prerequisites

Before running the application, make sure you have Redis installed and running on your local machine.

### Installing Redis

**Windows:**
1. Download Redis from the official website or use Windows Subsystem for Linux (WSL)
2. Alternatively, use Docker: `docker run -d -p 6379:6379 redis:latest`

**macOS:**
```bash
brew install redis
brew services start redis
```

**Linux:**
```bash
sudo apt-get install redis-server
sudo systemctl start redis-server
```

### Verifying Redis Installation

To verify Redis is running on the default port (6379):
```bash
redis-cli ping
```
You should see a response: `PONG`

## Getting Started

First, make sure Redis is running, then start the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Features

- **Bill Processing**: Upload and process bill images to extract item information
- **Member Management**: Add multiple members and assign items to them
- **Item Splitting**: Split items among multiple members with proportional pricing
- **Redis Caching**: Bill data is stored in Redis with 1-month expiration
- **Dynamic URLs**: Each processed bill gets a unique URL for easy sharing
- **Responsive Design**: Works on desktop and mobile devices

## Project Structure

- `/src/app/components/` - React components
- `/src/app/utils/redis.ts` - Redis utility functions for data storage
- `/src/app/review/` - Review page for assigning items to members
- `/src/app/final/[id]/` - Dynamic route for displaying final bill calculations
- `/src/app/types/Bill.ts` - TypeScript type definitions

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
