import { GoogleGenerativeAI } from '@google/generative-ai'

const LLM_MODEL = 'gemini-1.5-flash'

/**
 * Generate a grounded answer using retrieved context chunks.
 * @param {string} question
 * @param {{ text, documentName, pageNumber }[]} contextChunks
 * @returns {Promise<string>}
 */
export async function generateAnswer(question, contextChunks) {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
  const model = genAI.getGenerativeModel({ model: LLM_MODEL })

  const contextParts = contextChunks.map((chunk, i) =>
    `[Source ${i + 1} — ${chunk.documentName}, Page ${chunk.pageNumber}]\n${chunk.text}`
  )
  const context = contextParts.join('\n\n---\n\n')

  const prompt = `You are an intelligent document assistant.
Answer the user's question using ONLY the context provided below.

CONTEXT:
${context}

QUESTION: ${question}

RULES:
1. Base your answer solely on the context — do not use outside knowledge.
2. If the answer is not present in the context, respond with:
   "This information is not available in the uploaded documents."
3. Cite sources inline using the format: *(Source: filename, Page N)*
4. Format the response in clean Markdown (headers, bold, lists where appropriate).
5. Be concise and precise.

ANSWER:`

  const result = await model.generateContent(prompt)
  return result.response.text()
}
