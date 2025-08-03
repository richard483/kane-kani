'use client';

import { BillData, BillItem } from '../types/Bill';

interface Member {
  name: string;
  items: Map<string, BillItem>;
}

interface FinalCalcProps {
  billData: BillData;
  members: Member[];
}

export default function FinalCalc({ billData, members }: FinalCalcProps) {
  const calculateMemberTotal = (member: Member) => {
    let total = 0;
    member.items.forEach((item) => {
      total += item.item_price * item.item_multiply;
    });
    return total;
  };

  const serviceFeePerPerson =
    ((billData.service_fee || 0) +
      ((billData.service_fee || 0) * (billData.tax_rate || 0)) / 100) /
    members.length;

  return (
    <div className="w-full max-w-4xl p-4 sm:p-8 bg-white shadow-lg rounded-lg">
      <h2 className="text-3xl font-bold text-center mb-6">
        {billData.bill_title}
      </h2>
      <p className="text-center text-gray-600 mb-8">
        {billData.bill_description}
      </p>

      <div className="space-y-6">
        {members.map((member, index) => (
          <div key={index} className="p-6 border rounded-lg">
            <h3 className="text-2xl font-semibold mb-4">{member.name}</h3>
            <ul className="space-y-2 mb-4">
              {Array.from(member.items.values()).map((item, itemIndex) => (
                <li key={itemIndex} className="flex justify-between">
                  <span>
                    {item.item_name} (x{item.item_multiply})
                  </span>
                  <span>{item.item_price * item.item_multiply} yen</span>
                </li>
              ))}
            </ul>
            <div className="border-t pt-4 mt-4">
              <div className="flex justify-between font-semibold">
                <span>Subtotal</span>
                <span>{calculateMemberTotal(member)} yen</span>
              </div>
              <div className="flex justify-between">
                <span>Service Fee</span>
                <span>{serviceFeePerPerson.toFixed(2)} yen</span>
              </div>
              <div className="flex justify-between text-xl font-bold mt-2">
                <span>Total</span>
                <span>
                  {(calculateMemberTotal(member) + serviceFeePerPerson).toFixed(
                    2,
                  )}{' '}
                  yen
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 text-center">
        <h3 className="text-2xl font-bold">
          Total Bill Amount: {billData.total_price} yen
        </h3>
      </div>
    </div>
  );
}
