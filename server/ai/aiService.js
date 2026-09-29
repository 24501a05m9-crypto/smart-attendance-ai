import dotenv from 'dotenv';

dotenv.config();

const OLLAMA_URL = 'http://127.0.0.1:11434/api/chat';
const MODEL = 'llama3.2:latest';

export const generateSynapseResponse = async (message, context) => {
  try {
    const startTime = Date.now();

    const prompt = `
You are Synapse AI, the attendance assistant inside a college attendance system.

Answer the student's question using ONLY the supplied attendance context.

Rules:
- Answer directly.
- Keep it very short and simple.
- Maximum 3 short sentences or 3 short bullet points.
- Use exact values from the context.
- Do not invent values.
- Do not change calculated values.
- If information is unavailable, say so clearly.

Attendance context:
${JSON.stringify(context)}

Student question:
${message}
`;

    const response = await fetch(OLLAMA_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        stream: false
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Ollama error: ${errorText}`);
    }

    const data = await response.json();

    const answer = data?.message?.content?.trim();

    if (!answer) {
      throw new Error('Ollama returned an empty response.');
    }

    console.log(
      `[Synapse AI] Ollama response time: ${Date.now() - startTime} ms`
    );

    return answer;
  } catch (error) {
    console.error(
      'Synapse Ollama error:',
      error?.message || error
    );

    throw new Error(
      'Synapse AI is currently unavailable. Please try again.'
    );
  }
};