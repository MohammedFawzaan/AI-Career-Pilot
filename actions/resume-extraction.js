"use server";

import { auth } from "@clerk/nextjs/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function extractResumeData(resumeText) {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const prompt = `
        You are an expert resume parser. Extract structured information from the following resume text.
        
        Resume Text:
        """
        ${resumeText}
        """

        Extract and return the following in JSON format ONLY (valid JSON, no markdown blocks):
        {
            "name": "Full name of the candidate",
            "email": "Email if found, or null",
            "phone": "Phone if found, or null",
            "summary": "A brief 2-3 sentence professional summary based on the resume content",
            "skills": ["Skill 1", "Skill 2", "Skill 3", ...],
            "experience": [
                {
                    "title": "Job Title",
                    "company": "Company Name",
                    "duration": "e.g., 2 years",
                    "description": "Brief description of role"
                }
            ],
            "education": [
                {
                    "degree": "Degree Name",
                    "institution": "Institution Name",
                    "year": "Year of completion or expected"
                }
            ],
            "projects": [
                {
                    "name": "Project Name",
                    "description": "Brief description of the project and what it does",
                    "technologies": ["Tech 1", "Tech 2", ...]
                }
            ],
            "certifications": ["Certification 1", "Certification 2"],
            "totalYearsOfExperience": 5,
            "primaryDomain": "The main field/domain the candidate works in (e.g., 'Full Stack Development', 'Data Science', 'Cloud Engineering')"
        }

        IMPORTANT:
        - Extract ALL skills mentioned (technical and soft skills)
        - Extract ALL projects mentioned — include personal, academic, and professional projects
        - If a field is not found in the resume, use null or empty array
        - totalYearsOfExperience should be a number (estimate from work history if not stated)
        - Be thorough in skill extraction — include tools, frameworks, languages, and methodologies
    `;

    try {
        const result = await model.generateContent(prompt);
        const text = result.response.text().replace(/```json/g, "").replace(/```/g, "").trim();
        const extracted = JSON.parse(text);

        if (!extracted || !extracted.skills) {
            throw new Error("Failed to extract resume data");
        }

        return extracted;
    } catch (error) {
        console.error("Error extracting resume data:", error);
        throw new Error("Failed to extract resume data: " + error.message);
    }
}
