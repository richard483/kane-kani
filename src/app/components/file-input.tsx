import axios from 'axios';
import sharp from 'sharp';
import FileInputForm from './file-input-form';

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

interface GeminiBillResponse {
  candidates: [
    {
      content: {
        parts: [
          {
            text: string;
          },
        ];
      };
    },
  ];
}

async function compressRawBase64String(buffer: Buffer): Promise<string> {
  'use server';

  const compressedBuffer = await sharp(buffer)
    .resize(800)
    .jpeg({ quality: 50 })
    .toBuffer();
  return compressedBuffer.toString('base64');
}

async function handleFileUpload(formData: FormData) {
  'use server';

  const file = formData.get('file-upload') as File;

  if (!file || file.size <= 0) return;

  try {
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const compressedBase64String = await compressRawBase64String(buffer);

    const response = await axios(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent',
      {
        method: 'POST',
        data: {
          contents: [
            {
              parts: [
                {
                  inline_data: {
                    mime_type: 'image/jpeg',
                    data: compressedBase64String,
                  },
                },
                {
                  text: 'is the given picture is a bill? if yes, return the information about the bill such as the merchant name for the title, some details about the merchant and cashier for the description, and an array about the item on the bill such as the item name, item multiply, and the item',
                },
              ],
            },
          ],
          generationConfig: {
            responseMimeType: 'application/json',
            responseSchema: {
              type: 'OBJECT',
              properties: {
                bill_title: {
                  type: 'STRING',
                  description: 'The main title of the bill.',
                },
                bill_description: {
                  type: 'STRING',
                  description:
                    "A short description of the bill's contents or purpose.",
                },
                is_a_bill: {
                  type: 'BOOLEAN',
                  description: 'A flag to confirm if the document is a bill.',
                },
                properties: {
                  type: 'OBJECT',
                  description: 'Contains the detailed items of the bill.',
                  properties: {
                    items: {
                      type: 'ARRAY',
                      description: 'A list of all items included in the bill.',
                      items: {
                        type: 'OBJECT',
                        description: 'Represents a single item on the bill.',
                        properties: {
                          item_name: {
                            type: 'STRING',
                            description: 'The name of the item.',
                          },
                          item_multiply: {
                            type: 'NUMBER',
                            description:
                              'The quantity or multiplier for the item.',
                          },
                          item_price: {
                            type: 'NUMBER',
                            description:
                              'The price of a single unit of the item.',
                          },
                        },
                        required: ['item_name', 'item_multiply', 'item_price'],
                      },
                    },
                  },
                  required: ['items'],
                },
              },
              required: [
                'bill_title',
                'bill_description',
                'is_a_bill',
                'properties',
              ],
            },
          },
        },
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': process.env.GEMINI_API_KEY,
        },
      },
    );

    const jsonMatch = (
      response.data as GeminiBillResponse
    ).candidates[0].content.parts[0].text.match(/\{[\s\S]*\}/);

    if (!jsonMatch) {
      console.error(
        '#handleFileUpload - No JSON found in response:',
        response.data,
      );
      return;
    }

    const cleanJsonString = jsonMatch[0];

    const billObject: BillData = JSON.parse(cleanJsonString);

    console.log('Parsed bill data:', billObject);
  } catch (error) {
    console.error('#handleFileUpload - Encountered error:', error);
    return;
  }
}

export default function FileInput() {
  return (
    <div className="flex justify-center items-center w-full h-full">
      <FileInputForm handleFileUpload={handleFileUpload} />
    </div>
  );
}
