import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { StagewiseToolbar } from "@/components/StagewiseToolbar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Viber - Music that feels what you feel",
  description: "AI-powered mood detection with adaptive music playlists. Let your emotions guide your listening experience.",
  keywords: ["mood music", "AI music", "emotion detection", "music player", "adaptive playlist", "facial recognition music"],
  authors: [{ name: "Viber Team" }],
  creator: "Viber",
  publisher: "Viber",
  applicationName: "Viber",
  generator: "Next.js",
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: "Viber - Music that feels what you feel",
    description: "AI-powered mood detection with adaptive music playlists",
    url: '/',
    siteName: 'Viber',
    locale: 'en_US',
    type: 'website',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Viber - Mood-Based Music',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: "Viber - Music that feels what you feel",
    description: "AI-powered mood detection with adaptive music playlists",
    images: ['/og-image.png'],
    creator: '@viber',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-icon.png' },
    ],
  },
  manifest: '/manifest.json',
  category: 'entertainment',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta name="theme-color" content="#8b5cf6" />
        <meta name="color-scheme" content="dark light" />
        <link rel="preconnect" href="https://www.youtube.com" />
        <link rel="dns-prefetch" href="https://www.youtube.com" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <StagewiseToolbar />
        {children}
      </body>
    </html>
  );
}
