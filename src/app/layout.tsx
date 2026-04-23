import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Athlete Kingdom",
  description: "Elite athlete development and performance community.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
