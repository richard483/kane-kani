'use client';

import Form from 'next/form';
import Image from 'next/image';
import { useRef, useState } from 'react';
import { BillData } from '../types/Bill';

export default function FileInputForm(props: {
  handleFileProcessing: (formData: FormData) => Promise<BillData | undefined>;
}) {
  const [base64InputValue, setBase64InputValue] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { handleFileProcessing } = props;

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

  return (
    <div className="flex justify-center items-center w-full h-full">
      <Form
        action={async (formData: FormData) => {
          const billData = await handleFileProcessing(formData);
          if (billData && billData?.is_a_bill) {
            const queryString = new URLSearchParams({
              data: JSON.stringify(billData),
            }).toString();

            window.location.href = `/review?${queryString}`;
          } else {
            alert('Failed to process the file. Please try again.');
          }
        }}
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
        <input
          type="submit"
          value="Upload"
          style={{ backgroundColor: 'var(--color-green)' }}
          className="text-black py-2 px-4 rounded mt-8 cursor-pointer"
        />
      </Form>
    </div>
  );
}
