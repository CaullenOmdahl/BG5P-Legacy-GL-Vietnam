"use client";

import { FormEvent, type ReactNode, useEffect, useMemo, useRef, useState } from "react";
import { useLocale } from "@/components/LocaleProvider";
import { trimUserFirstHistory } from "@/lib/chat/history";
import { getEffectiveLocale, SITE_LOCALE_EVENT, type Locale } from "@/lib/locale";

interface ChatSource {
  id: string;
  title: string;
  url: string;
  score: number;
}

interface ChatMessage {
  id: string;
  role: "assistant" | "user";
  content: string;
  sources?: ChatSource[];
}

type DiagnosticMode = "diagnose" | "decode-code" | "find-part" | "find-manual";

interface IntakeContext {
  symptom: string;
  flashCode: string;
  starts: string;
  condition: string;
  recentWork: string;
}

interface PageContext {
  path: string;
  title: string;
}

interface ChatCopy {
  floatingButton: string;
  eyebrow: string;
  title: string;
  intro: string;
  placeholder: string;
  close: string;
  ariaLabel: string;
  autoLocale: string;
  send: string;
  loading: string;
  usefulLinks: string;
  starterLabel: string;
  modeLabel: string;
  intakeLabel: string;
  symptom: string;
  flashCode: string;
  starts: string;
  condition: string;
  recentWork: string;
  copyChecklist: string;
  copied: string;
  askFollowUp: string;
  startOver: string;
  openFirstLink: string;
  pageAware: string;
  errors: {
    requestFailed: string;
  };
}

interface DiagnosticModeConfig {
  id: DiagnosticMode;
  label: string;
  shortLabel: string;
  description: string;
  starterPrompts: string[];
}

const DEFAULT_INTAKE: IntakeContext = {
  symptom: "",
  flashCode: "",
  starts: "",
  condition: "",
  recentWork: "",
};

const SESSION_STORAGE_KEY = "bg5-diagnosticSession-v1";
const CHAT_MESSAGES_STORAGE_KEY = "bg5-chat-messages-v1";
const MAX_PERSISTED_MESSAGES = 24;
const IMAGE_MARKDOWN_PREFIX = "![";

const COPY: Record<Locale, ChatCopy> = {
  en: {
    floatingButton: "Ask BG5P",
    eyebrow: "BG5P AI Workbench",
    title: "Diagnose, decode, find parts",
    intro:
      "Pick a mode or describe the symptom. I use the BG5P manuals and return public links only.",
    placeholder: "Describe the symptom, code, part number, or diagram…",
    close: "Close chat",
    ariaLabel: "BG5P diagnostic chat",
    autoLocale: "Auto",
    send: "Send message",
    loading: "Checking BG5P sources…",
    usefulLinks: "Useful Links",
    starterLabel: "Fast Starts",
    modeLabel: "Mode",
    intakeLabel: "Quick Context",
    symptom: "Symptom",
    flashCode: "Flash Code",
    starts: "Starts / Runs",
    condition: "Hot / Cold / Driving",
    recentWork: "Recent Work",
    copyChecklist: "Copy Checklist",
    copied: "Copied",
    askFollowUp: "Ask Follow-Up",
    startOver: "Start Over",
    openFirstLink: "Open First Link",
    pageAware: "Page-aware",
    errors: {
      requestFailed: "Chat request failed.",
    },
  },
  vi: {
    floatingButton: "Hỏi BG5P",
    eyebrow: "Bàn Chẩn Đoán BG5P",
    title: "Chẩn đoán, đọc mã, tìm phụ tùng",
    intro:
      "Chọn chế độ hoặc mô tả triệu chứng. Trợ lý dùng tài liệu BG5P và chỉ đưa link công khai.",
    placeholder: "Mô tả triệu chứng, mã lỗi, mã phụ tùng, hoặc sơ đồ…",
    close: "Đóng chat",
    ariaLabel: "Chat chẩn đoán BG5P",
    autoLocale: "Tự động",
    send: "Gửi tin nhắn",
    loading: "Đang tra tài liệu BG5P…",
    usefulLinks: "Link hữu ích",
    starterLabel: "Gợi ý nhanh",
    modeLabel: "Chế độ",
    intakeLabel: "Thông tin nhanh",
    symptom: "Triệu chứng",
    flashCode: "Mã nháy",
    starts: "Nổ máy / chạy",
    condition: "Nóng / lạnh / đang chạy",
    recentWork: "Sửa gần đây",
    copyChecklist: "Sao chép checklist",
    copied: "Đã sao chép",
    askFollowUp: "Hỏi tiếp",
    startOver: "Làm lại",
    openFirstLink: "Mở link đầu tiên",
    pageAware: "Theo trang",
    errors: {
      requestFailed: "Không gửi được câu hỏi.",
    },
  },
};

