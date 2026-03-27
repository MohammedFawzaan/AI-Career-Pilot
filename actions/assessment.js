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
        You are a professional career assessment evaluator. You are conducting a structured assessment — not a casual conversation.
        Current Assessment Topic: "${currentLayer.name}"
        Initial Question: "${currentLayer.initialQuestion}"

        Conversation History for this topic:
        ${JSON.stringify(history)}

        Based on the user's previous answers, generate the NEXT single follow-up question.
        
        IMPORTANT RULES:
        - Do NOT drill deeper into the same specific detail. PIVOT to a DIFFERENT ANGLE of the topic.
        - Keep the tone professional, clear, and evaluative — like an assessment, not a friendly chat.
        - Ask direct, purposeful questions that extract concrete information about the user.
        - Do NOT use phrases like "That's great!", "Interesting!", "Tell me more" or any filler.
        - Do NOT repeat questions or ask about something they already answered.
        - The question should be concise (1-2 sentences max) and assessment-focused.
        - Focus on extracting facts, preferences, skills, and goals — not feelings or reflections.
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

export async function submitAssessment(fullProfile, targetRole = null, psychScores = null) {
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
            If present, use the provided scores to enhance your analysis and GENERATE detailed sub-scores.
            - Cognitive Intelligence Score: ${psychScores?.cognitiveScore ?? 'N/A'}/100
              Round Data: ${JSON.stringify(psychScores?.cognitiveRoundScores || [])}
            - Focus & Precision Score: ${psychScores?.focusScore ?? 'N/A'}/100
              Round Data: ${JSON.stringify(psychScores?.focusRoundScores || [])}
            - Curiosity & Learning Score: ${psychScores?.curiosityScore ?? 'N/A'}/100
              Round Data: ${JSON.stringify(psychScores?.curiosityRoundScores || [])}

            A roleTargeting section may also be present (type: 'roleTarget') with the user's desired role and personality-fit answers.

            Based on ALL these inputs, analyze the user's:
            1. Core Interests & Hobbies
            2. Skills (Soft & Hard)
            3. Achievements
            4. Career Goals
            5. Learning Ambitions
            6. Current Status & Satisfaction
            7. Psychological profile: Cognitive Intelligence, Focus & Precision, Curiosity & Learning Mindset

            Map these traits to the most suitable roles — NOT limited to IT.
            Consider ANY career path that fits their profile, skills, and ambitions (e.g., healthcare, finance, education, creative arts, engineering, business, etc.).

            Return the result in the following JSON format ONLY (valid JSON, no markdown blocks):
            {
                "primaryProfile": "A 2-3 word catchphrase describing their profile (e.g., 'The Logical Architect')",
                "summary": "A brief 2-sentence summary of why this profile fits them — reference both interview answers AND psychological scores.",
                "psychologicalProfile": {
                    "cognitive": {
                        "overall": 75,
                        "analyticalThinking": 80,
                        "logicalReasoning": 70,
                        "problemSolving": 75,
                        "decisionMaking": 72
                    },
                    "focusPrecision": {
                        "overall": 68,
                        "accuracy": 72,
                        "persistence": 65
                    },
                    "curiosityLearning": {
                        "overall": 82,
                        "curiosity": 85,
                        "adaptability": 80,
                        "learningInitiative": 78
                    },
                    "dominantTraits": ["Analytical Thinking", "Curiosity"],
                    "summary": "Brief psychological analysis based on the detailed round performance"
                },
                "targetRoleCareerPath": {
                    "role": "Target Role Name (only if specified by user)",
                    "description": "Brief description of the role",
                    "matchReason": "Why they fit this target role...",
                    "matchScore": 85,
                    "feasibility": "High Fit/Moderate Fit/Low Fit",
                    "feasibilityReason": "Detailed 2-3 sentence explanation of WHY they are a fit or not for this target role based on their skills and psychological profile.",
                    "careerLadder": [
                        { "level": 1, "title": "Junior/Entry Title", "timeframe": "0-2 years" },
                        { "level": 2, "title": "Mid-Level Title", "timeframe": "2-5 years" },
                        { "level": 3, "title": "Senior Title", "timeframe": "5-8 years" }
                    ],
                    "keyMilestones": ["Milestone 1 to achieve", "Milestone 2", "Milestone 3"]
                },
                "recommendedRoles": [
                    { "role": "Name of Role", "description": "Brief description", "matchReason": "Why this role fits — reference skills AND psychological scores", "matchScore": 92 },
                    { "role": "Second Best Role", "description": "Brief description", "matchReason": "Why this role fits", "matchScore": 85 },
                    { "role": "Third Best Role", "description": "Brief description", "matchReason": "Why this role fits", "matchScore": 75 }
                ],
                "recommendedCountries": [
                    { "country": "Country Name", "demandLevel": "High/Medium/Low", "reason": "Why" },
                    { "country": "Country Name", "demandLevel": "High/Medium/Low", "reason": "Why" },
                    { "country": "Country Name", "demandLevel": "High/Medium/Low", "reason": "Why" }
                ],
                "identifiedSkills": [
                    { "skill": "Skill 1 (User has)", "proficiency": "Strong/Moderate/Basic" },
                    { "skill": "Skill 2 (User has)", "proficiency": "Strong/Moderate/Basic" }
                ],
                "recommendedSkills": [
                    { "skill": "Skill 1 (To learn)", "reason": "Why needed", "priority": "High/Medium/Low" },
                    { "skill": "Skill 2 (To learn)", "reason": "Why needed", "priority": "High/Medium/Low" }
                ],
                "skillGap": [
                    { "skill": "Skill Name", "priority": "High" } 
                ],
                "personalDevelopment": [
                    "Advice 1 based on behavioral traits and game scores", "Advice 2"
                ]
            }
            
            IMPORTANT RULES:
            - 'targetRoleCareerPath': ONLY generate this object if the user has specified a target role. If they skipped it, completely omit this key.
            - If 'targetRoleCareerPath' is generated, the target role MUST NOT appear in 'recommendedRoles'. 'recommendedRoles' must be 3 DIFFERENT roles.
            - 'identifiedSkills': Extract skills the user *explicitly mentioned* or *demonstrated*.
            - 'recommendedSkills': Suggest skills they *need* for the recommended roles and target role.
            - 'psychologicalProfile': Generate the 9 detailed sub-scores (0-100) by analyzing their round-by-round performance in the games.
            - 'recommendedCountries': Suggest 3-5 countries with high demand for the recommended roles.
        `;

        const result = await model.generateContent(prompt);
        let text = result.response.text();

        text = text.replace(/```(json|JSON)?\n?/g, "").replace(/```/g, "").trim();
        const firstBrace = text.indexOf('{');
        const lastBrace = text.lastIndexOf('}');
        if (firstBrace !== -1 && lastBrace !== -1) {
            text = text.substring(firstBrace, lastBrace + 1);
        }

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
                updatedAt: new Date(),
            },
            create: {
                userId: user.id,
                questions: [fullProfile],
                primaryRole: null,
                targetRole: targetRole || null,
                analysis: analysis,
            },
        });

        console.log("submitAssessment: Assessment saved successfully:", assessment.id);
        return assessment;
    } catch (error) {
        console.error("submitAssessment: Error:", error);
        throw new Error("Failed to submit assessment: " + error.message);
    }
}
