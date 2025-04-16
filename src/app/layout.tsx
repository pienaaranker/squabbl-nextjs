import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
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
    <html lang="en" className={inter.variable}>
      <body className="min-h-screen bg-softwhite text-slate-800 flex flex-col">
        <Toaster
          position="top-center"
          toastOptions={{
            duration: 3000,
            style: {
              background: "#FFFFFF",
              color: "#2F4F4F",
              border: "1px solid #A8DADC",
              padding: "12px 16px",
              borderRadius: "6px",
              boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
            },
            success: {
              iconTheme: {
                primary: "#B0EACD",
                secondary: "#2F4F4F",
              },
            },
            error: {
              iconTheme: {
                primary: "#EF798A",
                secondary: "#2F4F4F",
              },
            },
          }}
        />
        <main className="flex-1">
          {children}
        </main>
        <footer className="py-4 px-6 text-center text-sm text-slate-600 bg-softwhite border-t border-sky-100">
          <p>Squabbl - A fun word game for families and friends</p>
        </footer>
      </body>
    </html>
  );
}
