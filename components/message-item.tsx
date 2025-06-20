import { cn } from "@/lib/utils"
import MarkdownRenderer from "./ui/markdown-renderer"

export function MessageItem({ message }: { message: any }) {
    if (message.role === "user") {
        return (
            <div className="flex w-full justify-end p-2">
                <div className="rounded-lg p-3 text-foreground bg-secondary w-fit max-w-[80%]">
                    {message.parts && message.parts.map((part: any, i: number) => {
                        if (part.type === 'text') {
                            return <MarkdownRenderer key={i}>{part.text}</MarkdownRenderer>
                        }
                        return null
                    })}
                </div>
            </div>
        )
    }
    return (
        <div>
            <div key={message.id} className={cn("p-4 bg-white/15 dark:bg-black/90")}>
                {message.parts && message.parts.map((part: any, i: number) => {
                    if (part.type === 'text') {
                        return <MarkdownRenderer key={i}>{part.text}</MarkdownRenderer>
                    }
                    return null
                })}
            </div>
        </div>
    )
}