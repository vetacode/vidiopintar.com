"use client";

import React, { useRef, useEffect } from "react";
import { useChat } from "@ai-sdk/react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { ArrowUp } from "lucide-react";
import { cn } from "@/lib/utils";
import MarkdownRenderer from "./ui/markdown-renderer";
import { TypingIndicator } from "./ui/typing-indicator";

interface ChatInterfaceProps {
  videoId: string;
  initialMessages: any[];
}

function ChatInterface({ videoId, initialMessages }: ChatInterfaceProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const mainContainerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    status
  } = useChat({
    api: '/api/chat',
    initialMessages,
    body: { videoId },
    onFinish: (message, options) => {
      console.log(message, options);
      if (options.finishReason === "stop") {
        textareaRef.current?.focus();
      }
    }
  });

  // Scroll to bottom on new messages
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "instant" });
    }
  }, [messages]);

  return (
    <div ref={mainContainerRef} className="bg-gray-50 flex flex-col overflow-hidden border-l h-screen">
      <div className="flex-grow pb-32 overflow-y-auto scrollbar-none">
        <div className="p-4 border-b bg-white sticky top-0 z-50">
          <h2 className="font-semibold tracking-tight">Untitled</h2>
        </div>
        <div className="w-full space-y-4">
          {messages.length === 0 ? (
            <div className="text-center text-muted-foreground py-8 px-4 h-full flex flex-col items-center justify-center">
              <p>No messages yet. Start a conversation about this video!</p>
            </div>
          ) : (
            <>
              {messages.map((message: any) => (
                <div key={message.id} className={cn("p-4", message.role === "user" ? "bg-white" : "bg-white/10")}>
                  <p className={cn("text-sm pb-3 opacity-50", message.role === "user" ? "text-black" : "text-gray-950")}>
                    {message.role === "user" ? "You" : "Vidiopintar"}
                    </p>
                  {message.parts && message.parts.map((part: any, i: number) => {
                    if (part.type === 'text') {
                        return <MarkdownRenderer key={i}>{part.text}</MarkdownRenderer>
                    }
                    return null
                  })}
                </div>
              ))}
              <div ref={messagesEndRef} />
              {status === "streaming" || status === "submitted" && <TypingIndicator />}
            </>
          )}
        </div>
      </div>
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gray-50 border-l">
        <form onSubmit={handleSubmit} className="max-w-none mx-auto">
          <div className="relative w-full rounded-2xl border border-gray-200 bg-white p-4 pl-3 cursor-text">
            <div className="pb-9">
              <Textarea
                ref={textareaRef}
                placeholder={status === "streaming" ? "Waiting for response..." : "Ask Anything"}
                className="min-h-[24px] max-h-[160px] w-full rounded-none border-0 bg-transparent text-gray-900 placeholder:text-gray-400 placeholder:text-base focus-visible:ring-0 focus-visible:ring-offset-0 text-sm pl-1 pr-4 pt-0 pb-0 resize-none overflow-y-auto leading-tight"
                value={input}
                onChange={handleInputChange}
                onKeyDown={e => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit(e as any);
                  }
                }}
              />
            </div>
            <div className="absolute bottom-3 right-3">
              <Button
                type="submit"
                variant="outline"
                size="icon"
                className={cn(
                  "rounded-full h-8 w-8 border-0 flex-shrink-0 transition-all duration-200",
                  input.trim() ? "bg-black scale-110" : "bg-gray-200"
                )}
                disabled={!input.trim() || status === "streaming"}
              >
                <ArrowUp className={cn("h-4 w-4 transition-colors", input.trim() ? "text-white" : "text-gray-500")} />
                <span className="sr-only">Submit</span>
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ChatInterface;
