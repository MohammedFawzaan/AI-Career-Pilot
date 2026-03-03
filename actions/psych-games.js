"use server";

import { auth } from "@clerk/nextjs/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

/**
 * Generates personalized content for all 3 psychological mini-games
 * based on the user's career assessment history or resume data.
 *
 * @param {Object} userContext - { type: "STUDENT"|"EXPERIENCED", summary: string }
 * @returns {Object} - { decisionScenarios, patternRounds, personaScenes }
 */
export async function generatePsychGameContent(userContext) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

  const { type, summary } = userContext;

  const prompt = `
        You are an expert career psychologist and game designer.
        A user has just completed a career ${type === "STUDENT" ? "assessment interview" : "resume validation assessment"}.

        Here is a summary of the user's background, interests, and career direction:
        ${summary}

        Generate personalized psychological game content for 3 mini-games tailored to this specific user.
        The content must feel highly relevant to their field, goals, and background.

        ────────────────────────────────────────────
        GAME 1: Decision Under Pressure (3 scenarios)
        ────────────────────────────────────────────
        Generate 3 crisis/pressure scenarios that a person in THIS USER's target field would realistically face.
        Each scenario has 5 options. Each option maps to traits.
        Trait keys: analytical, riskAppetite, ethical, leadership, calmness
        Values range from -30 to +30.

        ────────────────────────────────────────────
        GAME 2: Pattern Hunter (6 rounds — 1 of each type)
        ────────────────────────────────────────────
        Generate exactly 1 round of each of the following 6 types, in this order:
        "sequence", "flowchart", "anomaly", "priority", "mismatch", "tradeoff".
        Use terminology and context relevant to the user's field AND their career background.
        The last 3 types MUST be based on the user's career goals, experience, or assessment answers — NOT generic tech puzzles.

        For "sequence" rounds:
        - A number/logic sequence with a clear rule
        - 4 multiple-choice answers, only one correct
        - Short explanation of the rule
        - trait: "abstraction"

        For "flowchart" rounds:
        - A short workflow with 4-6 steps relevant to their field
        - One step is logically in the wrong position (has "isBug": true)
        - trait: "anomalyDetection"

        For "anomaly" rounds:
        - A small table (4 rows, 3-4 columns) with realistic data
        - One row is a clear outlier
        - trait: "optimization"

        For "priority" rounds (career-based — NEW):
        - Present 4-5 career decisions/actions relevant to THIS USER's stated goals
        - User must identify which action should be the HIGHEST priority
        - 4 multiple-choice answers, only one is the best priority
        - Short explanation of why that priority matters most for their career
        - trait: "prioritization"
        - Example context: "You just graduated with a CS degree and want to become a data scientist. Which should you prioritize FIRST?"
        - Options: ["Build a portfolio", "Get AWS certified", "Learn SQL deeply", "Apply to 100 jobs"]

        For "mismatch" rounds (career-based — NEW):
        - Present a short career profile (3-4 bullet points) based on the user's background
        - One bullet point is a career MISMATCH — something that doesn't logically fit their path
        - 4 statements, user picks the one that doesn't belong
        - Short explanation of why it's a mismatch
        - trait: "careerAwareness"
        - Example: For a UX designer: ["Proficient in Figma", "Led user research studies", "Expert in kernel programming", "Designed mobile interfaces"] — answer: "Expert in kernel programming"

        For "tradeoff" rounds (career-based — NEW):
        - Present a realistic career dilemma with 2 competing paths relevant to the user
        - 4 multiple-choice answers representing different approaches to the dilemma
        - There IS a best answer based on the user's stated career direction
        - Short explanation of the tradeoff reasoning
        - trait: "decisionClarity"
        - Example: "You have a stable job but received a startup offer. You want to be a tech lead someday. Best approach?"
        - Options: ["Take the startup for faster growth", "Stay for the stability", "Negotiate remote at startup", "Ask for a lead role at current company"]

        ────────────────────────────────────────────
        GAME 3: Hidden Persona (3 scenes)
        ────────────────────────────────────────────
        Generate 3 short workplace chat scenarios authentic to the user's target environment.
        Each scene has 4 response options mapping to Big Five traits.
        Trait keys: O (Openness), C (Conscientiousness), E (Extraversion), A (Agreeableness), N (Neuroticism)
        Values range from -20 to +25.

        ────────────────────────────────────────────
        RETURN FORMAT — valid JSON only, no markdown blocks:
        ────────────────────────────────────────────
        {
          "decisionScenarios": [
            {
              "context": "Scenario description",
              "instruction": "You have 5 options. Pick the 2 you do FIRST.",
              "options": [
                { "id": "a", "text": "Option text", "traits": { "analytical": 20, "riskAppetite": -10, "ethical": 0, "leadership": 10, "calmness": 5 } },
                { "id": "b", "text": "Option text", "traits": { "analytical": 0, "riskAppetite": 25, "ethical": -15, "leadership": 0, "calmness": -5 } },
                { "id": "c", "text": "Option text", "traits": { "analytical": 5, "riskAppetite": 0, "ethical": 25, "leadership": 10, "calmness": 15 } },
                { "id": "d", "text": "Option text", "traits": { "analytical": 15, "riskAppetite": -5, "ethical": 10, "leadership": -10, "calmness": 20 } },
                { "id": "e", "text": "Option text", "traits": { "analytical": 10, "riskAppetite": 10, "ethical": 5, "leadership": 25, "calmness": 10 } }
              ]
            }
          ],
          "patternRounds": [
            {
              "type": "sequence",
              "question": "What comes next in the sequence?",
              "sequence": "1 → 4 → 9 → 16 → 25 → ?",
              "options": ["30", "36", "32", "49"],
              "answer": "36",
              "explanation": "Perfect squares: 1², 2², 3²... so 6² = 36",
              "trait": "abstraction"
            },
            {
              "type": "flowchart",
              "question": "This workflow has ONE logical error. Which step is wrong?",
              "steps": [
                { "id": "A", "text": "Step 1", "isBug": false },
                { "id": "B", "text": "Step 2 (incorrect order)", "isBug": true },
                { "id": "C", "text": "Step 3", "isBug": false },
                { "id": "D", "text": "Step 4", "isBug": false }
              ],
              "bugStep": "B",
              "explanation": "Why B is the bug",
              "trait": "anomalyDetection"
            },
            {
              "type": "anomaly",
              "question": "One row in this data doesn't belong. Which one?",
              "headers": ["Column 1", "Column 2", "Column 3"],
              "rows": [
                { "id": "A", "data": ["val1", "val2", "val3"] },
                { "id": "B", "data": ["val1", "val2", "val3"] },
                { "id": "C", "data": ["OUTLIER", "val2", "val3"] },
                { "id": "D", "data": ["val1", "val2", "val3"] }
              ],
              "bugRow": "C",
              "explanation": "Why C is the anomaly",
              "trait": "optimization"
            },
            {
              "type": "priority",
              "question": "Based on your career goals, which action should you prioritize FIRST?",
              "options": ["Action A", "Action B", "Action C", "Action D"],
              "answer": "Action B",
              "explanation": "Why Action B is the highest priority for this career path",
              "trait": "prioritization"
            },
            {
              "type": "mismatch",
              "question": "One of these career profile items does NOT fit. Which one?",
              "options": ["Statement A", "Statement B", "Statement C (mismatch)", "Statement D"],
              "answer": "Statement C (mismatch)",
              "explanation": "Why Statement C is the career mismatch",
              "trait": "careerAwareness"
            },
            {
              "type": "tradeoff",
              "question": "Career dilemma description. What's the best approach?",
              "options": ["Approach A", "Approach B", "Approach C", "Approach D"],
              "answer": "Approach C",
              "explanation": "Why this approach best aligns with the career direction",
              "trait": "decisionClarity"
            }
          ],
          "personaScenes": [
            {
              "setup": "Workplace scenario description",
              "responses": [
                { "text": "Response option 1", "traits": { "O": 15, "C": 10, "E": 5, "A": -5, "N": 0 } },
                { "text": "Response option 2", "traits": { "O": 5, "C": 20, "E": -10, "A": 15, "N": -5 } },
                { "text": "Response option 3", "traits": { "O": 20, "C": 5, "E": 15, "A": 10, "N": -10 } },
                { "text": "Response option 4", "traits": { "O": -5, "C": 5, "E": -15, "A": 20, "N": 10 } }
              ]
            }
          ]
        }

        IMPORTANT:
        - decisionScenarios: exactly 3
        - patternRounds: exactly 6 (1 sequence + 1 flowchart + 1 anomaly + 1 priority + 1 mismatch + 1 tradeoff)
        - personaScenes: exactly 3
        - The priority, mismatch, and tradeoff rounds MUST directly reference the user's career background, NOT generic tech questions
        - All content must feel personalized to the user's career direction
        - Return ONLY valid JSON, no markdown, no extra text
    `;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text().replace(/\`\`\`json/g, "").replace(/\`\`\`/g, "").trim();
    const parsed = JSON.parse(text);

    if (
      !parsed.decisionScenarios || parsed.decisionScenarios.length < 3 ||
      !parsed.patternRounds || parsed.patternRounds.length < 6 ||
      !parsed.personaScenes || parsed.personaScenes.length < 3
    ) {
      throw new Error("Incomplete game content generated");
    }

    return parsed;
  } catch (error) {
    console.error("generatePsychGameContent error:", error);
    throw new Error("Failed to generate game content: " + error.message);
  }
}
