import { useVideoStore } from '@/stores/video-store'

export const useVideo = () => {
  const store = useVideoStore()
  
  return {
    // State
    currentTime: store.currentTime,
    isReady: store.isReady,
    player: store.player,
    
    // Actions
    seekAndPlay: store.seekAndPlay,
    setCurrentTime: store.setCurrentTime,
    setReady: store.setReady,
    setPlayer: store.setPlayer,
  }
}