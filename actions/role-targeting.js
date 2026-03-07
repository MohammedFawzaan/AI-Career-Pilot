"use server";

import { auth } from "@clerk/nextjs/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

/**
 * Generate 7 questions to evaluate whether the user is CAPABLE OF LEARNING
 * their targeted role/domain — using Section 1 assessment context to personalize.
 *
 * @param {string} targetRole - The user's desired target role or domain
 * @param {Array} section1Context - Summary of Section 1 answers for context
 * @returns {{ questions: string[] }}
 */
export async function generateRoleFitQuestions(targetRole, section1Context = []) {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    // Build a brief summary of Section 1 for context
    const section1Summary = section1Context.length > 0
        ? `
        Here is a brief summary of the user's background from their career assessment:
        ${section1Context.map(item => `- ${item.question}: ${item.answer}`).slice(0, 12).join("\n        ")}
        
        Use this background to understand the person's current knowledge, skills, and experience.
        This helps you ask smarter questions about their ABILITY TO LEARN the target role.
        `
        : "No prior assessment data is available.";

    const prompt = `
        You are an expert career transition coach and learning capability evaluator.

        A user wants to learn and transition into this target role/domain: "${targetRole}"

        ${section1Summary}

        Your goal is to generate exactly 7 questions that evaluate whether this person 
        is CAPABLE OF LEARNING this new target role — NOT whether their personality fits it.

        The questions should assess:
        1. Learning approach — How do they learn new, unfamiliar subjects? What methods work for them?
        2. Problem-solving transfer — Can they apply problem-solving from their current background to new domains?
        3. Foundational aptitude — Do they have any foundational thinking patterns (logical, creative, analytical) that would help them learn this target role?
        4. Self-study discipline — Can they commit to structured or unstructured self-learning over time?
        5. Curiosity & depth — When they encounter something new, do they go deep or stay surface-level?
        6. Failure resilience in learning — How do they handle being bad at something new? Do they persist or give up?
        7. Connection ability — Can they draw connections between what they already know and what they need to learn?

        CRITICAL RULES:
        - The purpose is to check if the person CAN LEARN the target role — NOT if their personality fits it
        - Do NOT ask about teamwork, leadership, stress handling, or motivation
        - Do NOT ask technical questions about the target role
        - KEEP QUESTIONS SHORT
        - Questions should feel conversational but direct, like a mentor evaluating a student's learning potential
        - If Section 1 data is available, reference the person's background subtly 
          (e.g., "Given your [their field] background, how would you approach learning [target concept]?")
        - Each question should help determine: "Can this person successfully learn and transition into this new domain?"

        Return ONLY valid JSON (no markdown, no extra text):
        {
            "questions": [
                "Question 1 about learning approach",
                "Question 2 about problem-solving transfer",
                "Question 3 about foundational aptitude",
                "Question 4 about self-study discipline",
                "Question 5 about curiosity and depth",
                "Question 6 about failure resilience in learning",
                "Question 7 about connection ability"
            ]
        }
    `;

    try {
        const result = await model.generateContent(prompt);
        const text = result.response.text().replace(/```json/g, "").replace(/```/g, "").trim();
        const parsed = JSON.parse(text);

        if (!parsed.questions || parsed.questions.length < 7) {
            throw new Error("Incomplete role-fit questions generated");
        }

        return parsed;
    } catch (error) {
        console.error("generateRoleFitQuestions error:", error);
        throw new Error("Failed to generate role-fit questions: " + error.message);
    }
}
