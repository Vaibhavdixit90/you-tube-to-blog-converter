import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Video To Blog Converter",
  description: "Video To Blog Converter",
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
