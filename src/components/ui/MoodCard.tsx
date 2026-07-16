import * as React from "react";
import { cn } from "@/lib/utils";

const MoodCard = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "rounded-3xl border border-white/5 bg-white/5 backdrop-blur-xl p-6 text-foreground shadow-sm",
      "transition-colors duration-1000", 
      className
    )}
    {...props}
  />
));
MoodCard.displayName = "MoodCard";

export { MoodCard };

// made by arpan
