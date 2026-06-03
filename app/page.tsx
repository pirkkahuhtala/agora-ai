"use client";

import { useRef, useState } from "react";
import MessageList from "@/components/chat/MessageList";
import MessageInput from "@/components/chat/MessageInput";
import NicknameModal from "@/components/chat/NicknameModal";
import ParticipantList from "@/components/chat/ParticipantList";
import { useMessages } from "@/hooks/useMessages";
import { useNickname } from "@/hooks/useNickname";
import { useParticipants } from "@/hooks/useParticipants";
import { createClient } from "@/lib/supabase/client";
import { DEMO_ROOM_ID, AI_MENTION } from "@/lib/constants";
import { useRoom } from "@/hooks/useRoom";
import { RoomDetails } from "@/components/chat/RoomDetails";

export default function Home() {
  const { nickname, ready, setNickname } = useNickname();
  const { messages, loading } = useMessages(DEMO_ROOM_ID);
  const { participants } = useParticipants(DEMO_ROOM_ID, nickname);
  const { room, loading: roomLoading } = useRoom(DEMO_ROOM_ID);
  const supabase = useRef(createClient());
  const [isAiTyping, setIsAiTyping] = useState(false);

  async function handleSend(content: string) {
    if (!nickname) return;

    await supabase.current.from("messages").insert({
      room_id: DEMO_ROOM_ID,
      author: nickname,
      content,
    });

    if (content.trim().toLowerCase().startsWith(AI_MENTION)) {
      setIsAiTyping(true);
      try {
        await fetch("/api/ai", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            roomId: DEMO_ROOM_ID,
            userMessage: content.trim(),
          }),
        });
      } finally {
        setIsAiTyping(false);
      }
    }
  }

  return (
    <>
      {ready && !nickname && <NicknameModal onConfirm={setNickname} />}
      <div className="flex flex-1 overflow-hidden">
        <div className="flex flex-1 flex-col overflow-hidden">
          <RoomDetails className="mb-4" room={room} loading={roomLoading} />
          <MessageList
            currentNickname={nickname}
            isAiTyping={isAiTyping}
            loading={loading}
            messages={messages}
          />
          <MessageInput onSend={handleSend} disabled={!nickname} />
        </div>
        <ParticipantList participants={participants} currentNickname={nickname} />
      </div>
    </>
  );
}
