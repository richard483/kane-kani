import { BillItemWithId, MemberWithBill } from "../types/Member";

export default function SharingItemModal(props: {
  unassignedItem: BillItemWithId;
  members: MemberWithBill[];
  unAssignedItems: BillItemWithId[];
  selectedMembersForSharing: number[];
  setMembers: React.Dispatch<React.SetStateAction<MemberWithBill[]>>;
  setUnAssignedItems: React.Dispatch<React.SetStateAction<BillItemWithId[] | null>>;
  setShowSharingItemModal: React.Dispatch<React.SetStateAction<string | null>>;
  setSelectedMembersForSharing: React.Dispatch<React.SetStateAction<number[]>>;
}) {
  return <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div className="bg-white rounded-lg p-6 shadow-lg max-w-md w-full mx-4">
      <h3 className="text-lg text-black font-bold mb-4">Split &quot;{props.unassignedItem.item_name}&quot; among members</h3>
      <p className="text-sm text-gray-600 mb-4">
        Select members to split this props.item. The cost will be divided equally.
      </p>

      <div className="max-h-60 overflow-y-auto mb-4">
        {props.members.map((member) => (
          <label key={member.id} className="flex items-center mb-2 cursor-pointer text-black">
            <input
              type="checkbox"
              className="mr-2"
              checked={props.selectedMembersForSharing.includes(member.id)}
              onChange={(e) => {
                if (e.target.checked) {
                  props.setSelectedMembersForSharing([...props.selectedMembersForSharing, member.id]);
                } else {
                  props.setSelectedMembersForSharing(
                    props.selectedMembersForSharing.filter(id => id !== member.id)
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
            props.setShowSharingItemModal(null);
            props.setSelectedMembersForSharing([]);
          }}
        >
          Cancel
        </button>
        <button
          className="px-4 py-2 bg-green-500 rounded"
          disabled={props.selectedMembersForSharing.length === 0}
          onClick={() => {
            if (props.selectedMembersForSharing.length > 0) {
              // Calculate the divided price
              const dividedPrice = props.unassignedItem.item_price / props.selectedMembersForSharing.length;

              // Add the item to each selected member with divided price
              const updatedMembers = props.members.map((member) => {
                if (props.selectedMembersForSharing.includes(member.id) && props.selectedMembersForSharing.length > 1) {
                  const itemKey = `${props.unassignedItem.item_name} (Split)`;
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
                          ...props.unassignedItem,
                          item_name: itemKey,
                          item_price: dividedPrice,
                          item_multiply: 1,
                        }
                    }
                  };
                }
                return member;
              });

              props.setMembers(updatedMembers);

              // Decrease the unassigned item count by 1
              props.setUnAssignedItems((prev) => {
                if (prev == null) return prev;

                return prev.map((item) => {
                  if (item.id === props.unassignedItem.id) {
                    return {
                      ...item,
                      item_multiply: item.item_multiply - 1,
                    };
                  }
                  return item;
                }).filter((item) => item.item_multiply > 0);
              });

              // Close modal and reset selection
              props.setShowSharingItemModal(null);
              props.setSelectedMembersForSharing([]);
            }
          }}
        >
          Split Item ({props.selectedMembersForSharing.length} members)
        </button>
      </div>
    </div>
  </div>;
}