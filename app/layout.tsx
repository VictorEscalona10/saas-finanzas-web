import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "@material-symbols/font-400/outlined.css";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SaaS Finanzas",
  description: "Plataforma de gestión financiera inteligente",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <script
          dangerouslySetInnerHTML={{
            __html: `
              document.addEventListener('mousemove', function(e) {
                document.documentElement.style.setProperty('--mouse-x', e.clientX + 'px');
                document.documentElement.style.setProperty('--mouse-y', e.clientY + 'px');
                document.querySelectorAll('.liquid-card, .liquid-glass').forEach(function(el) {
                  var rect = el.getBoundingClientRect();
                  var x = ((e.clientX - rect.left) / rect.width) * 100;
                  var y = ((e.clientY - rect.top) / rect.height) * 100;
                  el.style.setProperty('--ripple-x', x + '%');
                  el.style.setProperty('--ripple-y', y + '%');
                  el.style.setProperty('--mouse-x', x + '%');
                  el.style.setProperty('--mouse-y', y + '%');
                });
              });
            `,
          }}
        />
        {children}
      </body>
    </html>
  );
}
