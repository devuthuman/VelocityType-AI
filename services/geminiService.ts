import { GoogleGenAI } from "@google/genai";
import { Difficulty } from '../types';

// Initialize Gemini
// NOTE: In a real production app, you would likely proxy this through a backend 
// to avoid exposing keys, but for this demo per instructions, we use process.env.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const PROMPT_TEMPLATES: Record<Difficulty, string> = {
  [Difficulty.EASY]: "Generate a simple, easy-to-type paragraph of text (approx 30 words). Use common English words, simple sentence structure, and minimal punctuation. No weird characters. Just the text.",
  [Difficulty.MEDIUM]: "Generate a moderate difficulty paragraph (approx 50 words). Include some commas, periods, and a mix of short and long words. Standard prose. Just the text.",
  [Difficulty.HARD]: "Generate a difficult paragraph (approx 60 words). Include complex vocabulary, scientific or technical terms, varied punctuation (semicolons, hyphens), and numbers. Just the text.",
  [Difficulty.CODE]: "Generate valid, clean JavaScript/TypeScript code snippet (approx 10 lines). Include functions, variables, and comments. Do not use markdown blocks (```). Just the raw code text."
};

export const generateTypingText = async (difficulty: Difficulty): Promise<string> => {
  try {
    const prompt = PROMPT_TEMPLATES[difficulty];
    
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    const text = response.text?.trim();

    if (!text) {
      throw new Error("No text generated");
    }

    // Clean up potential markdown if the model disobeys slightly
    return text.replace(/^```[a-z]*\n/i, '').replace(/\n```$/, '');
    
  } catch (error) {
    console.error("Gemini Generation Error:", error);
    // Fallback texts in case of API failure
    if (difficulty === Difficulty.CODE) {
      return "const calculateSpeed = (distance: number, time: number): number => {\n  if (time <= 0) return 0;\n  return distance / time;\n};\nconsole.log(calculateSpeed(100, 20));";
    }
    return "The quick brown fox jumps over the lazy dog. Typing is a skill that improves with daily practice and dedication.";
  }
};