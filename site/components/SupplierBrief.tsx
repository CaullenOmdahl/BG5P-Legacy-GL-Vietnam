"use client";
import { useState } from "react";
export default function SupplierBrief({
  brief,
  label,
  copied,
}: {
  brief: string;
  label: string;
  copied: string;
}) {
  const [done, setDone] = useState(false);
  return (
    <div>
      <textarea
        aria-label={label}
        readOnly
        value={brief}
        className="h-72 w-full rounded border border-border bg-background p-3 text-sm"
      />
      <button
        className="rounded bg-accent px-4 py-2 text-background"
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(brief);
            setDone(true);
          } catch {
            setDone(false);
          }
        }}
      >
        {done ? copied : label}
      </button>
      <span role="status" className="sr-only">
        {done ? copied : ""}
      </span>
    </div>
  );
}
