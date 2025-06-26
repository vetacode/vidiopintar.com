"use client"

import { Markdown } from "@/components/ui/markdown"
import { Message, MessageContent } from "@/components/ui/message"
import { ChatContainerContent } from "@/components/ui/chat-container"
import { CopyButton } from "@/components/ui/copy-button";
import { Ellipsis } from "@/components/ui/loader";
import { ScrollButton } from "@/components/ui/scroll-button";
import { Message as MessageType } from "@ai-sdk/react"

interface MessageItemProps {
    messages: MessageType[];
    status: string;
}

export function MessageItem({ messages, status }: MessageItemProps) {
    return (
        <ChatContainerContent className="gap-4 p-4"
            style={{
                scrollbarGutter: "stable both-edges",
                scrollbarWidth: "none",
            }}>
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
                                <div className="relative group prose dark:prose-invert prose-sm px-2 py-6 max-w-none">
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
                <Ellipsis className="text-secondary-foreground/25" />
            </div>}
            <div className="absolute inset-x-0 bottom-2">
                <div className="flex justify-center w-full">
                    <ScrollButton className="shadow-none" />
                </div>
            </div>
        </ChatContainerContent>
    )
}
