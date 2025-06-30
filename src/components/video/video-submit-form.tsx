"use client";

import { handleVideoSubmit } from "@/app/actions"
import { useState } from "react";
import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";
import { Loader } from "lucide-react";
import { PromptInput, PromptInputTextarea, PromptInputActions } from "@/components/ui/prompt-input"

export function VideoSubmitForm() {
  const [input, setInput] = useState("")
  const { pending } = useFormStatus();
  
  return (
    <form action={handleVideoSubmit} className="space-y-4">
      <PromptInput
        value={input}
        onValueChange={(value) => setInput(value)}>
        <PromptInputTextarea
          name="videoUrl"
          placeholder="Paste YouTube link here..."
          className="bg-transparent!"
          required
        />
        <PromptInputActions className="justify-end pt-2">
          <Button type="submit" disabled={pending} className="rounded-xl cursor-pointer">
            {pending ? <Loader className="size-4 animate-spin" /> : "Search"}
          </Button>
        </PromptInputActions>
      </PromptInput>
    </form>
  )
}
