import { GoogleGenAI, GenerateContentResponse, Modality, Type, FunctionDeclaration } from "@google/genai";
import { PersonaId, VoiceId, MusicTrack } from "../types";

const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY as string });

let chatSession: any = null;

const getDynamicContext = () => {
  const now = new Date();
  const timeStr = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  const dateStr = now.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  
  return `HOJE É: ${dateStr}, ${timeStr}.
  ASSISTENTE: Aura (Inteligência Central).
  USUÁRIO: Kenned.
  
  SUA MISSÃO:
  Você é o cérebro do app Glass. Você não é apenas um guia de lugares, mas um gestor de vida.
  Você tem visibilidade sobre:
  - FINANÇAS: Saldo, gastos e entradas.
  - TAREFAS: O que Kenned precisa fazer.
  - MERCADO: Itens que faltam na dispensa.
  - OBRA (MEU APÊ): O progresso da construção do apartamento.

  DIRETRIZES:
  1. Use 'googleMaps' para lugares e rotas.
  2. Use 'googleSearch' para notícias e tempo real.
  3. Seja proativa: se ele perguntar de finanças, sugira economizar ou ver as tarefas.
  4. Respostas curtas, elegantes e em português brasileiro.`;
};

// updateApeProgressDeclaration remains available but excluded from Maps-grounded chat
const updateApeProgressDeclaration: FunctionDeclaration = {
  name: 'updateApeProgress',
  parameters: {
    type: Type.OBJECT,
    description: 'Atualiza o progresso percentual da obra do apartamento.',
    properties: {
      progress: {
        type: Type.NUMBER,
        description: 'Novo percentual de progresso (ex: 32).',
      },
    },
    required: ['progress'],
  },
};

export const resetChatSession = () => {
  chatSession = null;
};

export interface LocationCoords {
  latitude: number;
  longitude: number;
}

// FIX: Corrected gemini-2.5-flash usage and resolved tool conflict (no function calls with googleMaps)
export const getAssistantChat = (systemContext: string, location?: LocationCoords) => {
  if (!chatSession) {
    const ai = getAI();
    chatSession = ai.chats.create({
      model: 'gemini-2.5-flash', 
      config: {
        systemInstruction: `${getDynamicContext()}\n${systemContext}`,
        // FIX: Removed functionDeclarations to comply with "googleMaps may only be used with googleSearch" rule
        tools: [
            { googleSearch: {} }, 
            { googleMaps: {} }
        ],
        toolConfig: location ? {
          retrievalConfig: {
            latLng: {
              latitude: location.latitude,
              longitude: location.longitude
            }
          }
        } : undefined
      },
    });
  }
  return chatSession;
};

export const sendMessageStream = async (prompt: string, context: string, location?: LocationCoords, userDataContext?: string) => {
    const chat = getAssistantChat(context, location);
    const contextPrompt = `
    [CONTEXTO_SISTEMA]
    ${userDataContext}
    [/CONTEXTO_SISTEMA]
    
    LOCALIZAÇÃO: ${location ? `Lat: ${location.latitude}, Lng: ${location.longitude}` : 'Omitida'}
    
    USUÁRIO DIZ: ${prompt}`;
    
    return chat.sendMessageStream({ message: contextPrompt });
};

// FIX: Updated default TTS voice to 'Kore' as per Gemini API guidelines
export const getAudioData = async (text: string, voice: VoiceId = 'Sulafat'): Promise<string | undefined> => {
  try {
    const ai = getAI();
    const cleanText = text.replace(/[*#_~]/g, '').trim();
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: cleanText }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } } },
      },
    });
    return response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  } catch (error) {
    return undefined;
  }
};

// decode converts a base64 string to a Uint8Array.
export function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

// decodeAudioData converts raw PCM audio bytes to an AudioBuffer.
export async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}