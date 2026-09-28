```js
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

if (!process.env.GEMINI_API_KEY) {
  throw new Error('GEMINI_API_KEY is not configured in server/.env');
}

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY
});

export const generateSynapseResponse = async (message, context) => {
  try {
    const startTime = Date.now();

    const prompt = `
You are Synapse AI, the attendance assistant inside a college attendance system.

Answer the student's question using ONLY the supplied attendance context.

STRICT RESPONSE STYLE:
- Give the answer directly.
- Keep it very short and simple.
- Maximum 3 short sentences OR 3 short bullet points.
- Do not repeat the entire attendance report.
- Do not add unnecessary headings.
- Focus only on what the student asked.
- Use exact values from the context.
- Do not invent values.
- Do not change calculated values.
- Do not perform calculations when the required result is already provided.
- If information is unavailable, say so clearly.

Attendance context:
${JSON.stringify(context)}

Student question:
${message}

Give only the concise answer.
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        thinkingConfig: {
          thinkingLevel: 'low'
        }
      }
    });

    const answer = response.text?.trim();

    if (!answer) {
      throw new Error('Gemini returned an empty response.');
    }

    console.log(
      `[Synapse AI] Gemini response time: ${Date.now() - startTime} ms`
    );

    return answer;

  } catch (error) {
    console.error(
      'Synapse Gemini error:',
      error?.message || error
    );

    throw new Error('Synapse AI is currently unavailable. Please try again.');
  }
};
```

Then:

```powershell
git add server/ai/aiService.js
git commit -m "Fix Synapse Gemini API call"
git push origin ai-integration
```

After Vercel redeploys, test Synapse again with:

> Which subject needs attention?

This remove
