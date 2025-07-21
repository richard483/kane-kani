'use client';

import Form from 'next/form';
import Image from 'next/image';
import { useState } from 'react';

export default function FileInputForm(props: {
  handleFileUpload: (formData: FormData) => Promise<void>;
}) {
  const [base64InputValue, setBase64InputValue] = useState<string>('');
  const { handleFileUpload } = props;

  const handleInputChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    console.log('File input changed:', event.target.files?.[0]);
    const file = event.target.files?.[0] as File | undefined;
    const bytes = file ? await file.arrayBuffer() : new ArrayBuffer(0);
    console.log('File bytes:', bytes);
    const buffer = Buffer.from(bytes);
    setBase64InputValue(buffer.toString('base64'));
  };

  return (
    <div className="flex justify-center items-center w-full h-full">
      <Form
        action={handleFileUpload}
        className="flex justify-center items-center w-full h-full"
      >
        <label
          style={{
            color: 'var(--color-grey)',
          }}
          htmlFor="file-upload"
          className="flex items-center flex-col justify-center gap-4 w-21/34 h-64 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-gray-400"
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

          <span className="text-xl md:text-2xl lg:md:text-4xl text-center">
            Click to upload a file
          </span>
          <input
            id="file-upload"
            name="file-upload"
            type="file"
            className="hidden"
            accept=".jpg, .jpeg, .png"
            onChange={handleInputChange}
          />
        </label>
        <input type="submit" value="Upload" />
        <Image
          src={`data:image/png;base64,${base64InputValue}`}
          alt="Uploaded file preview"
          width={100}
          height={100}
        />
      </Form>
    </div>
  );
}