const MODES: Record<Locale, DiagnosticModeConfig[]> = {
  en: [
    {
      id: "diagnose",
      label: "Diagnose",
      shortLabel: "Diagnose",
      description: "Symptom-first checks",
      starterPrompts: [
        "What should I check first for rough idle?",
        "Cranks but does not start. What is the first path?",
        "Overheats at idle but cools while driving.",
        "Battery light is on while running.",
        "Clutch slips under load.",
      ],
    },
    {
      id: "decode-code",
      label: "Decode Flash Code",
      shortLabel: "Code",
      description: "Two-digit no-OBD codes",
      starterPrompts: [
        "What does EJ20E flash code 22 mean?",
        "How do I read no-OBD flash codes?",
      ],
    },
    {
      id: "find-part",
      label: "Find Part",
      shortLabel: "Part",
      description: "OEM numbers and diagrams",
      starterPrompts: [
        "Find the knock sensor diagram.",
        "What should I verify before buying a used alternator?",
      ],
    },
    {
      id: "find-manual",
      label: "Find Manual / Diagram",
      shortLabel: "Manual",
      description: "Direct PDFs and pages",
      starterPrompts: [
        "Find timing belt service references.",
        "Show me the engine electrical manuals.",
      ],
    },
  ],
  vi: [
    {
      id: "diagnose",
      label: "Chẩn Đoán",
      shortLabel: "Chẩn đoán",
      description: "Kiểm tra theo triệu chứng",
      starterPrompts: [
        "Máy rung ở ga-lăng-ti thì kiểm tra gì trước?",
        "Đề có quay nhưng không nổ, nên bắt đầu từ đâu?",
        "Máy nóng khi đứng yên nhưng mát khi chạy.",
        "Đèn bình sáng khi máy đang nổ.",
        "Côn bị trượt khi tải nặng.",
      ],
    },
    {
      id: "decode-code",
      label: "Đọc Mã Nháy",
      shortLabel: "Mã",
      description: "Mã 2 chữ số no-OBD",
      starterPrompts: [
        "Mã nháy EJ20E 22 nghĩa là gì?",
        "Cách đọc mã nháy no-OBD thế nào?",
      ],
    },
    {
      id: "find-part",
      label: "Tìm Phụ Tùng",
      shortLabel: "Phụ tùng",
      description: "Mã OEM và sơ đồ",
      starterPrompts: [
        "Tìm sơ đồ knock sensor.",
        "Trước khi mua alternator cũ cần kiểm tra gì?",
      ],
    },
    {
      id: "find-manual",
      label: "Tìm Tài Liệu / Sơ Đồ",
      shortLabel: "Tài liệu",
      description: "PDF và trang liên quan",
      starterPrompts: [
        "Tìm tài liệu thay timing belt.",
        "Cho tôi tài liệu hệ thống điện động cơ.",
      ],
    },
  ],
};

function ChatIcon() {
  return (
    <svg
      className="h-5 w-5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M21 11.5a8.4 8.4 0 0 1-8.5 8.5 8.8 8.8 0 0 1-3.7-.8L3 21l1.8-5.3A8.2 8.2 0 0 1 4 11.5 8.4 8.4 0 0 1 12.5 3 8.4 8.4 0 0 1 21 11.5Z" />
      <path d="M8.5 10.5h8" />
      <path d="M8.5 14h5.5" />
    </svg>
  );
}

function SendIcon() {
  return (
    <svg
      className="h-4 w-4"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="m22 2-7 20-4-9-9-4Z" />
      <path d="M22 2 11 13" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg
      className="h-4 w-4"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  );
}

function isSafeHref(href: string): boolean {
  if (href.startsWith("/")) return !href.startsWith("//");
  try {
    const url = new URL(href);
    return url.protocol === "https:" && url.hostname === "bg5.caphedigital.com";
  } catch {
    return false;
  }
}

function isSafeSourceHref(href: string): boolean {
  return href.startsWith("https://bg5.caphedigital.com/");
}

function isImageHref(href: string): boolean {
  const [withoutHash] = href.split("#", 1);
  const [pathname] = withoutHash.split("?", 1);
  return /\.(gif|png|jpe?g|webp)$/i.test(pathname);
}

function isSafeLocalDiagramImageHref(href: string): boolean {
  if (!href.startsWith("/diagrams/")) return false;

  try {
    const url = new URL(href, "https://bg5.caphedigital.com");
    if (url.origin !== "https://bg5.caphedigital.com") return false;
    const decodedPath = decodeURIComponent(url.pathname);
    if (decodedPath.split("/").includes("..")) return false;
    return decodedPath.startsWith("/diagrams/");
  } catch {
    return false;
  }
}

function isAllowedImageHref(href: string): boolean {
  if (!isImageHref(href)) return false;

  if (isSafeLocalDiagramImageHref(href)) {
    return true;
  }

  try {
    const url = new URL(href);
    return url.protocol === "https:" && url.hostname === "bg5.caphedigital.com";
  } catch {
    return false;
  }
}

