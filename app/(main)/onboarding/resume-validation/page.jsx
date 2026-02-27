import { redirect } from "next/navigation";
import { getUser } from "@/actions/user";
import ValidationForm from "./_components/validation-form";

export default async function ResumeValidationPage() {
    const user = await getUser();

    if (!user) redirect("/sign-in");

    if (user.userType !== "EXPERIENCED") {
        redirect("/onboarding/assessment");
    }

    return (
        <main className="container mx-auto px-4 py-8 max-w-4xl">
            <div className="space-y-4 mb-8">
                <h1 className="gradient-title text-3xl md:text-4xl font-bold">
                    Resume Validation Assessment
                </h1>
                <p className="text-muted-foreground text-lg">
                    A quick validation to verify your skills and map you to the best growth opportunities.
                </p>
            </div>
            <ValidationForm />
        </main>
    );
}
