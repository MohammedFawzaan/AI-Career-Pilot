import { redirect } from "next/navigation";
import { industries } from "@/data/industries";
import OnboardingForm from "./_components/onboarding-form";
import { getUser } from "@/actions/user";

export default async function OnboardingPage() {
  const user = await getUser();

  if (!user) redirect("/sign-in");

  if (!user?.userType) {
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

  if (user.industry) {
    redirect("/profile");
  }

  return (
    <main>
      <OnboardingForm industries={industries} />
    </main>
  );
}
