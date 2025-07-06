import Image from 'next/image';
import FileInput from './components/file-input';

export default function Home() {
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
        Upload Your File Here!
      </h1>
      <FileInput />
    </div>
  );
}
