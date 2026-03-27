"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, RefreshCw } from "lucide-react";
import { generateRoadmap } from "@/actions/roadmap";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function DurationSelector({ currentDuration }) {
    const [duration, setDuration] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleGenerate = async () => {
        const selected = duration || currentDuration;
        if (!selected) {
            toast.error("Please select a duration first.");
            return;
        }
        setLoading(true);
        try {
            await generateRoadmap(parseInt(selected));
            toast.success(currentDuration ? "Roadmap regenerated!" : "Roadmap generated successfully!");
            router.refresh();
        } catch (error) {
            toast.error(error.message || "Failed to generate roadmap");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col min-[375px]:flex-row gap-3 items-start min-[375px]:items-center">
            <Select value={duration} onValueChange={setDuration}>
                <SelectTrigger className="w-full min-[375px]:w-[160px]">
                    <SelectValue placeholder="Select duration" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="3">3 Months</SelectItem>
                    <SelectItem value="6">6 Months</SelectItem>
                    <SelectItem value="12">12 Months</SelectItem>
                </SelectContent>
            </Select>
            <Button onClick={handleGenerate} disabled={loading} className="w-full min-[375px]:w-auto">
                {loading ? (
                    <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Generating...
                    </>
                ) : (
                    <>
                        <RefreshCw className="mr-2 h-4 w-4" />
                        {currentDuration ? "Regenerate" : "Generate Roadmap"}
                    </>
                )}
            </Button>
        </div>
    );
}
