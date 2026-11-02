import type { Metadata, Viewport } from "next";
import { Poppins } from "next/font/google";
import { Analytics } from "@vercel/analytics/next"

import "./globals.css";

const poppins = Poppins({
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  subsets: ["latin"],
  variable: "--font-poppins",
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://your-portfolio-domain.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "Personal Portfolio",
  description: "Personal portfolio and digital showcase website.",
  icons: {
    icon: [
      { url: "/olifyhub.png", type: "image/png" },
      { url: "/icon.png", type: "image/png" },
    ],
    shortcut: "/olifyhub.png",
    apple: "/olifyhub.png",
  },
  keywords: [
    "Portfolio",
    "Software Engineer",
    "UI/UX Designer",
    "Frontend Developer",
    "React Developer",
    "Next.js Developer",
    "Web Designer",
  ],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    title: "Personal Portfolio",
    description: "Personal portfolio and digital showcase website.",
    siteName: "Personal Portfolio",
    images: [
      {
        url: "/olifyhub.png",
        width: 512,
        height: 512,
        alt: "Logo",
      },
    ],
  },
  twitter: {
    card: "summary",
    title: "Personal Portfolio",
    description: "Personal portfolio and digital showcase website.",
    images: ["/olifyhub.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

import { SiteProvider } from "@/context/SiteContext";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" type="image/png" href="/olifyhub.png" />
        <link rel="shortcut icon" href="/olifyhub.png" />
        <link rel="apple-touch-icon" href="/olifyhub.png" />
      </head>
      <body
        className={`${poppins.variable} font-sans antialiased`}
      >
        <SiteProvider>
          {children}
        </SiteProvider>
        <Analytics />
      </body>
    </html>
  );
}
