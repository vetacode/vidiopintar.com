"use client"

import { useChat } from "@ai-sdk/react";
import { ArrowUp, Square, Share2, Trash2, Link } from "lucide-react"
import { flushSync } from "react-dom"
import { Button } from "@/components/ui/button"
import { Markdown } from "@/components/ui/markdown"
import { Message, MessageContent } from "@/components/ui/message"
import { ChatContainerContent, ChatContainerRoot } from "@/components/ui/chat-container"
import {
  PromptInput,
  PromptInputAction,
  PromptInputActions,
  PromptInputTextarea,
} from "@/components/ui/prompt-input"
import { CopyButton } from "./ui/copy-button";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { useState } from "react";
import { createShareVideo } from "@/lib/services/api";
import { RuntimeClient } from "@/lib/services/RuntimeClient";
import { toast } from "sonner";

interface ChatInterfaceProps {
  videoId: string;
  userVideoId: number;
  quickStartQuestions: string[];
  initialMessages: any[];
}

export default function ChatInterface({ videoId, userVideoId, initialMessages, quickStartQuestions }: ChatInterfaceProps) {
  const {
    messages,
    input,
    setInput,
    handleSubmit,
    status,
  } = useChat({
    api: '/api/chat',
    initialMessages,
    body: { videoId, userVideoId },
  });
  
  const [shareUrl, setShareUrl] = useState<string>('');
  const [isGeneratingUrl, setIsGeneratingUrl] = useState(false);
  const [popoverOpen, setPopoverOpen] = useState(false);
  
  const handleShareClick = async () => {
    try {
      setIsGeneratingUrl(true);
      const response = await RuntimeClient.runPromise(createShareVideo({ youtubeId: videoId, userVideoId }))
      setShareUrl(response.url);
    } catch (error) {
      console.error("Error generating share URL:", error);
      toast.error("Failed to generate share URL");
      setPopoverOpen(false);
    } finally {
      setIsGeneratingUrl(false);
    }
  };

  return (
    <div className="flex h-screen w-full flex-col overflow-hidden border-l">
      <div className="px-4 py-2.5 border-b bg-white dark:bg-black sticky top-0 z-50 flex justify-between items-center">
        <h2 className="font-semibold tracking-tight dark:text-foreground">Chat</h2>
        <div className="flex gap-2">
          <Popover open={popoverOpen} onOpenChange={(open) => {
            if (open && !shareUrl && !isGeneratingUrl) {
              handleShareClick();
            }
            setPopoverOpen(open);
          }}>
            <PopoverTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon"
              >
                <Share2 className="size-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80">
              {isGeneratingUrl ? (
                <div className="space-y-2">
                  <p className="text-sm text-center p-4 text-muted-foreground">Generating share link...</p>
                </div>
              ) : (
                <div className="space-y-2">
                  <h4 className="font-medium">Share this chat</h4>
                  <p className="text-sm text-muted-foreground">Anyone with this link can view this chat</p>
                  <div className="flex items-center space-x-2 pt-2">
                    <div className="grid flex-1 items-center gap-2">
                      <div className="flex items-center border rounded-md px-3 py-2 bg-muted">
                        <Link className="h-4 w-4 mr-2 flex-shrink-0 text-muted-foreground" />
                        <span className="text-sm truncate">{shareUrl}</span>
                      </div>
                    </div>
                    <CopyButton content={shareUrl} copyMessage="Link copied!" />
                  </div>
                </div>
              )}
            </PopoverContent>
          </Popover>
          <Button variant="ghost" size="icon">
            <Trash2 className="size-4" />
          </Button>
        </div>
      </div>
      <ChatContainerRoot className="flex-1">
        {messages.length === 0 && quickStartQuestions.length > 0 ? (
          <div className="flex flex-col gap-4 p-4 h-full justify-center">
            <div>
              <p className="text-left py-2 text-foreground/75 font-semibold tracking-tight">
                Start your video chat with these quick questions!
              </p>
            </div>
            <div className="flex flex-col gap-2">
              {quickStartQuestions.map((question, index) => (
                <form
                  key={index}
                  onSubmit={(e) => {
                    handleSubmit(e as any);
                  }}>
                  <button
                    type="submit"
                    onClick={() => flushSync(() => setInput(question))}
                    className="text-sm text-left p-2 rounded bg-secondary border border-border/25 text-foreground/85 cursor-pointer hover:border-accent-foreground/75">
                    {question}
                  </button>
                </form>
              ))}
            </div>
          </div>
        ) : (
          <ChatContainerContent className="space-y-4 p-4">
            {messages.map((message) => {
              const isAssistant = message.role === "assistant"
              return (
                <Message
                  key={message.id}
                  className={
                    message.role === "user" ? "justify-end" : "justify-start"
                  }
                >
                  {isAssistant ? (
                    <div className="max-w-full flex-1 sm:max-w-full">
                      <div className="relative group prose prose-sm px-2 py-6 max-w-none">
                        <Markdown>{message.content}</Markdown>
                        <div className="absolute bottom-0 right-2 group-hover:visible invisible">
                          <CopyButton content={message.content} copyMessage="Copied to clipboard" label="Copy" />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="max-w-[85%] flex-1 sm:max-w-[75%]">
                      <MessageContent className="bg-secondary text-secondary-foreground p-3" markdown={true}>
                        {message.content}
                      </MessageContent>
                    </div>
                  )}
                </Message>
              )
            })}
          </ChatContainerContent>
        )}
      </ChatContainerRoot>
      <div className="p-4">
        <PromptInput
          value={input}
          onValueChange={(value) => setInput(value)}
          isLoading={status === "streaming"}
          onSubmit={handleSubmit}
          className="w-full"
        >
          <PromptInputTextarea placeholder="Ask anything..." />
          <PromptInputActions className="justify-end pt-2">
            <PromptInputAction
              tooltip={status === "streaming" ? "Stop generation" : "Send message"}
            >
              <Button
                variant="default"
                size="icon"
                className="h-8 w-8 rounded-full"
                onClick={handleSubmit}
              >
                {status === "streaming" ? (
                  <Square className="size-5 fill-current" />
                ) : (
                  <ArrowUp className="size-5" />
                )}
              </Button>
            </PromptInputAction>
          </PromptInputActions>
        </PromptInput>
      </div>
    </div>
  )
}
