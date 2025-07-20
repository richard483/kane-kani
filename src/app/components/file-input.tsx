import axios from 'axios';
import Form from 'next/form';
import sharp from 'sharp';

interface BillItem {
  item_name: string;
  item_multiply: number;
  item_price: number;
}

interface BillData {
  properties: {
    items: BillItem[];
  };
  bill_title: string;
  bill_description: string;
  is_a_bill: boolean;
}

interface OllamaBillResponse {
  message: {
    content: string;
  };
}

async function compressRawBase64String(buffer: Buffer): Promise<string> {
  const compressedBuffer = await sharp(buffer)
    .resize(800)
    .jpeg({ quality: 50 })
    .toBuffer();
  return compressedBuffer.toString('base64');
}

async function handleFileUpload(formData: FormData) {
  'use server';

  console.log('File upload initiated');

  const file = formData.get('file-upload') as File;

  if (file && file.size > 0) {
    try {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      let base64String = buffer.toString('base64');
      base64String = await compressRawBase64String(buffer);
      console.log('File converted to base64, length:', base64String.length);
      console.log('File converted to base64:', base64String);

      const response = await axios('http://10.10.10.7:11434/api/chat', {
        method: 'POST',
        data: {
          keep_alive: '10080m',
          model: 'qwen2.5vl:3b',
          messages: [
            {
              role: 'user',
              content:
                'is the given picture is a bill? if yes, return the information about the bill such as the merchant name for the title, some details about the merchant and cashier for the description, and an array about the item on the bill such as the item name, item multiply, and the item, return the result as json with this format:     "properties": {\r\n"items": {\r\n"type": "array",\r\n"items": {\r\n"type": "object",\r\n"properties": {\r\n"item_name": {\r\n"type": "string"\r\n},\r\n"item_multiply": {\r\n"type": "number"\r\n},\r\n"item_price": {\r\n"type": "number"\r\n}\r\n}\r\n}\r\n},\r\n"bill_title": {\r\n"type": "string"\r\n},\r\n"bill_description": {\r\n"type": "string"\r\n},\r\n"is_a_bill": {\r\n"type": "boolean"\r\n}\r\n}',
              images: [base64String],
            },
          ],
          stream: false,
        },
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log('File uploaded:', response.data);

      const jsonMatch = (
        response.data as OllamaBillResponse
      ).message.content.match(/\{[\s\S]*\}/);

      if (!jsonMatch) {
        console.error('No JSON found in response:', response.data);
        return;
      }

      const cleanJsonString = jsonMatch[0];

      const billObject: BillData = JSON.parse(cleanJsonString);

      console.log('Parsed bill data:', billObject);
    } catch (error) {
      console.error('Encountored error:', error);
      return;
    }
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
