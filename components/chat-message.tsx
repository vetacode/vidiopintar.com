import type React from "react"
import { useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Send, MessageSquare, User, Bot } from "lucide-react"
import { useChat } from '@ai-sdk/react'

export function ChatMessages() {
  const messagesEndRef = useRef<HTMLDivElement>(null)
  
  const { messages, input, handleInputChange, handleSubmit, status } = useChat({
    api: '/api/chat',
    initialMessages: [],
  })

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e as any)
    }
  }

  return (
    <div className="h-full flex flex-col">
        <div className="space-y-4 flex-1 px-4 py-2">
            {messages.length === 0 ? (
            <div className="text-center text-muted-foreground py-8 px-4 h-full flex flex-col items-center justify-center">
                <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No messages yet. Start a conversation about this video!</p>
            </div>
            ) : (
            <>
                {messages.map((message) => (
                    <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                        <div className={`max-w-[100%] rounded-2xl p-4 break-words ${message.role === "user" ? "bg-melody text-melody-foreground" : "bg-secondary"}`}>
                        <div className="flex items-center mb-2 text-xs opacity-70 py-1">
                            {message.role === "user" ? (
                            <span className="flex items-center gap-1">
                                You
                            </span>
                            ) : (
                            <span className="flex items-center gap-1">
                                Assistant
                            </span>
                            )}
                        </div>
                        {message.parts.map((part, i) => {
                            if (part.type === 'text') {
                                return <p key={i} className="whitespace-pre-wrap">{part.text}</p>
                            }
                            return null
                        })}
                        </div>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </>
            )}
        </div>

        <div className="p-4 border-t border-white/10 shrink-0">
            <form onSubmit={handleSubmit} className="flex gap-2">
            <Input
                placeholder="Type a message..."
                value={input}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                className="flex-1 bg-secondary/70 border-0 h-12 rounded-xl focus:ring-melody focus:ring-1"
            />
            <Button
                type="submit"
                disabled={!input.trim() || status === "streaming"}
                className="h-12 w-12 rounded-xl bg-melody hover:bg-melody-dark text-melody-foreground shrink-0"
            >
                <Send className="h-5 w-5" />
            </Button>
            </form>
        </div>
    </div>
  )
}
