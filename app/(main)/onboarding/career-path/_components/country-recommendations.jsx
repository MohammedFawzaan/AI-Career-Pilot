"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Globe, TrendingUp, TrendingDown, Minus } from "lucide-react";

export default function CountryRecommendations({ countries }) {
    if (!countries || countries.length === 0) {
        return null;
    }

    const getDemandIcon = (demandLevel) => {
        switch (demandLevel) {
            case "High":
                return <TrendingUp className="h-4 w-4 text-green-500" />;
            case "Medium":
                return <Minus className="h-4 w-4 text-yellow-500" />;
            case "Low":
                return <TrendingDown className="h-4 w-4 text-orange-500" />;
            default:
                return <Minus className="h-4 w-4 text-gray-500" />;
        }
    };

    const getDemandColor = (demandLevel) => {
        switch (demandLevel) {
            case "High":
                return "bg-green-100 text-green-700 border-green-300";
            case "Medium":
                return "bg-yellow-100 text-yellow-700 border-yellow-300";
            case "Low":
                return "bg-orange-100 text-orange-700 border-orange-300";
            default:
                return "bg-gray-100 text-gray-700 border-gray-300";
        }
    };

    return (
        <Card className="col-span-full">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Globe className="h-5 w-5 text-blue-500" />
                    Top Countries for Your Career Path
                </CardTitle>
                <CardDescription>
                    Countries with high demand for your recommended roles
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {countries.map((country, index) => (
                        <div
                            key={index}
                            className="p-4 border rounded-lg hover:shadow-md transition-shadow"
                        >
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="font-semibold text-lg">{country.country}</h3>
                                <div className={`flex items-center gap-1 px-2 py-1 rounded-full border ${getDemandColor(country.demandLevel)}`}>
                                    {getDemandIcon(country.demandLevel)}
                                    <span className="text-xs font-medium">{country.demandLevel}</span>
                                </div>
                            </div>
                            <p className="text-sm text-muted-foreground">{country.reason}</p>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
