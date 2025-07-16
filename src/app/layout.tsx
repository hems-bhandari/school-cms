import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from "@/contexts/LanguageContext";
import Footer from "@/components/Footer";
import { generateMetadata as generateSEOMetadata } from "@/lib/seo";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = generateSEOMetadata({
  title: "Shree Jana Jagriti Secondary School - JJSS",
  description: "Welcome to Shree Jana Jagriti Secondary School located in Omsatiya-1, Rupandehi, Lumbini, Nepal. A comprehensive bilingual school featuring quality education, notices, activities, teacher profiles, and committee information.",
  keywords: [
    "Shree Jana Jagriti Secondary School",
    "JJSS",
    "Jana Jagriti",
    "school",
    "education",
    "Omsatiya",
    "Rupandehi",
    "Lumbini",
    "Nepal",
    "secondary school",
    "bilingual education",
    "notices",
    "activities",
    "teachers",
    "committee"
  ],
  url: "/",
  type: "website"
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <LanguageProvider>
          <div className="min-h-screen flex flex-col">
            <main className="flex-1">
              {children}
            </main>
            <Footer />
          </div>
        </LanguageProvider>
      </body>
    </html>
  );
}
