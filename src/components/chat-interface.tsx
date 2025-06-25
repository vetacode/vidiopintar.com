"use client"

import { useChat } from "@ai-sdk/react";
import { ArrowUp, Square, Share2, Trash2, Link as LinkIcon} from "lucide-react"
import { flushSync } from "react-dom"
import { Button, buttonVariants } from "@/components/ui/button"
import { Markdown } from "@/components/ui/markdown"
import { Message, MessageContent } from "@/components/ui/message"
import { ChatContainerContent, ChatContainerRoot } from "@/components/ui/chat-container"
import {
  PromptInput,
  PromptInputAction,
  PromptInputActions,
  PromptInputTextarea,
} from "@/components/ui/prompt-input"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { CopyButton } from "./ui/copy-button";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { useState } from "react";
import { createShareVideo, clearChatMessages } from "@/lib/services/api";
import { RuntimeClient } from "@/lib/services/RuntimeClient";
import { toast } from "sonner";
import { Ellipsis, Loader } from "./ui/loader";

interface ChatInterfaceProps {
  videoId: string;
  userVideoId: number;
  quickStartQuestions: string[];
  initialMessages: any[];
  isSharePage?: boolean;
  isLoggedIn?: boolean;
  shareChatUrl?: string;
}

export function ChatInterface({ 
  videoId,
  userVideoId,
  initialMessages,
  quickStartQuestions,
  shareChatUrl,
  isSharePage = false,
  isLoggedIn = false }: ChatInterfaceProps) {
  const {
    messages,
    input,
    setInput,
    handleSubmit,
    status,
    setMessages,
  } = useChat({
    api: '/api/chat',
    initialMessages,
    body: { videoId, userVideoId },
  });

  const [shareState, setShareState] = useState({
    isLoading: false,
    url: isSharePage ? shareChatUrl : null,
  });

  const [clearState, setClearState] = useState({
    isLoading: false,
  });

  const handleShareClick = async () => {
    if (isSharePage) return;
    setShareState({ isLoading: true, url: null });
    try {
      const response = await RuntimeClient.runPromise(createShareVideo({ youtubeId: videoId, userVideoId }))
      setShareState({ isLoading: false, url: response.url });
    } catch (error) {
      toast.error("Failed to generate share URL");
      setShareState({ isLoading: false, url: null });
    }
  };

  const handleClearMessages = async () => {
    if (isSharePage || clearState.isLoading) return;
    
    setClearState({ isLoading: true });
    try {
      await RuntimeClient.runPromise(clearChatMessages({ userVideoId }));
      setMessages([]);
      toast.success("Chat messages cleared successfully");
    } catch (error) {
      toast.error("Failed to clear chat messages");
    } finally {
      setClearState({ isLoading: false });
    }
  };

  return (
    <div className="flex h-screen w-full flex-col overflow-hidden border-l">
      <div className="px-4 py-2.5 border-b bg-white dark:bg-black sticky top-0 z-50 flex justify-between items-center">
        <h2 className="font-semibold tracking-tight dark:text-foreground">Chat</h2>
        <div className="flex gap-2">
          <Popover onOpenChange={(open) => {
            if (open && !shareState.url && !shareState.isLoading) {
              handleShareClick();
            }
          }}>
            <PopoverTrigger className={buttonVariants({ variant: "ghost", size: "icon" })}>
              <Share2 className="size-4" />
            </PopoverTrigger>
            <PopoverContent side="bottom" align="end" className="w-80">
              {shareState.isLoading ? (
                <div className="space-y-2">
                  <p className="text-sm text-center p-4 text-muted-foreground">Generating share link...</p>
                </div>
              ) : (
                <div className="space-y-2">
                  <h4 className="font-medium">Share this chat</h4>
                  <p className="text-sm text-muted-foreground">Anyone with this link can view this chat</p>
                  <div className="flex items-center space-x-2 pt-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center border rounded-md px-3 py-2 bg-muted">
                        <LinkIcon className="h-4 w-4 mr-2 flex-shrink-0 text-muted-foreground" />
                        {shareState.url && <span className="text-sm truncate">{shareState.url}</span>}
                      </div>
                    </div>
                    {shareState.url && <CopyButton content={shareState.url} copyMessage="Link copied!" />}
                  </div>
                </div>
              )}
            </PopoverContent>
          </Popover>
          {!isSharePage && (
            <Tooltip>
              <TooltipTrigger 
                className={buttonVariants({ variant: "ghost", size: "icon" })}
                onClick={handleClearMessages}
                disabled={clearState.isLoading}
              >
                <Trash2 className="size-4" />
              </TooltipTrigger>
              <TooltipContent>
                <p>{clearState.isLoading ? "Clearing..." : "Clear chat messages"}</p>
              </TooltipContent>
            </Tooltip>
          )}
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
            {status === "submitted" && <div className="px-2 py-6">
              <Ellipsis className="text-secondary-foreground/25"/>
            </div>}
          </ChatContainerContent>
        )}
      </ChatContainerRoot>
      <div className="p-4">
        {isSharePage ? (
          <div className="text-center text-sm text-muted-foreground">
            {isLoggedIn ? (
              <a href={`/video/${videoId}`}>
                <Button variant="outline">
                  Click to continue the conversation
                </Button>
              </a>
            ) : (
              <a href="/login">
                <Button variant="outline">
                  Login to start your conversation
                </Button>
              </a>
            )}
          </div>
        ) : (
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
        )}
      </div>
    </div>
  )
}
