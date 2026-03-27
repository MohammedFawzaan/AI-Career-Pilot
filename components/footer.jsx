import Link from "next/link";
import Image from "next/image";
import { Mail, Github, Linkedin } from "lucide-react";

export default function Footer() {
    return (
        <footer className="w-full border-t border-border bg-background">
            <div className="container mx-auto px-4 md:px-6 py-10">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
                    {/* Brand */}
                    <div className="flex flex-col gap-3">
                        <Link href="/" className="flex items-center gap-2">
                            <Image src="/logo.png" alt="AI Career Pilot" width={28} height={28} className="object-contain" />
                            <span className="font-bold text-lg">AI Career Pilot</span>
                        </Link>
                        <p className="text-sm text-muted-foreground max-w-xs">
                            Empowering the next generation with AI-driven career intelligence.
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div className="flex flex-col gap-3">
                        <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">Platform</h3>
                        <nav className="flex flex-col gap-2 text-sm">
                            <Link href="/dashboard" className="text-foreground/70 hover:text-foreground transition-colors">Dashboard</Link>
                            <Link href="/onboarding/career-path" className="text-foreground/70 hover:text-foreground transition-colors">Career Blueprint</Link>
                            <Link href="/internships" className="text-foreground/70 hover:text-foreground transition-colors">Internships</Link>
                            <Link href="/interview/mock" className="text-foreground/70 hover:text-foreground transition-colors">Mock Interview</Link>
                        </nav>
                    </div>

                    {/* Contact */}
                    <div className="flex flex-col gap-3">
                        <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">Contact Support</h3>
                        <a
                            href="mailto:fawzaanmd31@gmail.com"
                            className="flex items-center gap-2 text-sm text-foreground/70 hover:text-foreground transition-colors"
                        >
                            <Mail className="h-4 w-4 shrink-0" />
                            fawzaanmd31@gmail.com
                        </a>
                        <div className="flex gap-3 mt-1">
                            <a href="https://github.com/MohammedFawzaan" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground transition-colors">
                                <Github className="h-5 w-5" />
                            </a>
                            <a href="https://www.linkedin.com/in/mohammed-fawzaan-702958257/" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground transition-colors">
                                <Linkedin className="h-5 w-5" />
                            </a>
                        </div>
                    </div>
                </div>

                <div className="mt-10 pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-muted-foreground">
                    <p>© {new Date().getFullYear()} AI Career Pilot. All rights reserved.</p>
                    <p>Made with 💗 by Mohammed Fawzaan &amp; Team</p>
                </div>
            </div>
        </footer>
    );
}
