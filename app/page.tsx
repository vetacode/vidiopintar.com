"use client"
import { handleVideoSubmit } from "./actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Sparkles } from "lucide-react"
import { useFormStatus } from 'react-dom'
import { LoadingSpinner } from "@/components/ui/loading-spinner"

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Ambient background elements */}
      <div className="absolute inset-0 ambient-dots opacity-30"></div>
      <div className="absolute top-1/4 -left-20 w-60 h-60 rounded-full bg-melody/10 blur-3xl animate-pulse-glow"></div>
      <div className="absolute bottom-1/4 -right-20 w-80 h-80 rounded-full bg-melody/10 blur-3xl animate-pulse-glow"></div>

      <div className="z-10 w-full max-w-md">
        <Card className="bg-melody-card border-0 shadow-2xl backdrop-blur-sm ambient-glow w-[500px]">
          <CardHeader className="text-center space-y-2">
            <div className="mx-auto bg-melody rounded-full w-16 h-16 flex items-center justify-center mb-2">
              <Sparkles className="h-8 w-8 text-melody-foreground" />
            </div>
            <CardTitle className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-melody to-melody-light">
              Vidiopintar
            </CardTitle>
            <CardDescription className="text-lg text-muted-foreground">
              Smart video learning with interactive transcripts
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form action={handleVideoSubmit} className="space-y-4">
              <div className="relative">
                <Input
                  name="videoUrl"
                  placeholder="Paste YouTube link here..."
                  className="bg-secondary/80 border-0 h-12 pl-4 pr-4 rounded-xl focus:ring-melody focus:ring-2 transition-all duration-300"
                  required
                />
              </div>
              <SubmitButton />
              <div className="text-sm text-muted-foreground/70 text-center pt-2">
                Example: https://www.youtube.com/watch?v=dQw4w9WgXcQ
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}

function SubmitButton() {
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
