import { getResume } from "@/actions/resume";
import ResumeBuilder from "./_components/resume-builder";
import { getUser } from "@/actions/user";
import { redirect } from "next/navigation";

export default async function ResumePage() {
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

  // Must have industry
  if (!user.industry) {
    redirect("/onboarding");
  }

  const resume = await getResume();

  return (
    <div className="container mx-auto px-4 py-6">
      <ResumeBuilder initialContent={resume?.content} />
    </div>
  );
}
