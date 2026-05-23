import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "../globals.css";
import Navbar from "@/src/modules/finance/presentation/components/Navbar/Navbar";
import Footer from "@/src/modules/finance/presentation/components/Footer/Footer";
import { headers } from "next/headers"; // 👈 Para obtener la URL

import { Montserrat } from "next/font/google";
import { Quicksand } from "next/font/google";
import { DM_Sans } from "next/font/google";

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  style: ["normal"],
  display: "swap",
});

const quicksand = Quicksand({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  style: ["normal"],
  display: "swap",
});

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["100", "300", "400", "500", "700", "900"],
  style: ["normal", "italic"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Dark Liquid Glass - Finanzas",
  description: "Plataforma financiera premium",
};

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});


export default async function RootLayout({  // 👈 Nota: async function
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const headersList = await headers();
  const pathname = headersList.get("x-pathname") || "";
  
  // Alternativa: También puedes obtener la URL completa
  // const url = headersList.get("x-url") || "";
  

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className={`min-h-full flex flex-col ${dmSans.className}`}>
        
        <main className={`flex-1 'pt-16' : ''}`}>
          {children}
        </main>
        
      </body>
    </html>
  );
}