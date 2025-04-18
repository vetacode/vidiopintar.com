"use client"

import { useFormStatus } from 'react-dom'
import { Button } from "@/components/ui/button"
import { LoadingSpinner } from "@/components/ui/loading-spinner"

export default function SubmitButton() {
  const { pending } = useFormStatus()

  return (
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
  )
}
