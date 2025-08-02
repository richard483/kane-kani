'use client';

import { useSearchParams } from 'next/navigation';
import { BillData, BillItem } from '../types/Bill';
import { useEffect, useState } from 'react';

interface Member {
  name: string;
  items: Map<BillItem['item_name'], BillItem>;
}

export default function ItemList() {
  const searchParams = useSearchParams();
  const billDataString = searchParams.get('data');
  const [unAssignedItems, setUnAssignedItems] = useState<BillItem[] | null>(
    null,
  );
  const [members, setMembers] = useState<Member[]>([]);
  const billData: BillData | null = billDataString
    ? (JSON.parse(billDataString) as BillData)
    : null;
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
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
      setUnAssignedItems(billData.properties.items);
    }
  }, []);
  return (
    <div className="flex flex-col gap-10 justify-center items-center w-full h-full">
      <div>
        <h3>Member</h3>
        <ul className="list-disc">
          {members.map((member, index) => (
            <li
              key={index}
              className="mb-2 cursor-pointer"
              onClick={() => setSelectedMember(member)}
            >
              <span className="font-bold">{member.name}</span>
              <ul className="list-disc ml-4">
                {Array.from(member.items.values()).map(
                  (memberItem, itemIndex) => (
                    <li key={itemIndex}>
                      {memberItem.item_name} {memberItem.item_price}
                      {' * '}
                      <input
                        type="number"
                        value={memberItem.item_multiply}
                        className="w-8"
                        onChange={(e) => {
                          const newValue = parseInt(e.target.value);
                          if (!isNaN(newValue)) {
                            const diffBetweenNewAndOld =
                              newValue - memberItem.item_multiply;
                            memberItem.item_multiply = newValue;
                            setMembers([...members]);
                            setUnAssignedItems(
                              unAssignedItems?.map((i) =>
                                i.item_name === memberItem.item_name &&
                                i.item_price === memberItem.item_price
                                  ? {
                                      ...i,
                                      item_multiply:
                                        i.item_multiply - diffBetweenNewAndOld,
                                    }
                                  : i,
                              ) || null,
                            );
                          }
                        }}
                      />
                    </li>
                  ),
                )}
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
              name: `${newMemberName || 'Member'} ${
                newMemberName ? '' : members.length + 1
              }`,
              items: new Map(),
            };
            setMembers([...members, newMember]);
            setNewMemberName('');
          }}
        >
          Add Member
        </button>
      </div>
      <div>
        <h3>Unassigned Items</h3>
        <ul className="list-disc">
          {unAssignedItems?.map((item, index) => (
            <li
              key={index}
              className="mb-2"
              onClick={() => {
                if (selectedMember) {
                  if (!selectedMember.items.has(item.item_name)) {
                    selectedMember.items.set(item.item_name, {
                      ...item,
                      item_multiply: 1,
                    });
                  } else {
                    selectedMember.items.get(
                      item.item_name,
                    )!.item_multiply += 1;
                  }
                  setMembers(
                    members.map((m) =>
                      m.name === selectedMember.name ? selectedMember : m,
                    ),
                  );
                  if (item.item_multiply > 1) {
                    item.item_multiply -= 1;
                  } else {
                    setUnAssignedItems(
                      unAssignedItems.filter(
                        (i) =>
                          i.item_name !== item.item_name &&
                          i.item_price !== item.item_price,
                      ),
                    );
                  }
                }
              }}
            >
              <span className="font-bold">{item.item_name}</span> -{' '}
              <span>
                {item.item_multiply} x {item.item_price} yen
              </span>
            </li>
          ))}
        </ul>
        <span>
          Service fee:{' '}
          {(billData?.service_fee as number) +
            ((billData?.service_fee as number) *
              (billData?.tax_rate as number)) /
              100}{' '}
          yen
        </span>
      </div>
      {unAssignedItems && unAssignedItems.length === 0 && (
        <>
          <button>Proceed to Final Calculation</button>
        </>
      )}
    </div>
  );
}
