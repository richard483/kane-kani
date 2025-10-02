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
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [newMemberName, setNewMemberName] = useState<string>('');
  const [showPatunganModal, setShowPatunganModal] = useState<string | null>(null);
  const [selectedMembersForPatungan, setSelectedMembersForPatungan] = useState<number[]>([]);

  const billData: BillData | null = billDataString
    ? (JSON.parse(billDataString) as BillData)
    : null;

  useEffect(() => {
    if (billDataString) {
      const billData: BillData = JSON.parse(billDataString) as BillData;
      let processedItems = [...billData.properties.items];

      if (!billData.item_includes_tax && billData.tax_rate) {
        processedItems = processedItems.map((item) => ({
          ...item,
          item_price: item.item_price + (item.item_price * (billData.tax_rate as number)) / 100
        }));
      }

      setUnAssignedItems(
        processedItems.map((item, index) => ({
          ...item,
          id: `${index}-${item.item_name}`,
        })),
      );
    }
  }, [billDataString]);
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
              name: `${newMemberName || 'Member'} ${newMemberName ? '' : members.length + 1
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
            <div key={item.id}>
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
              <button
                className="ml-2 px-2 py-1 bg-orange-500 text-white rounded text-sm"
                onClick={() => {
                  if (members.length > 0) {
                    setShowPatunganModal(item.id);
                    setSelectedMembersForPatungan([]);
                  } else {
                    alert('Please add members first before splitting items.');
                  }
                }}
              >
                Patungan
              </button>

              {/* Patungan Modal */}
              {showPatunganModal === item.id && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                  <div className="bg-white rounded-lg p-6 shadow-lg max-w-md w-full mx-4">
                    <h3 className="text-lg font-bold mb-4">Split &quot;{item.item_name}&quot; among members</h3>
                    <p className="text-sm text-gray-600 mb-4">
                      Select members to split this item. The cost will be divided equally.
                    </p>

                    <div className="max-h-60 overflow-y-auto mb-4">
                      {members.map((member) => (
                        <label key={member.id} className="flex items-center mb-2 cursor-pointer">
                          <input
                            type="checkbox"
                            className="mr-2"
                            checked={selectedMembersForPatungan.includes(member.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedMembersForPatungan([...selectedMembersForPatungan, member.id]);
                              } else {
                                setSelectedMembersForPatungan(
                                  selectedMembersForPatungan.filter(id => id !== member.id)
                                );
                              }
                            }}
                          />
                          <span className="font-medium">{member.name}</span>
                        </label>
                      ))}
                    </div>

                    <div className="flex justify-end gap-2">
                      <button
                        className="px-4 py-2 bg-gray-300 text-gray-700 rounded"
                        onClick={() => {
                          setShowPatunganModal(null);
                          setSelectedMembersForPatungan([]);
                        }}
                      >
                        Cancel
                      </button>
                      <button
                        className="px-4 py-2 bg-green-500 text-white rounded"
                        disabled={selectedMembersForPatungan.length === 0}
                        onClick={() => {
                          if (selectedMembersForPatungan.length > 0) {
                            // Calculate the divided price
                            const dividedPrice = item.item_price / selectedMembersForPatungan.length;

                            // Add the item to each selected member with divided price
                            const updatedMembers = members.map((member) => {
                              if (selectedMembersForPatungan.includes(member.id)) {
                                const itemKey = `${item.item_name} (Split)`;
                                const existingItem = member.items[itemKey];

                                return {
                                  ...member,
                                  items: {
                                    ...member.items,
                                    [itemKey]: existingItem
                                      ? {
                                        ...existingItem,
                                        item_multiply: existingItem.item_multiply + 1,
                                      }
                                      : {
                                        ...item,
                                        item_name: itemKey,
                                        item_price: dividedPrice,
                                        item_multiply: 1,
                                      }
                                  }
                                };
                              }
                              return member;
                            });

                            setMembers(updatedMembers);

                            // Decrease the unassigned item count by 1
                            if (item.item_multiply > 1) {
                              console.log('#patungan - item before decrease:', item);
                              item.item_multiply -= 1;
                            } else {
                              console.log('#patungan - 1item before decrease:', item);
                              setUnAssignedItems(
                                unAssignedItems.filter((i) => {
                                  console.log('#patungan - filtering item i:', i);
                                  console.log('#patungan - filtering ITEM:', item);
                                  return i.id !== item.id
                                }),
                              );
                            }

                            // Close modal and reset selection
                            setShowPatunganModal(null);
                            setSelectedMembersForPatungan([]);
                          }
                        }}
                      >
                        Split Item ({selectedMembersForPatungan.length} members)
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
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
