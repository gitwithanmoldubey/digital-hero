import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Digital Heroes | Golf Performance & Charitable Impact",
  description: "Track your golf scores, support world-class charities, and win monthly rewards. Join the movement of heroes.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
