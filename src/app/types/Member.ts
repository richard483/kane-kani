import { BillItem } from "./Bill";

export interface BillItemWithId extends BillItem {
  id: string;
}

export interface Member {
  id: number;
  name: string;
  items: {
    [key: string]: BillItemWithId;
  };
}