import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TLM Web",
  description: "Type Link Model Web Interface",
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
