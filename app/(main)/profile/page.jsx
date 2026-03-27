import { getUser } from "@/actions/user";
import { industries } from "@/data/industries";
import ProfileForm from "./_components/profile-form";
import { redirect } from "next/navigation";

export default async function ProfilePage() {
    const user = await getUser();
    if (!user) redirect("/sign-in");

    // Unified Onboarding Guard System
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

    // If assessment is done but final onboarding (industry) isn't, go to final step
    if (!user.industry) {
        redirect("/onboarding");
    }

    return (
        <div className="mx-auto py-6">
            <ProfileForm industries={industries} initialData={user} />
        </div>
    );
}
