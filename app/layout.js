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
        layout: {
          logoImageUrl: "/logo.png",
          socialButtonsPlacement: "bottom",
          socialButtonsVariant: "iconButton",
          termsPageUrl: "https://clerk.com/terms",
        },
        variables: {
          colorPrimary: "black",
          colorText: "hsl(240 10% 3.9%)",
          colorInputBackground: "white",
          colorInputText: "black",
          borderRadius: "0.5rem",
        },
        elements: {
          card: "bg-white border border-gray-200 shadow-sm rounded-xl p-8",
          headerTitle: "text-2xl font-bold tracking-tight text-gray-900",
          headerSubtitle: "text-sm text-gray-500",
          socialButtonsBlockButton: "border border-gray-200 hover:bg-gray-50 text-gray-900 transition-colors",
          socialButtonsBlockButtonText: "font-semibold",
          dividerLine: "bg-gray-200",
          dividerText: "text-gray-500",
          formFieldLabel: "text-sm font-medium text-gray-900",
          formFieldInput: "flex h-10 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900 focus-visible:ring-offset-2",
          formButtonPrimary: "inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-gray-900 text-gray-50 hover:bg-gray-900/90 h-10 px-4 py-2",
          footerActionText: "text-gray-500",
          footerActionLink: "text-gray-900 font-semibold hover:underline",
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
