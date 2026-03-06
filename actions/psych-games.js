"use server";

import { auth } from "@clerk/nextjs/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

/**
 * Generates personalized content for all 3 psychological assessment games.
 * Uses targetRole from Section 2 if available, otherwise generates general scenarios.
 *
 * @param {Object} context - { targetRole: string|null }
 * @returns {Object} - { cognitiveRounds, focusRounds, curiosityRounds }
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
        ────────────────────────────────────────────
        Test: Analytical Thinking, Logical Reasoning, Problem Solving, Decision Making
        
        Generate 5 scenario-based rounds. Each round presents a realistic workplace or life situation 
        that requires clear thinking and good judgment.
        
        Each round has:
        - A scenario (2-3 sentences describing a situation)
        - A question asking what the person would do or conclude
        - 4 answer options, each mapping to different trait scores
        - One "best" answer (the most analytically/logically sound choice)
        
        Trait keys: analyticalThinking, logicalReasoning, problemSolving, decisionMaking
        Values: -10 to +20 per trait per option

        ────────────────────────────────────────────
        GAME 2: Focus & Precision Assessment (5 rounds)
        ────────────────────────────────────────────
        Test: Attention to Detail, Accuracy, Persistence, Task Discipline
        
        Generate 5 scenario-based rounds. Each presents a situation where attention to detail,
        accuracy, or careful observation matters.
        
        Mix of round types:
        - "spot_detail": A short paragraph with a subtle inconsistency — user must identify it from 4 options
        - "sequence": A pattern or sequence where user picks what comes next from 4 options
        - "precision": A scenario requiring careful reading — user answers a detail question from 4 options
        
        Generate: 2 "spot_detail" + 2 "precision" + 1 "sequence"
        
        Each round has 4 options with trait scores.
        Trait keys: attentionToDetail, accuracy, persistence, taskDiscipline
        Values: -10 to +20 per trait per option

        ────────────────────────────────────────────
        GAME 3: Curiosity & Learning Mindset Assessment (5 rounds)
        ────────────────────────────────────────────
        Test: Curiosity, Learning Initiative, Adaptability, Exploration
        
        Generate 5 scenario-based rounds. Each presents an unfamiliar or new situation 
        and asks how the person would respond.
        
        Each round has:
        - A scenario describing something new/unfamiliar
        - 4 response options showing different levels of curiosity and openness
        
        Trait keys: curiosity, learningInitiative, adaptability, exploration
        Values: -10 to +20 per trait per option

        ────────────────────────────────────────────
        RETURN FORMAT — valid JSON only, no markdown blocks:
        ────────────────────────────────────────────
        {
            "cognitiveRounds": [
                {
                    "scenario": "A realistic situation description",
                    "question": "What would you do?",
                    "options": [
                        { "id": "a", "text": "Option text", "traits": { "analyticalThinking": 15, "logicalReasoning": 10, "problemSolving": 20, "decisionMaking": 15 } },
                        { "id": "b", "text": "Option text", "traits": { "analyticalThinking": 5, "logicalReasoning": -5, "problemSolving": 10, "decisionMaking": 0 } },
                        { "id": "c", "text": "Option text", "traits": { "analyticalThinking": -5, "logicalReasoning": 5, "problemSolving": -10, "decisionMaking": 10 } },
                        { "id": "d", "text": "Option text", "traits": { "analyticalThinking": 0, "logicalReasoning": 0, "problemSolving": 5, "decisionMaking": -5 } }
                    ],
                    "bestAnswer": "a"
                }
            ],
            "focusRounds": [
                {
                    "type": "spot_detail",
                    "scenario": "A short paragraph with a subtle inconsistency",
                    "question": "What seems off or inconsistent?",
                    "options": [
                        { "id": "a", "text": "Option", "traits": { "attentionToDetail": 20, "accuracy": 15, "persistence": 10, "taskDiscipline": 10 } },
                        { "id": "b", "text": "Option", "traits": { "attentionToDetail": 5, "accuracy": 5, "persistence": 0, "taskDiscipline": 0 } },
                        { "id": "c", "text": "Option", "traits": { "attentionToDetail": -5, "accuracy": -5, "persistence": 5, "taskDiscipline": 5 } },
                        { "id": "d", "text": "Option", "traits": { "attentionToDetail": 0, "accuracy": 0, "persistence": -5, "taskDiscipline": -5 } }
                    ],
                    "correctAnswer": "a"
                },
                {
                    "type": "sequence",
                    "scenario": "Observe this pattern:",
                    "sequence": "2 → 6 → 18 → 54 → ?",
                    "question": "What comes next?",
                    "options": [
                        { "id": "a", "text": "162", "traits": { "attentionToDetail": 20, "accuracy": 20, "persistence": 15, "taskDiscipline": 10 } },
                        { "id": "b", "text": "108", "traits": { "attentionToDetail": 0, "accuracy": -5, "persistence": 5, "taskDiscipline": 0 } },
                        { "id": "c", "text": "72", "traits": { "attentionToDetail": -5, "accuracy": -10, "persistence": 0, "taskDiscipline": 0 } },
                        { "id": "d", "text": "216", "traits": { "attentionToDetail": 5, "accuracy": 0, "persistence": 5, "taskDiscipline": 5 } }
                    ],
                    "correctAnswer": "a",
                    "explanation": "Each number is multiplied by 3"
                },
                {
                    "type": "precision",
                    "scenario": "A passage of text with specific details to remember",
                    "question": "Based on what you just read, which detail is correct?",
                    "options": [
                        { "id": "a", "text": "Option", "traits": { "attentionToDetail": 20, "accuracy": 15, "persistence": 10, "taskDiscipline": 10 } },
                        { "id": "b", "text": "Option", "traits": { "attentionToDetail": 5, "accuracy": 5, "persistence": 0, "taskDiscipline": 0 } },
                        { "id": "c", "text": "Option", "traits": { "attentionToDetail": -5, "accuracy": -10, "persistence": 0, "taskDiscipline": -5 } },
                        { "id": "d", "text": "Option", "traits": { "attentionToDetail": 0, "accuracy": 0, "persistence": -5, "taskDiscipline": 0 } }
                    ],
                    "correctAnswer": "a"
                }
            ],
            "curiosityRounds": [
                {
                    "scenario": "You encounter something completely new and unfamiliar",
                    "question": "How would you respond?",
                    "options": [
                        { "id": "a", "text": "Dive in and explore", "traits": { "curiosity": 20, "learningInitiative": 15, "adaptability": 15, "exploration": 20 } },
                        { "id": "b", "text": "Research first, then try", "traits": { "curiosity": 15, "learningInitiative": 20, "adaptability": 10, "exploration": 10 } },
                        { "id": "c", "text": "Ask someone for guidance", "traits": { "curiosity": 10, "learningInitiative": 5, "adaptability": 15, "exploration": 5 } },
                        { "id": "d", "text": "Stick with what I know", "traits": { "curiosity": -5, "learningInitiative": -10, "adaptability": -5, "exploration": -10 } }
                    ]
                }
            ]
        }

        IMPORTANT:
        - cognitiveRounds: exactly 5
        - focusRounds: exactly 5 (2 spot_detail + 2 precision + 1 sequence)
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
