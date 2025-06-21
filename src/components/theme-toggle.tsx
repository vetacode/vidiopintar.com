"use client"

import { useTheme } from "next-themes"
import { useEffect, useState } from "react"
import { Button } from "./ui/button"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // Only show this component after mounting to avoid hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="flex gap-2">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => setTheme("light")}
          className={theme === "light" ? "border-primary bg-primary/10" : ""}
        >
          Light
        </Button>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => setTheme("dark")}
          className={theme === "dark" ? "border-primary bg-primary/10" : ""}
        >
          Dark
        </Button>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => setTheme("system")}
          className={theme === "system" ? "border-primary bg-primary/10" : ""}
        >
          System
        </Button>
      </div>
    </div>
  )
}
