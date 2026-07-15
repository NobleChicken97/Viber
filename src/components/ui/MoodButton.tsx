import * as React from "react";
import { cn } from "@/lib/utils";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "ghost" | "icon" | "outline";
  size?: "sm" | "md" | "lg" | "icon";
}

const MoodButton = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "relative inline-flex items-center justify-center rounded-full font-medium transition-all duration-300",
          "disabled:opacity-50 disabled:pointer-events-none",
          "active:scale-95",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--mood-accent-h),var(--mood-accent-s),var(--mood-accent-l))] focus-visible:ring-offset-2",
          
          variant === "primary" && [
            "bg-[hsl(var(--mood-accent-h),var(--mood-accent-s),var(--mood-accent-l))] text-white",
            "shadow-[0_0_20px_-5px_hsl(var(--mood-accent-h),var(--mood-accent-s),var(--mood-accent-l))]",
            "hover:shadow-[0_0_30px_-5px_hsl(var(--mood-accent-h),var(--mood-accent-s),var(--mood-accent-l))]",
            "hover:scale-105"
          ],

          variant === "outline" && [
            "bg-transparent border border-white/10 text-foreground/80",
            "hover:bg-white/5 hover:text-foreground hover:border-white/20",
          ],
          
          variant === "ghost" && [
            "bg-transparent text-foreground/80 hover:text-foreground",
            "hover:bg-[hsl(var(--mood-fg-h),var(--mood-fg-s),var(--mood-fg-l),0.1)]"
          ],

          variant === "icon" && [
             "bg-transparent text-foreground hover:bg-[hsl(var(--mood-fg-h),var(--mood-fg-s),var(--mood-fg-l),0.1)] rounded-full aspect-square p-0"
          ],

          size === "sm" && "text-xs px-4 py-2 h-8",
          size === "md" && "text-sm px-6 py-3 h-12",
          size === "lg" && "text-base px-8 py-4 h-14",
          size === "icon" && "h-12 w-12",
          
          className
        )}
        {...props}
      />
    );
  }
);
MoodButton.displayName = "MoodButton";

export { MoodButton };
