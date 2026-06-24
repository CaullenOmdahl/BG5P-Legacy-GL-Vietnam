"use client";

import { FormEvent, useState } from "react";
import { Bot, FileSearch, MessageSquareText, ScanSearch, Wrench } from "lucide-react";
import { useLocale } from "@/components/LocaleProvider";

type DiagnosticMode = "diagnose" | "decode-code" | "find-part" | "find-manual";

const copy = {
  en: {
    title: "BG5P AI",
    subtitle: "Get a short diagnostic path with public manual links.",
    placeholder: "flash code 22, rough idle hot, knock sensor part diagram…",
    ask: "Run diagnostic",
    mode: "Mode",
    context: "No OBD-II · EJ20E SOHC · SSM1 / flash codes",
    modes: {
      diagnose: "Diagnose",
      "decode-code": "Decode code",
      "find-part": "Find part",
      "find-manual": "Find manual",
    },
  },
  vi: {
    title: "AI BG5P",
    subtitle: "Nhận hướng kiểm tra ngắn và link tài liệu công khai.",
    placeholder: "mã nháy 22, máy rung khi nóng, sơ đồ knock sensor…",
    ask: "Chẩn đoán",
    mode: "Chế độ",
    context: "Không OBD-II · EJ20E SOHC · SSM1 / mã nháy",
    modes: {
      diagnose: "Chẩn đoán",
      "decode-code": "Đọc mã",
      "find-part": "Tìm phụ tùng",
      "find-manual": "Tìm tài liệu",
    },
  },
} as const;

const modeIcons = {
  diagnose: MessageSquareText,
  "decode-code": ScanSearch,
  "find-part": Wrench,
  "find-manual": FileSearch,
} satisfies Record<DiagnosticMode, typeof Bot>;

export default function Bg5HomeAssistant() {
  const { locale } = useLocale();
  const [mode, setMode] = useState<DiagnosticMode>("diagnose");
  const [prompt, setPrompt] = useState("");
  const text = copy[locale];

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    window.dispatchEvent(
      new CustomEvent("bg5:open-chat", {
        detail: {
          prompt: prompt.trim(),
          mode,
          locale,
        },
      })
    );
  }

  return (
    <section className="bg5-panel-strong min-w-0 rounded-lg p-4 sm:p-5">
      <div className="flex min-w-0 items-start justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-md border border-accent/40 bg-accent/12 text-accent">
            <Bot className="h-5 w-5" aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <h2 className="text-xl font-semibold tracking-tight text-foreground">
              {text.title}
            </h2>
            <p className="mt-1 text-sm leading-5 text-muted">{text.subtitle}</p>
          </div>
        </div>

        <span className="shrink-0 rounded-md border border-border bg-background px-2 py-1.5 font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-muted">
          Auto {locale.toUpperCase()}
        </span>
      </div>

      <div className="mt-5 grid min-w-0 grid-cols-2 gap-2">
        {(Object.keys(text.modes) as DiagnosticMode[]).map((candidate) => {
          const Icon = modeIcons[candidate];
          const selected = mode === candidate;
          return (
            <button
              key={candidate}
              type="button"
              onClick={() => setMode(candidate)}
              className={`min-w-0 flex items-center gap-2 rounded-md border px-3 py-2 text-left text-xs font-semibold transition-colors ${
                selected
                  ? "border-accent bg-accent text-background"
                  : "border-border bg-background/70 text-muted hover:border-accent hover:text-foreground"
              }`}
            >
              <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
              <span className="truncate">{text.modes[candidate]}</span>
            </button>
          );
        })}
      </div>

      <form onSubmit={submit} className="mt-4 flex flex-col gap-3">
        <label className="sr-only" htmlFor="home-ai-prompt">
          {text.placeholder}
        </label>
        <textarea
          id="home-ai-prompt"
          name="home-ai-prompt"
          value={prompt}
          onChange={(event) => setPrompt(event.target.value)}
          autoComplete="off"
          placeholder={text.placeholder}
          className="min-h-28 resize-none rounded-md border border-border bg-background/85 px-3 py-3 text-sm leading-6 text-foreground placeholder:text-muted/70 focus:border-accent"
        />
        <div className="flex items-center justify-between gap-3">
          <span className="min-w-0 truncate font-mono text-[10px] uppercase tracking-[0.16em] text-muted">
            {text.context}
          </span>
          <button
            type="submit"
            className="shrink-0 rounded-md bg-accent px-4 py-2.5 text-sm font-semibold text-background transition-colors hover:bg-accent-hover"
          >
            {text.ask}
          </button>
        </div>
      </form>
    </section>
  );
}
