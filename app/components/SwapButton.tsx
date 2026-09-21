"use client";

export default function SwapButton({
  onClick,
  label = "Swap units",
  title,
}: {
  onClick: () => void;
  label?: string;
  title?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={title ?? "Swap units (S)"}
      className="group flex h-12 w-12 items-center justify-center self-center rounded-full border border-black/10 bg-white text-xl shadow-sm transition-transform motion-reduce:transition-none hover:scale-110 motion-reduce:hover:scale-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 active:scale-95 dark:border-white/15 dark:bg-zinc-800"
    >
      <span
        aria-hidden
        className="transition-transform duration-300 group-hover:rotate-180 motion-reduce:transition-none motion-reduce:group-hover:rotate-0"
      >
        <span className="sm:hidden">⇅</span>
        <span className="hidden sm:inline">⇄</span>
      </span>
    </button>
  );
}
