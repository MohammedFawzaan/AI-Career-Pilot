"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

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
        - Layer 1: ALL questions MUST be about SKILLS ONLY — to verify whether the skills listed are genuine
        - Layer 2: ALL questions MUST be about PROJECTS and WORK EXPERIENCE — to check practical ability
        - Layer 3: Questions MUST cross-verify whether the EXPERIENCE or PROJECTS mentioned are authentic
        - Layer 4: Reflective and forward-looking career questions
        Do NOT mix layers — each layer has a specific verification purpose.

        LAYER 1 — Resume Skill Validation (exactly 6 questions):
        PURPOSE: Verify whether the SKILLS listed on the resume are GENUINE. All 6 questions MUST be about specific skills.
        - Questions 1-2: Pick top skills from the resume and ask how they've used them — test depth of knowledge.
          Example: "You list [Skill] on your resume. Can you describe the most complex problem you've solved using it?"
        - Questions 3-4: Pick other skills and ask scenario questions — test whether they can apply it under real conditions.
          Example: "If you were given a task that required [Skill], what would be your step-by-step approach?"
        - Questions 5-6: Pick remaining skills and ask about challenges — test whether they've genuinely worked with them.
          Example: "What's the hardest challenge you've faced while working with [Skill], and how did you overcome it?"
        Do NOT ask about projects or experience in this layer — ONLY skills.

        LAYER 2 — Practical Ability Check (exactly 6 questions):
        PURPOSE: Verify practical ability through PROJECTS and WORK EXPERIENCE.
        DISTRIBUTION RULES:
        - If resume has BOTH Projects AND Work Experience: ask 3 questions about Projects + 3 about Work Experience
        - If resume has Projects but NO Work Experience: ask all 6 questions about Projects
        - If resume has Work Experience but NO Projects: ask all 6 questions about Work Experience
        - If resume has NEITHER Projects NOR Work Experience: ask 6 questions about Skills application and Certificates

        Project questions should verify the user built what they claim:
          Example: "In your [Project Name], what was the biggest technical challenge and how did you solve it?"
          Example: "Walk me through the architecture of [Project Name]. Why did you choose that approach?"
          Example: "What specific contributions did you make vs. your team members in [Project Name]?"
        Work Experience questions should verify workplace contributions:
          Example: "At [Company], what was a specific outcome you personally delivered?"
          Example: "Describe a real challenge you faced in your role at [Company] and how you handled it."
          Example: "What measurable impact did your work have at [Company]?"

        LAYER 3 — Cross-Skill Reasoning (exactly 4 questions):
        PURPOSE: Cross-verify whether the EXPERIENCE or PROJECTS mentioned are REAL — not copied or fabricated.
        - Questions 1-2: Combine a SKILL with a PROJECT or EXPERIENCE — ask how they used the skill IN that specific context.
          Example: "You used [Skill A] in [Project/Company]. Can you explain a specific decision you made using that skill in that context?"
        - Questions 3-4: Ask deeper follow-ups that only someone who ACTUALLY did the work would know.
          Example: "In [Project/Role], what would you do differently if you had to rebuild it from scratch, and why?"
          Example: "Describe a time when your approach in [Project/Role] failed or needed significant revision."
        These questions should feel like a natural conversation but are designed to catch fabrication.

        LAYER 4 — Role Suitability & Confidence Mapping (exactly 4 questions):
        PURPOSE: Verify career self-awareness, confidence alignment, and forward-looking career vision. Assess whether the user genuinely understands their strengths and where they want to grow.
        - Question 1: Reflective — based on their OVERALL CAREER (skills + experience + projects combined).
          Example: "Across all your work experience and projects, which skill or role responsibility do you feel most confident applying professionally?"
        - Question 2: Forward-looking — based on their BACKGROUND.
          Example: "Given your background in [field], what type of work environment or role do you see yourself thriving in next?"
        - Question 3: Self-awareness — test if they recognize their gaps.
          Example: "What's the one area in your career where you feel you still have the most room for growth?"
        - Question 4: Vision alignment — test career clarity.
          Example: "If you could design your ideal role two years from now, what would it look like?"

        Return the result in the following JSON format ONLY (valid JSON, no markdown blocks):
        {
            "layers": [
                {
                    "id": "skill-validation",
                    "name": "Resume Skill Validation",
                    "questions": ["Q1", "Q2", "Q3", "Q4", "Q5", "Q6"]
                },
                {
                    "id": "practical-check",
                    "name": "Practical Ability Check",
                    "questions": ["Q1", "Q2", "Q3", "Q4", "Q5", "Q6"]
                },
                {
                    "id": "cross-skill",
                    "name": "Cross-Skill Reasoning",
                    "questions": ["Q1", "Q2", "Q3", "Q4"]
                },
                {
                    "id": "role-suitability",
                    "name": "Role Suitability & Confidence",
                    "questions": ["Q1", "Q2", "Q3", "Q4"]
                }
            ]
        }

        IMPORTANT:
        - Questions must be personalized based on the ACTUAL content of the resume
        - Layer 1: ONLY about skills — verify genuineness, NOT projects or experience
        - Layer 2: ONLY about projects and work experience — verify practical ability
        - Layer 3: Cross-verify project/experience authenticity — catch fabrication
        - Reference specific skill names, project names, job titles, company names from the resume
        - Do NOT ask about education or academic background
        - Do NOT use generic placeholder questions
        - Keep all questions concise, professional, and conversational
        - Total: exactly 20 questions (6 + 6 + 4 + 4)
        - If NO work experience: replace experience questions with project or skill questions
        - If NO projects: replace project questions with experience or skill questions
    `;

    try {
        const result = await model.generateContent(prompt);
        let text = result.response.text();
        
        // Clean markdown and isolate JSON block
        text = text.replace(/```(json|JSON)?\n?/g, "").replace(/```/g, "").trim();
        const firstBrace = text.indexOf('{');
        const lastBrace = text.lastIndexOf('}');
        if (firstBrace !== -1 && lastBrace !== -1) {
            text = text.substring(firstBrace, lastBrace + 1);
        }

        const parsed = JSON.parse(text);

        if (!parsed || !parsed.layers || parsed.layers.length !== 4) {
            throw new Error("Invalid question generation response structure");
        }

        return parsed;
    } catch (error) {
        console.error("generateValidationQuestions error:", error.message);
        throw new Error("Failed to generate validation questions: " + error.message);
    }
}

export async function submitResumeValidation(resumeData, validationAnswers, targetRole = null, psychScores = null) {
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
            
            An experienced professional has uploaded their resume, completed a validation assessment, AND played 3 psychological assessment games.
            Your job is to analyze their resume data, validation answers, AND psychological game scores to:
            1. Verify the authenticity of their resume claims
            2. Identify their true skill level
            3. Recommend FUTURE GROWTH career roles (not their current role — they already have one)
            4. Generate a comprehensive career analysis incorporating their cognitive and personality profile

            Resume Data:
            ${JSON.stringify(resumeData)}

            Validation Assessment Answers:
            ${JSON.stringify(validationAnswers)}

            ${targetRole ? `The user's desired target role/domain: "${targetRole}"` : "The user has not specified a target role."}

            A psychProfile from 3 psychological assessment games may be included in the answers (type: 'psych').
            If present, use the provided scores to enhance your analysis and GENERATE detailed sub-scores:
            - Cognitive Intelligence Score: ${psychScores?.cognitiveScore ?? 'N/A'}/100
              Round Data: ${JSON.stringify(psychScores?.cognitiveRoundScores || [])}
            - Focus & Precision Score: ${psychScores?.focusScore ?? 'N/A'}/100
              Round Data: ${JSON.stringify(psychScores?.focusRoundScores || [])}
            - Curiosity & Learning Score: ${psychScores?.curiosityScore ?? 'N/A'}/100
              Round Data: ${JSON.stringify(psychScores?.curiosityRoundScores || [])}

            A roleTargeting section may also be present (type: 'roleTarget') with the user's desired role and personality-fit answers.

            Map their verified skills, validated experience, and cognitive profile to the most suitable roles — NOT limited to IT.
            Consider ANY career path that fits their profile (e.g., healthcare, finance, education, creative arts, engineering, business, etc.).

            Return the result in the following JSON format ONLY (valid JSON, no markdown blocks):
            {
                "primaryProfile": "A 2-3 word catchphrase describing their professional profile (e.g., 'The Systems Architect', 'The Data Strategist')",
                "summary": "A brief 2-sentence summary analyzing their resume vs validation performance AND psychological scores.",
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
                    "dominantTraits": ["Analytical Thinking", "Persistence"],
                    "summary": "Brief psychological analysis based on the detailed round performance"
                },
                "validationScore": {
                    "overall": 85,
                    "skillAuthenticity": 90,
                    "practicalAbility": 80,
                    "crossSkillReasoning": 85,
                    "confidenceAlignment": 80
                },
                "targetRoleCareerPath": {
                    "role": "Target Role Name (only if specified by user)",
                    "description": "Brief description of the role",
                    "matchReason": "Why they fit this target role based on verified skills...",
                    "matchScore": 85,
                    "feasibility": "High Fit/Moderate Fit/Low Fit",
                    "feasibilityReason": "Detailed 2-3 sentence explanation of WHY they are a fit or not for this target role.",
                    "careerLadder": [
                        { "level": 1, "title": "Junior/Entry Title", "timeframe": "0-2 years" },
                        { "level": 2, "title": "Mid-Level Title", "timeframe": "2-5 years" },
                        { "level": 3, "title": "Senior Title", "timeframe": "5-8 years" }
                    ],
                    "keyMilestones": ["Milestone 1 to achieve", "Milestone 2", "Milestone 3"]
                },
                "recommendedRoles": [
                    { "role": "Future Growth Role 1", "description": "Brief description", "matchReason": "Why this role fits — reference verified skills AND psychological scores", "matchScore": 92 },
                    { "role": "Future Growth Role 2", "description": "Brief description", "matchReason": "Why this role fits", "matchScore": 85 },
                    { "role": "Future Growth Role 3", "description": "Brief description", "matchReason": "Why this role fits", "matchScore": 75 }
                ],
                "recommendedCountries": [
                    { "country": "Country Name", "demandLevel": "High/Medium/Low", "reason": "Why" },
                    { "country": "Country Name", "demandLevel": "High/Medium/Low", "reason": "Why" },
                    { "country": "Country Name", "demandLevel": "High/Medium/Low", "reason": "Why" }
                ],
                "identifiedSkills": [
                    { "skill": "Verified Skill 1", "proficiency": "Strong/Moderate/Basic" },
                    { "skill": "Verified Skill 2", "proficiency": "Strong/Moderate/Basic" }
                ],
                "recommendedSkills": [
                    { "skill": "Growth Skill 1 (To learn)", "reason": "Why needed", "priority": "High/Medium/Low" },
                    { "skill": "Growth Skill 2 (To learn)", "reason": "Why needed", "priority": "High/Medium/Low" }
                ],
                "skillGap": [
                    { "skill": "Skill Name", "priority": "High" }
                ],
                "personalDevelopment": [
                    "Growth advice 1 based on validation performance and psychological scores", "Advice 2"
                ],
                "resumeAuthenticity": "Verified/Partially Verified/Needs Review",
                "currentStrengths": ["Strength 1 confirmed by validation", "Strength 2"],
                "areasOfConcern": ["Any skill that seemed overclaimed based on validation answers"]
            }

            IMPORTANT RULES:
            - 'targetRoleCareerPath': ONLY generate this object if the user has specified a target role. If they skipped it, completely omit this key.
            - If 'targetRoleCareerPath' is generated, the target role MUST NOT appear in 'recommendedRoles'. 'recommendedRoles' must be 3 DIFFERENT roles.
            - 'recommendedRoles' should be FUTURE GROWTH roles, not their current position
            - 'identifiedSkills': Skills VERIFIED through validation answers
            - 'recommendedSkills': Skills they need for future growth roles
            - 'psychologicalProfile': Generate the 9 detailed sub-scores (0-100) by analyzing their round-by-round performance in the games.
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
                targetRole: targetRole || null,
                analysis: analysis,
                updatedAt: new Date(),
            },
            create: {
                userId: user.id,
                questions: [{ resumeData, validationAnswers }],
                primaryRole: null,
                targetRole: targetRole || null,
                analysis: analysis,
            },
        });

        console.log("submitResumeValidation: Assessment saved successfully:", assessment.id);
        return assessment;
    } catch (error) {
        console.error("submitResumeValidation: Error:", error);
        throw new Error("Failed to submit resume validation: " + error.message);
    }
}
