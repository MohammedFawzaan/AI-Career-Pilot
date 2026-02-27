import { redirect } from "next/navigation";
import { industries } from "@/data/industries";
import OnboardingForm from "./_components/onboarding-form";
import { getUser } from "@/actions/user";

export default async function OnboardingPage({ searchParams }) {
  const user = await getUser();

  if (!user?.userType) {
    redirect("/onboarding/selection");
  }

  const params = await searchParams;

  // Experienced users without a selected role who navigate here directly
  // (no query params from role selection) should go to resume upload
  if (user.userType === "EXPERIENCED" && !user.careerAssessment?.primaryRole) {
    const hasParams = params?.industry || params?.bio || params?.selectedRole;
    if (!hasParams) {
      redirect("/onboarding/resume-upload");
    }
  }

  return (
    <main>
      <OnboardingForm industries={industries} />
    </main>
  );
}
