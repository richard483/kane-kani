import { cookies } from 'next/headers';
import ItemList from '../components/item-list';
import { BillData, BillItem } from '../types/Bill';

interface Member {
  name: string;
  items: Map<BillItem['item_name'], BillItem>;
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
      <ItemList handleFinalCalc={handleFinalCalc} />
    </div>
  );
}
