"use client";

import { useState } from "react";
import { Button } from "./ui/button";
import { ArrowRight, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

export function CTAButton() {
    const [isNavigating, setIsNavigating] = useState(false);
    const router = useRouter();

    const handleCTA = () => {
        setIsNavigating(true);
        router.push("/onboarding");
    };

    return (
        <Button
            size="lg"
            className="bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/25 px-8 py-6 text-base font-bold animate-bounce"
            onClick={handleCTA}
            disabled={isNavigating}
        >
            {isNavigating ? (
                <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Preparing Your Flight...
                </>
            ) : (
                <>
                    Now <ArrowRight className="ml-2 h-4 w-4" />
                </>
            )}
        </Button>
    );
}
