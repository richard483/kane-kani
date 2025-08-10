import { cookies } from 'next/headers';
import FinalCalc from '../components/final-calc';
import { BillData, BillItem } from '../types/Bill';
import { Suspense } from 'react';

interface Member {
  id: number;
  name: string;
  items: {
    [key: string]: BillItem;
  };
}

async function getCookieData(): Promise<{
  billData: BillData | null;
  members: Member[];
}> {
  const cookieStore = await cookies();
  const billData = cookieStore.get('billData');
  const members = cookieStore.get('members');

  return {
    billData: billData ? JSON.parse(billData.value) : null,
    members: members ? JSON.parse(members.value) : [],
  };
}

export default function Home() {
  return (
    <div className="flex flex-col justify-center items-center mt-8 my-24">
      <h1 className="text-xl font-bold mb-16 text-center">
        Review Your Bill Data!
      </h1>
      <div>
        {getCookieData().then(({ billData, members }) => {
          if (!billData || members.length === 0) {
            return <p>No bill data or members found. Please upload a bill.</p>;
          }
          return (
            <div>
              <h2 className="text-lg font-semibold mb-4">Bill Summary</h2>
              <p>Title: {billData.bill_title}</p>
              <p>Description: {billData.bill_description}</p>
              <p>Total Amount: {billData.total_price}</p>
              <h3 className="text-md font-semibold mt-4">Members:</h3>
              <ul className="list-disc ml-6">
                {members.map((member, index) => (
                  <li key={index} className="mb-2">
                    <span className="font-bold">{member.name}</span>
                    <ul className="list-disc ml-4">
                      {Object.values(member.items).map((item, itemIndex) => (
                        <li key={itemIndex}>
                          {item.item_name} - {item.item_price} x{' '}
                          {item.item_multiply}
                        </li>
                      ))}
                      <li className="font-bold">
                        Total:{' '}
                        {Object.values(member.items).reduce(
                          (acc, item) =>
                            acc + item.item_price * item.item_multiply,
                          0,
                        )}
                      </li>
                    </ul>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
      <Suspense>
        <FinalCalc />
      </Suspense>
    </div>
  );
}
