"use server";


import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { industries } from "@/data/industries";

export async function generateNextQuestion(currentLayer, history) {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const prompt = `
        You are an expert career counselor conducting an interview.
        Current Topic: "${currentLayer.name}"
        Initial Question: "${currentLayer.initialQuestion}"

        Conversation History for this topic:
        ${JSON.stringify(history)}

        Based on the user's previous answers, generate the NEXT single follow-up question to dig deeper into their "${currentLayer.name}".
        The question should be concise, engaging, and relevant to their previous response.
        Do NOT repeat questions.
        Return ONLY the question text.
    `;

    try {
        const result = await model.generateContent(prompt);
        const question = result.response.text().trim();
        return question;
    } catch (error) {
        console.error("Error generating question:", error);
        return "Could you elaborate more on that?"; // Fallback
    }
}

export async function submitAssessment(fullProfile) {
    const { userId } = await auth();
    if (!userId) {
        console.error("submitAssessment: Unauthorized");
        throw new Error("Unauthorized");
    }

    try {
        const user = await db.user.findUnique({
            where: { clerkUserId: userId },
        });

        if (!user) {
            console.error("submitAssessment: User not found for clerkUserId:", userId);
            throw new Error("User not found");
        }

        console.log("submitAssessment: Analyzing user profile with layers");

        // Initialize Gemini inside the function
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

        const prompt = `
            You are an expert career counselor. You have conducted a deep interview with a user to help them find their career path.
            
            User Profile & Interview Details:
            ${JSON.stringify(fullProfile)}

            Based ONLY on these interview inputs, analyze the user's:
            1. Core Interests & Hobbies
            2. Skills (Soft & Hard)
            3. Achievements
            4. Career Goals
            5. Learning Ambitions
            6. Current Status & Satisfaction

            Map these traits to the most suitable IT industries and roles.
            Use the following industry list as a reference (but you can suggest specific roles within them): 
            ${JSON.stringify(industries.map(i => ({ name: i.name, sub: i.subIndustries })))}

            Return the result in the following JSON format ONLY (valid JSON, no markdown blocks):
            {
                "primaryProfile": "A 2-3 word catchphrase describing their profile (e.g., 'The Logical Architect')",
                "summary": "A brief 2-sentence summary of why this profile fits them based on their answers.",
                "recommendedIndustries": [
                    { "industry": "Name of Industry", "score": 85, "reason": "Why this industry fits their profile" }
                ],
                "recommendedRoles": [
                    { "role": "Name of Role", "description": "Brief description", "matchReason": "Why this role fits specific traits" },
                    { "role": "Second Best Role", "description": "Brief description", "matchReason": "Why this role fits specific traits" },
                    { "role": "Third Best Role", "description": "Brief description", "matchReason": "Why this role fits specific traits" }
                ],
                "recommendedCountries": [
                    { "country": "Country Name", "demandLevel": "High/Medium/Low", "reason": "Why this country has opportunities for these roles" },
                    { "country": "Country Name", "demandLevel": "High/Medium/Low", "reason": "Why this country has opportunities for these roles" },
                    { "country": "Country Name", "demandLevel": "High/Medium/Low", "reason": "Why this country has opportunities for these roles" }
                ],
                "identifiedSkills": [
                    "Skill 1 (User has)", "Skill 2 (User has)"
                ],
                "recommendedSkills": [
                   "Skill 1 (To learn)", "Skill 2 (To learn)"
                ],
                // Deprecated but kept for compatibility if needed, or mapped from recommendedSkills
                "skillGap": [
                    { "skill": "Skill Name", "priority": "High" } 
                ],
                "personalDevelopment": [
                    "Advice 1 based on behavioral weak points", "Advice 2"
                ]
            }
            
            IMPORTANT:
            - 'identifiedSkills': Extract skills the user *explicitly mentioned* or *demonstrated* in their answers.
            - 'recommendedSkills': Suggest skills they *need* for the recommended roles but might lack.
            - 'skillGap': same as recommendedSkills but with priority.
            - 'recommendedCountries': Suggest 3-5 countries with high demand for the recommended roles, considering global job markets.
        `;

        const result = await model.generateContent(prompt);
        const text = result.response.text().replace(/```json/g, "").replace(/```/g, "").trim();

        console.log("submitAssessment: Generated AI response length:", text.length);

        const analysis = JSON.parse(text);

        if (!analysis) {
            console.error("submitAssessment: Failed to parse AI analysis");
            throw new Error("Failed to analyze assessment");
        }

        // Use upsert so user can retake assessment without error (or create new entry)
        const assessment = await db.careerAssessment.upsert({
            where: { userId: user.id },
            update: {
                questions: [fullProfile], // Store full conversational profile
                primaryRole: null, // Let user select their preferred role
                analysis: analysis,
                recommendedCountries: analysis.recommendedCountries || [],
                updatedAt: new Date(),
            },
            create: {
                userId: user.id,
                questions: [fullProfile], // Store full conversational profile
                primaryRole: null, // Let user select their preferred role
                analysis: analysis,
                recommendedCountries: analysis.recommendedCountries || [],
            },
        });

        console.log("submitAssessment: Assessment saved successfully:", assessment.id);
        return assessment;
    } catch (error) {
        console.error("submitAssessment: Error:", error);
        throw new Error("Failed to submit assessment: " + error.message);
    }
}
