import { BillItem } from "./Bill";

export interface BillItemWithId extends BillItem {
  id: string;
  sharedWith?: number[]; // Array of member IDs that share this item
}

export interface MemberWithBill {
  id: number;
  name: string;
  items: {
    [key: string]: BillItemWithId;
  };
}

export interface Member {
  id: number;
  name: string;
  items: {
    [key: string]: BillItem;
  };
}