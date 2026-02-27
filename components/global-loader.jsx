import { Loader2 } from "lucide-react";

export default function GlobalLoader() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] space-y-4">
            <div className="relative">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
            <p className="text-xl font-medium text-muted-foreground animate-pulse">
                Loading...
            </p>
        </div>
    );
}
