import { cookies } from 'next/headers';
import FinalCalc from '../components/final-calc';
import { BillData, BillItem } from '../types/Bill';

interface Member {
  name: string;
  items: [string, BillItem][];
}

async function getCookieData(): Promise<{
  billData: BillData | null;
  members: Member[];
}> {
  'use server';
  const cookieStore = await cookies();
  const billDataCookie = cookieStore.get('billData');
  const membersCookie = cookieStore.get('members');

  const billData = billDataCookie ? JSON.parse(billDataCookie.value) : null;
  let members: Member[] = membersCookie ? JSON.parse(membersCookie.value) : [];
  members = members.map((member) => ({
    ...member,
    items: new Map(member.items),
  }));

  return {
    billData,
    members,
  };
}
export default async function FinalPage() {
  const { billData, members } = await getCookieData();

  if (!billData || members.length === 0) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen p-4 sm:p-8">
        <h1 className="text-2xl font-bold text-center">
          No bill data or members found. Please go back and upload a bill.
        </h1>
      </div>
    );
  }

  return (
    <div className="flex flex-col justify-center items-center min-h-screen p-4 sm:p-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl sm:text-5xl md:text-6xl mb-4">
          Final Calculation
        </h1>
        <p className="mb-12 text-base sm:text-lg md:text-xl">
          Here's the breakdown of what each person owes.
        </p>
      </div>
      <div className="w-full max-w-4xl">
        <FinalCalc billData={billData} members={members} />
      </div>
    </div>
  );
}
