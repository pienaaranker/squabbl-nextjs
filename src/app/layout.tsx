import type { Metadata } from "next";
import { Nunito, Poppins } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import dynamic from 'next/dynamic';

const Footer = dynamic(() => import('./components/Footer'), { ssr: true });
// const Header = dynamic(() => import('./components/Header'), { ssr: true }); // Commented out Header import

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
  title: "Squabbl - Family Word Game",
  description: "A fun party word game for family and friends",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${nunito.variable} ${poppins.variable}`}>
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
        {/* <Header /> // Commented out Header component */}
        <main className="flex-1 container mx-auto py-8">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
