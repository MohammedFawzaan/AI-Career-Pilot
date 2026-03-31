"use client";

import { useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { onboardingSchema } from "@/app/lib/schema";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Loader2, Plus, Briefcase, MapPin, Wrench, FileText } from "lucide-react";
import { updateUser } from "@/actions/user";
import { Badge } from "@/components/ui/badge";

export default function OnboardingForm({ industries }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedIndustry, setSelectedIndustry] = useState(null);
  const [recommendedSkills, setRecommendedSkills] = useState([]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
    getValues,
  } = useForm({
    resolver: zodResolver(onboardingSchema),
  });

  // Watch industry to update sub-industries
  const watchIndustry = watch("industry");

  useEffect(() => {
    // Auto-fill from URL params (from assessment result)
    const industryParam = searchParams.get("industry");
    const bioParam = searchParams.get("bio");
    const skillsParam = searchParams.get("skills");

    if (industryParam) {
      // Try to find matching industry by subindustry
      const foundIndustry = industries.find(ind => ind.subIndustries.includes(industryParam));
      if (foundIndustry) {
        setValue("industry", foundIndustry.id);
        setSelectedIndustry(foundIndustry);
        // Set a small timeout to allow industry to settle before setting subIndustry
        setTimeout(() => {
          setValue("subIndustry", industryParam);
        }, 50);
      } else {
        // Fallback: try to match main industry name
        const mainIndustry = industries.find(ind => ind.name === industryParam);
        if (mainIndustry) {
          setValue("industry", mainIndustry.id);
          setSelectedIndustry(mainIndustry);
        }
      }
    }

    if (bioParam) {
      setValue("bio", bioParam);
    }

    if (skillsParam) {
      // Do NOT auto-fill skills, instead parse them for recommendations
      const skillsArray = skillsParam.split(",").map(s => s.trim());
      setRecommendedSkills(skillsArray);
    }

    // Default experience to 0 for freshers coming from assessment
    if (industryParam || bioParam) {
      setValue("experience", "0");
    }

  }, [searchParams, industries, setValue]);

  const handleAddSkill = (skill) => {
    const currentSkills = getValues("skills") || "";
    if (!currentSkills.includes(skill)) {
      setValue("skills", currentSkills ? `${currentSkills}, ${skill}` : skill);
      toast.success(`Added ${skill}`);
    } else {
      toast.info(`${skill} is already added.`);
    }
  };

  const onSubmit = async (values) => {
    try {
      const formattedIndustry = `${values.industry}-${values.subIndustry}`;
      await updateUser({ ...values, industry: formattedIndustry });
      toast.success("Profile updated successfully!");
      router.push("/profile");
    } catch (error) {
      console.error("Onboarding error:", error);
      toast.error("Something went wrong. Please try again.");
    }
  };

  return (
    <div className="w-full px-4 sm:px-0">
      {/* Header */}
      <div className="mb-12 space-y-2">
        <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-foreground">
          Complete Your Profile
        </h1>
        <p className="text-muted-foreground text-sm sm:text-base">
          Select your industry and fill in your details to get personalized career insights.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-12">
        {/* Section: Professional Details */}
        <section className="space-y-6">
          <div className="flex items-center gap-3 mb-2">
            <Briefcase className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-bold tracking-tight text-foreground">Professional Details</h2>
          </div>
          <div className="border-t border-border/60" />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="industry">Industry <span className="text-red-500">*</span></Label>
              <Select
                onValueChange={(value) => {
                  setValue("industry", value);
                  setSelectedIndustry(industries.find((ind) => ind.id === value));
                  setValue("subIndustry", "");
                }}
                value={watchIndustry}
              >
                <SelectTrigger id="industry" className={errors.industry ? "border-red-500" : ""}>
                  <SelectValue placeholder="Select an industry" />
                </SelectTrigger>
                <SelectContent>
                  {industries.map((ind) => (
                    <SelectItem key={ind.id} value={ind.id}>
                      {ind.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.industry && <p className="text-sm text-red-500">{errors.industry.message}</p>}
            </div>

            {watchIndustry && (
              <div className="space-y-2">
                <Label htmlFor="subIndustry">Specialization <span className="text-red-500">*</span></Label>
                <Select
                  onValueChange={(value) => setValue("subIndustry", value)}
                  value={watch("subIndustry")}
                >
                  <SelectTrigger id="subIndustry" className={errors.subIndustry ? "border-red-500" : ""}>
                    <SelectValue placeholder="Select your specialization" />
                  </SelectTrigger>
                  <SelectContent>
                    {selectedIndustry?.subIndustries.map((sub) => (
                      <SelectItem key={sub} value={sub}>
                        {sub}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.subIndustry && <p className="text-sm text-red-500">{errors.subIndustry.message}</p>}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="experience">Years of Experience <span className="text-red-500">*</span></Label>
              <Input
                id="experience"
                type="number"
                min="0"
                max="50"
                placeholder="Enter years of experience"
                className={errors.experience ? "border-red-500" : ""}
                {...register("experience")}
              />
              {errors.experience && <p className="text-sm text-red-500">{errors.experience.message}</p>}
            </div>
          </div>
        </section>

        {/* Section: Location */}
        <section className="space-y-6">
          <div className="flex items-center gap-3 mb-2">
            <MapPin className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-bold tracking-tight text-foreground">Location</h2>
          </div>
          <div className="border-t border-border/60" />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="country">Country <span className="text-red-500">*</span></Label>
              <Input
                id="country"
                placeholder="e.g., United States, India"
                className={errors.country ? "border-red-500" : ""}
                {...register("country")}
              />
              <p className="text-xs text-muted-foreground">Helps find local internships</p>
              {errors.country && <p className="text-sm text-red-500">{errors.country.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="city">City <span className="text-red-500">*</span></Label>
              <Input
                id="city"
                placeholder="e.g., New York, Bangalore"
                className={errors.city ? "border-red-500" : ""}
                {...register("city")}
              />
              <p className="text-xs text-muted-foreground">Helps find local internships</p>
              {errors.city && <p className="text-sm text-red-500">{errors.city.message}</p>}
            </div>
          </div>
        </section>

        {/* Section: Skills & Bio */}
        <section className="space-y-6">
          <div className="flex items-center gap-3 mb-2">
            <Wrench className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-bold tracking-tight text-foreground">Skills</h2>
          </div>
          <div className="border-t border-border/60" />

          <div className="space-y-2">
            <Label htmlFor="skills">Your Skills <span className="text-red-500">*</span></Label>
            <Input
              id="skills"
              placeholder="e.g., Python, JavaScript, Project Management"
              className={errors.skills ? "border-red-500" : ""}
              {...register("skills")}
            />

            {recommendedSkills.length > 0 && (
              <div className="mt-3">
                <p className="text-xs text-muted-foreground font-medium mb-2">Recommended for your career path:</p>
                <div className="flex flex-wrap gap-2">
                  {recommendedSkills.map((skill) => (
                    <Badge
                      key={skill}
                      variant="outline"
                      className="cursor-pointer hover:bg-primary/10 transition-colors flex items-center gap-1"
                      onClick={() => handleAddSkill(skill)}
                    >
                      <Plus className="h-3 w-3" /> {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            <p className="text-xs text-muted-foreground mt-2">Separate multiple skills with commas</p>
            {errors.skills && <p className="text-sm text-red-500">{errors.skills.message}</p>}
          </div>
        </section>

        {/* Section: Bio */}
        <section className="space-y-6">
          <div className="flex items-center gap-3 mb-2">
            <FileText className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-bold tracking-tight text-foreground">Professional Bio</h2>
          </div>
          <div className="border-t border-border/60" />

          <div className="space-y-2">
            <Label htmlFor="bio">Tell us about yourself <span className="text-red-500">*</span></Label>
            <Textarea
              id="bio"
              placeholder="Tell us about your professional background..."
              className={`h-32 ${errors.bio ? "border-red-500" : ""}`}
              {...register("bio")}
            />
            {errors.bio && <p className="text-sm text-red-500">{errors.bio.message}</p>}
          </div>
        </section>

        {/* Submit */}
        <div className="pt-4">
          <Button type="submit" className="w-full sm:w-auto sm:min-w-[200px]" size="lg" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Complete Profile"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
