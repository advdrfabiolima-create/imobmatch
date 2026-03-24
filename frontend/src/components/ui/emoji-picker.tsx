"use client";

import { useState } from "react";

const CATEGORIES: { label: string; emojis: string[] }[] = [
  {
    label: "😀 Rostos",
    emojis: ["😀","😃","😄","😁","😆","😅","🤣","😂","🙂","🙃","😉","😊","😇","🥰","😍","🤩","😘","😗","😚","😙","😋","😛","😜","🤪","😝","🤑","🤗","🫡","🤭","🤫","🤔","🤐","😶","😐","😑","😬","🙄","😯","😦","😧","😮","😲","🥱","😴","🤤","😪","😵","🤯","🥵","🥶","😳","🤪"],
  },
  {
    label: "👋 Gestos",
    emojis: ["👋","🤚","🖐","✋","🖖","👌","🤌","🤏","✌","🤞","🤟","🤘","🤙","👈","👉","👆","🖕","👇","☝","👍","👎","✊","👊","🤛","🤜","👏","🙌","🫶","👐","🤲","🙏","✍","💅","🤳","💪","🦾"],
  },
  {
    label: "❤️ Corações",
    emojis: ["❤️","🧡","💛","💚","💙","💜","🖤","🤍","🤎","❤️‍🔥","❤️‍🩹","💔","💕","💞","💓","💗","💖","💝","💘","💟","☮️","✝️","☯️","💯","✅","❌","❓","❗","💤","💫","⭐","🌟","✨","🔥","⚡","🎉","🎊","🏆","🥇"],
  },
  {
    label: "🐶 Animais",
    emojis: ["🐶","🐱","🐭","🐹","🐰","🦊","🐻","🐼","🐨","🐯","🦁","🐮","🐷","🐸","🐵","🙈","🙉","🙊","🐔","🐧","🐦","🦆","🦅","🦉","🦇","🐺","🐗","🐴","🦄","🐝","🦋","🐛","🐞","🐜","🦟","🦗","🦂","🐢","🐍","🦎","🦖","🐙","🦑","🦐","🦀","🐡","🐠","🐟","🐬","🐳","🐋","🦈"],
  },
  {
    label: "🍕 Comida",
    emojis: ["🍎","🍊","🍋","🍇","🍓","🫐","🍒","🍑","🥭","🍍","🥥","🥝","🍅","🫒","🥑","🥦","🥕","🌽","🌶","🫑","🥒","🧄","🧅","🥔","🍠","🫘","🧆","🥚","🍳","🥞","🧇","🥓","🥩","🍗","🍖","🌭","🍔","🍟","🍕","🫓","🥪","🥙","🌮","🌯","🥗","🍜","🍱","🍣","🍦","🍰","🎂","🍩","🍪","☕","🧋","🍺","🥂"],
  },
  {
    label: "🏠 Objetos",
    emojis: ["🏠","🏡","🏢","🏗","🏘","🏚","🏛","🏟","🏰","🏯","🕌","⛪","🕍","🕋","⛩","🗼","🗽","🗾","🌋","⛰","🏔","🗻","🏕","🏖","🏜","🏝","🏞","🚗","🚕","🚙","🚌","🚎","🏎","🚓","🚑","🚒","🚐","🛻","🚚","🚛","✈","🚀","🛸","🛺","🏍","🛵","🚲","💰","💵","💎","🔑","🗝","🔒","📱","💻","📷","🎵","🎶","📚","🎁","📦","📬"],
  },
];

interface EmojiPickerProps {
  onSelect: (emoji: string) => void;
}

export function EmojiPicker({ onSelect }: EmojiPickerProps) {
  const [tab, setTab] = useState(0);

  return (
    <div className="w-72 bg-card border border-border rounded-2xl shadow-xl overflow-hidden">
      {/* Category tabs */}
      <div className="flex border-b border-border overflow-x-auto scrollbar-hide">
        {CATEGORIES.map((cat, i) => (
          <button
            key={i}
            onClick={() => setTab(i)}
            title={cat.label}
            className={`flex-shrink-0 px-2.5 py-2 text-base transition ${
              tab === i ? "border-b-2 border-primary" : "hover:bg-accent"
            }`}
          >
            {cat.emojis[0]}
          </button>
        ))}
      </div>

      {/* Emojis grid */}
      <div className="p-2 grid grid-cols-8 gap-0.5 max-h-52 overflow-y-auto">
        {CATEGORIES[tab].emojis.map((emoji) => (
          <button
            key={emoji}
            onClick={() => onSelect(emoji)}
            className="text-xl p-1 rounded-lg hover:bg-accent transition leading-none"
            title={emoji}
          >
            {emoji}
          </button>
        ))}
      </div>
    </div>
  );
}
