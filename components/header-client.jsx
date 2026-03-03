"use client";

import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { LayoutDashboard, Loader2 } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";

export function HeaderClient() {
    const [isNavigating, setIsNavigating] = useState(false);
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        setIsNavigating(false);
    }, [pathname]);

    const handleDashboardClick = () => {
        if (pathname === "/dashboard") return;
        setIsNavigating(true);
        router.push("/dashboard");
    };

    return (
        <>
            <Button
                variant="outline"
                className="hidden md:inline-flex items-center gap-2"
                onClick={handleDashboardClick}
                disabled={isNavigating}
            >
                {isNavigating ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                    <LayoutDashboard className="h-4 w-4" />
                )}
                Industry Insights
            </Button>
            <Button
                variant="ghost"
                className="md:hidden w-10 h-10 p-0"
                onClick={handleDashboardClick}
                disabled={isNavigating}
            >
                {isNavigating ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                    <LayoutDashboard className="h-4 w-4" />
                )}
            </Button>
        </>
    );
}
