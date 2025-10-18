import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex flex-col justify-center items-center mt-8 my-24">
      <h1 className="text-2xl font-bold mb-8 text-center text-red-600">
        Bill Data Not Found
      </h1>
      <div className="text-center space-y-4">
        <p className="text-gray-600">
          The bill data you&apos;re looking for doesn&apos;t exist or has expired.
        </p>
        <p className="text-gray-600">
          Bill data is stored for 1 month before being automatically removed.
        </p>
        <div className="mt-8">
          <Link
            href="/"
            className="inline-block px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Upload a New Bill
          </Link>
        </div>
      </div>
    </div>
  );
}