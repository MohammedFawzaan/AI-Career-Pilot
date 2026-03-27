import { getIndustryInsights } from "@/actions/dashboard";
import DashboardView from "./_component/dashboard-view";
import { getUser } from "@/actions/user";
import { redirect } from "next/navigation";
import Footer from "@/components/footer";

export default async function DashboardPage() {
  const user = await getUser();

  if (!user.userType) {
    redirect("/onboarding/selection");
  }

  // If assessment isn't done, force them back to their specific journey
  if (!user.careerAssessment) {
    if (user.userType === "EXPERIENCED") {
      redirect("/onboarding/resume-upload");
    } else {
      redirect("/onboarding/assessment");
    }
  }

  // Final onboarding (industry selection)
  if (!user.industry) {
    redirect("/onboarding");
  }

  const insights = await getIndustryInsights();

  return (
    <>
      <div className="container mx-auto">
        <DashboardView insights={insights} user={user} />
      </div>
      <Footer />
    </>
  );
}
