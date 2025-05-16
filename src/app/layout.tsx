import type { Metadata } from "next";
import { Nunito, Poppins } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import dynamic from 'next/dynamic';

const Footer = dynamic(() => import('./components/Footer'), { ssr: true });

const nunito = Nunito({
  subsets: ["latin"],
  variable: "--font-nunito",
  weight: ["300", "400", "500", "600", "700", "800"],
  display: "swap",
});

const poppins = Poppins({
  subsets: ["latin"],
  variable: "--font-poppins",
  weight: ["500", "600", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL('https://www.squabbl.co.za'),
  title: {
    default: 'Squabbl - Play The Ultimate Party Word Game Online',
    template: '%s | Squabbl - The Digital Party Game',
  },
  description: "Create or join Squabbl games online! Describe, act out, and guess words in three exciting rounds. Fun for teams and parties.",
  openGraph: {
    title: "Squabbl - The Digital Party Game",
    description: "A fun and interactive digital adaptation of a popular party game.",
    images: [
      {
        url: "/squabbl_logo.jpg",
        width: 800,
        height: 600,
        alt: "Squabbl Logo",
      },
    ],
    siteName: "Squabbl",
    url: 'https://www.squabbl.co.za',
  },
  twitter: {
    card: "summary_large_image",
    title: "Squabbl - The Digital Party Game",
    description: "A fun and interactive digital adaptation of a popular party game.",
    images: ["/squabbl_logo.jpg"],
  },
  icons: {
    icon: [
      { url: '/favicon.ico', type: 'image/x-icon', sizes: 'any' },
      { url: '/squabbl_icon_64.png', type: 'image/png', sizes: '64x64' },
      // Consider adding other common sizes e.g. 16x16, 32x32 if you have them
    ],
    apple: '/apple-touch-icon.png', // Example: add if you have an apple-touch-icon
  },
  alternates: {
    canonical: '/',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${nunito.variable} ${poppins.variable}`}>
      <head>
        {/* The manual link for favicon will be removed by this edit as it's handled by the metadata object now */}
      </head>
      <body className="min-h-screen bg-background text-foreground flex flex-col font-nunito antialiased">
        <Toaster
          position="top-center"
          toastOptions={{
            duration: 3000,
            style: {
              background: "var(--background)",
              color: "var(--foreground)",
              border: "1px solid var(--neutral-light)",
              padding: "var(--space-md) var(--space-lg)",
              borderRadius: "var(--border-radius-lg)",
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
              fontFamily: "var(--font-nunito)",
            },
            success: {
              iconTheme: {
                primary: "var(--secondary)",
                secondary: "var(--background)",
              },
            },
            error: {
              iconTheme: {
                primary: "var(--primary)",
                secondary: "var(--background)",
              },
            },
          }}
        />
        <main className="flex-1 container mx-auto py-8">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
