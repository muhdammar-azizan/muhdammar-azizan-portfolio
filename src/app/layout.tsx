import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Kalam } from "next/font/google";
import localFont from "next/font/local";
import { siteConfig } from "@/lib/site";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Retro script display font (demo version, personal use only).
// Use it with the Tailwind class "font-relieve".
const relieve = localFont({
  src: "./fonts/Relieve.ttf",
  variable: "--font-relieve",
  display: "swap",
});

// Clash Display variable font (ITF Free Font License: free for personal and commercial use).
// Use it with the Tailwind class "font-clash".
const clash = localFont({
  src: "./fonts/ClashDisplay-Variable.woff2",
  variable: "--font-clash",
  weight: "200 700",
  display: "swap",
});

// Neat handwriting font for the project notes and sticky notes (SIL Open Font License).
// Use it with the Tailwind class "font-hand".
const kalam = Kalam({
  variable: "--font-kalam",
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: siteConfig.title,
  description: siteConfig.description,
  openGraph: {
    title: siteConfig.title,
    description: siteConfig.description,
    url: siteConfig.url,
    siteName: siteConfig.name,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.title,
    description: siteConfig.description,
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f3ece1" },
    { media: "(prefers-color-scheme: dark)", color: "#161616" },
  ],
};

// Runs before first paint so the saved theme is applied without a flash,
// and decides whether the opening intro plays (once per tab, never with reduced motion).
const themeScript = `
var root = document.documentElement;
try {
  var saved = localStorage.getItem("theme");
  root.dataset.theme = saved === "dark" ? "dark" : "light";
} catch (e) {
  root.dataset.theme = "light";
}
try {
  var seen = sessionStorage.getItem("intro-seen");
  var calm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  root.dataset.intro = seen || calm ? "done" : "play";
} catch (e) {
  root.dataset.intro = "done";
}
`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      data-theme="light"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} ${relieve.variable} ${clash.variable} ${kalam.variable} scroll-smooth antialiased`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-screen bg-background font-sans text-foreground">
        {children}
      </body>
    </html>
  );
}
