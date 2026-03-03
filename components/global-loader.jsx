import { Loader2 } from "lucide-react";

export default function GlobalLoader({ message = "Loading..." }) {
    return (
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] space-y-4 animate-in fade-in duration-500">
            <div className="relative">
                <div className="absolute inset-0 rounded-full bg-primary/20 blur-xl animate-pulse" />
                <Loader2 className="h-12 w-12 animate-spin text-primary relative z-10" />
            </div>
            <p className="text-xl font-medium text-muted-foreground animate-pulse text-center">
                {message}
            </p>
        </div>
    );
}
