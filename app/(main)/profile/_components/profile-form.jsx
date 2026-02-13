"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Wand2 } from "lucide-react";
import { toast } from "sonner";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
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
        if (updateResult?.success && !updateLoading) {
            toast.success("Profile updated successfully!");
            setIsEditMode(false);
        }
    }, [updateResult, updateLoading]);

    const watchIndustry = watch("industry");

    if (!isEditMode) {
        // View Mode
        // Helper to find display names for industry
        let industryName = initialData?.industry;
        let subIndustryName = "";

        if (initialData?.industry && industries) {
            for (const ind of industries) {
                if (initialData.industry.startsWith(ind.id + "-")) {
                    industryName = ind.name;
                    // Try to match specific subindustry for better display
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
            <Card className="w-full max-w-2xl mx-auto">
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="text-3xl">My Profile</CardTitle>
                    <Button onClick={() => setIsEditMode(true)}>Edit</Button>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-1">
                        <Label className="text-muted-foreground">Industry</Label>
                        <p className="text-lg font-medium">{industryName}</p>
                    </div>

                    {subIndustryName && (
                        <div className="space-y-1">
                            <Label className="text-muted-foreground">Specialization</Label>
                            <p className="text-lg font-medium">{subIndustryName}</p>
                        </div>
                    )}

                    <div className="space-y-1">
                        <Label className="text-muted-foreground">Years of Experience</Label>
                        <p className="text-lg font-medium">{initialData?.experience} years</p>
                    </div>

                    <div className="space-y-1">
                        <Label className="text-muted-foreground">Skills</Label>
                        <div className="flex flex-wrap gap-2 mt-1">
                            {initialData?.skills?.map((skill, index) => (
                                <span key={index} className="bg-secondary text-secondary-foreground px-2 py-1 rounded-md text-sm">
                                    {skill}
                                </span>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-1">
                        <Label className="text-muted-foreground">Bio</Label>
                        <p className="text-base whitespace-pre-wrap">{initialData?.bio}</p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="w-full max-w-2xl mx-auto">
            <CardHeader>
                <CardTitle>Edit Profile</CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="industry">Industry</Label>
                        <Select
                            onValueChange={(value) => {
                                setValue("industry", value);
                                setSelectedIndustry(
                                    industries.find((ind) => ind.id === value)
                                );
                                setValue("subIndustry", "");
                            }}
                            defaultValue={watchIndustry}
                        >
                            <SelectTrigger id="industry">
                                <SelectValue placeholder="Select an industry" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                    <SelectLabel>Industries</SelectLabel>
                                    {industries.map((ind) => (
                                        <SelectItem key={ind.id} value={ind.id}>
                                            {ind.name}
                                        </SelectItem>
                                    ))}
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                        {errors.industry && (
                            <p className="text-sm text-red-500">
                                {errors.industry.message}
                            </p>
                        )}
                    </div>

                    {(watchIndustry || selectedIndustry) && (
                        <div className="space-y-2">
                            <Label htmlFor="subIndustry">Specialization</Label>
                            <Select
                                onValueChange={(value) => setValue("subIndustry", value)}
                                defaultValue={watch("subIndustry")}
                            >
                                <SelectTrigger id="subIndustry">
                                    <SelectValue placeholder="Select your specialization" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectGroup>
                                        <SelectLabel>Specializations</SelectLabel>
                                        {selectedIndustry?.subIndustries.map((sub) => (
                                            <SelectItem key={sub} value={sub}>
                                                {sub}
                                            </SelectItem>
                                        ))}
                                    </SelectGroup>
                                </SelectContent>
                            </Select>
                            {errors.subIndustry && (
                                <p className="text-sm text-red-500">
                                    {errors.subIndustry.message}
                                </p>
                            )}
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
                        {errors.experience && (
                            <p className="text-sm text-red-500">
                                {errors.experience.message}
                            </p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="skills">Skills</Label>
                        <Input
                            id="skills"
                            placeholder="e.g., Python, JavaScript, Project Management"
                            {...register("skills")}
                        />
                        <p className="text-sm text-muted-foreground">
                            Separate multiple skills with commas
                        </p>
                        {errors.skills && (
                            <p className="text-sm text-red-500">{errors.skills.message}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <div className="flex justify-between items-center">
                            <Label htmlFor="bio">Professional Bio</Label>
                            <Button
                                type="button"
                                onClick={handleImproveBio}
                                disabled={isImproving || !watch("bio")}
                                variant="outline"
                                className="border-primary text-primary hover:bg-primary hover:text-primary-foreground"
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
                            placeholder="Tell us about your professional background..."
                            className="h-32"
                            {...register("bio")}
                        />
                        {errors.bio && (
                            <p className="text-sm text-red-500">{errors.bio.message}</p>
                        )}
                    </div>

                    <div className="flex gap-4">
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
                                "Save Changes"
                            )}
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
};

export default ProfileForm;
