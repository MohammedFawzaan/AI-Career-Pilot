import { redirect } from "next/navigation";
import { getUser } from "@/actions/user";
import AssessmentForm from "./_components/assessment-form";

export default async function AssessmentPage() {
    const user = await getUser();

    if (!user) redirect("/sign-in");

    // If user is already experienced, they shouldn't be here (ideally)
    // But we let them retake if they want, or we can redirect
    if (user.userType === "EXPERIENCED") {
        // redirect("/onboarding"); 
    }

    return (
        <main className="container mx-auto px-4 py-8 max-w-4xl">
            <div className="space-y-4 mb-8">
                <h1 className="gradient-title text-3xl md:text-4xl font-bold">
                    Career Assessment
                </h1>
                <p className="text-muted-foreground text-lg">
                    Answer these questions honestly to help us map your perfect IT career path.
                </p>
            </div>
            <AssessmentForm />
        </main>
    );
}
