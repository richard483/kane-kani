import { BillData } from '../../types/Bill';
import { Member } from '../../types/Member';
import { getDataFromRedis } from '../../utils/redis';
import { notFound } from 'next/navigation';

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

async function getRedisData(id: string): Promise<{
  billData: BillData;
  members: Member[];
} | null> {
  const data = await getDataFromRedis(id);

  if (!data) {
    return null;
  }

  const { billData } = data;
  let { members } = data;

  // Add service fee calculation if applicable
  if (billData?.service_fee != null && billData?.service_fee !== undefined) {
    const serviceFee =
      (billData.service_fee +
        (billData.service_fee * (billData.tax_rate as number)) / 100) /
      members.length;

    members = members.map(member => ({
      ...member,
      items: {
        ...member.items,
        service_fee: {
          item_name: 'Service Fee',
          item_price: serviceFee,
          item_multiply: 1,
        }
      }
    }));
  }

  return {
    billData,
    members,
  };
}

export default async function FinalPage({ params }: PageProps) {
  const { id } = await params;
  const data = await getRedisData(id);

  if (!data) {
    notFound();
  }

  const { billData, members } = data;

  if (!billData || members.length === 0) {
    return (
      <div className="flex flex-col justify-center items-center mt-8 my-24">
        <h1 className="text-xl font-bold mb-16 text-center text-red-600">
          No bill data or members found!
        </h1>
        <p className="text-gray-600">The data may have expired or the link is invalid.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col justify-center items-center mt-8 my-24">
      <h1 className="text-xl font-bold mb-16 text-center">
        Final Bill Summary
      </h1>
      <div className="w-full max-w-4xl px-4">
        <div className="rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Bill Information</h2>
          <p className="mb-2"><span className="font-medium">Title:</span> {billData.bill_title}</p>
          <p className="mb-2"><span className="font-medium">Description:</span> {billData.bill_description}</p>
          <p className="mb-2"><span className="font-medium">Total Amount:</span> Rp {billData.total_price?.toFixed(2)}</p>
          {billData.tax_rate && (
            <p className="mb-2"><span className="font-medium">Tax Rate:</span> {billData.tax_rate}%</p>
          )}
          {billData.service_fee && (
            <p className="mb-2"><span className="font-medium">Service Fee:</span> Rp {billData.service_fee?.toFixed(2)}</p>
          )}
        </div>

        <div className="rounded-lg shadow-lg p-6">
          <h3 className="text-md font-semibold mb-4">Member Breakdown:</h3>
          <div className="grid gap-4">
            {members.map((member, index) => (
              <div key={index} className="border rounded-lg p-4 ">
                <h4 className="font-bold text-lg mb-3 text-blue-600">{member.name}</h4>
                <div className="space-y-2">
                  {Object.values(member.items).map((item, itemIndex) => (
                    <div key={itemIndex} className="flex justify-between items-center py-1 border-b border-gray-200 last:border-b-0">
                      <span className="font-medium">{item.item_name}</span>
                      <span className="text-gray-600">
                        Rp {item.item_price?.toFixed(2)} × {item.item_multiply} = Rp {(item.item_price * item.item_multiply)?.toFixed(2)}
                      </span>
                    </div>
                  ))}
                  <div className="pt-2 mt-2 border-t-2 border-gray-300">
                    <div className="flex justify-between items-center font-bold text-lg">
                      <span>Total for {member.name}:</span>
                      <span className="text-green-600">
                        Rp {Object.values(member.items).reduce(
                          (acc, item) => acc + item.item_price * item.item_multiply,
                          0,
                        )?.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 p-4 rounded-lg">
            <div className="flex justify-between items-center font-bold text-xl">
              <span>Grand Total:</span>
              <span className="text-blue-700">
                Rp {members.reduce(
                  (total, member) =>
                    total + Object.values(member.items).reduce(
                      (acc, item) => acc + item.item_price * item.item_multiply,
                      0,
                    ),
                  0,
                )?.toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}