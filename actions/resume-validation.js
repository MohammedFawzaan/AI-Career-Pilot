"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { industries } from "@/data/industries";

export async function generateValidationQuestions(extractedResume) {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const prompt = `
        You are an expert career validator. Based on the following resume data, generate validation questions across 4 layers.
        
        Resume Data:
        ${JSON.stringify(extractedResume)}

        Generate questions for these layers:

        LAYER 1 — Resume Skill Validation (exactly 3 questions):
        - Generate 1 general experience-based question per major skill (pick top 3 skills).
        - Questions must focus on USAGE and EXPOSURE, not definitions.
        - Reference specific PROJECTS from the resume where the skill was used.
        - Keep them broad and professional.
        - Example: "In your [Project Name] project, you used [skill]. Can you describe the specific challenges you faced with it?"
        - Do NOT ask "What is [skill]?" or "Define [skill]"

        LAYER 2 — Practical Ability Check (exactly 3 questions):
        - Generate 3 general real-world situation questions.
        - Reference the candidate's actual projects and work experience when framing scenarios.
        - Focus on HOW the user approaches problems.
        - Do not go deep into technical implementation details.
        - Assess logical thinking and work approach.
        - Example: "In a project like [Project Name], when you encounter a bug in production, what is your typical approach to debugging it?"

        LAYER 3 — Cross-Skill Reasoning (exactly 3 questions):
        - Generate 3 scenario-based questions that combine at least 2 skills from the resume.
        - Use the candidate's ACTUAL PROJECTS as context for these scenarios.
        - Each question must test whether the candidate understands how their skills WORK TOGETHER in real-world scenarios.
        - Do NOT ask for definitions or deep theoretical explanations.
        - Keep questions practical and high-level.
        - Focus on how technologies interact, affect each other, or are used together in their projects.
        - This layer separates real engineers from tutorial followers.
        - Example: "In your [Project Name], you used [Tech A] and [Tech B] together. How did these technologies complement each other, and what tradeoffs did you face?"

        LAYER 4 — Role Suitability & Confidence Mapping (exactly 2 questions):
        - Ask 2 reflective questions.
        - Identify the candidate's strongest skill area considering their project portfolio.
        - Understand their preferred type of work (individual vs team, building vs maintaining, etc.)
        - Check if their confidence aligns with their resume and project claims.
        - Example: "Looking at your projects like [Project Name], which of your skills do you feel most confident applying in a professional setting, and why?"

        Return the result in the following JSON format ONLY (valid JSON, no markdown blocks):
        {
            "layers": [
                {
                    "id": "skill-validation",
                    "name": "Resume Skill Validation",
                    "questions": ["Question 1", "Question 2", "Question 3"]
                },
                {
                    "id": "practical-check",
                    "name": "Practical Ability Check",
                    "questions": ["Question 1", "Question 2", "Question 3"]
                },
                {
                    "id": "cross-skill",
                    "name": "Cross-Skill Reasoning",
                    "questions": ["Question 1", "Question 2", "Question 3"]
                },
                {
                    "id": "role-suitability",
                    "name": "Role Suitability & Confidence",
                    "questions": ["Question 1", "Question 2"]
                }
            ]
        }

        IMPORTANT:
        - Questions must be personalized based on the ACTUAL skills, projects, and experience in the resume
        - Reference specific project names and technologies from the resume in your questions
        - Do NOT use generic placeholder questions
        - Keep all questions concise and professional
        - Total: exactly 11 questions
    `;

    try {
        const result = await model.generateContent(prompt);
        const text = result.response.text().replace(/```json/g, "").replace(/```/g, "").trim();
        const parsed = JSON.parse(text);

        if (!parsed || !parsed.layers || parsed.layers.length !== 4) {
            throw new Error("Invalid question generation response");
        }

        return parsed;
    } catch (error) {
        console.error("Error generating validation questions:", error);
        throw new Error("Failed to generate validation questions: " + error.message);
    }
}

