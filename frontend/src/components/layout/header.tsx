"use client";

import { useState } from "react";
import { Menu, MessageSquarePlus } from "lucide-react";
import { useAuthStore } from "@/store/auth.store";
import { useSidebarStore } from "@/store/sidebar.store";
import { NotificationBell } from "./notification-bell";
import { FeedbackModal } from "@/components/ui/feedback-modal";

interface HeaderProps {
  title: string;
}

export function Header({ title }: HeaderProps) {
  const { user } = useAuthStore();
  const { toggle } = useSidebarStore();
  const [showFeedback, setShowFeedback] = useState(false);

  return (
    <>
    <header className="h-16 border-b bg-white flex items-center justify-between px-4 md:px-6 sticky top-0 z-30">
      <div className="flex items-center gap-3">
        {/* Hamburger — mobile only */}
        <button
          onClick={toggle}
          className="md:hidden p-2 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors"
          aria-label="Abrir menu"
        >
          <Menu className="h-5 w-5" />
        </button>
        <h1 className="text-lg md:text-xl font-semibold text-gray-900 truncate">{title}</h1>
      </div>

      <div className="flex items-center gap-2 md:gap-3">
        <button
          onClick={() => setShowFeedback(true)}
          title="Enviar Feedback"
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-gray-500 hover:bg-gray-100 hover:text-blue-600 transition-colors border border-gray-200 hover:border-blue-200"
        >
          <MessageSquarePlus className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Feedback</span>
        </button>
        <NotificationBell />
        <div className="w-9 h-9 rounded-full bg-blue-100 overflow-hidden flex items-center justify-center text-blue-600 font-semibold text-sm flex-shrink-0">
          {user?.avatarUrl ? (
            <img src={user.avatarUrl} alt={user?.name} className="w-full h-full object-cover" />
          ) : (
            user?.name?.charAt(0).toUpperCase()
          )}
        </div>
      </div>
    </header>
    {showFeedback && <FeedbackModal onClose={() => setShowFeedback(false)} />}
    </>
  );
}
