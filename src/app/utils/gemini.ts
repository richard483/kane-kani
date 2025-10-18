
// Retrieve data from Redis
type InlineData = {
  mime_type: string;
  data: string;
};

type Part = {
  inline_data?: InlineData;
  text?: string;
};

type Content = {
  parts: Part[];
};

type GenerationConfig = {
  responseMimeType: string;
  responseSchema: unknown;
};

type GeminiRequestData = {
  contents: Content[];
  generationConfig: GenerationConfig;
};

export function getGeminiRequestData(compressedBase64String: string): GeminiRequestData {

  return {
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
            text: 'Is the given picture is a bill and the picture is clear enough to be read? if yes, return the information about the bill such as the merchant name for the title, some details about the merchant and cashier for the description, and an array about the item on the bill such as the item name, item multiply, and the item. Please note that the bill is most likely to be in Indonesia Rupiah (IDR), so if there are number separation symbol like dot (.) or comma (,), it most likely to be separation of 3 number, not decimal fraction.',
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
            description: "A short information of the bill's contents.",
          },
          is_a_bill: {
            type: 'BOOLEAN',
            description: 'A flag to confirm if the document is a bill and the picture is clear enough to be read.',
          },
          total_price: {
            type: 'NUMBER',
            description: 'The total price of the bill.',
          },
          item_includes_tax: {
            type: 'BOOLEAN',
            description:
              'A flag to confirm if the item in bill is already taxed.',
          },
          tax_rate: {
            type: 'NUMBER',
            description: 'Tax rate in percentage if applicable, if there are multiple tax, sum up all the tax, add the rounding, and calculate the tax rate based on the total price and the pre-tax price (total price - tax). If not applicable, set to null.',
          },
          service_fee: {
            type: 'NUMBER',
            description:
              'Service fee (including service fee, and charge for Take Away (charge TA)), zero if not applicable, may include in the item list. If included in item lists, would taken out from the item lists & show the value on this serivce field without the tax calculation.',
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
          'service_fee',
          'item_includes_tax',
        ],
      },
    },
  }
}
