import axios from 'axios';

export async function POST(request: Request): Promise<Response> {
  try {
    const { body } = await request.json();

    const response = await axios('http://localhost:11434/api/chat', {
      ...body,
    });

    return new Response(JSON.stringify(response.data), {
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Error in POST request:', error);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}
