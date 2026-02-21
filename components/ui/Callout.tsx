import { Info, AlertTriangle, CheckCircle, Sparkles } from "lucide-react";

interface CalloutProps {
  children: React.ReactNode;
  variant?: "info" | "warning" | "positive" | "nurture";
}

const variantConfig: Record<
  string,
  {
    bg: string;
    border: string;
    iconColor: string;
    icon: typeof Info;
  }
> = {
  info: {
    bg: "bg-accent/[0.05]",
    border: "border-accent/20",
    iconColor: "text-accent",
    icon: Info,
  },
  warning: {
    bg: "bg-negative/[0.05]",
    border: "border-negative/20",
    iconColor: "text-negative",
    icon: AlertTriangle,
  },
  positive: {
    bg: "bg-positive/[0.05]",
    border: "border-positive/20",
    iconColor: "text-positive",
    icon: CheckCircle,
  },
  nurture: {
    bg: "bg-nurture/[0.05]",
    border: "border-nurture/20",
    iconColor: "text-nurture",
    icon: Sparkles,
  },
};

export default function Callout({ children, variant = "info" }: CalloutProps) {
  const config = variantConfig[variant];
  const Icon = config.icon;

  return (
    <div
      className={`mt-3 flex items-start gap-2.5 py-3 px-4 ${config.bg} border ${config.border} rounded-lg text-xs text-muted leading-relaxed`}
    >
      <Icon size={14} className={`${config.iconColor} shrink-0 mt-0.5`} />
      <div className="flex-1">{children}</div>
    </div>
  );
}