export async function submitResumeValidation(resumeData, validationAnswers) {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    try {
        const user = await db.user.findUnique({
            where: { clerkUserId: userId },
        });

        if (!user) throw new Error("User not found");

        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

        const prompt = `
            You are an expert career analyst for experienced professionals.
            
            An experienced professional has uploaded their resume and completed a validation assessment.
            Your job is to analyze their resume data AND their validation answers to:
            1. Verify the authenticity of their resume claims
            2. Identify their true skill level
            3. Recommend FUTURE GROWTH career roles (not their current role — they already have one)
            4. Generate a comprehensive career analysis

            Resume Data:
            ${JSON.stringify(resumeData)}

            Validation Assessment Answers:
            ${JSON.stringify(validationAnswers)}

            Use the following industry list as a reference:
            ${JSON.stringify(industries.map(i => ({ name: i.name, sub: i.subIndustries })))}

            Return the result in the following JSON format ONLY (valid JSON, no markdown blocks):
            {
                "primaryProfile": "A 2-3 word catchphrase describing their professional profile (e.g., 'The Systems Architect', 'The Data Strategist')",
                "summary": "A brief 2-sentence summary analyzing their resume vs validation performance. Mention if skills are verified or if there are gaps.",
                "validationScore": {
                    "overall": 85,
                    "skillAuthenticity": 90,
                    "practicalAbility": 80,
                    "crossSkillReasoning": 85,
                    "confidenceAlignment": 80
                },
                "recommendedIndustries": [
                    { "industry": "Name of Industry", "score": 85, "reason": "Why this industry fits their growth trajectory" }
                ],
                "recommendedRoles": [
                    { "role": "Future Growth Role 1", "description": "Brief description", "matchReason": "Why this role is a strong next step based on their verified skills" },
                    { "role": "Future Growth Role 2", "description": "Brief description", "matchReason": "Why this role fits" },
                    { "role": "Future Growth Role 3", "description": "Brief description", "matchReason": "Why this role fits" }
                ],
                "recommendedCountries": [
                    { "country": "Country Name", "demandLevel": "High/Medium/Low", "reason": "Why this country has opportunities for these growth roles" },
                    { "country": "Country Name", "demandLevel": "High/Medium/Low", "reason": "Why" },
                    { "country": "Country Name", "demandLevel": "High/Medium/Low", "reason": "Why" }
                ],
                "identifiedSkills": [
                    "Verified Skill 1", "Verified Skill 2"
                ],
                "recommendedSkills": [
                    "Growth Skill 1 (To learn for future roles)", "Growth Skill 2"
                ],
                "skillGap": [
                    { "skill": "Skill Name", "priority": "High" }
                ],
                "personalDevelopment": [
                    "Growth advice 1 based on validation performance", "Advice 2"
                ],
                "resumeAuthenticity": "Verified/Partially Verified/Needs Review",
                "currentStrengths": ["Strength 1 confirmed by validation", "Strength 2"],
                "areasOfConcern": ["Any skill that seemed overclaimed based on validation answers"]
            }

            IMPORTANT:
            - 'recommendedRoles' should be FUTURE GROWTH roles, not their current position
            - 'identifiedSkills': Skills VERIFIED through validation answers (they actually demonstrated knowledge)
            - 'recommendedSkills': Skills they need for future growth roles
            - 'validationScore': Rate each area 0-100 based on how well they performed in validation
            - 'resumeAuthenticity': Overall assessment of resume truthfulness
            - 'recommendedCountries': Suggest 3-5 countries with demand for their growth roles
            - If validation answers were weak for a claimed skill, note it in 'areasOfConcern'
        `;

        const result = await model.generateContent(prompt);
        const text = result.response.text().replace(/```json/g, "").replace(/```/g, "").trim();

        console.log("submitResumeValidation: Generated AI response length:", text.length);

        const analysis = JSON.parse(text);

        if (!analysis) {
            throw new Error("Failed to analyze resume validation");
        }

        // Mark analysis as experienced user type for differentiation
        analysis.userType = "EXPERIENCED";

        // Upsert into CareerAssessment (same model as fresher)
        const assessment = await db.careerAssessment.upsert({
            where: { userId: user.id },
            update: {
                questions: [{ resumeData, validationAnswers }],
                primaryRole: null,
                analysis: analysis,
                recommendedCountries: analysis.recommendedCountries || [],
                updatedAt: new Date(),
            },
            create: {
                userId: user.id,
                questions: [{ resumeData, validationAnswers }],
                primaryRole: null,
                analysis: analysis,
                recommendedCountries: analysis.recommendedCountries || [],
            },
        });

        console.log("submitResumeValidation: Assessment saved successfully:", assessment.id);
        return assessment;
    } catch (error) {
        console.error("submitResumeValidation: Error:", error);
        throw new Error("Failed to submit resume validation: " + error.message);
    }
}
