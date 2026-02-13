"use server";

import { auth } from "@clerk/nextjs/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

export async function improveWithAI({ current, type }) {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const prompt = `
    As an expert resume writer, please improve the following ${type} to be more professional, engaging, and concise. 
    Maintain the original meaning but enhance the clarity and impact.
    The output should be slightly more detailed and elaborate than the original, providing a comprehensive overview.
    
    Original text:
    "${current}"

    Return the improved text directly without any explanations or additional formatting.
  `;

    try {
        const result = await model.generateContent(prompt);
        const response = result.response;
        const improvedText = response.text().trim();
        return improvedText;
    } catch (error) {
        console.error("Error improving text:", error);
        throw new Error("Failed to improve text");
    }
}
