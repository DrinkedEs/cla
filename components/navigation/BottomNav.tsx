import { navItems } from "@/data/mock";
import { AppIcon } from "@/components/icons/AppIcon";
import type { ScreenKey } from "@/components/navigation/types";

type BottomNavProps = {
  active: ScreenKey;
  onNavigate: (screen: ScreenKey) => void;
};

export function BottomNav({ active, onNavigate }: BottomNavProps) {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-ink/90 px-3 pb-[max(0.8rem,env(safe-area-inset-bottom))] pt-2 backdrop-blur-xl lg:left-1/2 lg:max-w-xl lg:-translate-x-1/2 lg:rounded-t-[1.6rem] lg:border-x">
      <div className="grid grid-cols-5 gap-1">
        {navItems.map((item) => {
          const selected =
            active === item.key ||
            (item.key === "search" &&
              ["results", "student", "booking"].includes(active));
          return (
            <button
              key={item.key}
              type="button"
              onClick={() => onNavigate(item.key)}
              className={`flex min-h-[3.65rem] flex-col items-center justify-center gap-1 rounded-2xl text-[0.68rem] font-bold transition ${
                selected
                  ? "bg-violet-electric text-white shadow-aura"
                  : "text-white/48 hover:bg-white/[0.06] hover:text-white"
              }`}
              aria-label={item.label}
            >
              <AppIcon name={item.icon} className="h-5 w-5" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
