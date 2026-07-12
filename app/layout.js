import { Geist, Geist_Mono } from "next/font/google";
import { Playfair_Display, Inter } from "next/font/google";

import "@/app/styles/globals.css";

import Providers from "./providers";
import { OnlineStatusProvider } from "./OnlineStatusProvider";

import { Toaster } from "sonner";

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
  title: "Qbambi Strands",
  description: "Hair, Beauty, Academy and Salon",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${playfair.variable} ${inter.variable}`}>
      <body
        className={`${geistSans.variable} ${geistMono.variable} font-inter min-h-screen bg-neutral-50 text-neutral-900`}
      >
        <OnlineStatusProvider>
          <Providers>
            <main>{children}</main>
          </Providers>
        </OnlineStatusProvider>

        <Toaster richColors closeButton />
      </body>
    </html>
  );
}
