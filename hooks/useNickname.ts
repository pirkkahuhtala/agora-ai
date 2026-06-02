"use client";

import { useState } from "react";

const STORAGE_KEY = "agora:nickname";

export function useNickname() {
  const [nickname, setNicknameState] = useState<string | null>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem(STORAGE_KEY);
    }
    return null;
  });

  function setNickname(name: string) {
    localStorage.setItem(STORAGE_KEY, name);
    setNicknameState(name);
  }

  return { nickname, setNickname };
}
