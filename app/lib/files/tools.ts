/**
 * File tools that are not a one-format-to-another conversion, so they live
 * outside the conversion registry but are listed alongside it.
 */
export type FileTool = {
  slug: string;
  href: string;
  title: string;
  subtitle: string;
  /** Extra search words that should surface the tool. */
  keywords: string[];
};

export const MERGE_PDF_TOOL: FileTool = {
  slug: "merge-pdf",
  href: "/files/merge-pdf",
  title: "Merge PDF",
  subtitle: "Combine several PDFs into one, in any order",
  keywords: ["merge", "combine", "join", "concatenate"],
};

export const FILE_TOOLS: FileTool[] = [MERGE_PDF_TOOL];
