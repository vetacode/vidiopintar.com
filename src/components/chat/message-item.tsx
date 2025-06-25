"use client"

import { Markdown } from "@/components/ui/markdown"
import { Message, MessageContent } from "@/components/ui/message"
import { ChatContainerContent } from "@/components/ui/chat-container"
import { CopyButton } from "@/components/ui/copy-button";
import { Ellipsis } from "@/components/ui/loader";

interface MessageItemProps {
    messages: any[];
    isLoggedIn?: boolean;
    status: string;
}

export function MessageItem({
    messages,
    status,
    isLoggedIn = false }: MessageItemProps) {

    return (
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
                <Ellipsis className="text-secondary-foreground/25" />
            </div>}
        </ChatContainerContent>
    )
}
