import { cookies } from 'next/headers';
import ItemList from '../components/item-list';
import { BillData, BillItem } from '../types/Bill';
import { Suspense } from 'react';

interface Member {
  id: number;
  name: string;
  items: {
    [key: string]: BillItem;
  };
}

async function handleFinalCalc(members: Member[], billData: BillData) {
  'use server';
  const cookieStore = await cookies();
  cookieStore.set('billData', JSON.stringify(billData));
  cookieStore.set('members', JSON.stringify(members));
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
