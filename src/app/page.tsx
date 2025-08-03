import Image from 'next/image';
import FileInput from './components/file-input';

export default function Home() {
  return (
    <div className="flex flex-col justify-center items-center min-h-screen p-4 sm:p-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl sm:text-5xl md:text-6xl mb-4">Kane kani</h1>
        <p className="mb-12 text-base sm:text-lg md:text-xl">
          Okane no kani? What ever, I thinking it while I riding MRT & my
          Japanese is not even N5 (yet)
        </p>
      </div>
      <div className="mb-12">
        <Image
          src={'/kane-kani.svg'}
          alt="Background"
          width={200}
          height={200}
          className="w-40 h-40 sm:w-48 sm:h-48 md:w-56 md:h-56"
        />
      </div>
      <div className="w-full max-w-md">
        <h1 className="text-xl sm:text-2xl font-bold mb-8 text-center">
          Upload Your File Here!
        </h1>
        <FileInput />
      </div>
    </div>
  );
}
