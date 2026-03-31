import { redirect } from "next/navigation";
import { industries } from "@/data/industries";
import OnboardingForm from "./_components/onboarding-form";
import { getUser } from "@/actions/user";

export default async function OnboardingPage({ searchParams }) {
  const user = await getUser();
  const params = await searchParams;

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

  const isReselecting = !!params?.selectedRole;

  if (user.industry && !isReselecting) {
    redirect("/profile");
  }

  return (
    <main>
      <OnboardingForm industries={industries} />
    </main>
  );
}
