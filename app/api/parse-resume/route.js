import { NextResponse } from "next/server";

export const runtime = "nodejs";

export const maxDuration = 30;

export async function POST(request) {
    try {
        const formData = await request.formData();
        const file = formData.get("file");

        if (!file) {
            return NextResponse.json(
                { error: "No file provided" },
                { status: 400 }
            );
        }

        const fileName = file.name.toLowerCase();
        const buffer = Buffer.from(await file.arrayBuffer());

        let extractedText = "";

        if (fileName.endsWith(".pdf")) {
            const pdfParse = require("pdf-parse");
            const data = await pdfParse(buffer);
            extractedText = data.text;
        } else if (fileName.endsWith(".docx")) {
            const mammoth = require("mammoth");
            const result = await mammoth.extractRawText({ buffer });
            extractedText = result.value;
        } else {
            return NextResponse.json(
                { error: "Unsupported file format. Please upload a PDF or DOCX file." },
                { status: 400 }
            );
        }

        if (!extractedText || extractedText.trim().length < 50) {
            return NextResponse.json(
                { error: "Could not extract sufficient text from the file. Please ensure the file contains readable text." },
                { status: 400 }
            );
        }

        return NextResponse.json({ text: extractedText.trim() });
    } catch (error) {
        console.error("Resume parsing error:", error);
        return NextResponse.json(
            { error: "Failed to parse resume file. Please try again." },
            { status: 500 }
        );
    }
}
