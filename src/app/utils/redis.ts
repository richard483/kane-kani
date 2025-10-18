import Redis from 'ioredis';
import { BillData, BillItem } from '../types/Bill';

interface Member {
  id: number;
  name: string;
  items: {
    [key: string]: BillItem;
  };
}

interface CachedData {
  billData: BillData;
  members: Member[];
}

// Create Redis client only in runtime, not during build
const redis = new Redis({
  host: process.env.REDIS_HOST,
  username: process.env.REDIS_USERNAME,
  password: process.env.REDIS_PASSWORD,
  port: Number(process.env.REDIS_PORT) || 6379,
  maxRetriesPerRequest: 3,
  lazyConnect: true, // Connect only when needed
});

// Generate a unique ID for the data
export function generateId(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

// Save data to Redis with 1 month expiration
export async function saveDataToRedis(billData: BillData, members: Member[]): Promise<string> {
  const id = generateId();
  const data: CachedData = { billData, members };

  // Set data with 1 month expiration (30 days * 24 hours * 60 minutes * 60 seconds)
  const expirationSeconds = 30 * 24 * 60 * 60;

  await redis.setex(`bill:${id}`, expirationSeconds, JSON.stringify(data));

  return id;
}

// Retrieve data from Redis
export async function getDataFromRedis(id: string): Promise<CachedData | null> {
  try {
    const data = await redis.get(`bill:${id}`);

    if (!data) {
      return null;
    }

    return JSON.parse(data) as CachedData;
  } catch (error) {
    console.error('Error retrieving data from Redis:', error);
    return null;
  }
}

// Optional: Function to delete data from Redis
export async function deleteDataFromRedis(id: string): Promise<void> {
  await redis.del(`bill:${id}`);
}

export default redis;