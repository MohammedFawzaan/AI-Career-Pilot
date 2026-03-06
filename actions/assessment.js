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
        You are a warm, insightful career coach having a genuine conversation (not an exam).
        Current Topic: "${currentLayer.name}"
        Initial Question: "${currentLayer.initialQuestion}"

        Conversation History for this topic:
        ${JSON.stringify(history)}

        Based on the user's previous answers, generate the NEXT single follow-up question.
        
        IMPORTANT RULES:
        - Do NOT drill deeper into the same specific detail. Instead, PIVOT to a DIFFERENT, BROADER ANGLE of the topic.
        - Keep the tone warm, curious, and conversational — like a career coach, not an interviewer.
        - Ask open-ended questions that encourage reflection and self-discovery.
        - Do NOT repeat questions or ask about something they already answered.
        - The question should feel natural, like the next thing a thoughtful coach would ask.
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

export async function submitAssessment(fullProfile, targetRole = null) {
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
            You are an expert career counselor and psychologist. You have conducted a deep interview with a user AND they completed 3 psychological assessment games.
            
            User Profile & Interview Details:
            ${JSON.stringify(fullProfile)}

            ${targetRole ? `The user's desired target role/domain: "${targetRole}"` : "The user has not specified a target role."}

            A psychProfile from 3 psychological assessment games may be included in the data (type: 'psych').
            If present, use its trait scores to enhance your analysis:
            - cognitiveGame: traits (analyticalThinking, logicalReasoning, problemSolving, decisionMaking) + overallScore
            - focusGame: traits (attentionToDetail, accuracy, persistence, taskDiscipline) + overallScore
            - curiosityGame: traits (curiosity, learningInitiative, adaptability, exploration) + overallScore

            A roleTargeting section may also be present (type: 'roleTarget') with the user's desired role and personality-fit answers.

            Based on ALL these inputs, analyze the user's:
            1. Core Interests & Hobbies
            2. Skills (Soft & Hard)
            3. Achievements
            4. Career Goals
            5. Learning Ambitions
            6. Current Status & Satisfaction
            7. Psychological profile: Cognitive Intelligence, Focus & Precision, Curiosity & Learning Mindset

            Map these traits to the most suitable industries and roles — NOT limited to IT.
            Consider ANY industry or career path that fits their profile, skills, and ambitions (e.g., healthcare, finance, education, creative arts, engineering, business, etc.).
            Use the following industry list as a reference, but feel free to suggest industries OUTSIDE this list if they are a better fit: 
            ${JSON.stringify(industries.map(i => ({ name: i.name, sub: i.subIndustries })))}

            Return the result in the following JSON format ONLY (valid JSON, no markdown blocks):
            {
                "primaryProfile": "A 2-3 word catchphrase describing their profile (e.g., 'The Logical Architect')",
                "summary": "A brief 2-sentence summary of why this profile fits them — reference both interview answers AND psychological scores.",
                "psychologicalProfile": {
                    "cognitiveIntelligence": 75,
                    "focusPrecision": 68,
                    "curiosityLearning": 82,
                    "dominantTraits": ["Analytical Thinking", "Curiosity"],
                    "summary": "Brief description of their psychological strengths"
                },
                "recommendedIndustries": [
                    { "industry": "Name of Industry", "score": 85, "reason": "Why this industry fits their profile" }
                ],
                "recommendedRoles": [
                    { "role": "Name of Role", "description": "Brief description", "matchReason": "Why this role fits — reference skills AND psychological scores" },
                    { "role": "Second Best Role", "description": "Brief description", "matchReason": "Why this role fits" },
                    { "role": "Third Best Role", "description": "Brief description", "matchReason": "Why this role fits" }
                ],
                "recommendedCountries": [
                    { "country": "Country Name", "demandLevel": "High/Medium/Low", "reason": "Why" },
                    { "country": "Country Name", "demandLevel": "High/Medium/Low", "reason": "Why" },
                    { "country": "Country Name", "demandLevel": "High/Medium/Low", "reason": "Why" }
                ],
                "identifiedSkills": [
                    "Skill 1 (User has)", "Skill 2 (User has)"
                ],
                "recommendedSkills": [
                   "Skill 1 (To learn)", "Skill 2 (To learn)"
                ],
                "skillGap": [
                    { "skill": "Skill Name", "priority": "High" } 
                ],
                "personalDevelopment": [
                    "Advice 1 based on behavioral traits and game scores", "Advice 2"
                ]
            }
            
            IMPORTANT:
            - 'identifiedSkills': Extract skills the user *explicitly mentioned* or *demonstrated*.
            - 'recommendedSkills': Suggest skills they *need* for the recommended roles.
            - 'psychologicalProfile': Include all 3 scores from the games (0-100 each)
            - 'recommendedCountries': Suggest 3-5 countries with high demand for the recommended roles.
            - If user specified a target role, factor it heavily into role recommendations.
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
                questions: [fullProfile],
                primaryRole: null,
                targetRole: targetRole || null,
                analysis: analysis,
                recommendedCountries: analysis.recommendedCountries || [],
                updatedAt: new Date(),
            },
            create: {
                userId: user.id,
                questions: [fullProfile],
                primaryRole: null,
                targetRole: targetRole || null,
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
