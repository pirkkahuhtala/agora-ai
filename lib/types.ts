import { z } from "zod";

export const RoomSchema = z.object({
  topic: z.string().min(3).max(200),
});

export const NicknameSchema = z.object({
  name: z.string().min(1).max(50),
});

export const MessageSchema = z.object({
  room_id: z.uuid(),
  author: z.string().min(1).max(50),
  content: z.string().min(1).max(5000),
});

export type RoomInput = z.infer<typeof RoomSchema>;
export type NicknameInput = z.infer<typeof NicknameSchema>;
export type MessageInput = z.infer<typeof MessageSchema>;
