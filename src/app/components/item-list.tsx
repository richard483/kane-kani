'use client';

import { useSearchParams } from 'next/navigation';
import { BillData, BillItem } from '../types/Bill';
import { useEffect, useState } from 'react';

interface Member {
  name: string;
  items: BillItem[];
}

export default function ItemList() {
  const [unAssignedItems, setUnAssignedItems] = useState<BillData | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const searchParams = useSearchParams();
  const billDataString = searchParams.get('data');
  const billData: BillData | null = billDataString
    ? (JSON.parse(billDataString) as BillData)
    : null;

  useEffect(() => {
    if (billData) {
      setUnAssignedItems(billData);
    }
  }, []);
  return (
    <div className="flex flex-col gap-10 justify-center items-center w-full h-full">
      <div>
        <h3>Member</h3>
        <ul className="list-disc">
          {members.map((member, index) => (
            <li key={index} className="mb-2">
              <span className="font-bold">{member.name}</span>
              <ul className="list-disc ml-4">
                {member.items.map((item, itemIndex) => (
                  <li key={itemIndex}>
                    {item.item_name} - {item.item_multiply} x {item.item_price}{' '}
                    yen
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
        <button
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
          onClick={() => {
            const newMember: Member = {
              name: `Member ${members.length + 1}`,
              items: [],
            };
            setMembers([...members, newMember]);
          }}
        >
          Add Member
        </button>
      </div>
      <div>
        <h3>Unassigned Items</h3>
        <ul className="list-disc">
          {unAssignedItems?.properties.items.map((item, index) => (
            <li key={index} className="mb-2">
              <span className="font-bold">{item.item_name}</span> -{' '}
              <span>
                {item.item_multiply} x {item.item_price} yen
              </span>
            </li>
          ))}
        </ul>
      </div>
      <ul className="list-disc">
        {billData?.properties.items.map((item, index) => (
          <li key={index} className="mb-2">
            <span className="font-bold">{item.item_name}</span> -{' '}
            <span>
              {item.item_multiply} x {item.item_price} yen
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
