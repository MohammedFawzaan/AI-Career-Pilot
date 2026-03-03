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

    const resumeSections = {
        hasExperience: (extractedResume.experience?.length || 0) > 0,
        hasProjects: (extractedResume.projects?.length || 0) > 0,
        hasSkills: (extractedResume.skills?.length || 0) > 0,
        hasEducation: (extractedResume.education?.length || 0) > 0,
        hasAchievements: (extractedResume.achievements?.length || 0) > 0,
    };

    const prompt = `
        You are an expert career validator. Based on the following resume data, generate BALANCED validation questions across 4 layers.

        Resume Data:
        ${JSON.stringify(extractedResume)}

        Available Resume Sections:
        - Skills: ${resumeSections.hasSkills ? "YES" : "NONE"}
        - Work Experience: ${resumeSections.hasExperience ? "YES" : "NONE"}
        - Projects: ${resumeSections.hasProjects ? "YES" : "NONE"}
        - Education: ${resumeSections.hasEducation ? "YES" : "NONE"}
        - Achievements: ${resumeSections.hasAchievements ? "YES" : "NONE"}

        CRITICAL DISTRIBUTION RULE:
        Across ALL 11 questions, you MUST spread them across the resume sections as follows:
        - Maximum 3 questions may reference ONLY projects
        - At least 3 questions must focus on SKILLS directly (independent of any project)
        - If WORK EXPERIENCE is available: at least 2 questions must reference specific jobs/companies/responsibilities
        - If NO WORK EXPERIENCE is listed: replace the experience-based questions with additional SKILL or PROJECT questions
        - Remaining questions can combine any available sections
        Do NOT make most questions about projects. The assessment must cover the FULL resume.

        LAYER 1 — Resume Skill Validation (exactly 3 questions):
        - Question 1: Target a top technical SKILL directly — ask about how they've used it across their career (not just one project).
          Example: "You list [Skill] on your resume. Can you describe the most complex problem you've solved using it?"
        - Question 2: Target their WORK EXPERIENCE — ask about a specific role, responsibility, or achievement at a company.
          Example: "At [Company Name], what was your primary responsibility, and what was the most significant outcome you delivered?"
        - Question 3: Target a SECOND SKILL from the resume — how they've applied or deepened that skill across their work or personal builds.
          Example: "You have [Skill] listed on your resume. Can you walk me through a real situation where you applied it independently?"

        LAYER 2 — Practical Ability Check (exactly 3 questions):
        - Question 1: A scenario based on their WORK EXPERIENCE — how they handled a real workplace situation.
          Example: "In your role at [Company], how did you handle [type of challenge like deadlines, team conflict, technical debt]?"
        - Question 2: A scenario based on their SKILLS — how they'd approach a technical problem.
          Example: "If you had to choose between [Skill A] and [Skill B] for a given scenario, how would you decide?"
        - Question 3: This one may reference a specific PROJECT if the resume has one — otherwise use experience.
          Example: "Walk me through a critical decision you made during [Project/Role] and what the outcome was."

        LAYER 3 — Cross-Skill Reasoning (exactly 3 questions):
        - Generate 3 questions that combine SKILLS + EXPERIENCE or SKILLS + PROJECTS together.
        - At most 1 of these 3 may be purely project-focused.
        - Each question must test how their skills WORK TOGETHER across their career, not just one project.
        - Example: "You have experience in [Skill A] and [Skill B]. In your work at [Company/Project], how did these two complement each other?"
        - Example: "How does your knowledge of [Skill] influence how you approach [broader responsibility from their experience]?"

        LAYER 4 — Role Suitability & Confidence Mapping (exactly 2 questions):
        - Question 1: Reflective — based on their OVERALL CAREER (skills + experience combined).
          Example: "Across all your work experience and projects, which skill or role responsibility do you feel most confident applying professionally?"
        - Question 2: Forward-looking — based on their BACKGROUND.
          Example: "Given your background in [field], what type of work environment or role do you see yourself thriving in next?"

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
        - Questions must be personalized based on the ACTUAL content of the resume
        - SPREAD questions across Skills, Work Experience, and Projects — do NOT focus only on projects
        - Reference specific skill names, job titles, company names, and technologies from the resume
        - Do NOT ask about education or academic background
        - Do NOT use generic placeholder questions
        - Keep all questions concise, professional, and conversational
        - Total: exactly 11 questions
        - If NO work experience: replace all experience questions with additional skill-depth or project questions
        - If NO projects: replace all project references with experience or skill-based questions
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
            You are an expert career analyst and psychologist for experienced professionals.
            
            An experienced professional has uploaded their resume, completed a validation assessment, AND played 3 psychological mini-games.
            Your job is to analyze their resume data, validation answers, AND psychological game scores to:
            1. Verify the authenticity of their resume claims
            2. Identify their true skill level
            3. Recommend FUTURE GROWTH career roles (not their current role — they already have one)
            4. Generate a comprehensive career analysis incorporating their cognitive and personality profile

            Resume Data:
            ${JSON.stringify(resumeData)}

            Validation Assessment Answers:
            ${JSON.stringify(validationAnswers)}

            A psychProfile from 3 psychological mini-games may be included in the answers (type: 'psych').
            If present, use its trait scores to enhance your analysis:
            - decisionGame traits (analytical, riskAppetite, ethical, leadership, calmness)
            - patternGame traits (abstraction, anomalyDetection, optimization)
            - personaGame bigFive traits (openness, conscientiousness, extraversion, agreeableness, neuroticism)

            Use the following industry list as a reference:
            ${JSON.stringify(industries.map(i => ({ name: i.name, sub: i.subIndustries })))}

            Return the result in the following JSON format ONLY (valid JSON, no markdown blocks):
            {
                "primaryProfile": "A 2-3 word catchphrase describing their professional profile (e.g., 'The Systems Architect', 'The Data Strategist')",
                "summary": "A brief 2-sentence summary analyzing their resume vs validation performance AND personality traits from game scores.",
                "personalityArchetype": "A powerful archetype title based on game scores (e.g., 'Systems Architect', 'Risk-Driven Innovator', 'Empathetic Builder')",
                "cognitiveStrength": "Their standout cognitive ability from game scores (e.g., 'Structured Abstraction', 'Anomaly Detection')",
                "riskProfile": "Low / Moderate / High — derived from decisionGame riskAppetite score",
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
                    { "role": "Future Growth Role 1", "description": "Brief description", "matchReason": "Why this role fits — reference verified skills AND personality/cognitive scores" },
                    { "role": "Future Growth Role 2", "description": "Brief description", "matchReason": "Why this role fits" },
                    { "role": "Future Growth Role 3", "description": "Brief description", "matchReason": "Why this role fits" }
                ],
                "recommendedCountries": [
                    { "country": "Country Name", "demandLevel": "High/Medium/Low", "reason": "Why" },
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
                    "Growth advice 1 based on validation performance and game scores", "Advice 2"
                ],
                "resumeAuthenticity": "Verified/Partially Verified/Needs Review",
                "currentStrengths": ["Strength 1 confirmed by validation", "Strength 2"],
                "areasOfConcern": ["Any skill that seemed overclaimed based on validation answers"]
            }

            IMPORTANT:
            - 'recommendedRoles' should be FUTURE GROWTH roles, not their current position
            - 'identifiedSkills': Skills VERIFIED through validation answers
            - 'recommendedSkills': Skills they need for future growth roles
            - 'personalityArchetype': Short, evocative title — not generic
            - 'cognitiveStrength': Pick the single strongest trait from game scores
            - 'riskProfile': Map riskAppetite: 0-40 = Low, 41-70 = Moderate, 71-100 = High
            - 'validationScore': Rate each area 0-100
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
