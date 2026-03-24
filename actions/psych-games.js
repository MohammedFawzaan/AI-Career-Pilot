"use server";

import { auth } from "@clerk/nextjs/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

/**
 * Generates content for all 3 psychological assessment games.
 * Each game uses a DIFFERENT evaluation technique:
 *   1. Cognitive: Weighted Single Selection (pick best action, scored 100/70/40/10)
 *   2. Focus: Correct Identification (find the ONE correct claim among 3 wrong ones)
 *   3. Curiosity: Priority Ranking (rank learning approaches, compared to expert order)
 *
 * Scoring is done IN-CODE, not by AI.
 */
export async function generatePsychGameContent(context) {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const { targetRole } = context;

    const roleContext = targetRole
        ? `The user is targeting the role/domain: "${targetRole}". 
           Tailor some scenarios to be relevant to someone pursuing this type of career, 
           BUT keep all scenarios GENERAL (non-technical). Focus on workplace behavior, 
           decision-making, and soft skills — NOT technical knowledge.`
        : `The user has no specific target role. 
           Generate GENERAL workplace and life scenarios that test universal psychological traits.
           Keep everything non-technical and broadly applicable.`;

    const prompt = `
        You are an expert psychologist designing assessment games.
        ${roleContext}

        Generate content for 3 psychological assessment games.
        ALL scenarios must be GENERAL — about everyday workplace/life situations, NOT technical.

        ────────────────────────────────────────────
        GAME 1: Cognitive Intelligence Assessment (5 rounds)
        TECHNIQUE: Weighted Single Selection
        ────────────────────────────────────────────
        Each round presents a realistic workplace/life scenario requiring good judgment.
        The user picks the BEST course of action from 4 options.
        Each option has an expert weight reflecting how good the decision is.

        Each round has:
        - "scenario": A realistic workplace or life situation (2-3 sentences)
        - "question": "What is the best course of action?"
        - "options": Array of exactly 4 options, each with:
          - "id" (a/b/c/d)
          - "text": The action description (1-2 sentences)
          - "weight": Expert weight — one of: 100 (best), 70 (good), 40 (mediocre), 10 (poor)
          - "explanation": Brief 1-sentence expert explanation of why this ranks where it does
        - Each round must have exactly one option with weight 100, one with 70, one with 40, one with 10
        - Options must be REAL decisions (not obvious/trick answers)

        ────────────────────────────────────────────
        GAME 2: Focus & Precision Assessment (5 rounds)
        TECHNIQUE: Correct Identification
        ────────────────────────────────────────────
        Each round presents a detailed scenario, process, report, or factual description.
        Then shows 4 claims about the scenario. Only ONE claim is CORRECT, the other 3 are WRONG.
        The user must identify the ONE correct claim.

        Each round has:
        - "scenario": A detailed workplace process, report, or factual description (3-5 sentences with specific details like numbers, dates, names, sequences)
        - "question": "Which of the following claims about the above is CORRECT?"
        - "claims": Array of exactly 4 claims, each with:
          - "id" (a/b/c/d)
          - "text": The claim text
          - "isCorrect": true for the ONE correct claim, false for the 3 wrong ones
        - Make exactly 1 claim correct (isCorrect: true) and 3 wrong (isCorrect: false)
        - Wrong claims should be SUBTLY wrong (changed numbers, swapped details, slight inaccuracies) — NOT obviously false

        ────────────────────────────────────────────
        GAME 3: Curiosity & Learning Mindset Assessment (5 rounds)
        TECHNIQUE: Priority Ranking of Learning Approaches
        ────────────────────────────────────────────
        Each round presents an unfamiliar situation where the user encounters something new.
        The user must RANK 4 learning approaches from "try first" (1st) to "try last" (4th).
        You provide the expert curiosity ranking (the ideal order for a curious learner).

        Ranking guide (most curious → least curious):
        - Hands-on exploration / experimentation → rank highest
        - Deep independent research / documentation → rank second
        - Asking mentors / seeking external guidance → rank third
        - Avoiding / sticking with what's familiar → rank lowest

        Each round has:
        - "scenario": An unfamiliar situation where the user encounters something new (2-3 sentences)
        - "question": "How would you prioritize these approaches?"
        - "approaches": Array of exactly 4 approaches, each with:
          - "id" (a/b/c/d)
          - "text": The learning approach description
        - "expertRanking": Array of approach IDs in ideal curiosity order [most curious → least curious]
          e.g. ["b", "d", "a", "c"] means approach B is most curious, C is least

        ────────────────────────────────────────────
        RETURN FORMAT — valid JSON only, no markdown blocks:
        ────────────────────────────────────────────
        {
            "cognitiveRounds": [
                {
                    "scenario": "A realistic situation",
                    "question": "What is the best course of action?",
                    "options": [
                        { "id": "a", "text": "Action A description", "weight": 100, "explanation": "This is the best because..." },
                        { "id": "b", "text": "Action B description", "weight": 70, "explanation": "Good but misses..." },
                        { "id": "c", "text": "Action C description", "weight": 40, "explanation": "Mediocre because..." },
                        { "id": "d", "text": "Action D description", "weight": 10, "explanation": "Poor because..." }
                    ]
                }
            ],
            "focusRounds": [
                {
                    "scenario": "A detailed process with specific facts, numbers, and sequences",
                    "question": "Which of the following claims about the above is CORRECT?",
                    "claims": [
                        { "id": "a", "text": "Claim A (wrong - subtle error)", "isCorrect": false },
                        { "id": "b", "text": "Claim B (correct)", "isCorrect": true },
                        { "id": "c", "text": "Claim C (wrong - subtle error)", "isCorrect": false },
                        { "id": "d", "text": "Claim D (wrong - subtle error)", "isCorrect": false }
                    ]
                }
            ],
            "curiosityRounds": [
                {
                    "scenario": "An unfamiliar situation",
                    "question": "How would you prioritize these approaches?",
                    "approaches": [
                        { "id": "a", "text": "Approach A" },
                        { "id": "b", "text": "Approach B" },
                        { "id": "c", "text": "Approach C" },
                        { "id": "d", "text": "Approach D" }
                    ],
                    "expertRanking": ["b", "d", "a", "c"]
                }
            ]
        }

        IMPORTANT:
        - cognitiveRounds: exactly 5 (each with weights 100, 70, 40, 10)
        - focusRounds: exactly 5 (each with exactly 1 correct and 3 wrong claims, wrong ones must be SUBTLY wrong)
        - curiosityRounds: exactly 5
        - ALL scenarios must be GENERAL — everyday workplace/life, NOT technical
        - Return ONLY valid JSON, no markdown, no extra text
    `;

    try {
        const result = await model.generateContent(prompt);
        let text = result.response.text();

        text = text.replace(/```(json|JSON)?\n?/g, "").replace(/```/g, "").trim();
        const firstBrace = text.indexOf('{');
        const lastBrace = text.lastIndexOf('}');
        if (firstBrace !== -1 && lastBrace !== -1) {
            text = text.substring(firstBrace, lastBrace + 1);
        }
        
        const parsed = JSON.parse(text);

        if (
            !parsed.cognitiveRounds || parsed.cognitiveRounds.length < 5 ||
            !parsed.focusRounds || parsed.focusRounds.length < 5 ||
            !parsed.curiosityRounds || parsed.curiosityRounds.length < 5
        ) {
            throw new Error("Incomplete game content generated");
        }

        return parsed;
    } catch (error) {
        console.error("generatePsychGameContent error:", error.message);
        throw new Error("Failed to generate game content: " + error.message);
    }
}
