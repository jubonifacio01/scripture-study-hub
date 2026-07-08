import { MemorizeMark } from "@/components/MemorizeMark";

interface AvatarProps {
  name: string;
  seed?: string;
  size?: number;
  className?: string;
}

export function Avatar({ name, size = 64, className = "" }: AvatarProps) {
  return (
    <div
      className={
        "grid shrink-0 place-items-center rounded-full bg-muted text-foreground " +
        className
      }
      style={{ width: size, height: size }}
      aria-hidden
    >
      <MemorizeMark size={Math.round(size * 0.5)} strokeWidth={1.5} />
    </div>
  );
}
