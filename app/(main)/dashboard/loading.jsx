import { BarChart3, Loader2 } from "lucide-react";

export default function Loading() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] space-y-4">
            <div className="relative">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
                <BarChart3 className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-6 w-6 text-muted-foreground animate-pulse" />
            </div>
            <p className="text-xl font-medium text-muted-foreground animate-pulse">
                Generating your dashboard insights...
            </p>
        </div>
    );
}
