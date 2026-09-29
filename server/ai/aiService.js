import dotenv from 'dotenv';
import Groq from 'groq-sdk';

dotenv.config();

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

const MODEL = 'openai/gpt-oss-120b';

export const generateSynapseResponse = async (message, context) => {
  try {
    const startTime = Date.now();

    if (!process.env.GROQ_API_KEY) {
      throw new Error('GROQ_API_KEY is not configured.');
    }

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

    let answer = '';

    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        const completion = await groq.chat.completions.create({
          model: MODEL,
          messages: [
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.2,
          max_tokens: 200
        });

        answer =
          completion?.choices?.[0]?.message?.content?.trim() || '';

        if (answer) {
          break;
        }

        console.warn(
          `[Synapse AI] Groq returned empty response on attempt ${attempt}.`
        );

      } catch (error) {
        console.warn(
          `[Synapse AI] Groq attempt ${attempt} failed:`,
          error?.message || error
        );
      }
    }

    if (!answer) {
      throw new Error('Groq returned an empty response after retry.');
    }

    console.log(
      `[Synapse AI] Groq response time: ${Date.now() - startTime} ms`
    );

    return answer;

  } catch (error) {
    console.error(
      'Synapse Groq error:',
      error?.message || error
    );

    throw new Error(
      'Synapse AI is currently unavailable. Please try again.'
    );
  }
};