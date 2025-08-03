'use client';

import Form from 'next/form';
import Image from 'next/image';
import { useRef, useState } from 'react';
import { BillData } from '../types/Bill';

export default function FileInputForm(props: {
  handleFileProcessing: (formData: FormData) => Promise<BillData | undefined>;
}) {
  const [base64InputValue, setBase64InputValue] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { handleFileProcessing } = props;

  const handleInputChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];

    if (!file) return;

    setLoading(true);
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64String = buffer.toString('base64');

    setBase64InputValue(base64String);
    setLoading(false);
  };

  const handleClearInput = () => {
    setBase64InputValue('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="flex justify-center items-center w-full h-full">
      <Form
        action={async (formData: FormData) => {
          setLoading(true);
          const billData = await handleFileProcessing(formData);
          if (billData) {
            const queryString = new URLSearchParams({
              data: JSON.stringify(billData),
            }).toString();

            window.location.href = `/review?${queryString}`;
          } else {
            alert('Failed to process the file. Please try again.');
          }
          setLoading(false);
        }}
        className="flex flex-col justify-center items-center w-full h-full"
      >
        {base64InputValue ? (
          <div className="relative items-center">
            <Image
              className="absolute top-2 right-2 cursor-pointer bg-white rounded-full"
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
              className="rounded-lg"
            />
          </div>
        ) : (
          <label
            htmlFor="file-upload"
            className="flex items-center flex-col justify-center gap-4 w-full h-48 sm:h-64 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-10 h-10 text-gray-500"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5"
              />
            </svg>

            <span className="text-lg sm:text-xl md:text-2xl text-center text-gray-500">
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
          disabled={loading}
        />
        {base64InputValue && (
          <input
            type="submit"
            value={loading ? 'Processing...' : 'Upload'}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mt-8 cursor-pointer w-full"
            disabled={loading || !base64InputValue}
          />
        )}
      </Form>
    </div>
  );
}
