import * as React from "react"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "file:text-foreground placeholder:text-[#404040] selection:bg-primary selection:text-primary-foreground dark:bg-white/70 border-input flex h-12 w-full min-w-0 rounded-md border bg-transparent px-4 pl-4 pr-4 text-[1rem] shadow-[0_2px_4px_rgba(0,0,0,0.16),0_4px_12px_rgba(0,0,0,0.16)] transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-[1rem] file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-[1rem]",
        "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
        "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
        className
      )}
      {...props}
    />
  );
}

export { Input }
