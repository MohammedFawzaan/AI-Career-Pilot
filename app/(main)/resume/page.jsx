import { getResume } from "@/actions/resume";
import ResumeBuilder from "./_components/resume-builder";
import { getUser, getUserOnboardingStatus } from "@/actions/user";
import { redirect } from "next/navigation";

export default async function ResumePage() {
  const user = await getUser();
  const { isOnboarded } = await getUserOnboardingStatus();
  if (!user) redirect("/sign-in");
  if (!isOnboarded) {
    if (!user?.userType) {
      redirect("/onboarding/selection");
    }
    redirect("/onboarding");
  }

  const resume = await getResume();

  return (
    <div className="container mx-auto px-4 py-6">
      <ResumeBuilder initialContent={resume?.content} />
    </div>
  );
}
