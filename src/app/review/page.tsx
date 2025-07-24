'use client';

import Image from 'next/image';
import { useSearchParams } from 'next/navigation';

export default function Home() {
  const searchParams = useSearchParams();
  const billDataString = searchParams.get('data');
  return (
    <div className="flex flex-col justify-center items-center mt-8 my-24">
      <div className="mb-8 text-center px-4">
        <h1 className="text-4xl mb-4">Kane kani</h1>
        <p className="mb-12">
          Okane no kani? What ever, I thinking it while I riding MRT & my
          Japanese is not even N5 (yet)
        </p>
      </div>
      <Image
        src={'/kane-kani.svg'}
        alt="Background"
        width={200}
        height={200}
        className="mb-16"
      />
      <h1 className="text-xl font-bold mb-16 text-center">
        Review Your Bill Data!
      </h1>
      {billDataString ? (
        <pre className="text-wrap">{billDataString}</pre>
      ) : (
        <p>No bill data available for review.</p>
      )}
    </div>
  );
}
