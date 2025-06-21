"use client"

import { Check, Copy } from "lucide-react"

import { cn } from "@/lib/utils"
import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard"
import { Button } from "@/components/ui/button"

type CopyButtonProps = {
  content: string
  copyMessage?: string
  label?: string
}

export function CopyButton({ content, copyMessage, label }: CopyButtonProps) {
  const { isCopied, handleCopy } = useCopyToClipboard({
    text: content,
    copyMessage,
  })

  return (
    <Button
      variant="ghost"
      size="icon"
      className="relative h-fit w-fit cursor-pointer items-center p-1"
      aria-label={label || "Copy to clipboard"}
      onClick={handleCopy}
    >
      <div className="absolute inset-0 flex items-center justify-start p-1">
        <Check
          className={cn(
            "h-4 w-4 transition-transform ease-in-out",
            isCopied ? "scale-100" : "scale-0"
          )}
        />
      </div>
      <Copy
        className={cn(
          "h-4 w-4 transition-transform ease-in-out",
          isCopied ? "scale-0" : "scale-100"
        )}
      />
      {label && <span className="text-xs">{label}</span>}
    </Button>
  )
}
