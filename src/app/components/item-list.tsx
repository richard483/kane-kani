'use client';

import { BillData, BillItem } from '../types/Bill';
import { useEffect, useState } from 'react';
import getCookie from '../utils/cookie';
import MemberItem from './member-item';
import UnassignedItem from './unassigned-item';
import { MemberWithBill } from '../types/Member';

interface BillItemWithId extends BillItem {
  id: string;
}


export default function ItemList(props: {
  handleFinalCalc: (members: MemberWithBill[], billData: BillData, location: Location | null) => Promise<void>;
}) {
  const [billDataString, setBillDataString] = useState<string | null>(null);
  const [unAssignedItems, setUnAssignedItems] = useState<
    BillItemWithId[] | null
  >(null);
  const [members, setMembers] = useState<MemberWithBill[]>([]);
  const [selectedMember, setSelectedMember] = useState<MemberWithBill | null>(null);
  const [newMemberName, setNewMemberName] = useState<string>('');
  const [showSharingItemModal, setShowSharingItemModal] = useState<string | null>(null);
  const [selectedMembersForSharing, setSelectedMembersForSharing] = useState<number[]>([]);
  const [location, setLocation] = useState<Location | null>(null);

  const billData: BillData | null = billDataString
    ? (JSON.parse(billDataString) as BillData)
    : null;

  useEffect(() => {
    // Load bill data from cookie on component mount
    const cookieData = getCookie('billData');
    if (cookieData) {
      setBillDataString(cookieData);
    }

    // Get location from cookie
    const locationData = getCookie('location');
    if (locationData) {
      const loc: Location = JSON.parse(locationData) as Location;
      setLocation(loc);
    }
  }, []);

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
        <h3 className="font-bold">Selected Member to assign item:</h3>
        {selectedMember ? (
          <div>
            <h4 className="font-bold">{selectedMember.name}</h4>
            <ul className="list-disc">
              {Object.values(selectedMember.items).map((item) => (
                <li key={item.id}>
                  {item.item_name} - {item.item_multiply} x {item.item_price}
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <p>No member selected</p>
        )}
      </div>
      <div>
        <h3 className="font-bold justify-self-center">Member(s)</h3>
        <ul className="list-disc">
          {members.map((member, index) => (
            <MemberItem
              key={index}
              member={member}
              setSelectedMember={setSelectedMember}
              members={members}
              unAssignedItems={unAssignedItems}
              setMembers={setMembers}
              setUnAssignedItems={setUnAssignedItems}
            />
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
            const newMember: MemberWithBill = {
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
        <h3 className="font-bold justify-self-center mb-8">Unassigned Items</h3>
        <ul className="list-disc gap-8">
          {unAssignedItems?.map((unassignedItem, index) => (
            <UnassignedItem
              key={index}
              unassignedItem={unassignedItem}
              members={members}
              selectedMember={selectedMember}
              setMembers={setMembers}
              unAssignedItems={unAssignedItems}
              setUnAssignedItems={setUnAssignedItems}
              showSharingItemModal={showSharingItemModal}
              setShowSharingItemModal={setShowSharingItemModal}
              selectedMembersForSharing={selectedMembersForSharing}
              setSelectedMembersForSharing={setSelectedMembersForSharing}
            />
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
                await props.handleFinalCalc(members, billData, location);
              }
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
