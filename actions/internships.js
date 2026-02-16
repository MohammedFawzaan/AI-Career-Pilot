"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { unstable_cache } from "next/cache";

const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY;
const RAPIDAPI_HOST = "jsearch.p.rapidapi.com";

// Cache internships for 1 hour to reduce API calls
const getCachedInternships = unstable_cache(
    async (userId, primaryRole, city, country) => {
        const hasLocation = country && city;

        // Make API calls in parallel for faster loading
        const [localResults, remoteResults] = await Promise.all([
            // Fetch local internships if user has location
            hasLocation ? (async () => {
                const locationQuery = [primaryRole, "internship", city, country]
                    .filter(Boolean)
                    .join(" ");

                const localUrl = `https://${RAPIDAPI_HOST}/search?query=${encodeURIComponent(locationQuery)}&page=1&num_pages=1&date_posted=month`;

                try {
                    const localResponse = await fetch(localUrl, {
                        method: "GET",
                        headers: {
                            "X-RapidAPI-Key": RAPIDAPI_KEY,
                            "X-RapidAPI-Host": RAPIDAPI_HOST,
                        },
                    });

                    if (localResponse.ok) {
                        const localData = await localResponse.json();
                        return (localData?.data || [])
                            .filter(job => {
                                const title = job.job_title?.toLowerCase() || "";
                                const description = job.job_description?.toLowerCase() || "";
                                return (
                                    title.includes("intern") ||
                                    title.includes("entry") ||
                                    title.includes("fresher") ||
                                    title.includes("junior") ||
                                    title.includes("graduate") ||
                                    description.includes("internship")
                                );
                            })
                            .map(job => ({
                                id: job.job_id,
                                title: job.job_title,
                                company: job.employer_name,
                                location: job.job_city && job.job_country
                                    ? `${job.job_city}, ${job.job_country}`
                                    : job.job_country || "Remote",
                                description: job.job_description?.substring(0, 200) + "..." || "No description available",
                                applyLink: job.job_apply_link,
                                postedDate: job.job_posted_at_datetime_utc,
                                employmentType: job.job_employment_type,
                                isRemote: false,
                            }));
                    }
                } catch (error) {
                    console.error("Error fetching local internships:", error);
                }
                return [];
            })() : Promise.resolve([]),

            // Fetch remote internships
            (async () => {
                const remoteUrl = `https://${RAPIDAPI_HOST}/search?query=${encodeURIComponent(primaryRole + " remote internship")}&page=1&num_pages=1&date_posted=month`;

                try {
                    const remoteResponse = await fetch(remoteUrl, {
                        method: "GET",
                        headers: {
                            "X-RapidAPI-Key": RAPIDAPI_KEY,
                            "X-RapidAPI-Host": RAPIDAPI_HOST,
                        },
                    });

                    if (remoteResponse.ok) {
                        const remoteData = await remoteResponse.json();
                        return (remoteData?.data || [])
                            .filter(job => {
                                const title = job.job_title?.toLowerCase() || "";
                                const description = job.job_description?.toLowerCase() || "";
                                return (
                                    (title.includes("intern") ||
                                        title.includes("entry") ||
                                        title.includes("fresher") ||
                                        title.includes("junior") ||
                                        title.includes("graduate") ||
                                        description.includes("internship")) &&
                                    (title.includes("remote") || description.includes("remote"))
                                );
                            })
                            .map(job => ({
                                id: job.job_id,
                                title: job.job_title,
                                company: job.employer_name,
                                location: "Remote",
                                description: job.job_description?.substring(0, 200) + "..." || "No description available",
                                applyLink: job.job_apply_link,
                                postedDate: job.job_posted_at_datetime_utc,
                                employmentType: job.job_employment_type,
                                isRemote: true,
                            }));
                    }
                } catch (error) {
                    console.error("Error fetching remote internships:", error);
                }
                return [];
            })()
        ]);

        // Return combined results
        return {
            local: localResults,
            remote: remoteResults,
            userLocation: hasLocation ? { city, country } : null,
        };
    },
    ["internships"],
    {
        revalidate: 3600, // Cache for 1 hour (3600 seconds)
        tags: ["internships"],
    }
);

export async function fetchInternships() {
    try {
        const { userId } = await auth();
        if (!userId) throw new Error("Unauthorized");

        const user = await db.user.findUnique({
            where: { clerkUserId: userId },
            include: { careerAssessment: true },
        });

        if (!user) throw new Error("User not found");

        if (!user.careerAssessment) {
            throw new Error("Please complete your career assessment first");
        }

        if (!user.careerAssessment.primaryRole) {
            throw new Error("Please select a role from your assessment results before viewing internships");
        }

        const primaryRole = user.careerAssessment.primaryRole;

        // Use cached function
        return await getCachedInternships(
            userId,
            primaryRole,
            user.city || null,
            user.country || null
        );
    } catch (error) {
        console.error("Error fetching internships:", error);
        throw new Error("Failed to fetch internships: " + error.message);
    }
}

