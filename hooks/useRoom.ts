import { createClient } from "@/lib/supabase/client";
import { Room } from "@/lib/types";
import { useEffect, useRef, useState } from "react";

export function useRoom(roomId: string) {
  const [room, setRoom] = useState<Room | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = useRef(createClient());

  useEffect(() => {
    const client = supabase.current;

    async function fetchRoom() {
      const { data } = await client.from("rooms").select("*").eq("id", roomId);
      setRoom(data?.[0] ?? null);
      setLoading(false);
    }

    fetchRoom();
  }, [roomId]);

  return { room, loading };
}
