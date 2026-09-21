import type {Metadata} from "next";
import Link from "next/link";
import ConverterSearch from "../components/ConverterSearch";
import SectionHeading from "../components/SectionHeading";

export const metadata: Metadata = {
    title: "About",
    description:
        "ConverterStack is a fast, no-fuss collection of unit converters for as many purposes as possible.",
};

export default function AboutPage() {
    return (
        <div className="app-bg flex flex-1 items-start justify-center px-6 pb-16 pt-6">
            <main className="flex w-full max-w-2xl flex-col gap-6">
                <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">About</h1>

                <ConverterSearch/>

                <div className="flex flex-col gap-4 text-zinc-600 dark:text-zinc-400">
                    <p>
                        ConverterStack is a simple, fast collection of converters. The goal
                        is to cover as many things you might need to convert as possible,
                        and make them easily accessible. Every conversion is ran completely in
                        the browser, file conversions included.
                    </p>
                    <p>
                        No sign-ups, no clutter, no fuzz. Pick your units, type a value, and
                        get the answer instantly.
                    </p>
                    <p>
                        ConverterStack is open source under the MIT licence. The code is
                        available on{" "}
                        <Link
                            href="https://github.com/lysne81/converterstack"
                            target="_blank"
                            rel="noreferrer"
                            className="text-blue-600 hover:underline dark:text-blue-400"
                        >
                            GitHub
                        </Link>
                        {" "}— bug reports, feature ideas and pull requests are welcome.
                    </p>
                </div>

                <section id="how-it-works" className="flex scroll-mt-6 flex-col gap-6">
                    <div className="flex flex-col gap-2">
                        <h2 className="text-lg font-semibold tracking-tight">
                            How it works
                        </h2>
                        <p className="text-zinc-600 dark:text-zinc-400">
                            Most conversions on this site happen entirely on your own
                            device — the moment you type a value or drop a file, the
                            computation runs in your browser and nothing is sent anywhere.
                            The one exception is exchange rates, which need a real-world
                            number to start from; that section below explains what does and
                            does not leave your device.
                        </p>
                    </div>

                    <section id="how-it-works-units" className="flex scroll-mt-6 flex-col gap-2">
                        <SectionHeading>Unit converter</SectionHeading>
                        <p className="text-zinc-600 dark:text-zinc-400">
                            Every unit inside a category (length, mass, volume, and so on)
                            is defined by a fixed conversion factor relative to a base unit.
                            Converting between two units is a single multiplication — or,
                            for temperature, a short formula with an offset and a
                            factor — computed in plain JavaScript in your browser the
                            instant you type. There is no lookup table to fetch and no
                            network request involved.
                        </p>
                    </section>

                    <section id="how-it-works-timezone" className="flex scroll-mt-6 flex-col gap-2">
                        <SectionHeading>Time zone converter</SectionHeading>
                        <p className="text-zinc-600 dark:text-zinc-400">
                            Each time zone here is modelled as a fixed offset from UTC.
                            This intentionally ignores daylight saving time changes, so the
                            offset for a given zone never shifts depending on the date —
                            it stays a simple, predictable calculator. Converting a time is
                            just adding the difference between the two offsets to the time
                            you entered, done locally with no server involved.
                        </p>
                    </section>

                    <section id="how-it-works-exchangerate" className="flex scroll-mt-6 flex-col gap-2">
                        <SectionHeading>Exchange rate converter</SectionHeading>
                        <p className="text-zinc-600 dark:text-zinc-400">
                            Currency values cannot be
                            computed from a fixed formula — they depend on real-world
                            markets, so a starting number has to come from somewhere.
                            Exchange rates are fetched once a day from a currency data
                            provider and published as part of the site, so the rate you see
                            is at most a day old. Once those rates are loaded, converting
                            between any two currencies is ordinary multiplication and
                            division, done in your browser.
                        </p>
                    </section>

                    <section id="how-it-works-files" className="flex scroll-mt-6 flex-col gap-2">
                        <SectionHeading>File converter</SectionHeading>
                        <p className="text-zinc-600 dark:text-zinc-400">
                            File conversions run entirely in your browser — your files are
                            read with the{" "}
                            <Link href="https://developer.mozilla.org/en-US/docs/Web/API/File_API#examples"
                                  className="underline hover:no-underline">
                                File API
                            </Link>{" "}
                            and never uploaded to a server. Images
                            are converted with your browser&apos;s own canvas and image codecs;
                            audio and video use the WebCodecs API built into your browser;
                            PDFs are rendered and built with small open-source libraries
                            that run alongside the rest of the page. Some formats or
                            combinations may not be supported on every browser or device —
                            when that happens, the converter says so and suggests
                            alternatives that are. See the{" "}
                            <Link href="/licenses" className="underline hover:no-underline">
                                third-party licences page
                            </Link>{" "}
                            for the exact libraries and versions used for each format.
                        </p>
                    </section>
                </section>

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
