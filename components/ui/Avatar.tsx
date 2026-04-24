type AvatarProps = {
  name: string;
  size?: "sm" | "md" | "lg";
  tone?: "violet" | "mint" | "rose";
};

const sizes = {
  sm: "h-9 w-9 text-xs",
  md: "h-12 w-12 text-sm",
  lg: "h-20 w-20 text-2xl"
};

const tones = {
  violet: "from-violet-glow to-violet-electric",
  mint: "from-mint to-violet-glow",
  rose: "from-rose to-violet-electric"
};

export function Avatar({ name, size = "md", tone = "violet" }: AvatarProps) {
  const initials = name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div
      className={`${sizes[size]} grid shrink-0 place-items-center rounded-2xl bg-gradient-to-br ${tones[tone]} font-bold text-white shadow-aura`}
      aria-label={name}
    >
      {initials}
    </div>
  );
}
