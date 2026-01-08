"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface SliderProps {
  value: number;
  min?: number;
  max?: number;
  step?: number;
  onChange: (value: number) => void;
  className?: string;
}

export function MoodSlider({
  value,
  min = 0,
  max = 100,
  step = 1,
  onChange,
  className,
}: SliderProps) {
  const percentage = ((value - min) / (max - min)) * 100;

  return (
    <div className={cn("relative flex w-full touch-none items-center py-4", className)}>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="absolute inset-0 z-10 w-full cursor-pointer opacity-0"
      />
      
      {/* Track */}
      <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-foreground/10">
        <div
          className="h-full transition-all duration-100 ease-out"
          style={{
            width: `${percentage}%`,
            backgroundColor: `hsl(var(--mood-accent-h), var(--mood-accent-s), var(--mood-accent-l))`
          }}
        />
      </div>

      {/* Thumb */}
      <div
        className="absolute h-4 w-4 rounded-full bg-white shadow-md ring-2 ring-black/5 transition-transform duration-100 ease-out"
        style={{
          left: `calc(${percentage}% - 8px)`,
        }}
      />
    </div>
  );
}
