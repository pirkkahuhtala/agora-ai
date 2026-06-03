import { Room } from "@/lib/types";
import { cn } from "@/lib/utils";

export function RoomDetails({
  className,
  room,
  loading,
}: {
  className?: string;
  room: Room | null;
  loading: boolean;
}) {
  return (
    <div className={cn("border-b px-6 py-4", className)}>
      <h1 className="font-bold">
        {loading ? "Loading room..." : room ? room.topic : "Room not found"}
      </h1>
      {room?.summary && <p className="text-sm text-gray-500">{room.summary}</p>}
    </div>
  );
}
