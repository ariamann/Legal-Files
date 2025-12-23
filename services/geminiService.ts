import { GoogleGenAI, Type } from "@google/genai";
import { FileSystemItem } from "../types";

// In a real app, this would be process.env.API_KEY
// Assuming the environment provides the key.
const API_KEY = process.env.API_KEY || '';

let genAI: GoogleGenAI | null = null;

export const initializeGemini = () => {
  if (API_KEY && !genAI) {
    genAI = new GoogleGenAI({ apiKey: API_KEY });
  }
  return genAI;
};

export const analyzeFileContent = async (file: FileSystemItem, context: string): Promise<string> => {
  const ai = initializeGemini();
  if (!ai) return "AI Service Unavailable (Missing Key)";

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `You are a legal analyst AI. 
      Analyze this file named "${file.name}" of type ${file.mimeType}.
      Context: ${context}
      
      Provide a concise 2-sentence summary of how this might be relevant to a legal case.
      Assume the content is generic legal boilerplate for this demo if actual content is missing.
      `,
    });
    return response.text || "No analysis available.";
  } catch (error) {
    console.error("Analysis failed", error);
    return "Analysis failed due to error.";
  }
};

export const generateCaseScenario = async (caseName: string, evidence: FileSystemItem[]): Promise<{scenario: string, confidence: number}> => {
  const ai = initializeGemini();
  if (!ai) {
    return {
        scenario: "AI Unavailable. Please check API Key.",
        confidence: 0
    }
  }

  const evidenceList = evidence.map(e => `- ${e.name} (${e.type})`).join('\n');

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: `You are a Senior Legal Strategist.
      Case Name: ${caseName}
      
      Evidence List:
      ${evidenceList}
      
      Task:
      1. Write a narrative scenario (story) of the case based on these filenames (infer content from names like 'invoice', 'contract', 'email').
      2. Estimate a confidence score (0-100) based on how complete the evidence looks.
      
      Return JSON.
      `,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            scenario: { type: Type.STRING },
            confidence: { type: Type.NUMBER }
          }
        }
      }
    });
    
    const result = JSON.parse(response.text || "{}");
    return {
      scenario: result.scenario || "Could not generate scenario.",
      confidence: result.confidence || 50
    };

  } catch (error) {
    console.error("Scenario generation failed", error);
    return { scenario: "Error generating scenario.", confidence: 0 };
  }
};

export const chatWithCase = async (history: {role: string, text: string}[], newMessage: string, caseContext: string) => {
    const ai = initializeGemini();
    if (!ai) return "AI Not Initialized";

    try {
        // Construct chat history for the API
        // Note: The SDK manages history in a Chat session, but here we do stateless for simplicity or reconstruct
        const chat = ai.chats.create({
            model: 'gemini-3-flash-preview',
            config: {
                systemInstruction: `You are a legal assistant specialized in the case: "${caseContext}". Answer strictly based on evidence.`
            },
            history: history.map(h => ({
                role: h.role,
                parts: [{ text: h.text }]
            }))
        });

        const result = await chat.sendMessage({ message: newMessage });
        return result.text || "No response generated.";

    } catch (e) {
        console.error(e);
        return "Error in chat processing.";
    }
}
