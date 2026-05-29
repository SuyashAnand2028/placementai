import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geist = Geist({ subsets: ["latin"], variable: "--font-geist" });

export const metadata: Metadata = {
  title: "PlacementAI — AI Resume Optimizer for Indian Students",
  description:
    "Get your resume ATS-scored, bullet points rewritten, and a tailored cover letter generated — built specifically for Indian engineering placement drives.",
  keywords:
    "resume optimizer india, placement preparation, ATS resume, engineering placement, MIT Manipal, NIT resume, cover letter generator india",
  openGraph: {
    title: "PlacementAI — AI Resume Optimizer for Indian Students",
    description:
      "Beat the ATS. Get placed faster. AI-powered resume analysis built for Indian engineering students.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Outfit:wght@400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className={geist.variable}>{children}</body>
    </html>
  );
}
