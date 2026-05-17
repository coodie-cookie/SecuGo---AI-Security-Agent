import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "SecuGo — AI security for modern startups",
  description:
    "SecuGo scans your repositories for exposed secrets, vulnerabilities, and dangerous mistakes — then explains everything in simple language with AI-powered guidance.",
  metadataBase: new URL("https://secugo.app"),
  openGraph: {
    title: "SecuGo — AI security for modern startups",
    description:
      "Catch dangerous mistakes before production. Your AI security engineer for GitHub.",
    type: "website",
  },
};

const themeInitScript = `
(function() {
  try {
    var t = localStorage.getItem('secugo-theme');
    if (!t) t = 'dark';
    if (t === 'dark') document.documentElement.classList.add('dark');
    document.documentElement.style.colorScheme = t;
  } catch (e) {
    document.documentElement.classList.add('dark');
  }
})();
`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning style={{ scrollBehavior: "smooth" }}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="min-h-screen bg-background text-foreground antialiased font-sans">
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
