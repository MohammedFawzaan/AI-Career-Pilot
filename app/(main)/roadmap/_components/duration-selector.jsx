"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { generateRoadmap } from "@/actions/roadmap";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function DurationSelector({ currentDuration }) {
    const [duration, setDuration] = useState(currentDuration || "3");
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleGenerate = async () => {
        setLoading(true);
        try {
            await generateRoadmap(parseInt(duration));
            toast.success("Roadmap generated successfully!");
            router.refresh();
        } catch (error) {
            toast.error(error.message || "Failed to generate roadmap");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex gap-4 items-center">
            <Select value={duration} onValueChange={setDuration}>
                <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select duration" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="3">3 Months</SelectItem>
                    <SelectItem value="6">6 Months</SelectItem>
                    <SelectItem value="12">12 Months</SelectItem>
                </SelectContent>
            </Select>
            <Button onClick={handleGenerate} disabled={loading}>
                {loading ? (
                    <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Generating...
                    </>
                ) : (
                    currentDuration ? "Regenerate" : "Generate Roadmap"
                )}
            </Button>
        </div>
    );
}
