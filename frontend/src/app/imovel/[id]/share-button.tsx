"use client";

import { Share2 } from "lucide-react";

export function ShareButton({ title }: { title: string }) {
  return (
    <button
      onClick={() => navigator.share?.({ title, url: window.location.href })}
      className="flex items-center justify-center gap-2 w-full border border-gray-200 text-gray-600 py-2 px-4 rounded-xl text-sm hover:bg-gray-50 transition"
    >
      <Share2 className="h-4 w-4" />
      Compartilhar
    </button>
  );
}
