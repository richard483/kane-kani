import { BillItemWithId, Member } from "../types/Member";
import SharingItemModal from "./sharing-item-modal";

export default function UnassignedItem(props: {
  item: BillItemWithId;
  members: Member[];
  selectedMember: Member | null;
  unAssignedItems: BillItemWithId[];
  showSharingItemModal: string | null;
  selectedMembersForSharing: number[];
  setMembers: React.Dispatch<React.SetStateAction<Member[]>>;
  setUnAssignedItems: React.Dispatch<React.SetStateAction<BillItemWithId[] | null>>;
  setShowSharingItemModal: React.Dispatch<React.SetStateAction<string | null>>;
  setSelectedMembersForSharing: React.Dispatch<React.SetStateAction<number[]>>;
}) {
  return <div key={props.item.id} className="mb-4 flex justify-between items-center">
    <li
      key={props.item.id}
      className="mb-2"
    >
      <span className="font-bold">{props.item.item_name}</span> -{' '}
      <span>
        {props.item.item_multiply} x {props.item.item_price}
      </span>
    </li>

    <div>
      <button
        className="ml-2 px-2 py-1 text-white rounded text-sm"
        style={{ backgroundColor: props.selectedMember ? 'var(--color-dark-green)' : 'gray' }}
        onClick={() => {
          if (props.selectedMember) {
            if (props.selectedMember.items[props.item.item_name] == null) {
              props.selectedMember.items[props.item.item_name] = {
                ...props.item,
                item_multiply: 1,
              };
            } else {
              props.selectedMember.items[props.item.item_name].item_multiply =
                props.selectedMember.items[props.item.item_name].item_multiply + 1;
            }
            props.setMembers(
              props.members.map((m) =>
                m.id === props.selectedMember?.id ? props.selectedMember : m,
              ),
            );
            if (props.item.item_multiply > 1) {
              props.item.item_multiply -= 1;
            } else {
              props.setUnAssignedItems(
                props.unAssignedItems.filter((i) => i.id !== props.item.id),
              );
            }
          }
        }}
      >
        Assign item
      </button>

      <button
        className="ml-2 px-2 py-1 bg-orange-500 text-white rounded text-sm"
        onClick={() => {
          if (props.members.length > 0) {
            props.setShowSharingItemModal(props.item.id);
            props.setSelectedMembersForSharing([]);
          } else {
            alert('Please add members first before splitting items.');
          }
        }}
      >
        Share item
      </button>
    </div>

    {/* Sharing Modal */}
    {props.showSharingItemModal === props.item.id && (
      <SharingItemModal
        item={props.item}
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