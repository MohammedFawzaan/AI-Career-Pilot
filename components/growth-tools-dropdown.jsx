"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  PenBox,
  FileText,
  GraduationCap,
  ChevronDown,
  StarsIcon,
  User,
  Target,
  Briefcase,
  MapIcon,
  Loader2,
} from "lucide-react";

const tools = [
  { href: "/profile", label: "My Profile", icon: User },
  { href: "/onboarding/career-path", label: "Career Path", icon: Target },
  { href: "/internships", label: "Internships & Certificates", icon: Briefcase },
  { href: "/roadmap", label: "Career Roadmap", icon: MapIcon },
  { href: "/resume", label: "Build Resume", icon: FileText },
  { href: "/ai-cover-letter", label: "Cover Letter", icon: PenBox },
  { href: "/interview", label: "Interview Prep", icon: GraduationCap },
];

export function GrowthToolsDropdown() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [loadingItem, setLoadingItem] = useState(null);

  useEffect(() => {
    // Clear the loading state when the route successfully changes
    setLoadingItem(null);
  }, [pathname, searchParams]);

  const handleNavigation = (href) => {
    // Only set loading if we aren't already loading something
    if (loadingItem) return;
    setLoadingItem(href);
    router.push(href);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button className="flex items-center gap-2 cursor-pointer" disabled={!!loadingItem}>
          {loadingItem ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <StarsIcon className="h-4 w-4" />
          )}
          <span className="hidden md:block">
            Growth Tools
          </span>
          <ChevronDown className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {tools.map((tool) => (
          <DropdownMenuItem
            key={tool.href}
            onClick={() => handleNavigation(tool.href)}
            className="flex items-center gap-2 cursor-pointer data-[disabled]:opacity-50"
            disabled={!!loadingItem}
          >
            {loadingItem === tool.href ? (
              <Loader2 className="h-4 w-4 animate-spin text-primary" />
            ) : (
              <tool.icon className="h-4 w-4" />
            )}
            {tool.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
