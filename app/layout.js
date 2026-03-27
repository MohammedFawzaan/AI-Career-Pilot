import { Inter } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "sonner";
import Header from "@/components/header";
import NavigationProgress from "@/components/navigation-progress";
import { ThemeProvider } from "@/components/theme-provider";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "AI Career Pilot",
  description: "AI Career Coach design for users professional success",
  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
  },
};

export default function RootLayout({ children }) {
  return (
    <ClerkProvider
      appearance={{
        variables: {
          colorPrimary: "#000000",
          colorTextOnPrimaryBackground: "#ffffff",
        },
        elements: {
          formButtonPrimary: "bg-black hover:bg-gray-800 text-sm normal-case",
          card: "shadow-none border border-border",
        }
      }}
    >
      <html lang="en" suppressHydrationWarning>
        <body className={`${inter.className}`}>
          <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem
            disableTransitionOnChange
          >
            <NavigationProgress />
            <Header />
            <main className="min-h-screen">{children}</main>
            <Toaster richColors />
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
