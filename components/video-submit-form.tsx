"use client"
import { useFormStatus } from 'react-dom'
import { Button } from "@/components/ui/button"
import { LoadingSpinner } from "@/components/ui/loading-spinner"

import { Input } from "@/components/ui/input"
import { handleVideoSubmit } from "@/app/actions"

export default function VideoSubmitForm() {
  const { pending } = useFormStatus()

  return (
    <form action={handleVideoSubmit} className="space-y-4 max-w-md mx-auto mb-8">
      <div className="relative">
        <Input
          name="videoUrl"
          placeholder="Paste YouTube link here..."
          className="dark:bg-secondary/80 border-melody h-12 pl-4 pr-4 rounded-xl focus:ring-melody focus:ring-2 transition-all duration-300"
          required
        />
      </div>
      <Button
        type="submit"
        aria-disabled={pending}
        className="w-full h-12 bg-melody hover:bg-melody-dark text-melody-foreground rounded-xl font-medium transition-all duration-300 ease-in-out hover:shadow-lg hover:shadow-melody/20 relative"
      >
        {pending ? (
          <>
            <LoadingSpinner className="text-melody-foreground" /> Preparing your video...
          </>
        ) : (
          "Start Learning"
        )}
      </Button>
    </form>
  )
}
