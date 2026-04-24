export type AppIconName =
  | "home"
  | "search"
  | "calendar"
  | "message"
  | "user"
  | "arrow"
  | "qr"
  | "clock"
  | "star"
  | "tooth"
  | "link"
  | "shield"
  | "send"
  | "chart";

type AppIconProps = {
  name: AppIconName;
  className?: string;
};

export function AppIcon({ name, className = "h-5 w-5" }: AppIconProps) {
  const common = {
    className,
    viewBox: "0 0 24 24",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const
  };

  switch (name) {
    case "home":
      return (
        <svg {...common}>
          <path d="M3 10.8 12 3l9 7.8" />
          <path d="M5.5 9.5V21h13V9.5" />
          <path d="M9.5 21v-6h5v6" />
        </svg>
      );
    case "search":
      return (
        <svg {...common}>
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-4-4" />
        </svg>
      );
    case "calendar":
      return (
        <svg {...common}>
          <path d="M7 3v3M17 3v3" />
          <rect x="4" y="5" width="16" height="16" rx="4" />
          <path d="M4 10h16" />
          <path d="M8 14h2M14 14h2M8 17h2" />
        </svg>
      );
    case "message":
      return (
        <svg {...common}>
          <path d="M5 5.5h14a2 2 0 0 1 2 2v8.2a2 2 0 0 1-2 2H9l-5 3v-13a2 2 0 0 1 2-2Z" />
          <path d="M8 10h8M8 13.5h5" />
        </svg>
      );
    case "user":
      return (
        <svg {...common}>
          <circle cx="12" cy="8" r="4" />
          <path d="M4.5 21a7.5 7.5 0 0 1 15 0" />
        </svg>
      );
    case "arrow":
      return (
        <svg {...common}>
          <path d="M5 12h14" />
          <path d="m13 6 6 6-6 6" />
        </svg>
      );
    case "qr":
      return (
        <svg {...common}>
          <path d="M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4z" />
          <path d="M14 14h2v2h-2zM18 14h2v6h-4v-2M14 18h2v2h-2z" />
        </svg>
      );
    case "clock":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="9" />
          <path d="M12 7v5l3 2" />
        </svg>
      );
    case "star":
      return (
        <svg {...common}>
          <path d="m12 3 2.5 5.2 5.7.8-4.1 4 1 5.7-5.1-2.7-5.1 2.7 1-5.7-4.1-4 5.7-.8L12 3Z" />
        </svg>
      );
    case "tooth":
      return (
        <svg {...common}>
          <path d="M8.2 3.7c1.4-.6 2.3.2 3.8.2s2.4-.8 3.8-.2c2.9 1.2 3.4 4.6 2.2 7.7-.6 1.5-1.3 2.7-1.6 4.5-.4 2.1-.8 4.1-2.2 4.1-1.1 0-1.2-2.3-2.2-2.3s-1.1 2.3-2.2 2.3c-1.4 0-1.8-2-2.2-4.1-.3-1.8-1-3-1.6-4.5C4.8 8.3 5.3 4.9 8.2 3.7Z" />
        </svg>
      );
    case "link":
      return (
        <svg {...common}>
          <path d="M10 13a5 5 0 0 0 7.1 0l1.4-1.4a5 5 0 0 0-7.1-7.1L10.5 5" />
          <path d="M14 11a5 5 0 0 0-7.1 0l-1.4 1.4a5 5 0 0 0 7.1 7.1l.9-.9" />
        </svg>
      );
    case "shield":
      return (
        <svg {...common}>
          <path d="M12 3 5 6v5c0 4.6 2.9 8.5 7 10 4.1-1.5 7-5.4 7-10V6l-7-3Z" />
          <path d="m9 12 2 2 4-4" />
        </svg>
      );
    case "send":
      return (
        <svg {...common}>
          <path d="m21 3-8.5 18-2.4-7.1L3 11.5 21 3Z" />
          <path d="m10.1 13.9 4.8-4.8" />
        </svg>
      );
    case "chart":
      return (
        <svg {...common}>
          <path d="M4 19V5" />
          <path d="M4 19h17" />
          <path d="M8 15v-4M12 15V8M16 15v-6" />
        </svg>
      );
    default:
      return null;
  }
}
