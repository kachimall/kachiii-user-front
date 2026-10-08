import Link from "next/link";
import { Fragment, type ReactNode } from "react";

// A small Markdown renderer for the shop's static pages, which staff write in the admin portal:
// headings, paragraphs, lists, quotes, rules, bold, italics, inline code and links. It builds
// React elements and never injects HTML, so whatever the text holds is shown as text.

type Block =
  | { type: "heading"; level: number; text: string }
  | { type: "paragraph"; text: string }
  | { type: "list"; ordered: boolean; items: string[] }
  | { type: "quote"; text: string }
  | { type: "rule" };

function parseBlocks(source: string): Block[] {
  const lines = source.replace(/\r\n?/g, "\n").split("\n");
  const blocks: Block[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];
    if (!line.trim()) {
      i++;
      continue;
    }

    const heading = line.match(/^(#{1,6})\s+(.*?)\s*#*\s*$/);
    if (heading) {
      blocks.push({ type: "heading", level: heading[1].length, text: heading[2] });
      i++;
      continue;
    }

    if (/^\s*([-*_])(\s*\1){2,}\s*$/.test(line)) {
      blocks.push({ type: "rule" });
      i++;
      continue;
    }

    const listItem = /^\s*(?:([-*+])|(\d+)[.)])\s+(.*)$/;
    const first = line.match(listItem);
    if (first) {
      const ordered = first[2] !== undefined;
      const items: string[] = [];
      while (i < lines.length) {
        const m = lines[i].match(listItem);
        if (m && (m[2] !== undefined) === ordered) {
          items.push(m[3]);
        } else if (lines[i].trim() && /^\s{2,}/.test(lines[i]) && items.length > 0) {
          // An indented line continues the item above.
          items[items.length - 1] += ` ${lines[i].trim()}`;
        } else {
          break;
        }
        i++;
      }
      blocks.push({ type: "list", ordered, items });
      continue;
    }

    if (/^\s*>/.test(line)) {
      const quoted: string[] = [];
      while (i < lines.length && /^\s*>/.test(lines[i])) quoted.push(lines[i++].replace(/^\s*>\s?/, ""));
      blocks.push({ type: "quote", text: quoted.join(" ") });
      continue;
    }

    const paragraph: string[] = [];
    while (
      i < lines.length &&
      lines[i].trim() &&
      !/^(#{1,6})\s/.test(lines[i]) &&
      !listItem.test(lines[i]) &&
      !/^\s*>/.test(lines[i])
    ) {
      paragraph.push(lines[i++].trim());
    }
    blocks.push({ type: "paragraph", text: paragraph.join("\n") });
  }

  return blocks;
}

/** Only web, mail and phone links, and paths within the shop. */
function safeHref(href: string): string | undefined {
  const trimmed = href.trim();
  if (/^(https?:|mailto:|tel:)/i.test(trimmed)) return trimmed;
  if (trimmed.startsWith("/") && !trimmed.startsWith("//")) return trimmed;
  if (trimmed.startsWith("#")) return trimmed;
  return undefined;
}

const inlinePattern = /(\*\*|__)(.+?)\1|(\*|_)(.+?)\3|`([^`]+)`|\[([^\]]+)\]\(([^)\s]+)(?:\s+"[^"]*")?\)|(https?:\/\/[^\s<]+[^\s<.,;:!?)])|\n/g;

function renderInline(text: string, keyPrefix = ""): ReactNode[] {
  const nodes: ReactNode[] = [];
  let last = 0;
  let n = 0;

  for (const match of text.matchAll(inlinePattern)) {
    const index = match.index ?? 0;
    if (index > last) nodes.push(text.slice(last, index));
    const key = `${keyPrefix}${n++}`;
    const [whole, , strong, , em, code, linkText, linkHref, bareUrl] = match;

    if (strong !== undefined) nodes.push(<strong key={key}>{renderInline(strong, `${key}-`)}</strong>);
    else if (em !== undefined) nodes.push(<em key={key}>{renderInline(em, `${key}-`)}</em>);
    else if (code !== undefined) nodes.push(<code key={key} className="rounded bg-surface-container px-1 py-0.5 text-[0.9em]">{code}</code>);
    else if (linkText !== undefined) {
      const href = safeHref(linkHref);
      nodes.push(href ? <MarkdownLink key={key} href={href}>{renderInline(linkText, `${key}-`)}</MarkdownLink> : <Fragment key={key}>{linkText}</Fragment>);
    } else if (bareUrl !== undefined) nodes.push(<MarkdownLink key={key} href={bareUrl}>{bareUrl}</MarkdownLink>);
    else if (whole === "\n") nodes.push(<br key={key} />);

    last = index + whole.length;
  }
  if (last < text.length) nodes.push(text.slice(last));
  return nodes;
}

function MarkdownLink({ href, children }: { href: string; children: ReactNode }) {
  const className = "font-medium text-primary underline-offset-2 hover:underline";
  if (href.startsWith("/") || href.startsWith("#")) {
    return (
      <Link href={href} className={className}>
        {children}
      </Link>
    );
  }
  const external = /^https?:/i.test(href);
  return (
    <a href={href} className={className} {...(external && { target: "_blank", rel: "noopener noreferrer" })}>
      {children}
    </a>
  );
}

const headingClass: Record<number, string> = {
  1: "mt-6 font-heading text-headline-md text-on-surface first:mt-0",
  2: "mt-6 font-heading text-headline-md text-on-surface first:mt-0",
  3: "mt-5 font-heading text-headline-sm text-on-surface first:mt-0",
};

export function Markdown({ source }: { source: string }) {
  return (
    <div className="flex flex-col gap-3 text-body-md leading-relaxed text-on-surface-variant">
      {parseBlocks(source).map((block, i) => {
        switch (block.type) {
          case "heading": {
            // The page title is the h1; the text's own headings start at h2.
            const level = Math.min(block.level + 1, 6);
            const Tag = `h${level}` as "h2";
            return (
              <Tag key={i} className={headingClass[block.level] ?? "mt-4 font-heading text-label-md text-on-surface first:mt-0"}>
                {renderInline(block.text)}
              </Tag>
            );
          }
          case "list": {
            const Tag = block.ordered ? "ol" : "ul";
            return (
              <Tag key={i} className={`flex flex-col gap-1 pl-5 ${block.ordered ? "list-decimal" : "list-disc"}`}>
                {block.items.map((item, j) => (
                  <li key={j}>{renderInline(item)}</li>
                ))}
              </Tag>
            );
          }
          case "quote":
            return (
              <blockquote key={i} className="border-l-4 border-primary-container/40 pl-3 italic">
                {renderInline(block.text)}
              </blockquote>
            );
          case "rule":
            return <hr key={i} className="my-2 border-surface-container-highest" />;
          default:
            return <p key={i}>{renderInline(block.text)}</p>;
        }
      })}
    </div>
  );
}
