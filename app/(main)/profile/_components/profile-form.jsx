"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Wand2, Briefcase, MapPin, GraduationCap, Building2 } from "lucide-react";
import { toast } from "sonner";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import useFetch from "@/hooks/use-fetch";
import { onboardingSchema } from "@/app/lib/schema";
import { updateUser } from "@/actions/user";
import { improveWithAI } from "@/actions/improve";

const ProfileForm = ({ industries, initialData }) => {
    const [isEditMode, setIsEditMode] = useState(false);
    const [selectedIndustry, setSelectedIndustry] = useState(null);

    const {
        loading: updateLoading,
        fn: updateUserFn,
        data: updateResult,
    } = useFetch(updateUser);

    const {
        register,
        handleSubmit,
        formState: { errors },
        setValue,
        watch,
    } = useForm({
        resolver: zodResolver(onboardingSchema),
        defaultValues: {
            experience: initialData?.experience?.toString() || "",
            bio: initialData?.bio || "",
            skills: initialData?.skills?.join(", ") || "",
            country: initialData?.country || "",
            city: initialData?.city || "",
        },
    });

    // Parse industry and subIndustry from initialData
    useEffect(() => {
        if (initialData?.industry && industries) {
            let found = false;
            for (const ind of industries) {
                for (const sub of ind.subIndustries) {
                    const slug = `${ind.id}-${sub.toLowerCase().replace(/ /g, "-")}`;
                    if (slug === initialData.industry) {
                        setValue("industry", ind.id);
                        setSelectedIndustry(ind);
                        setValue("subIndustry", sub);
                        found = true;
                        break;
                    }
                }
                if (found) break;
            }
        }
    }, [initialData, industries, setValue]);

    const [isImproving, setIsImproving] = useState(false);

    const handleImproveBio = async () => {
        const bio = watch("bio");
        if (!bio) {
            toast.error("Please enter some bio text first.");
            return;
        }
        setIsImproving(true);
        try {
            const result = await improveWithAI({
                current: bio,
                type: "professional bio",
            });
            setValue("bio", result);
            toast.success("Bio improved successfully!");
        } catch (error) {
            toast.error("Failed to improve bio.");
        } finally {
            setIsImproving(false);
        }
    };

    const onSubmit = async (values) => {
        try {
            const formattedIndustry = `${values.industry}-${values.subIndustry
                .toLowerCase()
                .replace(/ /g, "-")}`;

            await updateUserFn({
                ...values,
                industry: formattedIndustry,
            });
        } catch (error) {
            console.error("Profile update error:", error);
        }
    };

    useEffect(() => {
        if (updateResult && !updateLoading) {
            toast.success("Profile updated successfully!");
            setIsEditMode(false);
        }
    }, [updateResult, updateLoading]);

    const watchIndustry = watch("industry");

    if (!isEditMode) {
        // View Mode: Advanced Dashboard Layout
        let industryName = initialData?.industry;
        let subIndustryName = "";

        if (initialData?.industry && industries) {
            for (const ind of industries) {
                if (initialData.industry.startsWith(ind.id + "-")) {
                    industryName = ind.name;
                    for (const sub of ind.subIndustries) {
                        const slug = `${ind.id}-${sub.toLowerCase().replace(/ /g, "-")}`;
                        if (slug === initialData.industry) {
                            subIndustryName = sub;
                            break;
                        }
                    }
                    break;
                }
            }
        }

        return (
            <div className="w-full max-w-5xl mx-auto space-y-6">
                {/* Header Card */}
                <Card className="border-t-4 border-t-primary overflow-hidden shadow-lg">
                    <CardContent className="p-0">
                        <div className="bg-gradient-to-r from-muted/50 via-muted to-muted/20 h-24 sm:h-32"></div>
                        <div className="px-6 pb-6 pt-0 flex flex-col sm:flex-row gap-6 items-start sm:items-end -mt-12 sm:-mt-16">
                            <div className="h-24 w-24 sm:h-32 sm:w-32 bg-primary/10 rounded-full border-4 border-background flex items-center justify-center text-4xl shadow-md">
                                {initialData?.name?.charAt(0) || "U"}
                            </div>
                            <div className="flex-1 space-y-1 pb-2">
                                <h1 className="text-3xl font-bold gradient-title">
                                    {initialData?.name || "Professional"}
                                </h1>
                                <p className="text-muted-foreground font-medium text-lg flex items-center gap-2">
                                    <Briefcase className="h-4 w-4" />
                                    {subIndustryName || industryName || "Professional"}
                                </p>
                            </div>
                            <Button className="mt-4 sm:mb-2 w-full sm:w-auto" onClick={() => setIsEditMode(true)}>
                                Edit Profile
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Left Column: Bio & Skills */}
                    <div className="md:col-span-2 space-y-6">
                        <Card className="shadow-sm border-muted">
                            <CardHeader>
                                <CardTitle className="text-xl flex items-center gap-2">
                                    <Building2 className="h-5 w-5 text-primary" />
                                    Professional Summary
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-base leading-relaxed whitespace-pre-wrap text-muted-foreground">
                                    {initialData?.bio || "No summary provided."}
                                </p>
                            </CardContent>
                        </Card>

                        <Card className="shadow-sm border-muted">
                            <CardHeader>
                                <CardTitle className="text-xl flex items-center gap-2">
                                    <Wand2 className="h-5 w-5 text-primary" />
                                    Core Skills
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {initialData?.skills?.length > 0 ? (
                                    <div className="flex flex-wrap gap-2">
                                        {initialData.skills.map((skill, index) => (
                                            <Badge key={index} variant="secondary" className="px-3 py-1 text-sm bg-primary/10 hover:bg-primary/20 transition-colors">
                                                {skill}
                                            </Badge>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-muted-foreground text-sm">No skills added yet.</p>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right Column: Key Details */}
                    <div className="space-y-6">
                        <Card className="shadow-sm border-muted">
                            <CardHeader>
                                <CardTitle className="text-xl">Details</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-1.5 p-3 rounded-lg bg-muted/30">
                                    <div className="flex items-center text-sm font-medium text-muted-foreground gap-2">
                                        <GraduationCap className="h-4 w-4" />
                                        Industry
                                    </div>
                                    <p className="font-semibold text-foreground">{industryName}</p>
                                </div>
                                <div className="space-y-1.5 p-3 rounded-lg bg-muted/30">
                                    <div className="flex items-center text-sm font-medium text-muted-foreground gap-2">
                                        <Briefcase className="h-4 w-4" />
                                        Experience
                                    </div>
                                    <p className="font-semibold text-foreground">{initialData?.experience} Years</p>
                                </div>
                                <div className="space-y-1.5 p-3 rounded-lg bg-muted/30">
                                    <div className="flex items-center text-sm font-medium text-muted-foreground gap-2">
                                        <MapPin className="h-4 w-4" />
                                        Location
                                    </div>
                                    <p className="font-semibold text-foreground">
                                        {initialData?.city && initialData?.country
                                            ? `${initialData.city}, ${initialData.country}`
                                            : initialData?.country || initialData?.city || "Not specified"}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        );
    }

    // Edit Mode
    return (
        <Card className="w-full max-w-4xl mx-auto shadow-lg border-t-4 border-t-primary">
            <CardHeader>
                <CardTitle className="text-2xl">Edit Profile</CardTitle>
                <CardDescription>
                    All fields are required to give you the most accurate career guidance.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                    {/* Section 1: Professional Details */}
                    <div className="space-y-6 p-6 rounded-lg bg-muted/10 border border-muted/50">
                        <h3 className="text-lg font-semibold flex items-center gap-2">
                            <Briefcase className="h-5 w-5 text-primary" />
                            Professional Details
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                                        <SelectGroup>
                                            <SelectLabel>Industries</SelectLabel>
                                            {industries.map((ind) => (
                                                <SelectItem key={ind.id} value={ind.id}>{ind.name}</SelectItem>
                                            ))}
                                        </SelectGroup>
                                    </SelectContent>
                                </Select>
                                {errors.industry && <p className="text-sm text-red-500">{errors.industry.message}</p>}
                            </div>

                            {(watchIndustry || selectedIndustry) && (
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
                                            <SelectGroup>
                                                <SelectLabel>Specializations</SelectLabel>
                                                {selectedIndustry?.subIndustries.map((sub) => (
                                                    <SelectItem key={sub} value={sub}>{sub}</SelectItem>
                                                ))}
                                            </SelectGroup>
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
                    </div>

                    {/* Section 2: Location */}
                    <div className="space-y-6 p-6 rounded-lg bg-muted/10 border border-muted/50">
                        <h3 className="text-lg font-semibold flex items-center gap-2">
                            <MapPin className="h-5 w-5 text-primary" />
                            Location
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="country">Country <span className="text-red-500">*</span></Label>
                                <Input
                                    id="country"
                                    placeholder="e.g., United States, India"
                                    className={errors.country ? "border-red-500" : ""}
                                    {...register("country")}
                                />
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
                                {errors.city && <p className="text-sm text-red-500">{errors.city.message}</p>}
                            </div>
                        </div>
                    </div>

                    {/* Section 3: Summary & Skills */}
                    <div className="space-y-6 p-6 rounded-lg bg-muted/10 border border-muted/50">
                        <h3 className="text-lg font-semibold flex items-center gap-2">
                            <Wand2 className="h-5 w-5 text-primary" />
                            Summary & Skills
                        </h3>

                        <div className="space-y-2">
                            <Label htmlFor="skills">Skills <span className="text-red-500">*</span></Label>
                            <Input
                                id="skills"
                                placeholder="e.g., Python, JavaScript, Project Management"
                                className={errors.skills ? "border-red-500" : ""}
                                {...register("skills")}
                            />
                            <p className="text-xs text-muted-foreground">
                                Separate multiple skills with commas
                            </p>
                            {errors.skills && <p className="text-sm text-red-500">{errors.skills.message}</p>}
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between items-center sm:flex-row flex-col gap-2 sm:gap-0">
                                <Label htmlFor="bio" className="self-start sm:self-center">Professional Bio <span className="text-red-500">*</span></Label>
                                <Button
                                    type="button"
                                    onClick={handleImproveBio}
                                    disabled={isImproving || !watch("bio")}
                                    variant="outline"
                                    className="border-primary text-primary hover:bg-primary hover:text-primary-foreground self-start sm:self-center"
                                    size="sm"
                                >
                                    {isImproving ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                        <>
                                            <Wand2 className="h-4 w-4 mr-2" />
                                            Improve with AI
                                        </>
                                    )}
                                </Button>
                            </div>
                            <Textarea
                                id="bio"
                                placeholder="Tell us about your professional background... (minimum 10 characters)"
                                className={`h-32 ${errors.bio ? "border-red-500" : ""}`}
                                {...register("bio")}
                            />
                            {errors.bio && <p className="text-sm text-red-500">{errors.bio.message}</p>}
                        </div>
                    </div>

                    <div className="flex gap-4 max-w-sm mx-auto sm:ml-auto sm:mr-0 pt-4">
                        <Button type="button" variant="outline" onClick={() => setIsEditMode(false)} className="flex-1">
                            Cancel
                        </Button>
                        <Button type="submit" className="flex-1" disabled={updateLoading}>
                            {updateLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                "Save Profile"
                            )}
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
};

export default ProfileForm;
