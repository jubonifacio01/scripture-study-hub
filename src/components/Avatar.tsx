interface AvatarProps {
  name: string;
  seed?: string;
  size?: number;
  className?: string;
}

function initials(name: string) {
  return name
    .split(" ")
    .map((s) => s[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function Avatar({ name, size = 64, className = "" }: AvatarProps) {
  return (
    <div
      className={
        "grid shrink-0 place-items-center rounded-full gradient-primary font-display font-black text-primary-foreground shadow-lift " +
        className
      }
      style={{ width: size, height: size, fontSize: size / 2.6 }}
      aria-hidden
    >
      {initials(name)}
    </div>
  );
}
