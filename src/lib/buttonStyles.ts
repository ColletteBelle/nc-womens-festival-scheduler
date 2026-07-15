export type ButtonVariant = "primary" | "info" | "success" | "danger" | "neutral" | "bare";
export type ButtonSize = "sm" | "md" | "icon" | "vote";

const BASE =
  "inline-flex shrink-0 items-center justify-center gap-1.5 whitespace-nowrap rounded-full font-medium transition disabled:opacity-50 disabled:pointer-events-none";

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary: "bg-violet-600 text-white shadow-sm hover:bg-violet-700",
  info: "bg-violet-50 text-violet-700 hover:bg-violet-100",
  success: "bg-emerald-50 text-emerald-700 hover:bg-emerald-100",
  danger: "bg-red-50 text-red-600 hover:bg-red-100",
  neutral: "bg-gray-100 text-gray-600 hover:bg-gray-200",
  bare: "bg-transparent text-gray-400 hover:text-gray-600",
};

const SIZE_CLASSES: Record<ButtonSize, string> = {
  sm: "px-3 py-1 text-xs",
  md: "px-5 py-2.5 text-sm",
  icon: "h-7 w-7 p-0 text-xs",
  vote: "px-3.5 py-1.5 text-sm",
};

export function buttonClasses(
  variant: ButtonVariant = "neutral",
  size: ButtonSize = "md",
  className = ""
): string {
  return `${BASE} ${VARIANT_CLASSES[variant]} ${SIZE_CLASSES[size]} ${className}`.trim();
}
