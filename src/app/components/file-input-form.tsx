'use client';

import Image from 'next/image';
import { useRef, useState, FormEvent, useEffect } from 'react';
import { BillData } from '../types/Bill';
import { Location } from '../types/Location';

export default function FileInputForm(props: {
  handleFileProcessing: (formData: FormData) => Promise<BillData | undefined>;
}) {
  const { handleFileProcessing } = props;
  const [base64InputValue, setBase64InputValue] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [location, setLocation] = useState<Location | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showError, setShowError] = useState(true);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const loc: Location = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          };
          setLocation(loc);
        },
        (err) => {
          setError(err.message);
        },
      );
    }
  }, []);

  const handleInputChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];

    if (!file) return;

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64String = buffer.toString('base64');

    setBase64InputValue(base64String);
  };

  const handleClearInput = () => {
    setBase64InputValue('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);

    const formData = new FormData(event.currentTarget);
    const billData = await handleFileProcessing(formData);

    if (billData && billData?.is_a_bill) {
      document.cookie = `billData=${encodeURIComponent(
        JSON.stringify(billData),
      )}; path=/; max-age=${3600 * 24 * 7}`;

      if (location) {
        document.cookie = `location=${encodeURIComponent(
          JSON.stringify(location),
        )}; path=/; max-age=${3600 * 24 * 7}`;
      }

      window.location.href = `/review`;
    } else {
      alert('Failed to process the file. Please try again.');
    }
    setIsLoading(false);
  };

  return (
    <div className="flex flex-col justify-center items-center w-full h-full">
      {error && (
        <div className={`p-3 mb-4 flex items-start gap-2 text-sm text-red-800 rounded-lg bg-red-50 dark:bg-gray-800 dark:text-red-400 absolute top-4 right-4 transition-opacity duration-500 ${showError ? 'opacity-100' : 'opacity-0'}`} role="alert">
          <button className={`text-gray-500 hover:text-gray-700`} onClick={() => setShowError(false)}>
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
          <div className="">
            <span className="font-bold">Geolocation Error!</span><br />
            <span className="font-medium">Error getting location: {error}</span>
          </div>
        </div>
      )}
      <form
        id="file-upload-form"
        onSubmit={handleSubmit}
        className="flex flex-col justify-center items-center w-full h-full"
      >
        {base64InputValue ? (
          <div className="relative items-center">
            <Image
              className="absolute top-0 right-0 cursor-pointer"
              src={'/circle-xmark.svg'}
              alt="xmark"
              width={25}
              height={25}
              onClick={handleClearInput}
            />
            <Image
              src={`data:image/png;base64,${base64InputValue}`}
              alt="Uploaded file preview"
              width={256}
              height={256}
            />
          </div>
        ) : (
          <label
            style={{
              color: 'var(--color-grey)',
            }}
            htmlFor="file-upload"
            className="flex items-center flex-col justify-center gap-4 w-21/34 h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-gray-400"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="size-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5"
              />
            </svg>

            <span className="text-xl md:text-2xl lg:md:text-3xl text-center">
              Click to upload a file
            </span>
          </label>
        )}
        <input
          id="file-upload"
          name="file-upload"
          type="file"
          className="hidden"
          accept=".jpg, .jpeg, .png"
          ref={fileInputRef}
          onChange={handleInputChange}
        />
      </form>

      <button
        type="submit"
        form="file-upload-form"
        disabled={isLoading}
        style={{ backgroundColor: isLoading ? '#9CA3AF' : 'var(--color-green)' }}
        className={`text-black py-2 px-4 rounded mt-8 ${isLoading
          ? 'cursor-not-allowed opacity-50'
          : 'cursor-pointer hover:opacity-90'
          }`}
      >
        {isLoading ? 'Uploading...' : 'Upload'}
      </button>
    </div>
  );
}