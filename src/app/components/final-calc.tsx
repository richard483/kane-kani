'use client';

import { useSearchParams } from 'next/navigation';
import { BillData, BillItem } from '../types/Bill';
import { useEffect, useState } from 'react';

interface Member {
  id: number;
  name: string;
  items: {
    [key: string]: BillItem;
  };
}

export default function FinalCalc() {
  const searchParams = useSearchParams();
  const billDataString = searchParams.get('data');
  const [members, setMembers] = useState<Member[]>([]);
  const billData: BillData | null = billDataString
    ? (JSON.parse(billDataString) as BillData)
    : null;
  const [newMemberName, setNewMemberName] = useState<string>('');

  useEffect(() => {
    if (billData) {
      if (!billData.item_includes_tax && billData.tax_rate) {
        billData.properties.items.forEach((item) => {
          item.item_price =
            item.item_price +
            (item.item_price * (billData.tax_rate as number)) / 100;
        });
      }
    }
  }, []);
  return (
    <div className="flex flex-col gap-10 justify-center items-center w-full h-full">
      <div>
        <h3>Member</h3>
        <ul className="list-disc">
          {members.map((member, index) => (
            <li key={index} className="mb-2 cursor-pointer">
              <span className="font-bold">{member.name}</span>
              <ul className="list-disc ml-4">
                {Object.values(member.items).map((memberItem, itemIndex) => (
                  <li key={itemIndex}></li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
        <input
          type="text"
          placeholder="Enter member name"
          value={newMemberName}
          onChange={(e) => setNewMemberName(e.target.value)}
        />
        <button
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
          onClick={() => {
            const newMember: Member = {
              id: members.length + 1,
              name: `${newMemberName || 'Member'} ${
                newMemberName ? '' : members.length + 1
              }`,
              items: {},
            };
            setMembers([...members, newMember]);
            setNewMemberName('');
          }}
        >
          Add Member
        </button>
      </div>
    </div>
  );
}
