"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import type { MaintenanceCard as MaintenanceCardType } from "@/lib/data";

const difficultyColors: Record<string, string> = {
  Easy: "bg-green-600 text-white",
  Moderate: "bg-amber text-black",
  Advanced: "bg-red-600 text-white",
};

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      className={`h-4 w-4 shrink-0 transition-transform ${open ? "rotate-180" : ""}`}
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={2}
      stroke="currentColor"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
    </svg>
  );
}

export default function MaintenanceCard({ card }: { card: MaintenanceCardType }) {
  const [specsOpen, setSpecsOpen] = useState(false);
  const [stepsOpen, setStepsOpen] = useState(false);

  // Expand by default on desktop (md+)
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    if (mq.matches) {
      setSpecsOpen(true);
      setStepsOpen(true);
    }
  }, []);

  const badgeClass = difficultyColors[card.difficulty] ?? "bg-muted text-foreground";

  return (
    <div className="rounded-lg border border-border bg-surface p-5 flex flex-col gap-4">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-lg font-semibold text-foreground">{card.title}</h3>
          <span
            className={`shrink-0 rounded px-2 py-0.5 text-xs font-semibold ${badgeClass}`}
          >
            {card.difficulty}
          </span>
        </div>
        <p className="text-sm text-muted">{card.interval}</p>
      </div>

      {/* Specs Section */}
      {card.specs.length > 0 && (
        <div className="border-t border-border pt-3">
          <button
            onClick={() => setSpecsOpen(!specsOpen)}
            className="flex w-full items-center justify-between text-sm font-medium text-foreground hover:text-accent transition-colors"
            aria-expanded={specsOpen}
          >
            <span>Specs</span>
            <ChevronIcon open={specsOpen} />
          </button>
          {specsOpen && (
            <div className="mt-3 overflow-x-auto">
              <table className="w-full text-sm">
                <tbody>
                  {card.specs.map((spec, i) => (
                    <tr
                      key={spec.label}
                      className={i % 2 === 0 ? "bg-background/50" : ""}
                    >
                      <td className="py-1.5 px-2 text-muted whitespace-nowrap">
                        {spec.label}
                      </td>
                      <td className="py-1.5 px-2 text-foreground font-medium">
                        {spec.value}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Steps Section */}
      {card.steps.length > 0 && (
        <div className="border-t border-border pt-3">
          <button
            onClick={() => setStepsOpen(!stepsOpen)}
            className="flex w-full items-center justify-between text-sm font-medium text-foreground hover:text-accent transition-colors"
            aria-expanded={stepsOpen}
          >
            <span>Steps</span>
            <ChevronIcon open={stepsOpen} />
          </button>
          {stepsOpen && (
            <ol className="mt-3 space-y-2 text-sm text-foreground list-decimal list-inside marker:text-muted">
              {card.steps.map((step, i) => (
                <li key={i} className="leading-relaxed">
                  {step}
                </li>
              ))}
            </ol>
          )}
        </div>
      )}

      {/* Related Links */}
      {(card.relatedPdfs.length > 0 || card.relatedDiagrams.length > 0) && (
        <div className="border-t border-border pt-3 flex flex-wrap gap-x-4 gap-y-2 text-sm">
          {card.relatedPdfs.map((pdf) => {
            const filename = pdf.split("/").pop() ?? pdf;
            return (
              <a
                key={pdf}
                href={pdf}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-accent hover:text-accent-hover transition-colors"
              >
                <svg
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
                  />
                </svg>
                {filename.replace(/\.pdf$/i, "")}
              </a>
            );
          })}
          {card.relatedDiagrams.map((code) => (
            <Link
              key={code}
              href={`/parts/${code}`}
              className="inline-flex items-center gap-1 text-accent hover:text-accent-hover transition-colors"
            >
              <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z"
                />
              </svg>
              Diagram {code}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
