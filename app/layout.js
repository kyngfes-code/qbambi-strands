import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Playfair_Display, Inter } from "next/font/google";
import { Toaster } from "sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});
const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata = {
  title: "Qbambi Strands",
  description: "Hair and beauty",
};

//bg-linear-to-bl from-violet-100 to-stone-500
export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${playfair.variable} ${inter.variable}`}>
      <body
        className={`${geistSans.variable} ${geistMono.variable} font-inter min-h-screen relative flex flex-col bg-linear-to-bl from-violet-100 to-stone-500`}
      >
        {children}
        <Toaster richColors closeButton />
      </body>
    </html>
  );
}
