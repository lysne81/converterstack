import type { Metadata } from "next";
import Link from "next/link";
import SectionHeading from "../components/SectionHeading";

export const metadata: Metadata = {
  title: "Third-party licences",
  description:
    "Open-source libraries used by ConverterStack, with versions, licences, source links and the notices required by the LGPL, MPL and Apache licences.",
};

function ExternalLink({ href, children }: { href: string; children: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="text-blue-600 hover:underline dark:text-blue-400"
    >
      {children}
    </a>
  );
}

type Library = {
  name: string;
  version?: string;
  license: string;
  usedFor: string;
  source: { href: string; label: string };
  licenseText?: { href: string; label: string };
};

function LibraryList({ libraries }: { libraries: Library[] }) {
  return (
    <ul className="flex flex-col gap-4 text-zinc-600 dark:text-zinc-400">
      {libraries.map((library) => (
        <li key={library.name} className="flex flex-col gap-1">
          <p className="font-medium text-zinc-900 dark:text-zinc-100">
            {library.name}
            {library.version ? ` ${library.version}` : ""} — {library.license}
          </p>
          <p>{library.usedFor}</p>
          <p className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
            <ExternalLink href={library.source.href}>
              {library.source.label}
            </ExternalLink>
            {library.licenseText ? (
              <ExternalLink href={library.licenseText.href}>
                {library.licenseText.label}
              </ExternalLink>
            ) : null}
          </p>
        </li>
      ))}
    </ul>
  );
}

const LGPL_TEXT = {
  href: "https://www.gnu.org/licenses/lgpl-3.0.html",
  label: "LGPL-3.0 licence text",
};

const imageLibraries: Library[] = [
  {
    name: "heic-to",
    version: "1.5.2",
    license: "LGPL-3.0-or-later",
    usedFor: "Decoding Apple HEIC/HEIF photos in the browser.",
    source: {
      href: "https://github.com/hoppergee/heic-to/tree/v1.5.2",
      label: "heic-to 1.5.2 source on GitHub",
    },
    licenseText: LGPL_TEXT,
  },
  {
    name: "libheif (bundled by heic-to)",
    version: "1.22.2",
    license: "LGPL-3.0",
    usedFor: "HEIF container parsing and image decoding.",
    source: {
      href: "https://github.com/strukturag/libheif/tree/v1.22.2",
      label: "libheif 1.22.2 source on GitHub",
    },
    licenseText: LGPL_TEXT,
  },
  {
    name: "libde265 (bundled by heic-to)",
    license: "LGPL-3.0",
    usedFor: "HEVC decoding, the compression used inside HEIC photos.",
    source: {
      href: "https://github.com/strukturag/libde265",
      label: "libde265 source on GitHub",
    },
    licenseText: LGPL_TEXT,
  },
];

const mediaLibraries: Library[] = [
  {
    name: "mediabunny",
    version: "1.58.0",
    license: "MPL-2.0",
    usedFor: "Audio and video conversion via the browser's WebCodecs API.",
    source: {
      href: "https://github.com/Vanilagy/mediabunny",
      label: "mediabunny source on GitHub",
    },
    licenseText: {
      href: "https://www.mozilla.org/en-US/MPL/2.0/",
      label: "MPL-2.0 licence text",
    },
  },
  {
    name: "@mediabunny/mp3-encoder",
    version: "1.58.0",
    license: "MPL-2.0",
    usedFor:
      "Encoding MP3 audio, which no browser can do on its own. Built from LAME, compiled to WebAssembly.",
    source: {
      href: "https://github.com/Vanilagy/mediabunny",
      label: "mediabunny mp3-encoder source on GitHub",
    },
    licenseText: {
      href: "https://www.mozilla.org/en-US/MPL/2.0/",
      label: "MPL-2.0 licence text",
    },
  },
  {
    name: "LAME (bundled by @mediabunny/mp3-encoder)",
    license: "LGPL-2.1-or-later",
    usedFor: "The MP3 encoding algorithm itself.",
    source: {
      href: "https://lame.sourceforge.io/",
      label: "LAME project homepage",
    },
    licenseText: {
      href: "https://www.gnu.org/licenses/old-licenses/lgpl-2.1.html",
      label: "LGPL-2.1 licence text",
    },
  },
];

const documentLibraries: Library[] = [
  {
    name: "pdfjs-dist",
    version: "6.3.289",
    license: "Apache-2.0",
    usedFor: "Rendering PDF pages so they can be saved as images.",
    source: {
      href: "https://github.com/mozilla/pdf.js",
      label: "PDF.js source on GitHub",
    },
    licenseText: {
      href: "https://www.apache.org/licenses/LICENSE-2.0",
      label: "Apache-2.0 licence text",
    },
  },
  {
    name: "@cantoo/pdf-lib",
    version: "2.11.1",
    license: "MIT",
    usedFor: "Creating PDF documents from images.",
    source: {
      href: "https://github.com/cantoo-scribe/pdf-lib",
      label: "@cantoo/pdf-lib source on GitHub",
    },
  },
  {
    name: "tslib",
    version: "2.8.1",
    license: "0BSD",
    usedFor: "TypeScript runtime helpers, a dependency of @cantoo/pdf-lib.",
    source: {
      href: "https://github.com/microsoft/tslib",
      label: "tslib source on GitHub",
    },
  },
  {
    name: "culori",
    version: "4.0.2",
    license: "MIT",
    usedFor: "Colour conversion, a dependency of @cantoo/pdf-lib.",
    source: {
      href: "https://github.com/Evercoder/culori",
      label: "culori source on GitHub",
    },
  },
  {
    name: "fflate",
    version: "0.8.3",
    license: "MIT",
    usedFor:
      "Deflate compression of PDF streams, a dependency of @cantoo/pdf-lib.",
    source: {
      href: "https://github.com/101arrowz/fflate",
      label: "fflate source on GitHub",
    },
  },
  {
    name: "node-html-better-parser",
    version: "1.5.9",
    license: "MIT",
    usedFor: "HTML parsing, a dependency of @cantoo/pdf-lib.",
    source: {
      href: "https://github.com/Sharcoux/node-html-parser",
      label: "node-html-better-parser source on GitHub",
    },
  },
];

