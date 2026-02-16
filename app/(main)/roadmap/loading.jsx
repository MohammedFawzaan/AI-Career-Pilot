"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function RoadmapLoading() {
    return (
        <main className="container mx-auto px-4 py-8 max-w-6xl">
            <div className="space-y-6 text-center mb-10">
                <Skeleton className="h-12 w-80 mx-auto" />
                <Skeleton className="h-6 w-[450px] mx-auto" />
            </div>

            {/* Roadmap Basis Skeleton */}
            <Card className="mb-6 border-l-4 border-l-blue-500">
                <CardHeader className="pb-3">
                    <Skeleton className="h-6 w-64" />
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <Skeleton className="h-4 w-24 mb-1.5" />
                        <Skeleton className="h-6 w-40" />
                    </div>
                    <div>
                        <Skeleton className="h-4 w-32 mb-1.5" />
                        <div className="flex flex-wrap gap-1.5">
                            {[1, 2, 3, 4, 5, 6].map((i) => (
                                <Skeleton key={i} className="h-6 w-20" />
                            ))}
                        </div>
                    </div>
                    <div>
                        <Skeleton className="h-4 w-32 mb-1.5" />
                        <div className="flex flex-wrap gap-1.5">
                            {[1, 2, 3, 4, 5, 6].map((i) => (
                                <Skeleton key={i} className="h-6 w-20" />
                            ))}
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Roadmap Content Skeleton */}
            <Card className="max-w-2xl mx-auto">
                <CardHeader>
                    <Skeleton className="h-6 w-64 mb-2" />
                    <Skeleton className="h-4 w-96" />
                </CardHeader>
                <CardContent>
                    <Skeleton className="h-10 w-full" />
                </CardContent>
            </Card>
        </main>
    );
}
