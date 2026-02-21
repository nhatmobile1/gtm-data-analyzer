interface CalloutProps {
  children: React.ReactNode;
  variant?: "info" | "warning" | "positive" | "nurture";
}

const variantStyles: Record<string, { border: string; bg: string }> = {
  info: { border: "border-l-accent", bg: "bg-accent/[0.06]" },
  warning: { border: "border-l-negative", bg: "bg-negative/[0.06]" },
  positive: { border: "border-l-positive", bg: "bg-positive/[0.06]" },
  nurture: { border: "border-l-nurture", bg: "bg-nurture/[0.06]" },
};

export default function Callout({ children, variant = "info" }: CalloutProps) {
  const styles = variantStyles[variant];
  return (
    <div
      className={`mt-3 py-3 px-4 ${styles.bg} border-l-[3px] ${styles.border} rounded-r-[6px] text-xs text-muted leading-relaxed`}
    >
      {children}
    </div>
  );
}
