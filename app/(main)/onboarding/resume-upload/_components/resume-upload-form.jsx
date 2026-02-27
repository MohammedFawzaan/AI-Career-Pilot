"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { extractResumeData } from "@/actions/resume-extraction";
import {
    Upload,
    FileText,
    Loader2,
    CheckCircle2,
    XCircle,
    ArrowRight,
    Briefcase,
    GraduationCap,
    Award,
    RefreshCw,
    FolderKanban,
} from "lucide-react";

export default function ResumeUploadForm() {
    const router = useRouter();
    const fileInputRef = useRef(null);
    const [file, setFile] = useState(null);
    const [dragActive, setDragActive] = useState(false);
    const [parsing, setParsing] = useState(false);
    const [extracting, setExtracting] = useState(false);
    const [extractedData, setExtractedData] = useState(null);
    const [step, setStep] = useState("upload"); // "upload" | "preview"

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFile(e.dataTransfer.files[0]);
        }
    };

    const handleFileInput = (e) => {
        if (e.target.files && e.target.files[0]) {
            handleFile(e.target.files[0]);
        }
    };

    const handleFile = (selectedFile) => {
        const name = selectedFile.name.toLowerCase();
        if (!name.endsWith(".pdf") && !name.endsWith(".docx")) {
            toast.error("Please upload a PDF or DOCX file.");
            return;
        }
        if (selectedFile.size > 5 * 1024 * 1024) {
            toast.error("File size must be less than 5MB.");
            return;
        }
        setFile(selectedFile);
        setExtractedData(null);
    };

    const handleExtract = async () => {
        if (!file) {
            toast.error("Please select a file first.");
            return;
        }

        setParsing(true);
        try {
            // Step 1: Parse file to text via API route
            const formData = new FormData();
            formData.append("file", file);

            const parseResponse = await fetch("/api/parse-resume", {
                method: "POST",
                body: formData,
            });

            const parseResult = await parseResponse.json();

            if (!parseResponse.ok) {
                throw new Error(parseResult.error || "Failed to parse resume");
            }

            setParsing(false);
            setExtracting(true);

            // Step 2: Extract structured data via AI
            const extracted = await extractResumeData(parseResult.text);
            setExtractedData(extracted);
            setStep("preview");
            toast.success("Resume analyzed successfully!");
        } catch (error) {
            console.error("Extraction error:", error);
            toast.error(error.message || "Failed to process resume. Please try again.");
        } finally {
            setParsing(false);
            setExtracting(false);
        }
    };

    const handleConfirmAndContinue = () => {
        // Store extracted data in sessionStorage for the validation page
        sessionStorage.setItem("extractedResume", JSON.stringify(extractedData));
        router.push("/onboarding/resume-validation");
    };

    const handleReset = () => {
        setFile(null);
        setExtractedData(null);
        setStep("upload");
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    // Upload Step
    if (step === "upload") {
        return (
            <Card className="w-full max-w-2xl mx-auto shadow-lg">
                <CardHeader>
                    <CardTitle className="text-2xl gradient-title">
                        Upload Your Resume
                    </CardTitle>
                    <CardDescription>
                        We'll extract your professional profile using AI to provide personalized career insights.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Drop Zone */}
                    <div
                        className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-all cursor-pointer
                            ${dragActive
                                ? "border-primary bg-primary/5 scale-[1.01]"
                                : file
                                    ? "border-green-500 bg-green-50/50 dark:bg-green-950/20"
                                    : "border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/30"
                            }`}
                        onDragEnter={handleDrag}
                        onDragLeave={handleDrag}
                        onDragOver={handleDrag}
                        onDrop={handleDrop}
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept=".pdf,.docx"
                            onChange={handleFileInput}
                            className="hidden"
                        />
                        {file ? (
                            <div className="space-y-3">
                                <div className="flex items-center justify-center gap-2 text-green-600 dark:text-green-400">
                                    <FileText className="h-8 w-8" />
                                    <CheckCircle2 className="h-5 w-5" />
                                </div>
                                <p className="font-medium text-lg">{file.name}</p>
                                <p className="text-sm text-muted-foreground">
                                    {(file.size / 1024).toFixed(1)} KB • Click or drop to replace
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                <Upload className="h-10 w-10 mx-auto text-muted-foreground" />
                                <div>
                                    <p className="font-medium text-lg">
                                        Drop your resume here or click to browse
                                    </p>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        Supports PDF and DOCX • Max 5MB
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Extract Button */}
                    <Button
                        onClick={handleExtract}
                        className="w-full"
                        size="lg"
                        disabled={!file || parsing || extracting}
                    >
                        {parsing ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Parsing document...
                            </>
                        ) : extracting ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Extracting with AI...
                            </>
                        ) : (
                            <>
                                <FileText className="mr-2 h-4 w-4" />
                                Extract & Analyze Resume
                            </>
                        )}
                    </Button>
                </CardContent>
                <CardFooter className="justify-center border-t py-3 bg-muted/10">
                    <p className="text-xs text-center text-muted-foreground">
                        Your resume data is processed securely and used only to generate career insights.
                    </p>
                </CardFooter>
            </Card>
        );
    }

    // Preview Step
    return (
        <Card className="w-full max-w-2xl mx-auto shadow-lg">
            <CardHeader>
                <CardTitle className="text-2xl gradient-title">
                    Extracted Profile Preview
                </CardTitle>
                <CardDescription>
                    Review the extracted information before proceeding to the validation assessment.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                {extractedData && (
                    <div className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {/* Name & Summary */}
                        <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
                            <h3 className="font-semibold text-lg mb-1">
                                {extractedData.name || "Unknown"}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                                {extractedData.summary}
                            </p>
                            {extractedData.primaryDomain && (
                                <Badge variant="outline" className="mt-2">
                                    {extractedData.primaryDomain}
                                </Badge>
                            )}
                        </div>

                        {/* Skills */}
                        {extractedData.skills?.length > 0 && (
                            <div>
                                <h4 className="font-medium mb-2 flex items-center gap-2 text-sm">
                                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                                    Skills Identified ({extractedData.skills.length})
                                </h4>
                                <div className="flex flex-wrap gap-2">
                                    {extractedData.skills.map((skill, i) => (
                                        <Badge key={i} variant="secondary" className="text-xs">
                                            {skill}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Experience */}
                        {extractedData.experience?.length > 0 && (
                            <div>
                                <h4 className="font-medium mb-2 flex items-center gap-2 text-sm">
                                    <Briefcase className="h-4 w-4 text-blue-500" />
                                    Experience ({extractedData.totalYearsOfExperience || "?"} years)
                                </h4>
                                <div className="space-y-2">
                                    {extractedData.experience.map((exp, i) => (
                                        <div key={i} className="p-3 bg-muted/30 rounded-md text-sm">
                                            <span className="font-medium">{exp.title}</span>
                                            <span className="text-muted-foreground"> at {exp.company}</span>
                                            {exp.duration && (
                                                <span className="text-muted-foreground"> • {exp.duration}</span>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Projects */}
                        {extractedData.projects?.length > 0 && (
                            <div>
                                <h4 className="font-medium mb-2 flex items-center gap-2 text-sm">
                                    <FolderKanban className="h-4 w-4 text-indigo-500" />
                                    Projects ({extractedData.projects.length})
                                </h4>
                                <div className="space-y-2">
                                    {extractedData.projects.map((project, i) => (
                                        <div key={i} className="p-3 bg-muted/30 rounded-md text-sm">
                                            <span className="font-medium">{project.name}</span>
                                            {project.description && (
                                                <p className="text-muted-foreground mt-1">{project.description}</p>
                                            )}
                                            {project.technologies?.length > 0 && (
                                                <div className="flex flex-wrap gap-1 mt-2">
                                                    {project.technologies.map((tech, j) => (
                                                        <Badge key={j} variant="outline" className="text-xs">
                                                            {tech}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Education */}
                        {extractedData.education?.length > 0 && (
                            <div>
                                <h4 className="font-medium mb-2 flex items-center gap-2 text-sm">
                                    <GraduationCap className="h-4 w-4 text-purple-500" />
                                    Education
                                </h4>
                                <div className="space-y-2">
                                    {extractedData.education.map((edu, i) => (
                                        <div key={i} className="p-3 bg-muted/30 rounded-md text-sm">
                                            <span className="font-medium">{edu.degree}</span>
                                            <span className="text-muted-foreground"> — {edu.institution}</span>
                                            {edu.year && (
                                                <span className="text-muted-foreground"> ({edu.year})</span>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Certifications */}
                        {extractedData.certifications?.length > 0 && (
                            <div>
                                <h4 className="font-medium mb-2 flex items-center gap-2 text-sm">
                                    <Award className="h-4 w-4 text-yellow-500" />
                                    Certifications
                                </h4>
                                <div className="flex flex-wrap gap-2">
                                    {extractedData.certifications.map((cert, i) => (
                                        <Badge key={i} variant="outline" className="text-xs">
                                            {cert}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </CardContent>

            <CardFooter className="flex flex-col gap-3 border-t pt-4">
                <Button onClick={handleConfirmAndContinue} className="w-full" size="lg">
                    Confirm & Start Validation
                    <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <Button onClick={handleReset} variant="ghost" className="w-full">
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Upload Different Resume
                </Button>
            </CardFooter>
        </Card>
    );
}
