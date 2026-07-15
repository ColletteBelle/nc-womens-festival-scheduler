"use client";

import { ButtonHTMLAttributes } from "react";
import { buttonClasses, ButtonSize, ButtonVariant } from "@/lib/buttonStyles";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

export function Button({
  variant = "neutral",
  size = "md",
  className = "",
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button type={type} className={buttonClasses(variant, size, className)} {...props} />
  );
}
