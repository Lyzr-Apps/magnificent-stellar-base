'use client'

import { useState, useEffect, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Progress } from '@/components/ui/progress'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { ArrowLeft, Send, X, Save, MessageCircle } from 'lucide-react'
import Link from 'next/link'

interface Message {
  id: string
  role: 'agent' | 'user'
  content: string
  timestamp: string
}

interface InterviewData {
  id: string
  teamMemberId: string
  teamMemberName: string
  status: 'pending' | 'in-progress' | 'completed'
  startedAt: string
  completedAt?: string
  transcript?: string
  duration?: number
  messages?: Message[]
}

const STAGES = [
  { name: 'Projects', description: 'What are you working on?' },
  { name: 'Progress', description: 'What progress have you made?' },
  { name: 'Challenges', description: 'What challenges are you facing?' },
  { name: 'Plans', description: 'What are your upcoming plans?' }
]

export default function InterviewPage() {
  const params = useParams()
  const router = useRouter()
  const scrollRef = useRef<HTMLDivElement>(null)

  const interviewId = params.id as string
  const [interview, setInterview] = useState<InterviewData | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [currentStage, setCurrentStage] = useState(0)
  const [userInput, setUserInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showExitDialog, setShowExitDialog] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  // Load interview data
  useEffect(() => {
    const savedInterviews = localStorage.getItem('interviews')
    if (savedInterviews) {
      const interviews = JSON.parse(savedInterviews)
      const foundInterview = interviews.find((i: InterviewData) => i.id === interviewId)
      if (foundInterview) {
        setInterview(foundInterview)
        if (foundInterview.messages) {
          setMessages(foundInterview.messages)
          setCurrentStage(Math.min(foundInterview.messages.length / 2, STAGES.length - 1))
        } else {
          // Initialize first agent message
          initializeInterview(foundInterview)
        }
      }
    }
  }, [interviewId])

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages])

  const initializeInterview = (interviewData: InterviewData) => {
    const initialMessage: Message = {
      id: `msg_${Date.now()}`,
      role: 'agent',
      content: `Hi ${interviewData.teamMemberName}! I'm here to conduct a quick interview about your current projects and progress. Let's start with the first topic: ${STAGES[0].description}`,
      timestamp: new Date().toISOString()
    }
    setMessages([initialMessage])
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!userInput.trim() || isLoading || !interview) return

    const userMessage: Message = {
      id: `msg_${Date.now()}`,
      role: 'user',
      content: userInput,
      timestamp: new Date().toISOString()
    }

    setMessages(prev => [...prev, userMessage])
    setUserInput('')
    setIsLoading(true)

    try {
      // Call Interview Conductor Agent
      const response = await fetch('/api/interview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userInput,
          interview_id: interviewId,
          stage: STAGES[currentStage].name,
          conversation_history: messages
        })
      })

      const data = await response.json()

      if (data.success) {
        const agentMessage: Message = {
          id: `msg_${Date.now() + 1}`,
          role: 'agent',
          content: data.response?.agent_message || data.raw_response,
          timestamp: new Date().toISOString()
        }

        setMessages(prev => [...prev, agentMessage])

        // Update stage if interview progression detected
        const nextStage = data.response?.next_stage
        if (nextStage !== undefined && nextStage < STAGES.length) {
          setCurrentStage(nextStage)
        }

        // Check if interview is complete
        if (data.response?.interview_complete) {
          completeInterview(messages)
        }
      }
    } catch (error) {
      console.error('Error:', error)
      const errorMessage: Message = {
        id: `msg_${Date.now() + 1}`,
        role: 'agent',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date().toISOString()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const completeInterview = async (finalMessages: Message[]) => {
    if (!interview) return

    setIsSaving(true)
    try {
      // Build transcript
      const transcript = finalMessages
        .map(m => `${m.role === 'agent' ? 'Agent' : 'User'}: ${m.content}`)
        .join('\n\n')

      const startTime = new Date(interview.startedAt).getTime()
      const duration = Math.round((Date.now() - startTime) / 60000)

      // Update interview in localStorage
      const savedInterviews = localStorage.getItem('interviews')
      if (savedInterviews) {
        const interviews = JSON.parse(savedInterviews)
        const updatedInterviews = interviews.map((i: InterviewData) =>
          i.id === interviewId
            ? {
                ...i,
                status: 'completed',
                transcript,
                completedAt: new Date().toISOString(),
                duration,
                messages: finalMessages
              }
            : i
        )
        localStorage.setItem('interviews', JSON.stringify(updatedInterviews))
      }

      // Show completion dialog
      setTimeout(() => {
        alert('Interview completed successfully! Redirecting to dashboard...')
        router.push('/')
      }, 1000)
    } finally {
      setIsSaving(false)
    }
  }

  const handleSaveAndExit = async () => {
    if (!interview) return

    setIsSaving(true)
    try {
      const transcript = messages
        .map(m => `${m.role === 'agent' ? 'Agent' : 'User'}: ${m.content}`)
        .join('\n\n')

      const savedInterviews = localStorage.getItem('interviews')
      if (savedInterviews) {
        const interviews = JSON.parse(savedInterviews)
        const updatedInterviews = interviews.map((i: InterviewData) =>
          i.id === interviewId
            ? {
                ...i,
                transcript,
                messages
              }
            : i
        )
        localStorage.setItem('interviews', JSON.stringify(updatedInterviews))
      }

      router.push('/')
    } finally {
      setIsSaving(false)
      setShowExitDialog(false)
    }
  }

  if (!interview) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Card>
          <CardContent className="pt-6">
            <p className="text-slate-700">Loading interview...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const progressPercent = ((currentStage + 1) / STAGES.length) * 100

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <Link href="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
            <div className="text-center">
              <h1 className="text-xl font-bold text-slate-900">{interview.teamMemberName}</h1>
              <p className="text-sm text-slate-600">
                Stage {currentStage + 1} of {STAGES.length}: {STAGES[currentStage].name}
              </p>
            </div>
            <Button
              onClick={() => setShowExitDialog(true)}
              variant="outline"
              size="sm"
            >
              <Save className="w-4 h-4 mr-2" />
              Save & Exit
            </Button>
          </div>
        </div>
      </header>

      {/* Progress Bar */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <Progress value={progressPercent} className="h-2" />
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-6 py-8">
          <div className="space-y-4">
            {messages.map(message => (
              <div
                key={message.id}
                className={`flex ${message.role === 'agent' ? 'justify-start' : 'justify-end'}`}
              >
                <div
                  className={`max-w-2xl px-4 py-3 rounded-lg ${
                    message.role === 'agent'
                      ? 'bg-blue-50 border border-blue-200 text-slate-900'
                      : 'bg-blue-600 text-white'
                  }`}
                >
                  <p className="text-sm">{message.content}</p>
                  <p className={`text-xs mt-1 ${message.role === 'agent' ? 'text-slate-500' : 'text-blue-100'}`}>
                    {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-blue-50 border border-blue-200 px-4 py-3 rounded-lg">
                  <div className="flex gap-2">
                    <div className="w-2 h-2 rounded-full bg-blue-600 animate-bounce"></div>
                    <div className="w-2 h-2 rounded-full bg-blue-600 animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 rounded-full bg-blue-600 animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={scrollRef} />
          </div>
        </div>
      </div>

      {/* Input Area */}
      <div className="bg-white border-t border-slate-200 sticky bottom-0">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <form onSubmit={handleSendMessage} className="flex gap-3">
            <Textarea
              value={userInput}
              onChange={e => setUserInput(e.target.value)}
              placeholder="Type your response here... (Press Enter to send, Shift+Enter for new line)"
              className="resize-none h-12"
              onKeyDown={e => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  handleSendMessage(e as any)
                }
              }}
              disabled={isLoading}
            />
            <Button
              type="submit"
              disabled={isLoading || !userInput.trim()}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Send className="w-4 h-4" />
            </Button>
          </form>
        </div>
      </div>

      {/* Exit Dialog */}
      <AlertDialog open={showExitDialog} onOpenChange={setShowExitDialog}>
        <AlertDialogContent>
          <AlertDialogTitle>Save Interview Progress</AlertDialogTitle>
          <AlertDialogDescription>
            Your interview will be saved. You can continue it later from the dashboard.
          </AlertDialogDescription>
          <div className="flex gap-3 justify-end">
            <AlertDialogCancel>Continue Interview</AlertDialogCancel>
            <AlertDialogAction onClick={handleSaveAndExit} disabled={isSaving}>
              {isSaving ? 'Saving...' : 'Save & Exit'}
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
