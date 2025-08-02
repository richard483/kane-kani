export interface BillItem {
  item_name: string;
  item_multiply: number;
  item_price: number;
}

export interface BillData {
  properties: {
    items: BillItem[];
  };
  bill_title: string;
  bill_description: string;
  is_a_bill: boolean;
  total_price: number;
  item_includes_tax: boolean;
  tax_rate?: number;
  service_fee?: number;
}

export interface GeminiBillResponse {
  candidates: [
    {
      content: {
        parts: [
          {
            text: string;
          },
        ];
      };
    },
  ];
}
