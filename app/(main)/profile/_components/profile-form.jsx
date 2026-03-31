"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Wand2, Briefcase, MapPin, GraduationCap, Building2 } from "lucide-react";
import { toast } from "sonner";
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

    // Compute and store industry/subIndustry from initialData ONCE so dropdowns can be initialised synchronously
    const getInitialIndustryState = () => {
        if (!initialData?.industry || !industries) return { industryId: "", subIndustry: "" };
        for (const ind of industries) {
            for (const sub of ind.subIndustries) {
                const slug = `${ind.id}-${sub.toLowerCase().replace(/ /g, "-")}`;
                if (slug === initialData.industry) {
                    return { industryId: ind.id, subIndustry: sub, industryObj: ind };
                }
            }
        }
        return { industryId: "", subIndustry: "" };
    };

    const { industryId, subIndustry: initialSubIndustry, industryObj } = getInitialIndustryState();
    const [selectedIndustry, setSelectedIndustry] = useState(industryObj || null);

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
        reset,
    } = useForm({
        resolver: zodResolver(onboardingSchema),
        defaultValues: {
            industry: industryId,
            subIndustry: initialSubIndustry,
            experience: initialData?.experience?.toString() || "",
            bio: initialData?.bio || "",
            skills: initialData?.skills?.join(", ") || "",
            country: initialData?.country || "",
            city: initialData?.city || "",
        },
    });

    // Reset form whenever edit mode opens to ensure dropdowns reflect the latest initialData
    useEffect(() => {
        if (isEditMode) {
            const { industryId: id, subIndustry: sub, industryObj: ind } = getInitialIndustryState();
            setSelectedIndustry(ind || null);
            reset({
                industry: id,
                subIndustry: sub,
                experience: initialData?.experience?.toString() || "",
                bio: initialData?.bio || "",
                skills: initialData?.skills?.join(", ") || "",
                country: initialData?.country || "",
                city: initialData?.city || "",
            });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isEditMode]);

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
            <div className="w-full px-4 sm:px-0">
                {/* Header Section: Zero Background, Pure Typography & Iconography */}
                <div className="flex flex-col md:flex-row items-center justify-between gap-8 mb-16 px-2">
                    <div className="flex flex-col md:flex-row items-center gap-8 group">
                        <div className="relative">
                            <div className="h-24 w-24 sm:h-32 sm:w-32 bg-primary text-primary-foreground rounded-[2rem] flex items-center justify-center text-4xl sm:text-5xl font-black shadow-lg rotate-6 group-hover:rotate-0 transition-all duration-500 ease-out">
                                {initialData?.name?.charAt(0) || "U"}
                            </div>
                            <div className="absolute -bottom-2 -right-2 h-10 w-10 bg-white rounded-full border-4 border-primary flex items-center justify-center shadow-lg transition-transform group-hover:scale-110">
                                <Wand2 className="h-5 w-5 text-primary" />
                            </div>
                        </div>
                        <div className="text-center md:text-left space-y-1">
                            <h1 className="text-4xl sm:text-6xl font-black tracking-tighter text-foreground leading-none">
                                {initialData?.name || "Professional"}
                            </h1>
                            <p className="text-lg sm:text-xl text-primary font-bold tracking-tight">
                                {initialData?.email}
                            </p>
                        </div>
                    </div>
                    <Button
                        variant="ghost"
                        size="lg"
                        onClick={() => setIsEditMode(true)}
                        className="text-primary font-black text-xl hover:bg-primary/5 rounded-none border-b-4 border-primary px-0 pb-1 h-auto"
                    >
                        EDIT PROFILE
                    </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-16 px-2">
                    {/* Primary Content Column */}
                    <div className="md:col-span-2 space-y-16">
                        {/* Summary Section: Pure Text focus */}
                        <section className="relative">
                            <div className="flex items-center gap-4 mb-6">
                                <h2 className="text-2xl font-black tracking-tight text-foreground border-l-4 border-primary pl-4">Professional Narrative</h2>
                            </div>
                            <p className="text-xl sm:text-2xl leading-relaxed text-muted-foreground font-medium italic pl-4">
                                {initialData?.bio || "No summary provided."}
                            </p>
                        </section>

                        {/* Skills Section */}
                        <section className="space-y-8">
                            <h2 className="text-2xl font-black tracking-tight text-foreground flex items-center gap-4">
                                <div className="h-2 w-12 bg-primary" />
                                Core Capabilities
                            </h2>
                            <div className="flex flex-wrap gap-4">
                                {initialData?.skills?.length > 0 ? (
                                    initialData.skills.map((skill, index) => (
                                        <Badge
                                            key={index}
                                            variant="outline"
                                            className="text-lg py-2.5 px-6 rounded-none border-2 border-primary text-primary bg-transparent font-bold uppercase tracking-widest hover:bg-primary hover:text-white transition-colors"
                                        >
                                            {skill}
                                        </Badge>
                                    ))
                                ) : (
                                    <p className="text-muted-foreground italic">No skills added yet.</p>
                                )}
                            </div>
                        </section>
                    </div>

                    {/* Metadata Column: Colored Text and Accents, No BG Pills */}
                    <div className="md:border-l-4 md:border-primary/10 md:pl-16 space-y-10">
                        <section className="space-y-10">
                            {[
                                { label: "Current Status", value: initialData?.userType || "Fresher", icon: <GraduationCap className="h-5 w-5 text-blue-600" />, textColor: "text-blue-600" },
                                { label: "Industry Focus", value: industryName || "—", icon: <Building2 className="h-5 w-5 text-purple-600" />, textColor: "text-purple-600" },
                                { label: "Primary Role", value: initialData?.careerAssessment?.primaryRole, icon: <Briefcase className="h-5 w-5 text-emerald-600" />, textColor: "text-emerald-600" },
                                { label: "Target Career", value: initialData?.careerAssessment?.targetRole, icon: <Wand2 className="h-5 w-5 text-amber-600" />, textColor: "text-amber-600" },
                                { label: "Experience", value: `${initialData?.experience} Years`, icon: <Briefcase className="h-5 w-5 text-rose-600" />, textColor: "text-rose-600" },
                                { label: "Location", value: initialData?.city && initialData?.country ? `${initialData.city}, ${initialData.country}` : initialData?.country || initialData?.city || "Not specified", icon: <MapPin className="h-5 w-5 text-indigo-600" />, textColor: "text-indigo-600" },
                            ].map((item, idx) => (
                                item.value && (
                                    <div key={idx} className="space-y-2 group">
                                        <div className="flex items-center gap-2">
                                            {item.icon}
                                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">{item.label}</p>
                                        </div>
                                        <p className={`text-2xl font-black leading-tight ${item.textColor} border-l-2 border-transparent group-hover:border-current pl-2 transition-all`}>
                                            {item.value}
                                        </p>
                                        {idx === 1 && subIndustryName && (
                                            <p className="text-sm font-bold text-muted-foreground/50 mt-1 uppercase tracking-wider ml-2">{subIndustryName}</p>
                                        )}
                                    </div>
                                )
                            ))}
                        </section>
                    </div>
                </div>
            </div>
        );
    }

    // Edit Mode
    return (
        <div className="w-full px-4 sm:px-0">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-12">
                <div className="space-y-1">
                    <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-foreground">
                        Edit Profile
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        All fields are required to give you the most accurate career guidance.
                    </p>
                </div>
                <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setIsEditMode(false)}
                    className="text-muted-foreground hover:text-foreground font-semibold"
                >
                    Cancel
                </Button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-12">
                {/* Section: Professional Details */}
                <section className="space-y-6">
                    <div className="flex items-center gap-3 mb-2">
                        <Briefcase className="h-5 w-5 text-primary" />
                        <h2 className="text-lg font-bold tracking-tight text-foreground">Professional Details</h2>
                    </div>
                    <div className="border-t border-border/60" />

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
                </section>

                {/* Section: Location */}
                <section className="space-y-6">
                    <div className="flex items-center gap-3 mb-2">
                        <MapPin className="h-5 w-5 text-primary" />
                        <h2 className="text-lg font-bold tracking-tight text-foreground">Location</h2>
                    </div>
                    <div className="border-t border-border/60" />

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
                </section>

                {/* Section: Skills & Bio */}
                <section className="space-y-6">
                    <div className="flex items-center gap-3 mb-2">
                        <Wand2 className="h-5 w-5 text-primary" />
                        <h2 className="text-lg font-bold tracking-tight text-foreground">Summary & Skills</h2>
                    </div>
                    <div className="border-t border-border/60" />

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
                </section>

                {/* Actions */}
                <div className="flex gap-4 pt-4">
                    <Button type="button" variant="outline" onClick={() => setIsEditMode(false)} className="flex-1 sm:flex-none sm:min-w-[120px]">
                        Cancel
                    </Button>
                    <Button type="submit" className="flex-1 sm:flex-none sm:min-w-[160px]" disabled={updateLoading}>
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
        </div>
    );
};

export default ProfileForm;
