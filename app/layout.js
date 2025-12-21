import { Geist, Geist_Mono } from "next/font/google";
import "@/app/styles/globals.css";
import { Playfair_Display, Inter } from "next/font/google";
import { Toaster } from "sonner";
import Providers from "./providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});
const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata = {
  title: "Qbambi Strands / Home",
  description: "Hair and beauty",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${playfair.variable} ${inter.variable}`}>
      <body
        className={`${geistSans.variable} ${geistMono.variable} font-inter min-h-screen relative flex flex-col bg-linear-to-bl from-violet-100 to-stone-500`}
      >
        <Providers>{children}</Providers>
        <Toaster richColors closeButton />
      </body>
    </html>
  );
}
