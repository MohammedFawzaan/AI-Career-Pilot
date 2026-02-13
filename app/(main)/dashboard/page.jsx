import { getIndustryInsights } from "@/actions/dashboard";
import DashboardView from "./_component/dashboard-view";
import { getUserOnboardingStatus, getUser } from "@/actions/user";
import { redirect } from "next/navigation";
export default async function DashboardPage() {
  const { isOnboarded } = await getUserOnboardingStatus();
  const user = await getUser();

  // If not onboarded, redirect to onboarding page
  // Skip this check if already on the onboarding page
  if (!isOnboarded) {
    // If not onboarded, check if they are fresher to send them to assessment flow or selection
    if (!user?.userType) {
      redirect("/onboarding/selection"); // If no type, go to selection
    }
    // If fresher but not onboarded (means assessment not done or profile not saved), go to onboarding
    // The OnboardingPage handles the redirection to assessment/result if needed.
    redirect("/onboarding");
  }

  const insights = await getIndustryInsights();

  return (
    <div className="container mx-auto">
      <DashboardView insights={insights} />
    </div>
  );
}
