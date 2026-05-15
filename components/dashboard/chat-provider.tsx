"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { mockChatHistory } from "@/lib/mock-data";
import type { ChatMessage } from "@/types";

interface ChatContextValue {
  messages: ChatMessage[];
  thinking: boolean;
  send: (text: string) => Promise<void>;
  clear: () => void;
}

const ChatContext = createContext<ChatContextValue | null>(null);

const STORAGE_KEY = "secugo_chat_history";

function loadMessages(): ChatMessage[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return mockChatHistory;
}

function saveMessages(msgs: ChatMessage[]) {
  try {
    // Keep only the last 50 messages to avoid storage bloat
    localStorage.setItem(STORAGE_KEY, JSON.stringify(msgs.slice(-50)));
  } catch {}
}

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const [messages, setMessages] = useState<ChatMessage[]>(mockChatHistory);
  const [thinking, setThinking] = useState(false);
  const loaded = useRef(false);

  // Load from localStorage once on mount
  useEffect(() => {
    if (loaded.current) return;
    loaded.current = true;
    setMessages(loadMessages());
  }, []);

  // Persist whenever messages change
  useEffect(() => {
    if (!loaded.current) return;
    saveMessages(messages);
  }, [messages]);

  const send = useCallback(
    async (text: string) => {
      if (!text.trim() || thinking) return;

      const user: ChatMessage = {
        id: crypto.randomUUID(),
        role: "user",
        content: text.trim(),
        timestamp: new Date().toISOString(),
      };

      const updated = [...messages, user];
      setMessages(updated);
      setThinking(true);

      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: updated }),
        });
        const data = await res.json();
        const reply: ChatMessage = {
          id: crypto.randomUUID(),
          role: "assistant",
          content:
            data.reply ?? data.error ?? "Sorry, I couldn't get a response.",
          timestamp: new Date().toISOString(),
        };
        setMessages((m) => [...m, reply]);
      } catch {
        setMessages((m) => [
          ...m,
          {
            id: crypto.randomUUID(),
            role: "assistant",
            content: "Something went wrong. Please try again.",
            timestamp: new Date().toISOString(),
          },
        ]);
      } finally {
        setThinking(false);
      }
    },
    [messages, thinking]
  );

  const clear = useCallback(() => {
    setMessages(mockChatHistory);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {}
  }, []);

  return (
    <ChatContext.Provider value={{ messages, thinking, send, clear }}>
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const ctx = useContext(ChatContext);
  if (!ctx) throw new Error("useChat must be used inside ChatProvider");
  return ctx;
}
