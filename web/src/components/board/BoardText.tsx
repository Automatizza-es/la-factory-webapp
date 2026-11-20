import type { ReactNode } from "react";

const MARKDOWN_LINK = /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/gi;

function cleanLabel(value: string) {
  // Labels sometimes include Markdown emphasis, such as **example.com**.
  return value.replace(/\*\*(.*?)\*\*/g, "$1").replace(/\\([\\`*_{}\[\]()#+.!:-])/g, "$1");
}

function safeUrl(value: string) {
  try {
    const url = new URL(value.replace(/\\([\\`*_{}\[\]()#+.!:-])/g, "$1"));
    return url.protocol === "https:" || url.protocol === "http:" ? url.href : null;
  } catch {
    return null;
  }
}

// Posts are stored as plain text. This deliberately supports just safe
// Markdown-style links, rather than injecting arbitrary HTML from a post.
export function BoardText({ text, className }: { text: string; className?: string }) {
  const parts: ReactNode[] = [];
  let start = 0;

  for (const match of text.matchAll(MARKDOWN_LINK)) {
    if (match.index > start) parts.push(text.slice(start, match.index));
    const href = safeUrl(match[2]);
    const label = cleanLabel(match[1]);
    parts.push(href ? (
      <a key={`${match.index}-${href}`} href={href} target="_blank" rel="noreferrer" className="font-medium text-brown-dark underline decoration-brown/50 underline-offset-2 hover:text-brown">
        {label}
      </a>
    ) : match[0]);
    start = match.index + match[0].length;
  }
  if (start < text.length) parts.push(text.slice(start));

  return <span className={className}>{parts}</span>;
}
