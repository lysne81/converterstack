import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-1 flex-col items-center justify-start gap-4 bg-zinc-50 px-6 pb-16 pt-6 text-center dark:bg-zinc-950">
      <h1 className="text-2xl font-semibold">Converter not found</h1>
      <p className="text-zinc-600 dark:text-zinc-400">
        That unit combination isn&apos;t available.
      </p>
      <Link href="/" className="font-medium underline">
        Back to all converters
      </Link>
    </div>
  );
}
