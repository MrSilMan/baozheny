import type { Metadata } from "next";
import { Syne, DM_Sans } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";

const syne = Syne({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["400", "500", "600", "700", "800"],
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-body",
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: {
    default: "BaoZhen — Buy from China, Built for the World",
    template: "%s | BaoZhen",
  },
  description:
    "BaoZhen is your trusted B2B platform for sourcing premium products from verified Chinese suppliers. Browse thousands of products, request quotes, and manage orders seamlessly.",
  keywords: ["China sourcing", "B2B marketplace", "Chinese suppliers", "wholesale", "import"],
  authors: [{ name: "BaoZhen" }],
  creator: "BaoZhen",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://baozhen.com",
    title: "BaoZhen — Buy from China, Built for the World",
    description: "Your trusted B2B platform for sourcing from verified Chinese suppliers.",
    siteName: "BaoZhen",
  },
  twitter: {
    card: "summary_large_image",
    title: "BaoZhen — Buy from China, Built for the World",
    description: "Your trusted B2B platform for sourcing from verified Chinese suppliers.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${syne.variable} ${dmSans.variable} font-body antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
