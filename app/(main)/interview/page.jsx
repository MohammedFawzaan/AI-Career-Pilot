import { getAssessments } from "@/actions/interview";
import StatsCards from "./_components/stats-cards";
import PerformanceChart from "./_components/performace-chart";
import QuizList from "./_components/quiz-list";
import { getUser } from "@/actions/user";
import { redirect } from "next/navigation";

export default async function InterviewPrepPage() {
  const user = await getUser();
  if (!user) redirect("/sign-in");

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

  const assessments = await getAssessments();

  return (
    <div className="container mx-auto">
      <div className="flex items-center justify-between mb-5 px-4">
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold gradient-title">
          Interview Preparation
        </h1>
      </div>
      <div className="space-y-6 px-4">
        <StatsCards assessments={assessments} />
        <PerformanceChart assessments={assessments} />
        <QuizList assessments={assessments} />
      </div>
    </div>
  );
}
