import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import CoverLetterGenerator from "../_components/cover-letter-generator";

import { getUser } from "@/actions/user";
import { redirect } from "next/navigation";

export default async function NewCoverLetterPage() {
  const user = await getUser();
  if (!user) redirect("/sign-in");

  // Unified Onboarding Guard System
  if (!user.userType) {
    redirect("/onboarding/selection");
  }

  // If assessment isn't done, force them back
  if (!user.careerAssessment) {
    if (user.userType === "EXPERIENCED") {
      redirect("/onboarding/resume-upload");
    } else {
      redirect("/onboarding/assessment");
    }
  }

  // Final onboarding
  if (!user.industry) {
    redirect("/onboarding");
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex flex-col space-y-2">
        <Link href="/ai-cover-letter">
          <Button variant="link" className="gap-2 pl-0">
            <ArrowLeft className="h-4 w-4" />
            Back to Cover Letters
          </Button>
        </Link>

        <div className="pb-6">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold gradient-title">
            Create Cover Letter
          </h1>
          <p className="text-muted-foreground">
            Generate a tailored cover letter for your job application
          </p>
        </div>
      </div>

      <CoverLetterGenerator />
    </div>
  );
}
