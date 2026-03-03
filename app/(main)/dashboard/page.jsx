import { getIndustryInsights } from "@/actions/dashboard";
import DashboardView from "./_component/dashboard-view";
import { getUserOnboardingStatus, getUser } from "@/actions/user";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const user = await getUser();
  const { isOnboarded } = await getUserOnboardingStatus();

  // If not onboarded, redirect to onboarding page
  if (!isOnboarded) {
    if (!user?.userType) {
      redirect("/onboarding/selection");
    }
    redirect("/onboarding");
  }

  const insights = await getIndustryInsights();

  return (
    <div className="container mx-auto">
      <DashboardView insights={insights} user={user} />
    </div>
  );
}
