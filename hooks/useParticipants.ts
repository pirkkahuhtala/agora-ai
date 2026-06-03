"use client";

import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Participant } from "@/types";

export function useParticipants(roomId: string, nickname: string | null) {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const supabase = useRef(createClient());
  const participantId = useRef<string | null>(null);

  // Join when nickname is set; leave on unmount or page unload
  useEffect(() => {
    if (!nickname) return;

    const client = supabase.current;

    async function join() {
      // Remove stale rows (e.g. from a previous refresh where beforeunload did not complete)
      await client
        .from("participants")
        .delete()
        .eq("room_id", roomId)
        .eq("name", nickname!);

      const { data } = await client
        .from("participants")
        .insert({ room_id: roomId, name: nickname! })
        .select("id")
        .single();
      if (data) participantId.current = data.id;
    }

    async function leave() {
      if (!participantId.current) return;
      await client.from("participants").delete().eq("id", participantId.current);
      participantId.current = null;
    }

    join();

    window.addEventListener("beforeunload", leave);
    return () => {
      window.removeEventListener("beforeunload", leave);
      leave();
    };
  }, [roomId, nickname]);

  // Fetch current participants and subscribe to changes
  useEffect(() => {
    const client = supabase.current;

    async function fetchParticipants() {
      const { data } = await client
        .from("participants")
        .select("*")
        .eq("room_id", roomId)
        .order("name", { ascending: true });
      setParticipants(data ?? []);
    }

    fetchParticipants();

    const channel = client
      .channel(`participants:${roomId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "participants",
          filter: `room_id=eq.${roomId}`,
        },
        (payload) => {
          const incoming = payload.new as Participant;
          setParticipants((prev) => {
            if (prev.some((p) => p.id === incoming.id)) return prev;
            return [...prev, incoming].sort((a, b) => a.name.localeCompare(b.name));
          });
        }
      )
      .on(
        "postgres_changes",
        {
          event: "DELETE",
          schema: "public",
          table: "participants",
          // No room_id filter: with REPLICA IDENTITY DEFAULT, payload.old only
          // contains the PK (id), so a room_id filter would never match.
          // We scope implicitly by checking against our local state (room-scoped).
        },
        (payload) => {
          setParticipants((prev) =>
            prev.filter((p) => p.id !== (payload.old as Participant).id)
          );
        }
      )
      .subscribe();

    return () => {
      client.removeChannel(channel);
    };
  }, [roomId]);

  return { participants };
}
