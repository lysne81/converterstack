"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import ThemeToggle from "./ThemeToggle";

const NAV_LINKS = [
  { href: "/browse", label: "Browse" },
  { href: "/timezone", label: "Time zones" },
  { href: "/exchangerate", label: "Exchange rates" },
  { href: "/files", label: "Files" },
  { href: "/about", label: "About" },
] as const;

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

function NavPills({ pathname }: { pathname: string }) {
  return (
    <>
      {NAV_LINKS.map((link) => {
        const active = isActive(pathname, link.href);
        return (
          <Link
            key={link.href}
            href={link.href}
            aria-current={active ? "page" : undefined}
            className={`rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
              active
                ? "bg-black/[.08] text-zinc-900 dark:bg-white/[.12] dark:text-white"
                : "text-zinc-600 hover:bg-black/[.04] hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-white/[.06] dark:hover:text-white"
            }`}
          >
            {link.label}
          </Link>
        );
      })}
    </>
  );
}

export default function SiteHeader() {
  const pathname = usePathname();

  return (
    <header className="py-6 sm:py-8">
      <div className="mx-auto w-full max-w-2xl px-6 md:max-w-4xl">
        <div className="flex items-center justify-between gap-4">
          <Link
            href="/"
            className="flex items-center gap-3 text-xl font-semibold tracking-tight sm:gap-4 sm:text-2xl"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/icon-light.jpg"
              alt=""
              width={64}
              height={64}
              className="h-11 w-11 shrink-0 rounded-xl shadow-sm sm:h-16 sm:w-16"
            />
            <span className="whitespace-nowrap">ConverterStack</span>
          </Link>
          <div className="flex shrink-0 items-center gap-2 md:gap-4">
            <nav className="hidden items-center gap-1 md:flex">
              <NavPills pathname={pathname} />
            </nav>
            <div
              aria-hidden
              className="hidden h-6 w-px bg-black/10 md:block dark:bg-white/15"
            />
            <ThemeToggle />
          </div>
        </div>
        <nav className="mt-4 flex flex-wrap items-center justify-center gap-1 md:hidden">
          <NavPills pathname={pathname} />
        </nav>
      </div>
    </header>
  );
}
