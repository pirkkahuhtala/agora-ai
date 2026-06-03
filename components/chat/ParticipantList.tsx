import type { Participant } from "@/types";
import { cn } from "@/lib/utils";

interface Props {
  participants: Participant[];
  currentNickname: string | null;
}

export default function ParticipantList({
  participants,
  currentNickname,
}: Props) {
  return (
    <aside className="border-border flex w-44 shrink-0 flex-col gap-3 border-l px-4 py-4">
      <span className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
        Online {participants.length + 1}
      </span>
      <ul className="flex flex-col gap-1">
        {[{ id: "xyz", name: "Agora" }, ...participants].map((p) => (
          <li
            key={p.id}
            className={cn(
              "truncate text-sm",
              p.name === currentNickname
                ? "text-foreground font-medium"
                : "text-muted-foreground"
            )}
          >
            {p.name}
          </li>
        ))}
      </ul>
    </aside>
  );
}
