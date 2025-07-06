import axios from 'axios';
import Form from 'next/form';

// interface FileUploadResponse {
//   message: {
//     content: string;
//   };
// }

async function handleFileUpload(formData: FormData) {
  'use server';

  console.log('File upload initiated');

  const file = formData.get('file-upload');
  if (file) {
    const response = await axios('http://10.10.10.7:11434/api/chat', {
      method: 'POST',
      data: {
        model: 'qwen2.5vl:3b',
        messages: [
          {
            role: 'user',
            content: 'tell me 1 unique facts about cat',
          },
        ],
        stream: false,
      },
      headers: {
        'Content-Type': 'application/json',
      },
    });

    console.log('File uploaded:', response.data);
  } else {
    console.error('No file uploaded');
  }
}

export default function FileInput() {
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
          />
        </label>
        <input type="submit" value="Upload" />
      </Form>
    </div>
  );
}
