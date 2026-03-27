import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import Quiz from "../_components/quiz";
import { getUser } from "@/actions/user";
import { redirect } from "next/navigation";

export default async function MockInterviewPage() {
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
    <div className="container mx-auto space-y-4 py-6 px-4">
      <div className="flex flex-col space-y-2">
        <Link href="/interview">
          <Button variant="link" className="gap-2 pl-0">
            <ArrowLeft className="h-4 w-4" />
            Back to Interview Preparation
          </Button>
        </Link>

        <div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold gradient-title">Mock Interview</h1>
          <p className="text-muted-foreground text-sm sm:text-base md:text-lg">
            Test your knowledge with an AI mock interview. Questions are uniquely generated based on your <strong className="text-foreground">Skills</strong> listed on you profile or a <strong className="text-foreground">Custom Topic</strong> of your choice.
          </p>
        </div>
      </div>

      <Quiz user={user} />
    </div>
  );
}