function renderImageMarkdown(line: string, key: string): ReactNode | null {
  if (!line.startsWith(IMAGE_MARKDOWN_PREFIX)) return null;

  const image = line.match(/^!\[([^\]]*)\]\(([^)\s]+)\)$/);
  if (!image) return null;

  const alt = image[1].trim();
  const href = image[2].trim();
  if (!isAllowedImageHref(href)) return null;

  return (
    <figure key={key} className="my-2 overflow-hidden rounded-md border border-border bg-panel">
      <img src={href} alt={alt} className="max-h-80 w-full object-contain" loading="lazy" />
      {alt && (
        <figcaption className="border-t border-border px-2 py-1 text-[11px] text-muted">
          {alt}
        </figcaption>
      )}
    </figure>
  );
}

function inlineSourcePreview(source: ChatSource): ReactNode | null {
  if (!isAllowedImageHref(source.url)) return null;

  return (
    <figure className="mb-1 overflow-hidden rounded-md border border-border bg-panel">
      <img
        src={source.url}
        alt={source.title}
        className="max-h-36 w-full object-contain"
        loading="lazy"
      />
    </figure>
  );
}

function renderInlineMarkdown(text: string, keyPrefix: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  const pattern = /(\[[^\]]+\]\([^)]+\)|https?:\/\/[^\s)]+|`[^`]+`|\*\*[^*]+\*\*|\*[^*]+\*)/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let index = 0;

  while ((match = pattern.exec(text))) {
    if (match.index > lastIndex) {
      nodes.push(text.slice(lastIndex, match.index));
    }

    const token = match[0];
    const key = `${keyPrefix}-${index}`;

    if (token.startsWith("[") && token.includes("](")) {
      const labelEnd = token.indexOf("](");
      const label = token.slice(1, labelEnd);
      const href = token.slice(labelEnd + 2, -1);
      nodes.push(
        isSafeHref(href) ? (
          <a
            key={key}
            href={href}
            target={href.startsWith("http") ? "_blank" : undefined}
            rel={href.startsWith("http") ? "noreferrer" : undefined}
            className="text-accent underline decoration-accent/40 underline-offset-2 hover:text-accent-hover"
          >
            {label}
          </a>
        ) : (
          label
        )
      );
    } else if (token.startsWith("http") && isSafeHref(token)) {
      nodes.push(
        <a
          key={key}
          href={token}
          target="_blank"
          rel="noreferrer"
          className="text-accent underline decoration-accent/40 underline-offset-2 hover:text-accent-hover"
        >
          {token}
        </a>
      );
    } else if (token.startsWith("`")) {
      nodes.push(
        <code key={key} className="rounded bg-surface px-1 py-0.5 text-[0.9em] text-foreground">
          {token.slice(1, -1)}
        </code>
      );
    } else if (token.startsWith("**")) {
      nodes.push(
        <strong key={key} className="font-semibold text-foreground">
          {token.slice(2, -2)}
        </strong>
      );
    } else if (token.startsWith("*")) {
      nodes.push(
        <em key={key} className="italic">
          {token.slice(1, -1)}
        </em>
      );
    }

    lastIndex = pattern.lastIndex;
    index += 1;
  }

  if (lastIndex < text.length) {
    nodes.push(text.slice(lastIndex));
  }

  return nodes;
}

function splitTableRow(line: string): string[] {
  return line
    .replace(/^\|/, "")
    .replace(/\|$/, "")
    .split("|")
    .map((cell) => cell.trim());
}

function isTableSeparator(line: string): boolean {
  return /^\s*\|?\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)+\|?\s*$/.test(line);
}

