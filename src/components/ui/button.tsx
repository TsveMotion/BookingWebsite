import * as React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "gradient" | "outline" | "ghost";
  size?: "default" | "sm" | "lg";
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "gradient", size = "default", ...props }, ref) => {
    return (
      <button
        className={cn(
          "inline-flex items-center justify-center whitespace-nowrap rounded-full font-medium transition-all duration-300",
          "disabled:pointer-events-none disabled:opacity-50",
          {
            "bg-accent-gradient text-black hover:shadow-lg hover:shadow-pink-500/20 hover:scale-105":
              variant === "gradient",
            "border border-white/20 bg-transparent text-white hover:bg-white/10 hover:border-white/40":
              variant === "outline",
            "text-white hover:bg-white/5": variant === "ghost",
          },
          {
            "h-11 px-8 text-base": size === "default",
            "h-9 px-6 text-sm": size === "sm",
            "h-14 px-10 text-lg": size === "lg",
          },
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";

export { Button };
