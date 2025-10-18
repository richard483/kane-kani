import ItemList from '../components/item-list';
import { BillData, BillItem } from '../types/Bill';
import { Suspense } from 'react';
import { saveDataToRedis } from '../utils/redis';
import { redirect } from 'next/navigation';

interface Member {
  id: number;
  name: string;
  items: {
    [key: string]: BillItem;
  };
}

async function handleFinalCalc(members: Member[], billData: BillData) {
  'use server';

  // Save data to Redis and get generated ID
  const generatedId = await saveDataToRedis(billData, members);

  // Redirect to /final/[id]
  redirect(`/final/${generatedId}`);
}

export default function Home() {
  return (
    <div className="flex flex-col justify-center items-center mt-8 my-24">
      <h1 className="text-xl font-bold mb-16 text-center">
        Review Your Bill Data!
      </h1>
      <Suspense>
        <ItemList handleFinalCalc={handleFinalCalc} />
      </Suspense>
    </div>
  );
}
