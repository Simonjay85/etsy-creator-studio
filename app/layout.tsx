import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Etsy Listing Creator — Font, Planner & CV Tools",
  description: "Automatically generate professional Etsy thumbnails, SEO titles, descriptions and hashtags for fonts, digital planners, and CV templates.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="h-full">
      <body className="h-full flex flex-col">{children}</body>
    </html>
  );
}
