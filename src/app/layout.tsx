import type { Metadata } from "next";
import { Cairo } from "next/font/google";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Providers } from "@/components/Providers";
import "./globals.css";

const cairo = Cairo({
  subsets: ["latin", "arabic"],
  variable: "--font-cairo",
  weight: ["300", "400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Level Up DZ",
  description: "Développez vos compétences, construisez votre avenir.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" dir="auto" className={cairo.variable}>
      <body style={{ fontFamily: "var(--font-cairo), sans-serif", display: "flex", flexDirection: "column", minHeight: "100vh" }}>
        <Providers>
          <Navbar />
          <main style={{ flex: 1 }}>
            {children}
          </main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
