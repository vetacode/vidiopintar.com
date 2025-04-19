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
          className='h-13 rounded-xl'
          required
        />
      </div>
      <Button
        type="submit"
        aria-disabled={pending}
        className='w-full h-12 rounded-xl'
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
