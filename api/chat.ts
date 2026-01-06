// api/chat.ts
import { GoogleGenAI } from "@google/genai";

export const config = { runtime: 'edge' };

export default async function handler(req: Request) {
  const { prompt, userDataContext } = await req.json();
  
  // CORREÇÃO 1: Passando um objeto com 'apiKey' em vez de apenas a string
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });
  
  // CORREÇÃO 2: Usando a estrutura correta da biblioteca @google/genai
  // Usamos 'generateContent' diretamente para chamadas de API sem estado (stateless)
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    config: {
      systemInstruction: `Você é o cérebro do app Glass. USUÁRIO: Kenned. Contexto: ${userDataContext}`
    },
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
  });

  return new Response(JSON.stringify(response));
}