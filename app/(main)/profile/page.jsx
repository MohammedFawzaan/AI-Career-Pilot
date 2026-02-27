import { getUser } from "@/actions/user";
import { industries } from "@/data/industries";
import ProfileForm from "./_components/profile-form";
import { redirect } from "next/navigation";

export default async function ProfilePage() {
    const user = await getUser();

    if (!user) {
        redirect("/sign-in");
    }

    if (!user.industry) {
        redirect("/onboarding");
    }

    return (
        <div className="mx-auto py-6">
            <ProfileForm industries={industries} initialData={user} />
        </div>
    );
}
