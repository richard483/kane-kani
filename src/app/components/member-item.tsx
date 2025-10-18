import { BillItemWithId, Member } from "../types/Member";

export default function MemberItem(props: {
  key: number;
  member: Member;
  members: Member[];
  unAssignedItems?: BillItemWithId[] | null;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  setMembers: React.Dispatch<React.SetStateAction<Member[]>>;
  setUnAssignedItems: React.Dispatch<React.SetStateAction<BillItemWithId[] | null>>;
  setSelectedMember: React.Dispatch<React.SetStateAction<Member | null>>;
}) {
  return <li className="mb-2 cursor-pointer flex flex-row justify-between items-start">
    <div>
      <span className="font-bold">{props.member.name}</span>
      <ul className="list-disc ml-4">
        {Object.values(props.member.items).map((memberItem, itemIndex) => (
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
          </li>
        ))}
      </ul>
    </div>
    <button onClick={() => props.setSelectedMember(props.member)} className="mt-2 px-2 py-1 text-white rounded text-sm" style={{ backgroundColor: 'var(--color-dark-green)' }}>
      Select member
    </button>
  </li>
}