export function Logo({ size = 64 }: { size?: number }) {
  return (
    <div
      className="flex items-center justify-center rounded-2xl shadow-lg"
      style={{
        width: size,
        height: size,
        background: "linear-gradient(135deg, #0B2447 0%, #19376D 100%)",
      }}
    >
      <svg width={size * 0.6} height={size * 0.6} viewBox="0 0 48 48" fill="none">
        <path
          d="M6 30 Q12 18, 18 30 T30 30 T42 30"
          stroke="#10D9A0"
          strokeWidth="3.5"
          strokeLinecap="round"
          fill="none"
        />
        <circle cx="24" cy="14" r="3" fill="#10D9A0" />
      </svg>
    </div>
  );
}
