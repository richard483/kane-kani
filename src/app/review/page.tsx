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
  cookieStore.set('members', JSON.stringify(Array.from(members.entries())));
}

export default function ReviewPage() {
  return (
    <div className="flex flex-col justify-center items-center min-h-screen p-4 sm:p-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl sm:text-5xl md:text-6xl mb-4">
          Review Your Bill
        </h1>
        <p className="mb-12 text-base sm:text-lg md:text-xl">
          Please review the extracted bill data and make any necessary
          corrections.
        </p>
      </div>
      <div className="w-full max-w-4xl">
        <ItemList handleFinalCalc={handleFinalCalc} />
      </div>
    </div>
  );
}
