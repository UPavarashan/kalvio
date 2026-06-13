type KalvioLogoSize = "sm" | "md" | "lg";

const sizeClasses: Record<KalvioLogoSize, string> = {
  sm: "w-10 h-10",
  md: "w-12 h-12",
  lg: "w-16 h-16",
};

interface KalvioLogoProps {
  size?: KalvioLogoSize;
  className?: string;
  title?: string;
}

export default function KalvioLogo({
  size = "sm",
  className = "",
  title = "Kalvio",
}: KalvioLogoProps) {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label={title}
      className={`${sizeClasses[size]} shrink-0 ${className}`}
    >
      <title>{title}</title>
      {/* Hand-drawn notebook cover */}
      <path
        d="M8 6C7 5 9 4 11 4H36C38 4 40 6 40 8V38C40 40 38 42 36 42H11C9 42 7 41 8 39L6 37V9L8 6Z"
        fill="#f0eeea"
        stroke="#334b46"
        strokeWidth="1.75"
        strokeLinejoin="round"
      />
      {/* Spine */}
      <path
        d="M14 4V42"
        stroke="#334b46"
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.35"
      />
      {/* Margin line */}
      <path
        d="M18 10V38"
        stroke="#ba1a1a"
        strokeWidth="1.25"
        strokeLinecap="round"
        opacity="0.55"
      />
      {/* Ruled lines */}
      <path
        d="M21 16H36M21 22H34M21 28H35"
        stroke="#334b46"
        strokeWidth="1"
        strokeLinecap="round"
        opacity="0.2"
      />
      {/* Stylized K */}
      <path
        d="M22 12V34M22 22L30 12M22 23L31 34"
        stroke="#334b46"
        strokeWidth="2.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Pen nib accent */}
      <path
        d="M35 8L38 11L35 14L32 11Z"
        fill="#334b46"
        opacity="0.85"
      />
      <circle cx="35" cy="11" r="1" fill="#cde8e1" />
    </svg>
  );
}

interface KalvioBrandProps {
  size?: KalvioLogoSize;
  showTagline?: boolean;
  className?: string;
}

export function KalvioBrand({
  size = "lg",
  showTagline = false,
  className = "",
}: KalvioBrandProps) {
  return (
    <div className={`flex flex-col items-center text-center ${className}`}>
      <KalvioLogo size={size} />
      <h1 className="font-headline text-2xl sm:text-3xl font-semibold text-primary mt-3">Kalvio</h1>
      {showTagline && (
        <p className="font-label text-[10px] text-on-surface-variant tracking-widest uppercase mt-1">
          Student Hub
        </p>
      )}
    </div>
  );
}
