// Small inline icon set (stroke icons, inherit currentColor).
type P = { className?: string };
const base = { fill: "none", stroke: "currentColor", strokeWidth: 1.6, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, viewBox: "0 0 24 24", "aria-hidden": true };

export const BagIcon = ({ className = "h-5 w-5" }: P) => (
  <svg {...base} className={className}><path d="M6 7h12l1 13H5L6 7Z" /><path d="M9 7a3 3 0 0 1 6 0" /></svg>
);
export const HeartIcon = ({ className = "h-5 w-5", filled = false }: P & { filled?: boolean }) => (
  <svg {...base} className={className} fill={filled ? "currentColor" : "none"}><path d="M12 20s-7-4.4-9.2-9A4.9 4.9 0 0 1 12 6a4.9 4.9 0 0 1 9.2 5C19 15.6 12 20 12 20Z" /></svg>
);
export const UserIcon = ({ className = "h-5 w-5" }: P) => (
  <svg {...base} className={className}><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></svg>
);
export const SearchIcon = ({ className = "h-5 w-5" }: P) => (
  <svg {...base} className={className}><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>
);
export const MenuIcon = ({ className = "h-5 w-5" }: P) => (
  <svg {...base} className={className}><path d="M4 7h16M4 12h16M4 17h16" /></svg>
);
export const CloseIcon = ({ className = "h-5 w-5" }: P) => (
  <svg {...base} className={className}><path d="M6 6l12 12M18 6 6 18" /></svg>
);
export const TruckIcon = ({ className = "h-6 w-6" }: P) => (
  <svg {...base} className={className}><path d="M3 6h11v10H3zM14 10h4l3 3v3h-7" /><circle cx="7" cy="18" r="2" /><circle cx="17" cy="18" r="2" /></svg>
);
export const ShieldIcon = ({ className = "h-6 w-6" }: P) => (
  <svg {...base} className={className}><path d="M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6l-8-3Z" /><path d="m9 12 2 2 4-4" /></svg>
);
export const ReturnIcon = ({ className = "h-6 w-6" }: P) => (
  <svg {...base} className={className}><path d="M4 9h11a5 5 0 0 1 0 10H8" /><path d="M8 5 4 9l4 4" /></svg>
);
export const ChatIcon = ({ className = "h-6 w-6" }: P) => (
  <svg {...base} className={className}><path d="M4 5h16v11H8l-4 4V5Z" /></svg>
);
export const ChevronIcon = ({ className = "h-5 w-5", dir = "right" }: P & { dir?: "left" | "right" }) => (
  <svg {...base} className={className}><path d={dir === "right" ? "m9 6 6 6-6 6" : "m15 6-6 6 6 6"} /></svg>
);
export const TagIcon = ({ className = "h-4 w-4" }: P) => (
  <svg {...base} className={className}><path d="M3 12V4h8l10 10-8 8L3 12Z" /><circle cx="7.5" cy="7.5" r="1.5" /></svg>
);
export const ChartIcon = ({ className = "h-5 w-5" }: P) => (
  <svg {...base} className={className}><path d="M4 20V10M10 20V4M16 20v-7M22 20H2" /></svg>
);
export const BoxIcon = ({ className = "h-5 w-5" }: P) => (
  <svg {...base} className={className}><path d="m12 3 9 5v8l-9 5-9-5V8l9-5Z" /><path d="m3 8 9 5 9-5M12 13v8" /></svg>
);
export const UsersIcon = ({ className = "h-5 w-5" }: P) => (
  <svg {...base} className={className}><circle cx="9" cy="8" r="3.5" /><path d="M2 20a7 7 0 0 1 14 0M16 4.5a3.5 3.5 0 0 1 0 7M22 20a7 7 0 0 0-4-6.3" /></svg>
);
