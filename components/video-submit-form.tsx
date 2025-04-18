"use client"

import { Input } from "@/components/ui/input"
import SubmitButton from "./submit-button"
import { handleVideoSubmit } from "@/app/actions"

export default function VideoSubmitForm() {
  return (
    <form action={handleVideoSubmit} className="space-y-4 max-w-md mx-auto mb-8">
      <div className="relative">
        <Input
          name="videoUrl"
          placeholder="Paste YouTube link here..."
          className="bg-secondary/80 border-0 h-12 pl-4 pr-4 rounded-xl focus:ring-melody focus:ring-2 transition-all duration-300"
          required
        />
      </div>
      <SubmitButton />
    </form>
  )
}
