"use client";

import { useRef } from "react";
import MessageList from "@/components/chat/MessageList";
import MessageInput from "@/components/chat/MessageInput";
import NicknameModal from "@/components/chat/NicknameModal";
import { useMessages } from "@/hooks/useMessages";
import { useNickname } from "@/hooks/useNickname";
import { createClient } from "@/lib/supabase/client";
import { DEMO_ROOM_ID } from "@/lib/constants";

export default function Home() {
  const { nickname, setNickname } = useNickname();
  const { messages, loading } = useMessages(DEMO_ROOM_ID);
  const supabase = useRef(createClient());

  async function handleSend(content: string) {
    if (!nickname) return;
    await supabase.current.from("messages").insert({
      room_id: DEMO_ROOM_ID,
      author: nickname,
      content,
    });
  }

  return (
    <>
      {!nickname && <NicknameModal onConfirm={setNickname} />}
      <MessageList messages={messages} loading={loading} currentNickname={nickname} />
      <MessageInput onSend={handleSend} disabled={!nickname} />
    </>
  );
}
