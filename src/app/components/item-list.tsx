'use client';

import { useSearchParams } from 'next/navigation';
import { BillData, BillItem } from '../types/Bill';
import { useEffect, useState } from 'react';

interface Member {
  name: string;
  items: Map<BillItem['item_name'], BillItem>;
}

export default function ItemList(props: {
  handleFinalCalc: (members: Member[], billData: BillData) => Promise<void>;
}) {
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
  }, [billData]);

  const handleAddItemToMember = (item: BillItem) => {
    if (selectedMember) {
      const updatedMembers = members.map((member) => {
        if (member.name === selectedMember.name) {
          const newItems = new Map(member.items);
          if (newItems.has(item.item_name)) {
            newItems.get(item.item_name)!.item_multiply += 1;
          } else {
            newItems.set(item.item_name, { ...item, item_multiply: 1 });
          }
          return { ...member, items: newItems };
        }
        return member;
      });
      setMembers(updatedMembers);

      const updatedUnassignedItems = unAssignedItems
        ? unAssignedItems.map((unassignedItem) => {
            if (unassignedItem.item_name === item.item_name) {
              return {
                ...unassignedItem,
                item_multiply: unassignedItem.item_multiply - 1,
              };
            }
            return unassignedItem;
          })
        : [];
      setUnAssignedItems(
        updatedUnassignedItems.filter((item) => item.item_multiply > 0),
      );
    }
  };

  const handleRemoveItemFromMember = (
    member: Member,
    itemName: string,
  ) => {
    const updatedMembers = members.map((m) => {
      if (m.name === member.name) {
        const newItems = new Map(m.items);
        const item = newItems.get(itemName);
        if (item) {
          if (item.item_multiply > 1) {
            item.item_multiply -= 1;
          } else {
            newItems.delete(itemName);
          }
        }
        return { ...m, items: newItems };
      }
      return m;
    });
    setMembers(updatedMembers);

    const updatedUnassignedItems = unAssignedItems
      ? [...unAssignedItems]
      : [];
    const existingUnassignedItem = updatedUnassignedItems.find(
      (item) => item.item_name === itemName,
    );
    if (existingUnassignedItem) {
      existingUnassignedItem.item_multiply += 1;
    } else {
      const originalItem = billData?.properties.items.find(
        (item) => item.item_name === itemName,
      );
      if (originalItem) {
        updatedUnassignedItems.push({ ...originalItem, item_multiply: 1 });
      }
    }
    setUnAssignedItems(updatedUnassignedItems);
  };

  return (
    <div className="flex flex-col lg:flex-row gap-10 justify-center w-full h-full">
      <div className="w-full lg:w-1/2">
        <h3 className="text-2xl font-bold mb-4">Members</h3>
        <div className="flex mb-4">
          <input
            type="text"
            placeholder="Enter member name"
            value={newMemberName}
            onChange={(e) => setNewMemberName(e.target.value)}
            className="border p-2 rounded-l w-full"
          />
          <button
            className="px-4 py-2 bg-blue-500 text-white rounded-r"
            onClick={() => {
              if (newMemberName.trim() !== '') {
                const newMember: Member = {
                  name: newMemberName,
                  items: new Map(),
                };
                setMembers([...members, newMember]);
                setNewMemberName('');
              }
            }}
          >
            Add
          </button>
        </div>
        <ul className="space-y-4">
          {members.map((member, index) => (
            <li
              key={index}
              className={`p-4 border rounded-lg cursor-pointer ${
                selectedMember?.name === member.name ? 'border-blue-500' : ''
              }`}
              onClick={() => setSelectedMember(member)}
            >
              <span className="font-bold text-lg">{member.name}</span>
              <ul className="list-disc ml-6 mt-2">
                {Array.from(member.items.values()).map(
                  (memberItem, itemIndex) => (
                    <li key={itemIndex} className="flex justify-between">
                      <span>
                        {memberItem.item_name} ({memberItem.item_multiply}x)
                      </span>
                      <button
                        className="text-red-500"
                        onClick={() =>
                          handleRemoveItemFromMember(
                            member,
                            memberItem.item_name,
                          )
                        }
                      >
                        Remove
                      </button>
                    </li>
                  ),
                )}
              </ul>
            </li>
          ))}
        </ul>
      </div>
      <div className="w-full lg:w-1/2">
        <h3 className="text-2xl font-bold mb-4">Unassigned Items</h3>
        <ul className="space-y-2">
          {unAssignedItems?.map((item, index) => (
            <li
              key={index}
              className="p-4 border rounded-lg flex justify-between items-center"
            >
              <div>
                <span className="font-bold">{item.item_name}</span>
                <span className="text-gray-600">
                  {' '}
                  ({item.item_multiply}x) - {item.item_price} yen
                </span>
              </div>
              <button
                className="px-4 py-2 bg-green-500 text-white rounded disabled:bg-gray-400"
                onClick={() => handleAddItemToMember(item)}
                disabled={!selectedMember}
              >
                Add
              </button>
            </li>
          ))}
        </ul>
        <div className="mt-4 text-lg">
          Service fee:{' '}
          <span className="font-bold">
            {(billData?.service_fee as number) +
              ((billData?.service_fee as number) *
                (billData?.tax_rate as number)) /
                100}{' '}
            yen
          </span>
        </div>
      </div>
      {unAssignedItems && unAssignedItems.length === 0 && (
        <div className="w-full mt-8 text-center">
          <button
            onClick={async () => {
              if (billData) {
                await props.handleFinalCalc(members, billData);
              }
              window.location.href = '/final';
            }}
            className="px-8 py-4 bg-green-500 text-white rounded-lg text-xl font-bold"
          >
            Proceed to Final Calculation
          </button>
        </div>
      )}
    </div>
  );
}
