import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { DataProvider } from "@/lib/store";
import { AuthProvider } from "@/lib/auth";
import { ThemeProvider } from "@/lib/theme";
import Nav from "@/components/Nav";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Milk Manager",
  description: "Daily milk collection, sales, expenses and billing manager",
};

const noFlashScript = `
try {
  var t = localStorage.getItem("milk-management-theme");
  var dark = t ? t === "dark" : window.matchMedia("(prefers-color-scheme: dark)").matches;
  if (dark) document.documentElement.classList.add("dark");
} catch (e) {}
`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: noFlashScript }} />
      </head>
      <body className="min-h-full flex flex-col bg-gradient-to-b from-neutral-50 via-white to-indigo-50/40 dark:from-neutral-950 dark:via-neutral-950 dark:to-indigo-950/20">
        <ThemeProvider>
          <AuthProvider>
            <DataProvider>
              <Nav />
              <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-5">{children}</main>
            </DataProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
