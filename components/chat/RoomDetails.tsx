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
      {loading && <h1 className="text-sm font-bold">Loading room...</h1>}
      {!loading && room && (
        <>
          <h1 className="text-sm font-bold mb-1">{room.topic}</h1>
          {room?.summary && (
            <p className="text-xs text-gray-500">{room.summary}</p>
          )}
        </>
      )}
    </div>
  );
}
