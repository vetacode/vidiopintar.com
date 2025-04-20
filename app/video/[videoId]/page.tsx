import { fetchVideoDetails, fetchVideoTranscript } from "@/lib/youtube"
import VideoPlayer from "@/components/video-player"
import TabInterface from "@/components/tab-interface"
import { getChatHistory } from "@/lib/storage"
import TranscriptView from "@/components/transcript-view"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Home, PlayCircle, Clock, ChevronRight, LayoutDashboard } from "lucide-react"
import Link from "next/link"
import ChatInterface from "@/components/chat-interface"

export default async function VideoPage({ params }: { params: { videoId: string } }) {
  const { videoId } = params
  const videoDetails = await fetchVideoDetails(videoId)
  const transcript = await fetchVideoTranscript(videoId)
  const messages = await getChatHistory(videoId)

  return (
    <main className="flex flex-col min-h-screen bg-melody-gradient relative">
      <div className="relative z-10">

        <div className="grid grid-cols-1 lg:grid-cols-7 h-screen">
          <div className="lg:col-span-4 h-full overflow-y-auto scrollbar-none relative">
            {/* <div className="p-3">
              
            </div> */}
            <div className="sticky top-0 z-50 bg-white dark:bg-black border-b">
              <div className="flex items-center p-4 gap-2">
                <Link href="/home" className="text-foreground hover:underline hover:text-melody transition-colors inline-flex gap-2 items-center">
                  Home
                </Link>
                <ChevronRight className="size-5 text-muted-foreground" />
                <h1 className="font-semibold tracking-tight flex-1 truncate">{videoDetails.title}</h1>
              </div>
            </div>
            <VideoPlayer videoId={videoId} />

            <div className="p-3">
              <Tabs defaultValue="transcript" className="w-full">
                <TabsList>
                  <TabsTrigger
                    value="transcript"
                  >
                    <span className="flex items-center gap-2">
                      Transcript
                    </span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="outline"
                  >
                    <span className="flex items-center gap-2">
                      Video Outline
                    </span>
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="transcript" className="h-full overflow-y-auto p-0 m-0">
                  <TranscriptView transcript={transcript} />
                </TabsContent>
                <TabsContent value="outline" className="h-full overflow-y-auto p-0 m-0">
                  <div className="p-4">
                    <h3 className="font-medium mb-4 text-melody">Outline</h3>
                    <p className="text-muted-foreground">Coming Soon</p>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>

          <div className="lg:col-span-3 flex flex-col h-full md:h-auto relative">
            <ChatInterface videoId={videoId} initialMessages={messages} />
          </div>
        </div>
      </div>
    </main>
  )
}

function formatTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = Math.floor(seconds % 60)
  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`
}

