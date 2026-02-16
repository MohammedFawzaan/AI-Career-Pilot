"use client";

import { useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { onboardingSchema } from "@/app/lib/schema";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Loader2, Plus } from "lucide-react";
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
      // Try to find matching industry
      const foundIndustry = industries.find(ind => ind.subIndustries.includes(industryParam));
      if (foundIndustry) {
        setValue("industry", `${foundIndustry.id}-${industryParam}`);
        setSelectedIndustry(foundIndustry);
      } else {
        // Fallback: try to match main industry name
        const mainIndustry = industries.find(ind => ind.name === industryParam);
        if (mainIndustry) {
          setSelectedIndustry(mainIndustry);
          // We can't select a sub-industry yet, user must do it
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
      router.push("/dashboard");
    } catch (error) {
      console.error("Onboarding error:", error);
      toast.error("Something went wrong. Please try again.");
    }
  };

  return (
    <div className="flex items-center justify-center bg-background">
      <Card className="w-full max-w-lg mt-10 mx-2">
        <CardHeader>
          <CardTitle className="gradient-title text-4xl">Complete Your Profile</CardTitle>
          <CardDescription>Select your industry to get personalized insights.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="industry">Industry</Label>
              <Select
                onValueChange={(value) => {
                  setValue("industry", value);
                  setSelectedIndustry(industries.find((ind) => ind.id === value));
                  setValue("subIndustry", "");
                }}
              >
                <SelectTrigger id="industry">
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
                <Label htmlFor="subIndustry">Specialization</Label>
                <Select onValueChange={(value) => setValue("subIndustry", value)}>
                  <SelectTrigger id="subIndustry">
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
              <Label htmlFor="experience">Years of Experience</Label>
              <Input
                id="experience"
                type="number"
                min="0"
                max="50"
                placeholder="Enter years of experience"
                {...register("experience")}
              />
              {errors.experience && <p className="text-sm text-red-500">{errors.experience.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="country">Country</Label>
              <Input
                id="country"
                placeholder="e.g., United States, India, United Kingdom"
                {...register("country")}
              />
              <p className="text-xs text-muted-foreground">Optional - helps find local internships</p>
              {errors.country && <p className="text-sm text-red-500">{errors.country.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                placeholder="e.g., New York, Bangalore, London"
                {...register("city")}
              />
              <p className="text-xs text-muted-foreground">Optional - helps find local internships</p>
              {errors.city && <p className="text-sm text-red-500">{errors.city.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="skills">Skills</Label>
              <Input
                id="skills"
                placeholder="e.g., Python, JavaScript, Project Management"
                {...register("skills")}
              />

              {recommendedSkills.length > 0 && (
                <div className="mt-2 text-sm text-muted-foreground">
                  <p className="mb-1">Recommended for chosen career path:</p>
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

            <div className="space-y-2">
              <Label htmlFor="bio">Professional Bio</Label>
              <Textarea
                id="bio"
                placeholder="Tell us about your professional background..."
                className="h-32"
                {...register("bio")}
              />
              {errors.bio && <p className="text-sm text-red-500">{errors.bio.message}</p>}
            </div>

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Complete Profile"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
