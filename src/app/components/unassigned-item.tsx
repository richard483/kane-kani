import { BillItemWithId, MemberWithBill } from "../types/Member";
import SharingItemModal from "./sharing-item-modal";

export default function UnassignedItem(props: {
  unassignedItem: BillItemWithId;
  members: MemberWithBill[];
  selectedMember: MemberWithBill | null;
  unAssignedItems: BillItemWithId[];
  showSharingItemModal: string | null;
  selectedMembersForSharing: number[];
  setMembers: React.Dispatch<React.SetStateAction<MemberWithBill[]>>;
  setUnAssignedItems: React.Dispatch<React.SetStateAction<BillItemWithId[] | null>>;
  setShowSharingItemModal: React.Dispatch<React.SetStateAction<string | null>>;
  setSelectedMembersForSharing: React.Dispatch<React.SetStateAction<number[]>>;
}) {
  return <div key={props.unassignedItem.id} className="mb-4 flex justify-between items-center">
    <li
      key={props.unassignedItem.id}
      className="mb-2"
    >
      <span className="font-bold">{props.unassignedItem.item_name}</span> -{' '}
      <span>
        {props.unassignedItem.item_multiply} x {props.unassignedItem.item_price}
      </span>
    </li>

    <div>
      <button
        className="ml-2 px-2 py-1 text-white rounded text-sm"
        style={{ backgroundColor: props.selectedMember ? 'var(--color-dark-green)' : 'gray' }}
        onClick={() => {
          if (props.selectedMember) {
            if (props.selectedMember.items[props.unassignedItem.item_name] == null) {
              props.selectedMember.items[props.unassignedItem.item_name] = {
                ...props.unassignedItem,
                item_multiply: 1,
              };
            } else {
              props.selectedMember.items[props.unassignedItem.item_name].item_multiply =
                props.selectedMember.items[props.unassignedItem.item_name].item_multiply + 1;
            }
            props.setMembers(
              props.members.map((m) =>
                m.id === props.selectedMember?.id ? props.selectedMember : m,
              ),
            );

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
          }
        }}
      >
        Assign
      </button>

      <button
        className="ml-2 px-2 py-1 bg-orange-500 text-white rounded text-sm"
        onClick={() => {
          if (props.members.length > 0) {
            props.setShowSharingItemModal(props.unassignedItem.id);
            props.setSelectedMembersForSharing([]);
          } else {
            alert('Please add members first before splitting items.');
          }
        }}
      >
        Share
      </button>
    </div>

    {/* Sharing Modal */}
    {props.showSharingItemModal === props.unassignedItem.id && (
      <SharingItemModal
        unassignedItem={props.unassignedItem}
        members={props.members}
        setMembers={props.setMembers}
        unAssignedItems={props.unAssignedItems}
        setUnAssignedItems={props.setUnAssignedItems}
        selectedMembersForSharing={props.selectedMembersForSharing}
        setSelectedMembersForSharing={props.setSelectedMembersForSharing}
        setShowSharingItemModal={props.setShowSharingItemModal}
      />
    )}
  </div>
}