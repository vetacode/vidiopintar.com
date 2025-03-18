"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { HelpCircle, CheckCircle, XCircle, RefreshCw } from "lucide-react"
import { getQuizzesForVideo, saveQuiz } from "@/lib/storage"

interface QuizQuestion {
  id: string
  question: string
  options: string[]
  correctAnswer: number
}

interface Quiz {
  id: string
  title: string
  questions: QuizQuestion[]
  timestamp: number
}

interface QuizInterfaceProps {
  videoId: string
}

export default function QuizSection({ videoId }: QuizInterfaceProps) {
  const [quizzes, setQuizzes] = useState<Quiz[]>([])
  const [currentQuiz, setCurrentQuiz] = useState<Quiz | null>(null)
  const [userAnswers, setUserAnswers] = useState<number[]>([])
  const [quizSubmitted, setQuizSubmitted] = useState(false)
  const [quizScore, setQuizScore] = useState({ correct: 0, total: 0 })
  const [isGeneratingQuiz, setIsGeneratingQuiz] = useState(false)

  // Load quizzes on component mount
  useEffect(() => {
    const savedQuizzes = getQuizzesForVideo(videoId)
    setQuizzes(savedQuizzes)

    // Set the first quiz as current if available
    if (savedQuizzes.length > 0) {
      setCurrentQuiz(savedQuizzes[0])
      setUserAnswers(new Array(savedQuizzes[0].questions.length).fill(-1))
    }
  }, [videoId])

  const handleAnswerSelect = (questionIndex: number, optionIndex: number) => {
    if (quizSubmitted) return

    const newAnswers = [...userAnswers]
    newAnswers[questionIndex] = optionIndex
    setUserAnswers(newAnswers)
  }

  const handleQuizSubmit = () => {
    if (!currentQuiz) return

    let correctCount = 0
    currentQuiz.questions.forEach((question, index) => {
      if (userAnswers[index] === question.correctAnswer) {
        correctCount++
      }
    })

    setQuizScore({
      correct: correctCount,
      total: currentQuiz.questions.length,
    })

    setQuizSubmitted(true)
  }

  const generateNewQuiz = () => {
    setIsGeneratingQuiz(true)

    // Simulate quiz generation (in a real app, this would call an AI service)
    setTimeout(() => {
      const newQuiz: Quiz = {
        id: Date.now().toString(),
        title: "Video Comprehension Quiz",
        timestamp: Date.now(),
        questions: [
          {
            id: "q1",
            question: "What is the main topic of this video?",
            options: [
              "Machine Learning Basics",
              "Advanced Data Structures",
              "Web Development Fundamentals",
              "Quantum Computing",
            ],
            correctAnswer: 2,
          },
          {
            id: "q2",
            question: "Which technology was mentioned as essential for modern web applications?",
            options: ["COBOL", "JavaScript", "FORTRAN", "Assembly"],
            correctAnswer: 1,
          },
          {
            id: "q3",
            question: "What pattern was recommended for state management?",
            options: ["Singleton", "Observer", "Factory", "Decorator"],
            correctAnswer: 0,
          },
          {
            id: "q4",
            question: "Which of these is NOT a benefit mentioned in the video?",
            options: ["Improved performance", "Better user experience", "Quantum encryption", "Code maintainability"],
            correctAnswer: 2,
          },
          {
            id: "q5",
            question: "What was the recommended approach for handling asynchronous operations?",
            options: ["Callbacks", "Async/Await", "Event listeners", "Polling"],
            correctAnswer: 1,
          },
        ],
      }

      const updatedQuizzes = [newQuiz, ...quizzes]
      setQuizzes(updatedQuizzes)
      setCurrentQuiz(newQuiz)
      setUserAnswers(new Array(newQuiz.questions.length).fill(-1))
      setQuizSubmitted(false)
      setQuizScore({ correct: 0, total: 0 })
      saveQuiz(videoId, newQuiz)
      setIsGeneratingQuiz(false)
    }, 2000)
  }

  const resetQuiz = () => {
    setUserAnswers(new Array(currentQuiz?.questions.length || 0).fill(-1))
    setQuizSubmitted(false)
    setQuizScore({ correct: 0, total: 0 })
  }

  return (
    <div className="space-y-6 h-full p-4 overflow-y-scroll max-h-[80vh] scrollbar-none">
      {!currentQuiz ? (
        <div className="text-center text-muted-foreground py-8 px-4 h-full flex flex-col items-center justify-center">
          <HelpCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p className="mb-4">No quizzes available for this video yet.</p>
          <Button
            onClick={generateNewQuiz}
            disabled={isGeneratingQuiz}
            className="bg-melody hover:bg-melody-dark text-melody-foreground"
          >
            {isGeneratingQuiz ? (
              <span className="flex items-center">
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Generating Quiz...
              </span>
            ) : (
              <span>Generate Quiz</span>
            )}
          </Button>
        </div>
      ) : (
        <>
          {/* Quiz header */}
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">{currentQuiz.title}</h3>
            <div className="text-xs text-muted-foreground">
              {new Date(currentQuiz.timestamp).toLocaleString([], {
                month: "short",
                day: "numeric",
              })}
            </div>
          </div>

          {/* Quiz results if submitted */}
          {quizSubmitted && (
            <div className="bg-secondary/30 rounded-xl p-4 mb-4">
              <h4 className="font-medium mb-2">Quiz Results</h4>
              <div className="flex items-center justify-between mb-2">
                <span>
                  Score: {quizScore.correct} / {quizScore.total}
                </span>
                <span className="text-sm">{Math.round((quizScore.correct / quizScore.total) * 100)}%</span>
              </div>
              <Progress value={(quizScore.correct / quizScore.total) * 100} className="h-2 bg-secondary" />
              <div className="mt-4 flex justify-end">
                <Button variant="outline" size="sm" onClick={resetQuiz} className="text-xs">
                  Retry Quiz
                </Button>
              </div>
            </div>
          )}

          {/* Questions */}
          <div className="space-y-6">
            {currentQuiz.questions.map((question, qIndex) => (
              <div
                key={question.id}
                className={`border border-white/10 rounded-xl p-4 ${
                  quizSubmitted && userAnswers[qIndex] === question.correctAnswer
                    ? "bg-green-950/20 border-green-500/30"
                    : quizSubmitted && userAnswers[qIndex] !== -1
                      ? "bg-red-950/20 border-red-500/30"
                      : "bg-secondary/30"
                }`}
              >
                <div className="flex items-start mb-3">
                  <span className="bg-melody/20 text-melody px-2 py-1 rounded-md text-sm mr-3">Q{qIndex + 1}</span>
                  <h4 className="font-medium flex-1">{question.question}</h4>
                  {quizSubmitted && (
                    <div className="ml-2">
                      {userAnswers[qIndex] === question.correctAnswer ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-500" />
                      )}
                    </div>
                  )}
                </div>

                <RadioGroup value={userAnswers[qIndex].toString()} className="space-y-2">
                  {question.options.map((option, oIndex) => (
                    <div
                      key={oIndex}
                      className={`flex items-center space-x-2 rounded-lg p-2 ${
                        quizSubmitted && oIndex === question.correctAnswer
                          ? "bg-green-500/10"
                          : quizSubmitted && userAnswers[qIndex] === oIndex && oIndex !== question.correctAnswer
                            ? "bg-red-500/10"
                            : "hover:bg-secondary/50"
                      } ${userAnswers[qIndex] === oIndex ? "bg-secondary/70" : ""}`}
                      onClick={() => handleAnswerSelect(qIndex, oIndex)}
                    >
                      <RadioGroupItem
                        value={oIndex.toString()}
                        id={`q${qIndex}-o${oIndex}`}
                        disabled={quizSubmitted}
                        className="cursor-pointer"
                      />
                      <Label
                        htmlFor={`q${qIndex}-o${oIndex}`}
                        className={`flex-1 cursor-pointer ${
                          quizSubmitted && oIndex === question.correctAnswer ? "text-green-400" : ""
                        }`}
                      >
                        {option}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
            ))}
          </div>

          {/* Submit button */}
          {!quizSubmitted && (
            <div className="flex justify-end mt-4">
              <Button
                onClick={handleQuizSubmit}
                disabled={userAnswers.includes(-1)}
                className="bg-melody hover:bg-melody-dark text-melody-foreground"
              >
                Submit Answers
              </Button>
            </div>
          )}

          {/* Generate new quiz button */}
          {quizSubmitted && (
            <div className="flex justify-center mt-6">
              <Button
                onClick={generateNewQuiz}
                disabled={isGeneratingQuiz}
                variant="outline"
                className="border-melody/30 text-melody hover:bg-melody/10"
              >
                {isGeneratingQuiz ? (
                  <span className="flex items-center">
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Generating New Quiz...
                  </span>
                ) : (
                  <span className="flex items-center">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Generate New Quiz
                  </span>
                )}
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  )
}

