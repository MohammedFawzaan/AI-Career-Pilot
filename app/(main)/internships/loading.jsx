"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function InternshipsLoading() {
    return (
        <main className="container mx-auto px-4 py-8 max-w-6xl">
            <div className="space-y-6 text-center mb-10">
                <Skeleton className="h-12 w-96 mx-auto" />
                <Skeleton className="h-6 w-[500px] mx-auto" />
            </div>

            <div className="flex justify-center mb-6">
                <Skeleton className="h-10 w-[400px]" />
            </div>

            <div className="space-y-8">
                {/* Local Internships Skeleton */}
                <div>
                    <Skeleton className="h-8 w-64 mb-4" />
                    <div className="grid gap-4">
                        {[1, 2, 3].map((i) => (
                            <Card key={i}>
                                <CardHeader>
                                    <Skeleton className="h-6 w-3/4 mb-2" />
                                    <Skeleton className="h-4 w-1/2" />
                                </CardHeader>
                                <CardContent>
                                    <Skeleton className="h-16 w-full mb-4" />
                                    <div className="flex justify-between">
                                        <Skeleton className="h-4 w-24" />
                                        <Skeleton className="h-10 w-32" />
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>

                {/* Remote Internships Skeleton */}
                <div>
                    <Skeleton className="h-8 w-64 mb-4" />
                    <div className="grid gap-4">
                        {[1, 2].map((i) => (
                            <Card key={i}>
                                <CardHeader>
                                    <Skeleton className="h-6 w-3/4 mb-2" />
                                    <Skeleton className="h-4 w-1/2" />
                                </CardHeader>
                                <CardContent>
                                    <Skeleton className="h-16 w-full mb-4" />
                                    <div className="flex justify-between">
                                        <Skeleton className="h-4 w-24" />
                                        <Skeleton className="h-10 w-32" />
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </div>
        </main>
    );
}
