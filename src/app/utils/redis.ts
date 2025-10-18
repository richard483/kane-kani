import Redis from 'ioredis';
import { BillData } from '../types/Bill';
import { Member } from '../types/Member';

interface CachedData {
  billData: BillData;
  members: Member[];
}

const redis = new Redis({
  host: process.env.REDIS_HOST,
  username: process.env.REDIS_USERNAME,
  password: process.env.REDIS_PASSWORD,
  port: Number(process.env.REDIS_PORT) || 6379,
  maxRetriesPerRequest: 3,
  lazyConnect: true,
});

export function generateId(): string {
  const epochMilliseconds = Date.now();
  const epochHex = epochMilliseconds.toString(16);
  return Math.random().toString(36).substring(2, 15) + '-' + epochHex;
}

export async function saveDataToRedis(billData: BillData, members: Member[]): Promise<string> {
  const id = generateId();
  const data: CachedData = { billData, members };

  const expirationSeconds = 30 * 24 * 60 * 60;

  await redis.setex(`bill:${id}`, expirationSeconds, JSON.stringify(data));

  return id;
}

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

export async function deleteDataFromRedis(id: string): Promise<void> {
  await redis.del(`bill:${id}`);
}

export default redis;