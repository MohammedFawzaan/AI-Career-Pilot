import { redirect } from "next/navigation";
import { getUser } from "@/actions/user";
import { fetchInternships, fetchCertificates } from "@/actions/internships";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Briefcase, Award, ExternalLink, MapPin, Building2, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default async function InternshipsPage() {
    const user = await getUser();
    if (!user) redirect("/sign-in");

    if (!user.userType) {
        redirect("/onboarding/selection");
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
        <main className="container mx-auto px-4 py-8 max-w-6xl">
            <div className="space-y-6 text-center mb-10">
                <h1 className="gradient-title text-4xl md:text-5xl font-bold">
                    Internships & Certifications
                </h1>
                <p className="text-muted-foreground text-lg mx-auto max-w-2xl">
                    Discover live internship opportunities and must-do certifications tailored to your career path.
                </p>
            </div>

            {error && (
                <Card className="border-red-200 bg-red-50 mb-6">
                    <CardContent className="pt-6">
                        <p className="text-red-700">{error}</p>
                    </CardContent>
                </Card>
            )}

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
                        <Card>
                            <CardContent className="pt-6 text-center">
                                <Briefcase className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                                <p className="text-muted-foreground">
                                    No internships found. Please complete your career assessment, if completed select a role to get personalized recommendations.
                                </p>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="space-y-8">
                            {/* Local Internships Section */}
                            {localInternships.length > 0 && (
                                <div>
                                    <div className="mb-4">
                                        <h2 className="text-2xl font-bold flex items-center gap-2">
                                            <MapPin className="h-6 w-6 text-blue-500" />
                                            Local Opportunities
                                            {userLocation && (
                                                <span className="text-lg font-normal text-muted-foreground">
                                                    in {[userLocation.city, userLocation.country].filter(Boolean).join(", ")}
                                                </span>
                                            )}
                                        </h2>
                                        <p className="text-sm text-muted-foreground mt-1">
                                            Internships near your location
                                        </p>
                                    </div>
                                    <div className="grid gap-4">
                                        {localInternships.map((internship) => (
                                            <Card key={internship.id} className="hover:shadow-md transition-shadow">
                                                <CardHeader>
                                                    <div className="flex items-start justify-between">
                                                        <div className="flex-1">
                                                            <CardTitle className="text-xl">{internship.title}</CardTitle>
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
                                                            <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                                                                {internship.employmentType}
                                                            </span>
                                                        )}
                                                    </div>
                                                </CardHeader>
                                                <CardContent>
                                                    <p className="text-sm text-muted-foreground mb-4">
                                                        {internship.description}
                                                    </p>
                                                    <div className="flex items-center justify-between">
                                                        {internship.postedDate && (
                                                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                                                                <Calendar className="h-3 w-3" />
                                                                {new Date(internship.postedDate).toLocaleDateString()}
                                                            </span>
                                                        )}
                                                        <Button asChild>
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
                                </div>
                            )}

                            {/* Remote Internships Section */}
                            {remoteInternships.length > 0 && (
                                <div>
                                    <div className="mb-4">
                                        <h2 className="text-2xl font-bold flex items-center gap-2">
                                            <Briefcase className="h-6 w-6 text-green-500" />
                                            Remote Opportunities
                                        </h2>
                                        <p className="text-sm text-muted-foreground mt-1">
                                            Work from anywhere internships
                                        </p>
                                    </div>
                                    <div className="grid gap-4">
                                        {remoteInternships.map((internship) => (
                                            <Card key={internship.id} className="hover:shadow-md transition-shadow border-green-200">
                                                <CardHeader>
                                                    <div className="flex items-start justify-between">
                                                        <div className="flex-1">
                                                            <CardTitle className="text-xl flex items-center gap-2">
                                                                {internship.title}
                                                                <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs">
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
                                                            <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                                                                {internship.employmentType}
                                                            </span>
                                                        )}
                                                    </div>
                                                </CardHeader>
                                                <CardContent>
                                                    <p className="text-sm text-muted-foreground mb-4">
                                                        {internship.description}
                                                    </p>
                                                    <div className="flex items-center justify-between">
                                                        {internship.postedDate && (
                                                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                                                                <Calendar className="h-3 w-3" />
                                                                {new Date(internship.postedDate).toLocaleDateString()}
                                                            </span>
                                                        )}
                                                        <Button asChild>
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
                                </div>
                            )}

                            {/* No location message */}
                            {!userLocation && remoteInternships.length > 0 && (
                                <Card className="bg-blue-50 border-blue-200">
                                    <CardContent className="pt-6">
                                        <p className="text-sm text-blue-700">
                                            💡 <strong>Tip:</strong> Add your location in your{" "}
                                            <Link href="/profile" className="underline font-semibold">
                                                profile settings
                                            </Link>{" "}
                                            to see local internship opportunities in your area!
                                        </p>
                                    </CardContent>
                                </Card>
                            )}
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
    );
}
