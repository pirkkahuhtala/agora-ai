"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "agora:nickname";

export function useNickname() {
  const [ready, setReady] = useState(false);
  const [nickname, setNicknameState] = useState<string | null>(() => {
    if (typeof window !== "undefined") {
      const storedNickname = localStorage.getItem(STORAGE_KEY);

      return storedNickname;
    }
    return null;
  });

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setNicknameState(() => {
      const storedNickname = localStorage.getItem(STORAGE_KEY);
      return storedNickname;
    });
    setReady(true);
  }, []);

  function setNickname(name: string) {
    localStorage.setItem(STORAGE_KEY, name);
    setNicknameState(name);
  }

  return { nickname, ready, setNickname };
}
