"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export default function MessageInput() {
  const [value, setValue] = useState("");

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  }

  function handleSubmit() {
    const trimmed = value.trim();
    if (!trimmed) return;
    // TODO: send message
    setValue("");
  }

  return (
    <footer className="border-t border-border px-6 py-4">
      <div className="flex gap-4">
        <Textarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Send a message… (Enter to send, Shift+Enter for newline)"
          rows={1}
          className="resize-none"
        />
        <Button onClick={handleSubmit} disabled={!value.trim()}>
          Send
        </Button>
      </div>
    </footer>
  );
}
