import { BillItem } from "./Bill";

export interface BillItemWithId extends BillItem {
  id: string;
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