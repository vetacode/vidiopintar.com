"use client"
import React from "react"
import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Save, FileText } from "lucide-react"

interface Note {
    id: string
    content: string
    timestamp: number
}

interface NotesSectionProps {
    videoId: string
}

export function NotesSection({ videoId }: NotesSectionProps) {
    const [notes, setNotes] = useState<Note[]>([])
    const [inputValue, setInputValue] = useState("")
    const notesEndRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const loadData = async () => {
            try {
                const res = await fetch(`/api/notes?videoId=${videoId}`);
                if (!res.ok) throw new Error('Failed to fetch notes');
                const videoNotes = await res.json();
                setNotes(videoNotes);
            } catch (error) {
                console.error('Error loading data:', error);
            }
        };

        loadData();
    }, [videoId])

    useEffect(() => {
        if (notesEndRef.current) {
            notesEndRef.current.scrollIntoView({ behavior: "smooth" })
        }
    }, [notes])

    const handleSaveNote = async () => {
        if (!inputValue.trim()) return

        const newNote: Note = {
            id: Date.now().toString(),
            content: inputValue,
            timestamp: Date.now(),
        }

        const updatedNotes = [...notes, newNote]
        setNotes(updatedNotes)
        await fetch('/api/notes', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ videoId, note: newNote }),
        })
        setInputValue("")
    }

    const handleKeyDown = async (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault()
            await handleSaveNote()
        }
    }

    return (
        <div className="h-full flex flex-col flex-grow">
            <div className="space-y-4 h-full flex-1">
                {notes.length === 0 ? (
                    <div className="text-center text-muted-foreground py-8 px-4 h-full flex flex-col items-center justify-center">
                        <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p>No notes yet. Add notes about this video!</p>
                    </div>
                ) : (
                    <>
                        {notes.map((note) => (
                            <div key={note.id} className="border border-white/10 rounded-xl p-4 bg-secondary/30 hover:bg-secondary/50 transition-colors">
                                <p className="mb-2 whitespace-pre-wrap break-words">{note.content}</p>
                                <div className="text-xs text-muted-foreground">
                                    {new Date(note.timestamp).toLocaleString([], {
                                        month: "short",
                                        day: "numeric",
                                        hour: "2-digit",
                                        minute: "2-digit",
                                    })}
                                </div>
                            </div>
                        ))}
                        <div ref={notesEndRef} />
                    </>
                )}
            </div>

            <div className="p-4 border-t border-white/10 shrink-0">
                <div className="flex gap-2">
                    <Input
                        placeholder="Add a note..."
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={handleKeyDown}
                        className="flex-1 bg-secondary/70 border-0 h-12 rounded-xl focus:ring-melody focus:ring-1"
                    />
                    <Button
                        onClick={handleSaveNote}
                        disabled={!inputValue.trim()}
                        className="h-12 w-12 rounded-xl bg-melody hover:bg-melody-dark text-melody-foreground shrink-0"
                    >
                        <Save className="h-5 w-5" />
                    </Button>
                </div>
            </div>
        </div>
    )
}
