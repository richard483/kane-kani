import axios from 'axios';
import sharp from 'sharp';
import FileInputForm from './file-input-form';
import { BillData, GeminiBillResponse } from '../types/Bill';
import { getGeminiRequestData } from '../utils/gemini';

async function compressRawBase64String(buffer: Buffer): Promise<string> {
  'use server';

  const compressedBuffer = await sharp(buffer)
    .resize(800)
    .jpeg({ quality: 50 })
    .toBuffer();
  return compressedBuffer.toString('base64');
}

async function handleFileProcessing(
  formData: FormData,
): Promise<BillData | undefined> {
  'use server';

  const file = formData.get('file-upload') as File;
  console.log('#handleFileProcessing - File received:', file);

  if (!file || file.size <= 0) return;

  console.log('#handleFileProcessing - File size:', file.size);

  try {
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const compressedBase64String = await compressRawBase64String(buffer);
    console.log(
      '#handleFileProcessing - Compressed base64 string:',
      compressedBase64String,
    );

    const response = await axios(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent',
      {
        method: 'POST',
        data: getGeminiRequestData(compressedBase64String),
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': process.env.GEMINI_API_KEY,
        },
      },
    ).catch((error) => {
      console.error('#handleFileProcessing - Error during API call:', error);
      throw error;
    });

    console.log('#handleFileProcessing - Response from Gemini:', response.data);

    const jsonMatch = (
      response.data as GeminiBillResponse
    ).candidates[0].content.parts[0].text.match(/\{[\s\S]*\}/);

    if (!jsonMatch) {
      console.error(
        '#handleFileProcessing - No JSON found in response:',
        response.data,
      );
      return;
    }

    const cleanJsonString = jsonMatch[0];

    const billObject: BillData = JSON.parse(cleanJsonString);
    console.log('#handleFileProcessing - Parsed bill object:', billObject);

    return billObject;
  } catch (error) {
    console.error('#handleFileProcessing - Encountered error:', error);
    return;
  }
}

export default function FileInput() {
  return (
    <div className="flex justify-center items-center w-full h-full">
      <FileInputForm handleFileProcessing={handleFileProcessing} />
    </div>
  );
}
