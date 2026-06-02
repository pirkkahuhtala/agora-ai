"use client";

import { useEffect, useRef } from "react";
import type { Message } from "@/types";
import { cn } from "@/lib/utils";

interface Props {
  messages: Message[];
  loading: boolean;
  currentNickname: string | null;
}

export default function MessageList({
  messages,
  loading,
  currentNickname,
}: Props) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <main className="flex-1 overflow-y-auto px-6 py-4">
      {loading && (
        <p className="text-muted-foreground text-sm">Loading messages…</p>
      )}
      {!loading && messages.length === 0 && (
        <p className="text-muted-foreground text-sm">
          No messages yet. Start the conversation!
        </p>
      )}
      <div className="flex flex-col gap-3">
        {messages.map((msg) => {
          const isOwn = msg.author === currentNickname;
          return (
            <div
              key={msg.id}
              className={cn("flex flex-col gap-0.5", isOwn && "items-end")}
            >
              <span className="text-xs text-muted-foreground">
                {msg.author}
              </span>
              <div
                className={cn(
                  "max-w-prose rounded-lg px-3 py-2 text-sm",
                  msg.is_ai
                    ? "bg-muted text-muted-foreground italic"
                    : isOwn
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-secondary-foreground",
                )}
              >
                {msg.content}
              </div>
            </div>
          );
        })}
      </div>
      <div ref={bottomRef} />
    </main>
  );
}
