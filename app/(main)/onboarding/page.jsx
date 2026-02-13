import { redirect } from "next/navigation";
import { industries } from "@/data/industries";
import OnboardingForm from "./_components/onboarding-form";
import { getUserOnboardingStatus, getUser } from "@/actions/user";

export default async function OnboardingPage() {
  // Check if user is already onboarded
  const { isOnboarded } = await getUserOnboardingStatus();

  // Allow access even if onboarded to enable re-selection of career path
  // if (isOnboarded) {
  //   redirect("/dashboard");
  // }


  const user = await getUser();

  if (!user?.userType) {
    redirect("/onboarding/selection");
  }

  return (
    <main>
      <OnboardingForm industries={industries} />
    </main>
  );
}
