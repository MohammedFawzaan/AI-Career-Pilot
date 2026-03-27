import { redirect } from "next/navigation";
import { getUser } from "@/actions/user";
import { fetchInternships, fetchCertificates } from "@/actions/internships";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Briefcase, Award, ExternalLink, MapPin, Building2, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Footer from "@/components/footer";

export default async function InternshipsPage() {
    const user = await getUser();
    if (!user) redirect("/sign-in");

    // Unified Onboarding Guard System
    if (!user.userType) {
        redirect("/onboarding/selection");
    }

    // If assessment isn't done, force them back
    if (!user.careerAssessment) {
        if (user.userType === "EXPERIENCED") {
            redirect("/onboarding/resume-upload");
        } else {
            redirect("/onboarding/assessment");
        }
    }

    // Must have industry to see internships
    if (!user.industry) {
        redirect("/onboarding");
    }

    let internshipsData = { local: [], remote: [], userLocation: null };
    let certificates = [];
    let error = null;

    try {
        [internshipsData, certificates] = await Promise.all([
            fetchInternships(),
            fetchCertificates(),
        ]);
    } catch (err) {
        error = err.message;
    }

    const { local: localInternships, remote: remoteInternships, userLocation } = internshipsData;
    const hasInternships = localInternships.length > 0 || remoteInternships.length > 0;

    return (
        <>
            <main className="container mx-auto px-4 py-8 max-w-6xl">
                <div className="space-y-6 text-center mb-10">
                    <h1 className="gradient-title text-4xl md:text-5xl font-bold">
                        Internships & Certifications
                    </h1>
                    <p className="text-muted-foreground text-lg mx-auto max-w-2xl">
                        Discover live internship opportunities and must-do certifications tailored to your career path.
                    </p>
                </div>

                {error && (() => {
                    const isApiError = error.includes("429") || error.includes("402") || error.includes("quota") || error.includes("key") || error.includes("RAPIDAPI") || error.includes("fetch");
                    return isApiError ? (
                        <Card className="border-orange-200 bg-orange-50 mb-6">
                            <CardContent className="pt-6 flex items-start gap-4">
                                <Briefcase className="h-6 w-6 text-orange-500 shrink-0 mt-0.5" />
                                <div>
                                    <p className="font-semibold text-orange-800">Internship Search Temporarily Unavailable</p>
                                    <p className="text-orange-700 text-sm mt-1">
                                        The live job search API is currently at capacity or unavailable. Please try again later. Your certifications and career path are still accessible below.
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    ) : (
                        <Card className="border-red-200 bg-red-50 mb-6">
                            <CardContent className="pt-6">
                                <p className="text-red-700">{error}</p>
                            </CardContent>
                        </Card>
                    );
                })()}

                <Tabs defaultValue="internships" className="w-full">
                    <TabsList className="grid w-full max-w-md mx-auto grid-cols-2">
                        <TabsTrigger value="internships">
                            <Briefcase className="h-4 w-4 mr-2" />
                            Internships
                        </TabsTrigger>
                        <TabsTrigger value="certificates">
                            <Award className="h-4 w-4 mr-2" />
                            Certifications
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="internships" className="mt-6">
                        {!hasInternships ? (
                            <Card className="border-dashed">
                                <CardContent className="pt-10 pb-10 text-center">
                                    <Briefcase className="h-12 w-12 mx-auto text-muted-foreground mb-4 opacity-20" />
                                    <h3 className="text-xl font-bold text-foreground mb-2">No Internships Found</h3>
                                    <p className="text-muted-foreground max-w-sm mx-auto">
                                        We couldn't find any live opportunities for <strong>{user?.careerAssessment?.primaryRole || "your industry"}</strong> at this moment.
                                        Try broadening your profile skills or checking back later.
                                    </p>
                                    <div className="mt-6">
                                        <Link href="/onboarding/selection">
                                            <Button variant="outline">Update Career Interests</Button>
                                        </Link>
                                    </div>
                                </CardContent>
                            </Card>
                        ) : (
                            <div className="space-y-12">
                                {/* Recognition of the Fetching Basis */}
                                <div className="flex items-center gap-2 bg-primary/5 border border-primary/10 px-4 py-2 rounded-full w-fit mx-auto md:mx-0">
                                    <span className="relative flex h-2 w-2">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                                    </span>
                                    <span className="text-sm font-bold text-primary">
                                        Recommendations based on your Targeted Role: {user?.careerAssessment?.primaryRole || user?.industry || "Technical Industry"}
                                    </span>
                                </div>

                                {/* Local Internships Section */}
                                <div className="space-y-4">
                                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-2 border-b pb-4">
                                        <div>
                                            <h2 className="text-2xl font-bold flex items-center gap-2 tracking-tight">
                                                <MapPin className="h-6 w-6 text-blue-500" />
                                                Local Opportunities
                                                {userLocation && (
                                                    <span className="text-lg font-normal text-muted-foreground hidden sm:inline">
                                                        — {[userLocation.city, userLocation.country].filter(Boolean).join(", ")}
                                                    </span>
                                                )}
                                            </h2>
                                            <p className="text-sm text-muted-foreground mt-1">
                                                Internships within commuting distance of your base location
                                            </p>
                                        </div>
                                    </div>

                                    {localInternships.length > 0 ? (
                                        <div className="grid gap-4">
                                            {localInternships.map((internship) => (
                                                <Card key={internship.id} className="hover:shadow-md transition-shadow group">
                                                    <CardHeader>
                                                        <div className="flex items-start justify-between">
                                                            <div className="flex-1">
                                                                <CardTitle className="text-xl group-hover:text-primary transition-colors">{internship.title}</CardTitle>
                                                                <CardDescription className="flex items-center gap-4 mt-2">
                                                                    <span className="flex items-center gap-1">
                                                                        <Building2 className="h-4 w-4" />
                                                                        {internship.company}
                                                                    </span>
                                                                    <span className="flex items-center gap-1">
                                                                        <MapPin className="h-4 w-4" />
                                                                        {internship.location}
                                                                    </span>
                                                                </CardDescription>
                                                            </div>
                                                            {internship.employmentType && (
                                                                <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold uppercase tracking-wider">
                                                                    {internship.employmentType}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </CardHeader>
                                                    <CardContent>
                                                        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                                                            {internship.description}
                                                        </p>
                                                        <div className="flex items-center justify-between">
                                                            {internship.postedDate && (
                                                                <span className="text-xs text-muted-foreground flex items-center gap-1">
                                                                    <Calendar className="h-3 w-3" />
                                                                    Posted {new Date(internship.postedDate).toLocaleDateString()}
                                                                </span>
                                                            )}
                                                            <Button asChild size="sm">
                                                                <a href={internship.applyLink} target="_blank" rel="noopener noreferrer">
                                                                    Apply Now
                                                                    <ExternalLink className="ml-2 h-4 w-4" />
                                                                </a>
                                                            </Button>
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="p-8 border-2 border-dashed rounded-xl bg-muted/20 text-center">
                                            <MapPin className="h-8 w-8 mx-auto text-muted-foreground mb-2 opacity-30" />
                                            <p className="text-muted-foreground font-medium">No local opportunities found for this field.</p>
                                            {!userLocation && (
                                                <p className="text-xs text-muted-foreground mt-1">
                                                    Add your city and country in your <Link href="/profile" className="text-primary underline">profile</Link> to see internships in your area.
                                                </p>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* Remote Internships Section */}
                                <div className="space-y-4">
                                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-2 border-b pb-4">
                                        <div>
                                            <h2 className="text-2xl font-bold flex items-center gap-2 tracking-tight">
                                                <Briefcase className="h-6 w-6 text-green-500" />
                                                Remote Opportunities
                                            </h2>
                                            <p className="text-sm text-muted-foreground mt-1">
                                                Work-from-anywhere roles compatible with global timezones
                                            </p>
                                        </div>
                                    </div>

                                    {remoteInternships.length > 0 ? (
                                        <div className="grid gap-4">
                                            {remoteInternships.map((internship) => (
                                                <Card key={internship.id} className="hover:shadow-md transition-shadow group border-l-4 border-l-green-500">
                                                    <CardHeader>
                                                        <div className="flex items-start justify-between">
                                                            <div className="flex-1">
                                                                <CardTitle className="text-xl flex items-center gap-2 group-hover:text-green-600 transition-colors">
                                                                    {internship.title}
                                                                    <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded text-[10px] font-black uppercase tracking-tight">
                                                                        Remote
                                                                    </span>
                                                                </CardTitle>
                                                                <CardDescription className="flex items-center gap-4 mt-2">
                                                                    <span className="flex items-center gap-1">
                                                                        <Building2 className="h-4 w-4" />
                                                                        {internship.company}
                                                                    </span>
                                                                </CardDescription>
                                                            </div>
                                                            {internship.employmentType && (
                                                                <span className="px-3 py-1 bg-green-50 text-green-700 rounded-full text-xs font-bold uppercase tracking-wider border border-green-200">
                                                                    {internship.employmentType}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </CardHeader>
                                                    <CardContent>
                                                        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                                                            {internship.description}
                                                        </p>
                                                        <div className="flex items-center justify-between">
                                                            {internship.postedDate && (
                                                                <span className="text-xs text-muted-foreground flex items-center gap-1">
                                                                    <Calendar className="h-3 w-3" />
                                                                    Posted {new Date(internship.postedDate).toLocaleDateString()}
                                                                </span>
                                                            )}
                                                            <Button asChild size="sm" className="bg-green-600 hover:bg-green-700">
                                                                <a href={internship.applyLink} target="_blank" rel="noopener noreferrer">
                                                                    Apply Now
                                                                    <ExternalLink className="ml-2 h-4 w-4" />
                                                                </a>
                                                            </Button>
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="p-8 border-2 border-dashed rounded-xl bg-muted/20 text-center">
                                            <Briefcase className="h-8 w-8 mx-auto text-muted-foreground mb-2 opacity-30" />
                                            <p className="text-muted-foreground font-medium">No remote opportunities available for this field.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </TabsContent>

                    <TabsContent value="certificates" className="mt-6">
                        {certificates.length === 0 ? (
                            <Card>
                                <CardContent className="pt-6 text-center">
                                    <Award className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                                    <p className="text-muted-foreground">
                                        No certifications found. Please complete your career assessment, if completed select a role to get personalized recommendations.
                                    </p>
                                </CardContent>
                            </Card>
                        ) : (
                            <div className="grid md:grid-cols-2 gap-4">
                                {certificates.map((cert) => (
                                    <Card key={cert.id} className="hover:shadow-md transition-shadow">
                                        <CardHeader>
                                            <CardTitle className="text-lg">{cert.title}</CardTitle>
                                            <CardDescription className="flex items-center gap-2">
                                                <Building2 className="h-4 w-4" />
                                                {cert.provider}
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            {cert.skill && (
                                                <div className="mb-3">
                                                    <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs">
                                                        {cert.skill}
                                                    </span>
                                                </div>
                                            )}
                                            <p className="text-sm text-muted-foreground mb-4">
                                                {cert.description}
                                            </p>
                                            <Button asChild variant="outline" className="w-full">
                                                <a href={cert.link} target="_blank" rel="noopener noreferrer">
                                                    View Course
                                                    <ExternalLink className="ml-2 h-4 w-4" />
                                                </a>
                                            </Button>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </TabsContent>
                </Tabs>
            </main>
            <Footer />
        </>
    );
}
