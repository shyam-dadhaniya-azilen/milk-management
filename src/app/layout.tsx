import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { DataProvider } from "@/lib/store";
import { AuthProvider } from "@/lib/auth";
import Nav from "@/components/Nav";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Milk Manager",
  description: "Daily milk collection, sales, expenses and billing manager",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-gradient-to-b from-neutral-50 to-white">
        <AuthProvider>
          <DataProvider>
            <Nav />
            <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-5">{children}</main>
          </DataProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