function renderMarkdownBlocks(content: string): ReactNode[] {
  const lines = content.replace(/\r\n/g, "\n").split("\n");
  const blocks: ReactNode[] = [];
  let paragraph: string[] = [];
  let listItems: string[] = [];
  let orderedItems: string[] = [];
  let codeLines: string[] = [];
  let inCodeBlock = false;

  function flushParagraph() {
    if (paragraph.length === 0) return;
    const text = paragraph.join(" ").trim();
    if (text) {
      blocks.push(
        <p key={`p-${blocks.length}`} className="my-2">
          {renderInlineMarkdown(text, `p-${blocks.length}`)}
        </p>
      );
    }
    paragraph = [];
  }

  function flushLists() {
    if (listItems.length > 0) {
      blocks.push(
        <ul key={`ul-${blocks.length}`} className="my-2 ml-4 list-disc space-y-1">
          {listItems.map((item, index) => (
            <li key={index}>{renderInlineMarkdown(item, `ul-${blocks.length}-${index}`)}</li>
          ))}
        </ul>
      );
      listItems = [];
    }

    if (orderedItems.length > 0) {
      blocks.push(
        <ol key={`ol-${blocks.length}`} className="my-2 ml-4 list-decimal space-y-1">
          {orderedItems.map((item, index) => (
            <li key={index}>{renderInlineMarkdown(item, `ol-${blocks.length}-${index}`)}</li>
          ))}
        </ol>
      );
      orderedItems = [];
    }
  }

  function flushCodeBlock() {
    if (codeLines.length === 0) return;
    blocks.push(
      <pre
        key={`code-${blocks.length}`}
        className="my-2 overflow-x-auto rounded border border-border bg-surface p-2 text-xs text-foreground"
      >
        <code>{codeLines.join("\n")}</code>
      </pre>
    );
    codeLines = [];
  }

  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i];
    const trimmed = line.trim();

    if (trimmed.startsWith("```")) {
      if (inCodeBlock) {
        inCodeBlock = false;
        flushCodeBlock();
      } else {
        flushParagraph();
        flushLists();
        inCodeBlock = true;
      }
      continue;
    }

    if (inCodeBlock) {
      codeLines.push(line);
      continue;
    }

    if (!trimmed) {
      flushParagraph();
      flushLists();
      continue;
    }

    const image = renderImageMarkdown(trimmed, `img-${blocks.length}`);
    if (image) {
      flushParagraph();
      flushLists();
      blocks.push(image);
      continue;
    }

    const heading = trimmed.match(/^(#{1,4})\s+(.+)$/);
    if (heading) {
      flushParagraph();
      flushLists();
      const level = heading[1].length;
      const className =
        level === 1
          ? "mt-1 mb-2 text-base font-semibold text-foreground"
          : "mt-3 mb-1 text-sm font-semibold text-foreground";
      blocks.push(
        <p key={`h-${blocks.length}`} className={className}>
          {renderInlineMarkdown(heading[2], `h-${blocks.length}`)}
        </p>
      );
      continue;
    }

    if (/^[-*_]{3,}$/.test(trimmed)) {
      flushParagraph();
      flushLists();
      blocks.push(<hr key={`hr-${blocks.length}`} className="my-3 border-border" />);
      continue;
    }

    if (
      trimmed.includes("|") &&
      i + 1 < lines.length &&
      isTableSeparator(lines[i + 1].trim())
    ) {
      flushParagraph();
      flushLists();
      const header = splitTableRow(trimmed);
      const rows: string[][] = [];
      i += 2;
      while (i < lines.length && lines[i].trim().includes("|")) {
        rows.push(splitTableRow(lines[i].trim()));
        i += 1;
      }
      i -= 1;

      blocks.push(
        <div key={`table-${blocks.length}`} className="my-2 overflow-x-auto">
          <table className="min-w-full border-collapse text-xs">
            <thead>
              <tr>
                {header.map((cell, index) => (
                  <th
                    key={index}
                    className="border border-border bg-surface px-2 py-1 text-left font-semibold text-foreground"
                  >
                    {renderInlineMarkdown(cell, `th-${blocks.length}-${index}`)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, rowIndex) => (
                <tr key={rowIndex}>
                  {row.map((cell, cellIndex) => (
                    <td key={cellIndex} className="border border-border px-2 py-1 align-top">
                      {renderInlineMarkdown(cell, `td-${blocks.length}-${rowIndex}-${cellIndex}`)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
      continue;
    }

    const quote = trimmed.match(/^>\s?(.+)$/);
    if (quote) {
      flushParagraph();
      flushLists();
      blocks.push(
        <blockquote
          key={`quote-${blocks.length}`}
          className="my-2 border-l-2 border-accent/60 pl-3 text-muted"
        >
          {renderInlineMarkdown(quote[1], `quote-${blocks.length}`)}
        </blockquote>
      );
      continue;
    }

    const unordered = trimmed.match(/^[-*]\s+(.+)$/);
    if (unordered) {
      flushParagraph();
      if (orderedItems.length > 0) flushLists();
      listItems.push(unordered[1]);
      continue;
    }

    const ordered = trimmed.match(/^\d+\.\s+(.+)$/);
    if (ordered) {
      flushParagraph();
      if (listItems.length > 0) flushLists();
      orderedItems.push(ordered[1]);
      continue;
    }

    flushLists();
    paragraph.push(trimmed);
  }

  flushParagraph();
  flushLists();
  if (inCodeBlock) flushCodeBlock();

  return blocks;
}

function MarkdownMessage({ content }: { content: string }) {
  return <div className="break-words">{renderMarkdownBlocks(content)}</div>;
}

function createInitialMessage(locale: Locale): ChatMessage {
  return {
    id: "initial",
    role: "assistant",
    content: COPY[locale].intro,
  };
}

function toPersistableSource(value: unknown): ChatSource | null {
  if (!value || typeof value !== "object") return null;
  const source = value as Partial<ChatSource>;
  if (
    typeof source.id !== "string" ||
    typeof source.title !== "string" ||
    typeof source.url !== "string" ||
    typeof source.score !== "number" ||
    !isSafeSourceHref(source.url)
  ) {
    return null;
  }

  return {
    id: source.id,
    title: source.title,
    url: source.url,
    score: source.score,
  };
}

function toPersistableMessage(value: unknown): ChatMessage | null {
  if (!value || typeof value !== "object") return null;
  const message = value as Partial<ChatMessage>;
  if (
    typeof message.id !== "string" ||
    (message.role !== "assistant" && message.role !== "user") ||
    typeof message.content !== "string"
  ) {
    return null;
  }

  const sources = Array.isArray(message.sources)
    ? message.sources
        .map(toPersistableSource)
        .filter((source): source is ChatSource => Boolean(source))
    : undefined;

  return {
    id: message.id,
    role: message.role,
    content: message.content,
    ...(sources && sources.length > 0 ? { sources } : {}),
  };
}

function loadPersistedMessages(locale: Locale): ChatMessage[] {
  if (typeof window === "undefined") return [createInitialMessage(locale)];

  try {
    const raw = window.localStorage.getItem(CHAT_MESSAGES_STORAGE_KEY);
    if (!raw) return [createInitialMessage(locale)];

    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [createInitialMessage(locale)];

    const messages = parsed
      .map(toPersistableMessage)
      .filter((message): message is ChatMessage => Boolean(message))
      .slice(-MAX_PERSISTED_MESSAGES);

    return messages.length > 0 ? messages : [createInitialMessage(locale)];
  } catch {
    return [createInitialMessage(locale)];
  }
}

function savePersistedMessages(messages: ChatMessage[]) {
  if (typeof window === "undefined") return;

  try {
    const persistableMessages = messages
      .map(toPersistableMessage)
      .filter((message): message is ChatMessage => Boolean(message))
      .slice(-MAX_PERSISTED_MESSAGES)
      .map(({ id, role, content, sources }) => ({
        id,
        role,
        content,
        ...(sources && sources.length > 0 ? { sources } : {}),
      }));

    if (persistableMessages.length === 1 && persistableMessages[0].id === "initial") {
      window.localStorage.removeItem(CHAT_MESSAGES_STORAGE_KEY);
      return;
    }

    window.localStorage.setItem(
      CHAT_MESSAGES_STORAGE_KEY,
      JSON.stringify(persistableMessages)
    );
  } catch {
    // Chat history persistence is optional; the assistant still works without it.
  }
}

function normalizeChatSources(value: unknown): ChatSource[] | undefined {
  if (!Array.isArray(value)) return undefined;
  const sources = value
    .map(toPersistableSource)
    .filter((source): source is ChatSource => Boolean(source));
  return sources.length > 0 ? sources : undefined;
}

function getPageContext(): PageContext {
  if (typeof window === "undefined") {
    return { path: "/", title: "BG5P Legacy GL" };
  }

  return {
    path: window.location.pathname,
    title: document.title || "BG5P Legacy GL",
  };
}

function stripMarkdown(content: string): string {
  return content
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/^\s{0,3}[-*+]\s+/gm, "")
    .replace(/^\s{0,3}#{1,6}\s+/gm, "")
    .replace(/^>\s?/gm, "")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\*([^*]+)\*/g, "$1")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function buildFallbackPrompt(mode: DiagnosticMode, intake: IntakeContext, locale: Locale): string {
  if (mode === "decode-code" && intake.flashCode) {
    return locale === "vi"
      ? `Mã nháy EJ20E ${intake.flashCode} nghĩa là gì?`
      : `What does EJ20E flash code ${intake.flashCode} mean?`;
  }
  if (mode === "find-part" && intake.symptom) {
    return locale === "vi"
      ? `Tìm phụ tùng hoặc sơ đồ liên quan tới: ${intake.symptom}`
      : `Find the part or diagram related to: ${intake.symptom}`;
  }
  if (mode === "find-manual" && intake.symptom) {
    return locale === "vi"
      ? `Tìm tài liệu hoặc sơ đồ cho: ${intake.symptom}`
      : `Find the manual or diagram for: ${intake.symptom}`;
  }
  if (intake.symptom) return intake.symptom;
  return "";
}

function saveDiagnosticSession(mode: DiagnosticMode, intake: IntakeContext) {
  try {
    window.localStorage.setItem(
      SESSION_STORAGE_KEY,
      JSON.stringify({ mode, intake })
    );
  } catch {
    // Local storage is optional; the assistant still works without it.
  }
}

function loadDiagnosticSession():
  | { mode?: DiagnosticMode; intake?: Partial<IntakeContext> }
  | null {
  try {
    const raw = window.localStorage.getItem(SESSION_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as { mode?: DiagnosticMode; intake?: Partial<IntakeContext> };
  } catch {
    return null;
  }
}

export default function Bg5ChatWidget() {
  const { locale } = useLocale();
  const [mode, setMode] = useState<DiagnosticMode>("diagnose");
  const [intake, setIntake] = useState<IntakeContext>(DEFAULT_INTAKE);
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    createInitialMessage(getEffectiveLocale(locale)),
  ]);
  const [messagesHydrated, setMessagesHydrated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copiedId, setCopiedId] = useState("");
  const [pageContext, setPageContext] = useState<PageContext>({
    path: "/",
    title: "BG5P Legacy GL",
  });
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const copy = COPY[locale];
  const modes = MODES[locale];
  const activeMode = modes.find((candidate) => candidate.id === mode) ?? modes[0];
  const starterPrompts = activeMode.starterPrompts;
  const diagnosticSession = useMemo(
    () => ({ locale, mode, intake, pageContext }),
    [locale, mode, intake, pageContext]
  );

  useEffect(() => {
    setPageContext(getPageContext());

    const stored = loadDiagnosticSession();
    if (!stored) return;

    if (
      stored.mode === "diagnose" ||
      stored.mode === "decode-code" ||
      stored.mode === "find-part" ||
      stored.mode === "find-manual"
    ) {
      setMode(stored.mode);
    }
    if (stored.intake) {
      setIntake((current) => ({ ...current, ...stored.intake }));
    }
  }, []);

  useEffect(() => {
    setMessages(loadPersistedMessages(getEffectiveLocale(locale)));
    setMessagesHydrated(true);
  }, []);

  useEffect(() => {
    setMessages((current) =>
      current.length === 1 && current[0].id === "initial"
        ? [createInitialMessage(getEffectiveLocale(locale))]
        : current
    );
  }, [locale]);

  useEffect(() => {
    function handleSiteLocaleChange(event: Event) {
      const nextLocale =
        (event as CustomEvent<{ locale?: Locale }>).detail?.locale ?? getEffectiveLocale(locale);

      setMessages((current) =>
        current.length === 1 && current[0].id === "initial"
          ? [createInitialMessage(nextLocale)]
          : current
      );
    }

    window.addEventListener(SITE_LOCALE_EVENT, handleSiteLocaleChange);
    return () => {
      window.removeEventListener(SITE_LOCALE_EVENT, handleSiteLocaleChange);
    };
  }, [locale]);

  useEffect(() => {
    if (!messagesHydrated) return;
    savePersistedMessages(messages);
  }, [messages, messagesHydrated]);

  useEffect(() => {
    saveDiagnosticSession(mode, intake);
  }, [mode, intake]);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    function handleOpenChat(event: Event) {
      const detail = (event as CustomEvent<{
        prompt?: string;
        mode?: DiagnosticMode;
      }>).detail;

      if (
        detail?.mode === "diagnose" ||
        detail?.mode === "decode-code" ||
        detail?.mode === "find-part" ||
        detail?.mode === "find-manual"
      ) {
        setMode(detail.mode);
      }
      if (detail?.prompt) setInput(detail.prompt);
      setPageContext(getPageContext());
      setOpen(true);
      window.setTimeout(() => inputRef.current?.focus(), 80);
    }

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("bg5:open-chat", handleOpenChat);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("bg5:open-chat", handleOpenChat);
    };
  }, []);

  function openPanel() {
    setPageContext(getPageContext());
    setOpen(true);
    window.setTimeout(() => inputRef.current?.focus(), 80);
  }

  function updateIntake(field: keyof IntakeContext, value: string) {
    setIntake((current) => ({ ...current, [field]: value }));
  }

  async function sendPrompt(prompt: string) {
    const trimmed = prompt.trim() || buildFallbackPrompt(mode, intake, locale);
    if (!trimmed || loading) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: trimmed,
    };
    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages);
    setInput("");
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          locale,
          diagnosticMode: mode,
          intake,
          pageContext: diagnosticSession.pageContext,
          messages: trimUserFirstHistory(
            nextMessages.filter((message) => message.id !== "initial")
          ).map(({ role, content }) => ({ role, content })),
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || copy.errors.requestFailed);
      }

      setMessages((current) => [
        ...current,
        {
          id: `assistant-${Date.now()}`,
          role: "assistant",
          content: data.answer,
          sources: normalizeChatSources(data.sources),
        },
      ]);
    } catch (err) {
      setError(err instanceof Error ? err.message : copy.errors.requestFailed);
    } finally {
      setLoading(false);
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    sendPrompt(input);
  }

  async function copyAnswer(message: ChatMessage) {
    try {
      await navigator.clipboard.writeText(stripMarkdown(message.content));
      setCopiedId(message.id);
      window.setTimeout(() => setCopiedId(""), 1400);
    } catch {
      setError(copy.errors.requestFailed);
    }
  }

  function startOver() {
    try {
      window.localStorage.removeItem(CHAT_MESSAGES_STORAGE_KEY);
    } catch {
      // Chat history persistence is optional; start-over still resets local state.
    }
    setInput("");
    setError("");
    setMessages([createInitialMessage(locale)]);
    setIntake(DEFAULT_INTAKE);
  }

  return (
    <div
      className="fixed bottom-3 right-3 z-[60] sm:bottom-5 sm:right-5"
      data-diagnostic-session={diagnosticSession.mode}
    >
      {open && (
        <section
          className="mb-3 flex h-[min(820px,calc(100vh-5.25rem))] w-[calc(100vw-1.5rem)] max-w-[620px] flex-col overflow-hidden rounded-lg border border-border bg-panel shadow-2xl shadow-black/50 sm:h-[calc(100vh-2.5rem)] sm:w-[560px]"
          aria-label={copy.ariaLabel}
        >
          <header className="flex items-center justify-between gap-3 border-b border-border bg-background/90 px-4 py-3">
            <div className="min-w-0">
              <p className="font-mono text-[10px] uppercase tracking-widest text-accent">
                {copy.eyebrow}
              </p>
              <h2 className="truncate text-sm font-semibold text-foreground">
                {copy.title}
              </h2>
              <p className="mt-0.5 truncate text-[11px] text-muted">
                {copy.pageAware}: {diagnosticSession.pageContext.path}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="rounded-md border border-border bg-surface px-2 py-1.5 font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-muted">
                {copy.autoLocale} {locale.toUpperCase()}
              </span>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-border text-muted transition-colors hover:border-accent hover:text-foreground"
                aria-label={copy.close}
              >
                <CloseIcon />
              </button>
            </div>
          </header>

          <div className="border-b border-border bg-surface/55 px-3 py-3">
            <p className="mb-2 font-mono text-[10px] uppercase tracking-widest text-muted">
              {copy.modeLabel}
            </p>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {modes.map((candidate) => (
                <button
                  key={candidate.id}
                  type="button"
                  onClick={() => setMode(candidate.id)}
                  className={`rounded-md border px-2.5 py-2 text-left transition-colors ${
                    mode === candidate.id
                      ? "border-accent bg-accent text-background"
                      : "border-border bg-background text-muted hover:border-accent hover:text-foreground"
                  }`}
                >
                  <span className="block text-xs font-semibold">{candidate.shortLabel}</span>
                  <span className="mt-0.5 block text-[10px] leading-snug text-muted">
                    {candidate.description}
                  </span>
                </button>
              ))}
            </div>

            <details className="mt-3 rounded-md border border-border bg-background/75 px-3 py-2">
              <summary className="cursor-pointer select-none font-mono text-[10px] uppercase tracking-widest text-muted">
                {copy.intakeLabel}
              </summary>
              <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
                <label className="text-[11px] text-muted">
                  {copy.symptom}
                  <input
                    name="symptom"
                    value={intake.symptom}
                    onChange={(event) => updateIntake("symptom", event.target.value)}
                    autoComplete="off"
                    className="mt-1 w-full rounded-md border border-border bg-panel px-2 py-1.5 text-xs text-foreground focus:border-accent"
                  />
                </label>
                <label className="text-[11px] text-muted">
                  {copy.flashCode}
                  <input
                    name="flash-code"
                    value={intake.flashCode}
                    onChange={(event) => updateIntake("flashCode", event.target.value)}
                    inputMode="numeric"
                    autoComplete="off"
                    className="mt-1 w-full rounded-md border border-border bg-panel px-2 py-1.5 text-xs text-foreground focus:border-accent"
                  />
                </label>
                <label className="text-[11px] text-muted">
                  {copy.starts}
                  <input
                    name="starts"
                    value={intake.starts}
                    onChange={(event) => updateIntake("starts", event.target.value)}
                    autoComplete="off"
                    className="mt-1 w-full rounded-md border border-border bg-panel px-2 py-1.5 text-xs text-foreground focus:border-accent"
                  />
                </label>
                <label className="text-[11px] text-muted">
                  {copy.condition}
                  <input
                    name="condition"
                    value={intake.condition}
                    onChange={(event) => updateIntake("condition", event.target.value)}
                    autoComplete="off"
                    className="mt-1 w-full rounded-md border border-border bg-panel px-2 py-1.5 text-xs text-foreground focus:border-accent"
                  />
                </label>
                <label className="text-[11px] text-muted sm:col-span-2">
                  {copy.recentWork}
                  <input
                    name="recent-work"
                    value={intake.recentWork}
                    onChange={(event) => updateIntake("recentWork", event.target.value)}
                    autoComplete="off"
                    className="mt-1 w-full rounded-md border border-border bg-panel px-2 py-1.5 text-xs text-foreground focus:border-accent"
                  />
                </label>
              </div>
            </details>
          </div>

          <div className="flex-1 overflow-y-auto overscroll-contain px-3 py-3" aria-live="polite">
            <div className="flex flex-col gap-3">
              {messages.map((message) => (
                <article
                  key={message.id}
                    className={`max-w-[94%] rounded-lg px-3 py-2 text-sm leading-relaxed ${
                    message.role === "user"
                      ? "ml-auto bg-accent text-background"
                      : "mr-auto border border-border bg-background text-foreground"
                  }`}
                >
                  {message.role === "assistant" ? (
                    <MarkdownMessage content={message.content} />
                  ) : (
                    <div className="whitespace-pre-wrap break-words">{message.content}</div>
                  )}
                  {message.sources && message.sources.length > 0 && (
                    <div className="mt-3 border-t border-border pt-2">
                      <p className="mb-1 font-mono text-[10px] uppercase tracking-widest text-muted">
                        {copy.usefulLinks}
                      </p>
                      <ul className="grid grid-cols-1 gap-1">
                        {message.sources.slice(0, 4).map((source) => (
                          <li key={source.id}>
                            {inlineSourcePreview(source)}
                            <a
                              href={source.url}
                              target="_blank"
                              rel="noreferrer"
                              className="block rounded-md border border-border bg-panel px-2 py-1.5 text-xs text-foreground hover:border-accent hover:text-accent-hover"
                            >
                              {source.title}
                            </a>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {message.role === "assistant" && message.id !== "initial" && (
                    <div className="mt-3 flex flex-wrap gap-2 border-t border-border pt-2">
                      {message.sources?.[0] && (
                        <a
                          href={message.sources[0].url}
                          target="_blank"
                          rel="noreferrer"
                          className="rounded-md border border-border px-2 py-1 text-[11px] text-muted hover:border-accent hover:text-foreground"
                        >
                          {copy.openFirstLink}
                        </a>
                      )}
                      <button
                        type="button"
                        onClick={() => copyAnswer(message)}
                        className="rounded-md border border-border px-2 py-1 text-[11px] text-muted hover:border-accent hover:text-foreground"
                      >
                        {copiedId === message.id ? copy.copied : copy.copyChecklist}
                      </button>
                      <button
                        type="button"
                        onClick={() => inputRef.current?.focus()}
                        className="rounded-md border border-border px-2 py-1 text-[11px] text-muted hover:border-accent hover:text-foreground"
                      >
                        {copy.askFollowUp}
                      </button>
                    </div>
                  )}
                </article>
              ))}

              {loading && (
                <div className="mr-auto rounded-lg border border-border bg-background px-3 py-2 text-sm text-muted">
                  {copy.loading}
                </div>
              )}
            </div>
          </div>

          {messages.length === 1 && (
            <div className="border-t border-border px-3 py-2">
              <p className="mb-2 font-mono text-[10px] uppercase tracking-widest text-muted">
                {copy.starterLabel}
              </p>
              <div className="flex flex-wrap gap-2">
                {starterPrompts.map((prompt) => (
                  <button
                    key={prompt}
                    type="button"
                    onClick={() => sendPrompt(prompt)}
                    className="rounded-md border border-border bg-background px-2.5 py-1.5 text-left text-xs text-muted transition-colors hover:border-accent hover:text-foreground"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="border-t border-border p-3">
            {error && (
              <p className="mb-2 rounded border border-red-900/60 bg-red-950/30 px-3 py-2 text-xs text-red-200">
                {error}
              </p>
            )}
            <div className="flex items-end gap-2">
              <textarea
                ref={inputRef}
                name="bg5-diagnostic-question"
                value={input}
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !event.shiftKey) {
                    event.preventDefault();
                    sendPrompt(input);
                  }
                }}
                placeholder={copy.placeholder}
                aria-label={copy.placeholder}
                autoComplete="off"
                className="max-h-32 min-h-11 flex-1 resize-none rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted focus:border-accent"
                rows={2}
                maxLength={1800}
                disabled={loading}
              />
              <button
                type="submit"
                disabled={loading || !(input.trim() || buildFallbackPrompt(mode, intake, locale))}
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-accent text-background transition-colors hover:bg-accent-hover disabled:cursor-not-allowed disabled:bg-border disabled:text-muted"
                aria-label={copy.send}
              >
                <SendIcon />
              </button>
            </div>
            <div className="mt-2 flex items-center justify-between gap-2">
              <span className="truncate text-[10px] text-muted">
                {activeMode.label}
              </span>
              <button
                type="button"
                onClick={startOver}
                className="rounded-md border border-border px-2 py-1 text-[11px] text-muted hover:border-accent hover:text-foreground"
              >
                {copy.startOver}
              </button>
            </div>
          </form>
        </section>
      )}

      <button
        type="button"
        onClick={open ? () => setOpen(false) : openPanel}
        className="flex min-h-12 min-w-12 items-center justify-center gap-2 rounded-full border border-accent/40 bg-accent p-3 text-sm font-semibold text-background shadow-xl shadow-black/30 transition-colors hover:bg-accent-hover sm:px-4"
        aria-label={open ? copy.close : copy.floatingButton}
        aria-expanded={open}
      >
        <ChatIcon />
        <span className="hidden sm:inline">{copy.floatingButton}</span>
      </button>
    </div>
  );
}
