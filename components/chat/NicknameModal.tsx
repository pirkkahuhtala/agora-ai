"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Props {
  onConfirm: (nickname: string) => void;
}

export default function NicknameModal({ onConfirm }: Props) {
  const [value, setValue] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = value.trim();
    if (!trimmed) return;
    onConfirm(trimmed);
  }

  return (
    <div className="bg-background/80 fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm">
      <div className="border-border bg-card w-full max-w-sm rounded-lg border p-6 shadow-lg">
        <h2 className="mb-1 text-lg font-semibold">Choose a nickname</h2>
        <p className="text-muted-foreground mb-4 text-sm">
          This is how others will see you in the room.
        </p>
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            autoFocus
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Your nickname"
            maxLength={50}
          />
          <Button type="submit" disabled={!value.trim()}>
            Join
          </Button>
        </form>
      </div>
    </div>
  );
}