export async function fetchCertificates() {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    try {
        // Get user's career assessment to find recommendedSkills
        const user = await db.user.findUnique({
            where: { clerkUserId: userId },
            include: {
                careerAssessment: true,
            },
        });

        if (!user?.careerAssessment?.analysis?.recommendedSkills) {
            throw new Error("Please complete your career assessment first");
        }

        const recommendedSkills = user.careerAssessment.analysis.recommendedSkills;

        // Take first 2-3 skills to avoid too many API calls
        const topSkills = recommendedSkills.slice(0, 2);

        const allCertificates = [];

        // Fetch certificates for each skill
        for (const skill of topSkills) {
            const url = `https://${RAPIDAPI_HOST}/search?query=${encodeURIComponent(skill + " certification course")}&page=1&num_pages=1`;

            const response = await fetch(url, {
                method: "GET",
                headers: {
                    "X-RapidAPI-Key": RAPIDAPI_KEY,
                    "X-RapidAPI-Host": RAPIDAPI_HOST,
                },
            });

            if (response.ok) {
                const data = await response.json();

                // Filter for certification/course related positions
                const certs = (data.data || [])
                    .filter(job => {
                        const title = job.job_title?.toLowerCase() || "";
                        const description = job.job_description?.toLowerCase() || "";
                        return (
                            title.includes("certif") ||
                            title.includes("course") ||
                            title.includes("training") ||
                            description.includes("certification") ||
                            description.includes("course")
                        );
                    })
                    .slice(0, 3) // Limit per skill
                    .map(job => ({
                        id: job.job_id,
                        title: job.job_title,
                        provider: job.employer_name,
                        skill: skill,
                        description: job.job_description?.substring(0, 200) + "..." || "No description available",
                        link: job.job_apply_link,
                    }));

                allCertificates.push(...certs);
            }
        }

        // If no results from job search, return popular certifications as fallback
        if (allCertificates.length === 0) {
            return getPopularCertifications(recommendedSkills);
        }

        return allCertificates.slice(0, 10); // Limit total results
    } catch (error) {
        console.error("Error fetching certificates:", error);
        // Return popular certifications as fallback
        const user = await db.user.findUnique({
            where: { clerkUserId: userId },
            include: { careerAssessment: true },
        });
        return getPopularCertifications(user?.careerAssessment?.analysis?.recommendedSkills || []);
    }
}

// Fallback function to provide popular certifications
function getPopularCertifications(skills) {
    const certMap = {
        "JavaScript": [
            { title: "JavaScript Algorithms and Data Structures", provider: "freeCodeCamp", link: "https://www.freecodecamp.org/learn/javascript-algorithms-and-data-structures/" },
            { title: "Modern JavaScript From The Beginning", provider: "Udemy", link: "https://www.udemy.com/course/modern-javascript-from-the-beginning/" },
        ],
        "Python": [
            { title: "Python for Everybody", provider: "Coursera", link: "https://www.coursera.org/specializations/python" },
            { title: "Complete Python Bootcamp", provider: "Udemy", link: "https://www.udemy.com/course/complete-python-bootcamp/" },
        ],
        "React": [
            { title: "React - The Complete Guide", provider: "Udemy", link: "https://www.udemy.com/course/react-the-complete-guide-incl-redux/" },
            { title: "Meta Front-End Developer", provider: "Coursera", link: "https://www.coursera.org/professional-certificates/meta-front-end-developer" },
        ],
        "AWS": [
            { title: "AWS Certified Solutions Architect", provider: "AWS", link: "https://aws.amazon.com/certification/certified-solutions-architect-associate/" },
            { title: "AWS Fundamentals", provider: "Coursera", link: "https://www.coursera.org/specializations/aws-fundamentals" },
        ],
        "Data Science": [
            { title: "IBM Data Science Professional Certificate", provider: "Coursera", link: "https://www.coursera.org/professional-certificates/ibm-data-science" },
            { title: "Data Science Bootcamp", provider: "Udemy", link: "https://www.udemy.com/course/the-data-science-course-complete-data-science-bootcamp/" },
        ],
    };

    const recommendations = [];

    skills.forEach((skill, index) => {
        // Try to find exact match or partial match
        const matchingKey = Object.keys(certMap).find(key =>
            skill.toLowerCase().includes(key.toLowerCase()) ||
            key.toLowerCase().includes(skill.toLowerCase())
        );

        if (matchingKey) {
            certMap[matchingKey].forEach(cert => {
                recommendations.push({
                    id: `fallback-${index}-${cert.title}`,
                    title: cert.title,
                    provider: cert.provider,
                    skill: skill,
                    description: `Popular certification for ${skill}`,
                    link: cert.link,
                });
            });
        }
    });

    // If still no matches, provide general certifications
    if (recommendations.length === 0) {
        return [
            {
                id: "general-1",
                title: "Google IT Support Professional Certificate",
                provider: "Coursera",
                skill: "General IT",
                description: "Foundational IT skills certification",
                link: "https://www.coursera.org/professional-certificates/google-it-support",
            },
            {
                id: "general-2",
                title: "CS50's Introduction to Computer Science",
                provider: "Harvard (edX)",
                skill: "Computer Science",
                description: "Introduction to computer science and programming",
                link: "https://www.edx.org/course/introduction-computer-science-harvardx-cs50x",
            },
        ];
    }

    return recommendations.slice(0, 10);
}
