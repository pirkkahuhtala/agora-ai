import type { Database } from "./database";

export type Room = Database["public"]["Tables"]["rooms"]["Row"];
export type Message = Database["public"]["Tables"]["messages"]["Row"];
export type Participant = Database["public"]["Tables"]["participants"]["Row"];

export type RoomInsert = Database["public"]["Tables"]["rooms"]["Insert"];
export type MessageInsert = Database["public"]["Tables"]["messages"]["Insert"];
export type ParticipantInsert =
  Database["public"]["Tables"]["participants"]["Insert"];
