"use client"

import React from "react";
import { Button } from "./ui/button";
import Link from "next/link";
import { SignedIn, SignedOut, SignInButton, UserButton, ClerkLoading, ClerkLoaded } from "@clerk/nextjs";
import { Loader2 } from "lucide-react";
import { HeaderClient } from "./header-client";
import { GrowthToolsDropdown } from "./growth-tools-dropdown";

export default function Header() {
  return (
    <header className="fixed top-0 w-full border-b bg-background/80 backdrop-blur-md z-50 supports-[backdrop-filter]:bg-background/60">
      <nav className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center">
          <h1 className="text-2xl md:text-3xl font-bold gradient-title">
            AI Career Pilot
          </h1>
        </Link>

        {/* Action Buttons */}
        <div className="flex items-center space-x-2 md:space-x-4">
          <ClerkLoading>
            {/* Minimal fallback placeholder to prevent jumping during auth init */}
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground mr-2" />
          </ClerkLoading>

          <ClerkLoaded>
            <SignedIn>
              <HeaderClient />
              <GrowthToolsDropdown />
            </SignedIn>

            <SignedOut>
              <SignInButton>
                <Button variant="outline">Sign In</Button>
              </SignInButton>
            </SignedOut>

            <SignedIn>
              <UserButton
                appearance={{
                  elements: {
                    avatarBox: "w-10 h-10",
                    userButtonPopoverCard: "shadow-xl",
                    userPreviewMainIdentifier: "font-semibold",
                  },
                }}
                afterSignOutUrl="/"
              />
            </SignedIn>
          </ClerkLoaded>
        </div>
      </nav>
    </header>
  );
}
