import { redirect } from "next/navigation";
import { industries } from "@/data/industries";
import OnboardingForm from "./_components/onboarding-form";
import { getUser } from "@/actions/user";

export default async function OnboardingPage() {
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