const frameworkLibraries: Library[] = [
  {
    name: "next",
    version: "16.3.3",
    license: "MIT",
    usedFor: "The framework this site is built and statically exported with.",
    source: {
      href: "https://github.com/vercel/next.js",
      label: "Next.js source on GitHub",
    },
  },
  {
    name: "react and react-dom",
    version: "19.2.8",
    license: "MIT",
    usedFor: "The user-interface runtime.",
    source: {
      href: "https://github.com/facebook/react",
      label: "React source on GitHub",
    },
  },
];

export default function LicensesPage() {
  return (
    <div className="app-bg flex flex-1 items-start justify-center px-6 pb-16 pt-6">
      <main className="flex w-full max-w-2xl flex-col gap-6 sm:gap-8">
        <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">
          Third-party licences
        </h1>

        <div className="flex flex-col gap-4 text-zinc-600 dark:text-zinc-400">
          <p>
            Every conversion on ConverterStack happens locally — your files stay
            in your browser and are never uploaded anywhere. That also means the
            open-source libraries below are downloaded to your device and run
            there. They are listed here with their versions, licences and
            sources, so you can see exactly what runs on your machine. For a
            plain-language explanation of how each converter works, see{" "}
            <Link href="/about#how-it-works" className="text-blue-600 hover:underline dark:text-blue-400">
              How it works
            </Link>{" "}
            on the About page.
          </p>
        </div>

        <section className="flex flex-col gap-4">
          <SectionHeading>Image decoding</SectionHeading>
          <LibraryList libraries={imageLibraries} />
          <div className="flex flex-col gap-4 text-zinc-600 dark:text-zinc-400">
            <p>
              heic-to, together with the libheif and libde265 builds it bundles,
              is used unmodified. It is loaded as its own separately addressable
              JavaScript chunk, downloaded only when you convert a HEIC file.
              You may therefore substitute your own build of the library — for
              example by serving a modified chunk in its place — and the rest of
              the site will keep working. This is how ConverterStack meets the
              relinking requirement in section 4(d) of the LGPL-3.0.
            </p>
          </div>
        </section>

        <section className="flex flex-col gap-4">
          <SectionHeading>Audio and video</SectionHeading>
          <LibraryList libraries={mediaLibraries} />
          <div className="flex flex-col gap-4 text-zinc-600 dark:text-zinc-400">
            <p>
              mediabunny is used unmodified. The complete source code for the
              version shipped here can be obtained from the{" "}
              <ExternalLink href="https://github.com/Vanilagy/mediabunny">
                mediabunny repository on GitHub
              </ExternalLink>{" "}
              or from the{" "}
              <ExternalLink href="https://www.npmjs.com/package/mediabunny/v/1.58.0">
                mediabunny 1.58.0 package on npm
              </ExternalLink>
              , as required by section 3.2 of the MPL-2.0.
            </p>
            <p>
              The MP3 encoder is a separate extension package, also MPL-2.0 and
              also used unmodified. It contains a WebAssembly build of LAME,
              which is licensed under the LGPL-2.1. Like the HEIC decoder it is
              downloaded as its own chunk, only when you convert to MP3, so you
              can substitute your own build of it.
            </p>
          </div>
        </section>

        <section className="flex flex-col gap-4">
          <SectionHeading>Documents</SectionHeading>
          <LibraryList libraries={documentLibraries} />
        </section>

        <section className="flex flex-col gap-4">
          <SectionHeading>Framework</SectionHeading>
          <LibraryList libraries={frameworkLibraries} />
        </section>

        <div className="flex flex-col gap-4 text-zinc-600 dark:text-zinc-400">
          <p>
            The MIT, 0BSD and Apache-2.0 libraries are used under their
            respective licences, with their copyright and permission notices
            retained in the files served to your browser. If an attribution here
            is missing or wrong, please let us know.
          </p>
          <p>
            ConverterStack itself is open source under the{" "}
            <ExternalLink href="https://github.com/lysne81/converterstack/blob/main/LICENSE">
              MIT licence
            </ExternalLink>
            . View or contribute to the source on{" "}
            <ExternalLink href="https://github.com/lysne81/converterstack">
              GitHub
            </ExternalLink>
            .
          </p>
        </div>

        <Link
          href="/"
          className="w-fit text-sm font-medium text-blue-600 hover:underline dark:text-blue-400"
        >
          ← Back to converters
        </Link>
      </main>
    </div>
  );
}
