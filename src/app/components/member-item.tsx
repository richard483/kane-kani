import { BillItemWithId, MemberWithBill } from "../types/Member";
import { useState } from "react";

export default function MemberItem(props: {
  key: number;
  member: MemberWithBill;
  members: MemberWithBill[];
  unAssignedItems?: BillItemWithId[] | null;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  setMembers: React.Dispatch<React.SetStateAction<MemberWithBill[]>>;
  setUnAssignedItems: React.Dispatch<React.SetStateAction<BillItemWithId[] | null>>;
  setSelectedMember: React.Dispatch<React.SetStateAction<MemberWithBill | null>>;
}) {
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState(props.member.name);

  const handleUnassignItem = (itemKey: string, memberItem: BillItemWithId) => {
    const isSplitItem = itemKey.includes('(Split)');

    if (isSplitItem && memberItem.sharedWith && memberItem.sharedWith.length > 1) {
      // Handle split item unassignment
      const originalItemName = itemKey.replace(' (Split)', '');
      const originalPrice = memberItem.item_price * memberItem.sharedWith.length;

      // Remove this item from all members who share it
      const updatedMembers = props.members.map(m => {
        if (memberItem.sharedWith?.includes(m.id)) {
          const newItems = { ...m.items };
          delete newItems[itemKey];
          return { ...m, items: newItems };
        }
        return m;
      });
      props.setMembers(updatedMembers);

      // Add the original item back to unassigned with the correct quantity
      props.setUnAssignedItems(prev => {
        if (!prev) return prev;

        // Check if the original item already exists in unassigned
        const existingItemIndex = prev.findIndex(item =>
          item.item_name === originalItemName && item.item_price === originalPrice
        );

        if (existingItemIndex !== -1) {
          // Add quantity to existing item
          return prev.map((item, idx) =>
            idx === existingItemIndex
              ? { ...item, item_multiply: item.item_multiply + memberItem.item_multiply }
              : item
          );
        } else {
          // Add new item to unassigned
          return [
            ...prev,
            {
              ...memberItem,
              item_name: originalItemName,
              item_price: originalPrice,
              sharedWith: undefined,
            }
          ];
        }
      });
    } else {
      // Handle regular item unassignment
      const updatedMember = { ...props.member };
      delete updatedMember.items[itemKey];
      props.setMembers(props.members.map(m => m.id === props.member.id ? updatedMember : m));

      // Add back to unassigned items
      props.setUnAssignedItems(prev => {
        if (!prev) return prev;

        const existingItemIndex = prev.findIndex(item => item.id === memberItem.id);

        if (existingItemIndex !== -1) {
          return prev.map((item, idx) =>
            idx === existingItemIndex
              ? { ...item, item_multiply: item.item_multiply + memberItem.item_multiply }
              : item
          );
        } else {
          return [...prev, memberItem];
        }
      });
    }
  };

  const handleRemoveMember = () => {
    // Return all items to unassigned
    Object.entries(props.member.items).forEach(([itemKey, memberItem]) => {
      const isSplitItem = itemKey.includes('(Split)');

      if (isSplitItem && memberItem.sharedWith && memberItem.sharedWith.length > 1) {
        // For split items, only return if removing causes all sharers to lose it
        const originalItemName = itemKey.replace(' (Split)', '');
        const originalPrice = memberItem.item_price * memberItem.sharedWith.length;

        // Check if other members still have this split item
        const otherMembersWithItem = props.members.filter(
          m => m.id !== props.member.id && memberItem.sharedWith?.includes(m.id)
        );

        if (otherMembersWithItem.length > 0) {
          // Remove from all other members who share this item
          props.setMembers(prevMembers =>
            prevMembers
              .filter(m => m.id !== props.member.id)
              .map(m => {
                if (memberItem.sharedWith?.includes(m.id)) {
                  const newItems = { ...m.items };
                  delete newItems[itemKey];
                  return { ...m, items: newItems };
                }
                return m;
              })
          );
        }

        // Add back to unassigned
        props.setUnAssignedItems(prev => {
          if (!prev) return prev;

          const existingItemIndex = prev.findIndex(item =>
            item.item_name === originalItemName && item.item_price === originalPrice
          );

          if (existingItemIndex !== -1) {
            return prev.map((item, idx) =>
              idx === existingItemIndex
                ? { ...item, item_multiply: item.item_multiply + memberItem.item_multiply }
                : item
            );
          } else {
            return [
              ...prev,
              {
                ...memberItem,
                item_name: originalItemName,
                item_price: originalPrice,
                sharedWith: undefined,
              }
            ];
          }
        });
      } else {
        // Regular item - add back to unassigned
        props.setUnAssignedItems(prev => {
          if (!prev) return prev;

          const existingItemIndex = prev.findIndex(item => item.id === memberItem.id);

          if (existingItemIndex !== -1) {
            return prev.map((item, idx) =>
              idx === existingItemIndex
                ? { ...item, item_multiply: item.item_multiply + memberItem.item_multiply }
                : item
            );
          } else {
            return [...prev, memberItem];
          }
        });
      }
    });

    // Remove the member
    props.setMembers(props.members.filter(m => m.id !== props.member.id));
    props.setSelectedMember(null);
  };

  const handleSaveName = () => {
    if (editedName.trim()) {
      const updatedMember = { ...props.member, name: editedName.trim() };
      props.setMembers(props.members.map(m => m.id === props.member.id ? updatedMember : m));

      // Update selected member if this member is selected
      props.setSelectedMember(prev => prev?.id === props.member.id ? updatedMember : prev);
    }
    setIsEditingName(false);
  };

  const handleCancelEdit = () => {
    setEditedName(props.member.name);
    setIsEditingName(false);
  };

  return <li className="mb-2 cursor-pointer flex justify-between items-start">
    <div className="flex-1">
      <div className="flex items-start gap-2">
        <button
          onClick={handleRemoveMember}
          className="text-red-500 hover:text-red-700 text-sm leading-none"
          title="Remove member"
        >
          ✕
        </button>
        {isEditingName ? (
          <div className="flex items-center gap-1">
            <input
              type="text"
              value={editedName}
              onChange={(e) => setEditedName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSaveName();
                if (e.key === 'Escape') handleCancelEdit();
              }}
              className="px-2 py-0.5 border rounded text-sm font-bold"
              autoFocus
            />
            <button
              onClick={handleSaveName}
              className="text-green-500 hover:text-green-700 text-sm"
              title="Save"
            >
              ✓
            </button>
            <button
              onClick={handleCancelEdit}
              className="text-gray-500 hover:text-gray-700 text-sm"
              title="Cancel"
            >
              ✕
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-1">
            <span className="font-bold">{props.member.name}</span>
            <button
              onClick={() => setIsEditingName(true)}
              className="text-blue-500 hover:text-blue-700 text-xs"
              title="Edit name"
            >
              ✎
            </button>
          </div>
        )}
      </div>
      <ul className="list-disc ml-4">
        {Object.entries(props.member.items).map(([itemKey, memberItem], itemIndex) => (
          <li key={itemIndex} className="flex items-center justify-between">
            <div className="flex items-start gap-2">
              <button
                onClick={() => handleUnassignItem(itemKey, memberItem)}
                className="text-orange-500 hover:text-orange-700 text-sm leading-none"
                title="Unassign"
              >
                ✕
              </button>
              <div className="flex items-center gap-2">
                <div className="flex flex-col">
                  <span>{memberItem.item_name}</span>
                  <span className="text-zinc-500 text-sm">{memberItem.item_price}</span>
                </div>
                <span>{' * '}</span>
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
                      props.setMembers([...props.members]);
                      props.setUnAssignedItems(
                        props.unAssignedItems?.map((i) =>
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
              </div>

            </div>
          </li>
        ))}
      </ul>
    </div>
    <button onClick={() => props.setSelectedMember(props.member)} className="mt-2 px-2 py-1 text-white rounded text-sm" style={{ backgroundColor: 'var(--color-dark-green)' }}>
      Select
    </button>
  </li>
}