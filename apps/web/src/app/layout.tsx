import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { SearchProvider } from "@/contexts/search-context";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "SprutNet - Shipping Planner",
  description: "MVP планировщик морских перевозок с использованием API Maersk",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <SearchProvider>{children}</SearchProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
