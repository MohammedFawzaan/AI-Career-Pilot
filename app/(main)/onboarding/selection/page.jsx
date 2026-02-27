import { redirect } from "next/navigation";
import { getUser } from "@/actions/user";
import SelectionForm from "./_components/selection-form";

export default async function SelectionPage() {
  const user = await getUser();

  if (user?.userType === "EXPERIENCED") {
    redirect("/onboarding/resume-upload");
  }

  if (user?.userType === "FRESHER") {
    redirect("/onboarding/assessment");
  }

  return (
    <main className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="space-y-6 text-center mb-10">
        <h1 className="gradient-title text-4xl md:text-5xl font-bold">
          Let's Customize Your Journey
        </h1>
        <p className="text-muted-foreground text-lg">
          Tell us where you are in your career so we can guide you better.
        </p>
      </div>
      <SelectionForm />
    </main>
  );
}
