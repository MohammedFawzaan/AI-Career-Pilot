import { redirect } from "next/navigation";
import { getUser } from "@/actions/user";
import ResumeUploadForm from "./_components/resume-upload-form";

export default async function ResumeUploadPage() {
    const user = await getUser();

    if (!user) redirect("/sign-in");

    // Only experienced users should be here
    if (user.userType !== "EXPERIENCED") {
        redirect("/onboarding/assessment");
    }

    // If user already has an assessment, they can still re-upload
    return (
        <main className="container mx-auto px-4 py-8 max-w-4xl">
            <div className="space-y-4 mb-8">
                <h1 className="gradient-title text-3xl md:text-4xl font-bold">
                    Upload Your Resume
                </h1>
                <p className="text-muted-foreground text-lg">
                    Upload your resume (PDF or DOCX) and let AI extract your professional profile.
                    This helps us provide personalized career growth recommendations.
                </p>
            </div>
            <ResumeUploadForm />
        </main>
    );
}
