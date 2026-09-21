import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";
import SiteHeader from "./components/SiteHeader";
import { THEME_INIT_SCRIPT } from "./lib/theme";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "ConverterStack — Unit, Exchange Rate & Time Zone Converter",
    template: "%s · ConverterStack",
  },
  description:
    "ConverterStack is a fast, free converter for length, mass, temperature and more, plus live exchange rates and time zones. Convert instantly as you type, copy results, and switch between light and dark mode.",
  applicationName: "ConverterStack",
  keywords: [
    "unit converter",
    "measurement converter",
    "length converter",
    "mass converter",
    "temperature converter",
    "currency converter",
    "exchange rates",
    "time zone converter",
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body className="min-h-full flex flex-col">
        <SiteHeader />
        {children}
        <footer className="mt-auto border-t border-black/[.06] py-8 dark:border-white/[.08]">
          <div className="mx-auto flex w-full max-w-2xl flex-col items-center gap-3 px-6 text-center">
            <nav className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm font-medium text-zinc-600 dark:text-zinc-400">
              <Link href="/" className="hover:underline">
                Home
              </Link>
              <Link href="/browse" className="hover:underline">
                Browse
              </Link>
              <Link href="/timezone" className="hover:underline">
                Time zones
              </Link>
              <Link href="/exchangerate" className="hover:underline">
                Exchange rates
              </Link>
              <Link href="/articles" className="hover:underline">
                Articles
              </Link>
              <Link href="/definitions" className="hover:underline">
                Definitions
              </Link>
              <Link href="/about" className="hover:underline">
                About
              </Link>
              <Link href="/licenses" className="hover:underline">
                Licences
              </Link>
              <a
                href="https://github.com/lysne81/converterstack"
                target="_blank"
                rel="noreferrer"
                className="hover:underline"
              >
                GitHub
              </a>
            </nav>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Fast, no-fuss converters.
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
