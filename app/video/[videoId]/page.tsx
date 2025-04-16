import { fetchVideoDetails, fetchVideoTranscript } from "@/lib/youtube"
import VideoPlayer from "@/components/video-player"
import ChatInterface from "@/components/chat-interface"
import { getChatHistory } from "@/lib/storage"
import TranscriptView from "@/components/transcript-view"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Home, PlayCircle, Clock, ChevronRight } from "lucide-react"
import Link from "next/link"

export default async function VideoPage({ params }: { params: { videoId: string } }) {
  const { videoId } = params
  const videoDetails = await fetchVideoDetails(videoId)
  const transcript = await fetchVideoTranscript(videoId)
  const messages = await getChatHistory(videoId)

  return (
    <main className="flex flex-col min-h-screen bg-melody-gradient relative">
      {/* Ambient background elements */}
      <div className="absolute inset-0 ambient-dots opacity-20"></div>
      <div className="absolute top-1/3 left-0 w-96 h-96 rounded-full bg-melody/5 blur-3xl animate-pulse-glow"></div>
      <div className="absolute bottom-1/4 right-0 w-96 h-96 rounded-full bg-melody/5 blur-3xl animate-pulse-glow"></div>

      <div className="py-6 px-4 md:px-6 lg:px-8 relative z-10">

        <div className="grid grid-cols-1 lg:grid-cols-7 gap-6 h-[calc(100vh-50px)]">
          {/* Video and Transcript Section (3/5 width on large screens) */}
          <div className="lg:col-span-4 space-y-6 h-full overflow-y-auto scrollbar-none">
            <div className="p-3">
              <div className="flex items-center mb-4 gap-2">
                <Link href="/" className="text-muted-foreground hover:underline hover:text-melody transition-colors inline-flex gap-2 items-center">
                  <Home className="size-5" /> Home
                </Link>
                <ChevronRight className="size-5 text-muted-foreground" />
                <h1 className="text-lg tracking-tight flex-1 truncate">{videoDetails.title}</h1>
              </div>
              <VideoPlayer videoId={videoId} />
            </div>

            <div>
              <Tabs defaultValue="transcript" className="w-full">
                <TabsList className="w-full p-3 bg-transparent rounded-t-2xl flex">
                  <TabsTrigger
                    value="transcript"
                    className="flex-1 rounded-xl data-[state=active]:bg-secondary data-[state=active]:text-melody py-3"
                  >
                    <span className="flex items-center gap-2">
                      <PlayCircle className="h-4 w-4" />
                      Transcript
                    </span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="outline"
                    className="flex-1 rounded-xl data-[state=active]:bg-muted data-[state=active]:text-melody py-3"
                  >
                    <span className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      Video Outline
                    </span>
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="transcript" className="h-full overflow-y-auto p-0 m-0">
                  <TranscriptView transcript={transcript} />
                </TabsContent>
                <TabsContent value="outline" className="h-full overflow-y-auto p-0 m-0">
                  <div className="p-4">
                    <h3 className="font-medium mb-4 text-melody">Video Outline</h3>
                    <ul className="space-y-3">
                      {transcript.segments.map(
                        (segment: { start: number; text: string; isChapterStart?: boolean }, index: number) =>
                          segment.isChapterStart && (
                            <li
                              key={index}
                              className="flex items-start p-3 rounded-xl hover:bg-secondary/40 transition-colors duration-200"
                            >
                              <span className="text-muted-foreground mr-3 font-mono">{formatTime(segment.start)}</span>
                              <span className="font-medium">{segment.text}</span>
                            </li>
                          ),
                      )}
                    </ul>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>

          {/* Chat Interface Section (2/5 width on large screens) */}
          <div className="lg:col-span-3 flex flex-col h-full md:h-auto py-3">
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

