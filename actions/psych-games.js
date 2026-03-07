"use server";

import { auth } from "@clerk/nextjs/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

/**
 * Generates content for all 3 psychological assessment games.
 * Each game uses a DIFFERENT evaluation technique:
 *   1. Cognitive: Decision Ranking (user ranks actions, compared to expert ranking)
 *   2. Focus: Error Detection (user identifies errors in statements)
 *   3. Curiosity: Priority Selection (each option has a weight, score = weight/max)
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
        TECHNIQUE: Decision Ranking
        ────────────────────────────────────────────
        Each round presents a scenario with exactly 4 possible actions.
        The user will RANK these actions from Best (1st) to Worst (4th).
        You must provide the EXPERT RANKING (the correct order).

        Each round has:
        - "scenario": A realistic workplace or life situation (2-3 sentences)
        - "question": What needs to be decided
        - "actions": Array of exactly 4 actions, each with "id" (a/b/c/d) and "text"
        - "expertRanking": Array of action IDs in correct order [best → worst]
          e.g. ["c", "a", "d", "b"] means action C is best, B is worst

        ────────────────────────────────────────────
        GAME 2: Focus & Precision Assessment (5 rounds)
        TECHNIQUE: Error Detection
        ────────────────────────────────────────────
        Each round presents a statement, process, or workflow description that contains ERRORS.
        The user must identify which items are INCORRECT.

        Each round has:
        - "scenario": A description of a workplace process, report, or statement (3-5 sentences)
        - "question": "Which of the following claims about the above are INCORRECT?"
        - "claims": Array of exactly 4 claims about the scenario, each with:
          - "id" (a/b/c/d)
          - "text": The claim text
          - "isError": true if this claim is INCORRECT, false if correct
        - Make exactly 2 claims incorrect (isError: true) and 2 correct (isError: false) per round

        ────────────────────────────────────────────
        GAME 3: Curiosity & Learning Mindset Assessment (5 rounds)
        TECHNIQUE: Priority Selection (Weighted Options)
        ────────────────────────────────────────────
        Each round presents an unfamiliar situation and asks how the person would respond.
        Each option has a predefined curiosity WEIGHT (0-10).

        Weight guide:
        - Exploration / Experimentation → 10
        - Reading documentation / Deep research → 9
        - Asking a mentor / Seeking guidance → 7
        - Surface-level attempt → 4
        - Ignoring / Avoiding the issue → 0

        Each round has:
        - "scenario": Something new or unfamiliar (2-3 sentences)
        - "question": "How would you respond?"
        - "options": Array of exactly 4 options, each with:
          - "id" (a/b/c/d)
          - "text": The option text
          - "weight": Integer 0-10 (curiosity weight)

        ────────────────────────────────────────────
        RETURN FORMAT — valid JSON only, no markdown blocks:
        ────────────────────────────────────────────
        {
            "cognitiveRounds": [
                {
                    "scenario": "A realistic situation",
                    "question": "What is the best course of action?",
                    "actions": [
                        { "id": "a", "text": "Action A" },
                        { "id": "b", "text": "Action B" },
                        { "id": "c", "text": "Action C" },
                        { "id": "d", "text": "Action D" }
                    ],
                    "expertRanking": ["c", "a", "d", "b"]
                }
            ],
            "focusRounds": [
                {
                    "scenario": "A detailed process description with some errors",
                    "question": "Which claims about the above are INCORRECT?",
                    "claims": [
                        { "id": "a", "text": "Claim A", "isError": true },
                        { "id": "b", "text": "Claim B", "isError": false },
                        { "id": "c", "text": "Claim C", "isError": true },
                        { "id": "d", "text": "Claim D", "isError": false }
                    ]
                }
            ],
            "curiosityRounds": [
                {
                    "scenario": "An unfamiliar situation",
                    "question": "How would you respond?",
                    "options": [
                        { "id": "a", "text": "Dive in and explore", "weight": 10 },
                        { "id": "b", "text": "Research first", "weight": 9 },
                        { "id": "c", "text": "Ask someone", "weight": 7 },
                        { "id": "d", "text": "Ignore it", "weight": 0 }
                    ]
                }
            ]
        }

        IMPORTANT:
        - cognitiveRounds: exactly 5
        - focusRounds: exactly 5 (each with exactly 2 errors and 2 correct claims)
        - curiosityRounds: exactly 5
        - ALL scenarios must be GENERAL — everyday workplace/life, NOT technical
        - Return ONLY valid JSON, no markdown, no extra text
    `;

    try {
        const result = await model.generateContent(prompt);
        const text = result.response.text().replace(/\`\`\`json/g, "").replace(/\`\`\`/g, "").trim();
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
        console.error("generatePsychGameContent error:", error);
        throw new Error("Failed to generate game content: " + error.message);
    }
}
