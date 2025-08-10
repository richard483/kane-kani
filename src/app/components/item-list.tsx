'use client';

import { useSearchParams } from 'next/navigation';
import { BillData, BillItem } from '../types/Bill';
import { useEffect, useState } from 'react';

interface Member {
  id: number;
  name: string;
  items: {
    [key: string]: BillItemWithId;
  };
}
interface BillItemWithId extends BillItem {
  id: string;
}

export default function ItemList(props: {
  handleFinalCalc: (members: Member[], billData: BillData) => Promise<void>;
}) {
  const searchParams = useSearchParams();
  const billDataString = searchParams.get('data');
  const [unAssignedItems, setUnAssignedItems] = useState<
    BillItemWithId[] | null
  >(null);
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

      setUnAssignedItems(
        billData.properties.items.map((item, index) => ({
          ...item,
          id: `${index}-${item.item_name}`,
        })),
      );
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
                {Object.values(member.items).map((memberItem, itemIndex) => (
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
                              i.id == memberItem.id
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
      <div>
        <h3>Unassigned Items</h3>
        <ul className="list-disc">
          {unAssignedItems?.map((item, index) => (
            <li
              key={index}
              className="mb-2"
              onClick={() => {
                if (selectedMember) {
                  if (selectedMember.items[item.item_name] == null) {
                    selectedMember.items[item.item_name] = {
                      ...item,
                      item_multiply: 1,
                    };
                  } else {
                    selectedMember.items[item.item_name].item_multiply =
                      selectedMember.items[item.item_name].item_multiply + 1;
                  }
                  setMembers(
                    members.map((m) =>
                      m.id === selectedMember.id ? selectedMember : m,
                    ),
                  );
                  if (item.item_multiply > 1) {
                    item.item_multiply -= 1;
                  } else {
                    setUnAssignedItems(
                      unAssignedItems.filter((i) => i.id !== item.id),
                    );
                  }
                }
              }}
            >
              <span className="font-bold">{item.item_name}</span> -{' '}
              <span>
                {item.item_multiply} x {item.item_price}
              </span>
            </li>
          ))}
        </ul>
        <span>
          Service fee:{' '}
          {(billData?.service_fee as number) +
            ((billData?.service_fee as number) *
              (billData?.tax_rate as number)) /
              100}
        </span>
      </div>
      {unAssignedItems && unAssignedItems.length === 0 && (
        <>
          <button
            onClick={async () => {
              if (billData) {
                await props.handleFinalCalc(members, billData);
              }
              window.location.href = '/final';
            }}
            className="mt-4 px-4 py-2 bg-green-500 text-white rounded"
          >
            Proceed to Final Calculation
          </button>
        </>
      )}
    </div>
  );
}
