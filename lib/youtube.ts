export function extractVideoId(url: string): string | null {
  // Handle different YouTube URL formats
  const regexes = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/|youtube\.com\/watch\?.*&v=)([^&\n?#]+)/,
    /youtube\.com\/shorts\/([^&\n?#]+)/,
  ]

  for (const regex of regexes) {
    const match = url.match(regex)
    if (match && match[1]) {
      return match[1]
    }
  }

  return null
}

export async function fetchVideoDetails(videoId: string) {
  try {
    // Construct the video URL
    const videoUrl = `https://www.youtube.com/watch?v=${videoId}`
    
    // Encode the URL for the API request
    const encodedUrl = encodeURIComponent(videoUrl)
    
    // Make the API request to get the video details
    const response = await fetch(`https://api.ahmadrosid.com/youtube/video?videoUrl=${encodedUrl}`)
    
    if (!response.ok) {
      throw new Error(`Failed to fetch video details: ${response.status} ${response.statusText}`)
    }
    
    const data = await response.json()
    
    return {
      title: data.title,
      description: data.description,
      channelTitle: data.channelTitle,
      publishedAt: data.publishedAt,
      thumbnails: data.thumbnails,
      tags: data.tags,
    }
  } catch (error) {
    console.error('Error fetching video details:', error)
    
    // Fallback to basic info in case of error
    return {
      title: `Video ${videoId}`,
      description: "Unable to load video description.",
      channelTitle: "Unknown Channel",
      publishedAt: new Date().toISOString(),
      thumbnails: {},
      tags: [],
    }
  }
}

export async function fetchVideoTranscript(videoId: string) {
  try {
    // Construct the video URL
    const videoUrl = `https://www.youtube.com/watch?v=${videoId}`
    
    // Encode the URL for the API request
    const encodedUrl = encodeURIComponent(videoUrl)
    
    // Make the API request to get the transcript
    const response = await fetch(`https://api.ahmadrosid.com/youtube/transcript?videoUrl=${encodedUrl}`)
    
    if (!response.ok) {
      throw new Error(`Failed to fetch transcript: ${response.status} ${response.statusText}`)
    }
    
    const data = await response.json()
    
    // Transform the API response to match our expected format
    const segments = data.content.map((item: any, index: number) => {
      // Convert start and end times from strings to numbers
      const start = parseInt(item.start, 10) / 1000 // Convert milliseconds to seconds if needed
      const end = parseInt(item.end, 10) / 1000 // Convert milliseconds to seconds if needed
      
      // Check if this might be a chapter start (simple heuristic)
      // We'll consider segments with short text that might be titles as potential chapter starts
      const isChapterStart = item.text.length < 30 && 
                            !item.text.includes('segment') && 
                            item.text !== 'N/A' &&
                            (index === 0 || index % 10 === 0) // Just a heuristic
      
      return {
        start,
        end,
        text: item.text !== 'N/A' ? item.text : `Segment at ${formatTime(start)}`,
        isChapterStart,
      }
    })
    
    return {
      segments,
    }
  } catch (error) {
    console.error('Error fetching transcript:', error)
    
    // Fallback to empty segments array in case of error
    return {
      segments: [],
    }
  }
}

function formatTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = Math.floor(seconds % 60)
  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`
}

