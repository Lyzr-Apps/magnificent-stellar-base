'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { ArrowLeft, Download, Share2, FileText, Calendar, Clock, MessageCircle, Flag } from 'lucide-react'
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

export default function TranscriptPage() {
  const params = useParams()
  const router = useRouter()

  const interviewId = params.id as string
  const [interview, setInterview] = useState<InterviewData | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [showShareDialog, setShowShareDialog] = useState(false)
  const [showFlagDialog, setShowFlagDialog] = useState(false)
  const [highlightedMessages, setHighlightedMessages] = useState<string[]>([])

  // Load interview data
  useEffect(() => {
    const savedInterviews = localStorage.getItem('interviews')
    if (savedInterviews) {
      const interviews = JSON.parse(savedInterviews)
      const foundInterview = interviews.find((i: InterviewData) => i.id === interviewId)
      if (foundInterview) {
        setInterview(foundInterview)
      }
    }
  }, [interviewId])

  const extractKeyPoints = (transcript: string) => {
    // Simple keyword extraction - in a real app, this would be more sophisticated
    const keywords = [
      'completed',
      'finished',
      'achieved',
      'delivered',
      'launched',
      'blocked',
      'challenge',
      'issue',
      'problem',
      'planning',
      'upcoming',
      'next'
    ]

    const lines = transcript.split('\n\n')
    const keyPoints = lines.filter(line =>
      keywords.some(keyword => line.toLowerCase().includes(keyword))
    )

    return keyPoints.slice(0, 5) // Return top 5 key points
  }

  const extractActionItems = (transcript: string) => {
    // In a real app, this would be powered by AI
    const items = transcript.split('\n\n')
      .filter(line => line.toLowerCase().includes('will') || line.toLowerCase().includes('need to'))
      .slice(0, 5)

    return items
  }

  const filteredMessages = interview?.messages?.filter(m =>
    m.content.toLowerCase().includes(searchQuery.toLowerCase())
  ) || []

  const displayMessages = searchQuery ? filteredMessages : interview?.messages || []

  if (!interview) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Card>
          <CardContent className="pt-6">
            <p className="text-slate-700">Loading transcript...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const keyPoints = interview.transcript ? extractKeyPoints(interview.transcript) : []
  const actionItems = interview.transcript ? extractActionItems(interview.transcript) : []

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center mb-4">
            <Link href="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Export PDF
              </Button>
              <Button
                onClick={() => setShowShareDialog(true)}
                variant="outline"
                size="sm"
              >
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="grid grid-cols-3 gap-6">
          {/* Left Sidebar - Metadata */}
          <div className="col-span-1 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Interview Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-slate-700">Team Member</p>
                  <p className="text-lg font-semibold text-slate-900">{interview.teamMemberName}</p>
                </div>
                <div className="border-t pt-4">
                  <p className="text-sm font-medium text-slate-700 mb-2">Date</p>
                  <div className="flex items-center gap-2 text-slate-600">
                    <Calendar className="w-4 h-4" />
                    {new Date(interview.startedAt).toLocaleDateString()}
                  </div>
                </div>
                <div className="border-t pt-4">
                  <p className="text-sm font-medium text-slate-700 mb-2">Time</p>
                  <div className="flex items-center gap-2 text-slate-600">
                    <Clock className="w-4 h-4" />
                    {new Date(interview.startedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
                {interview.duration && (
                  <div className="border-t pt-4">
                    <p className="text-sm font-medium text-slate-700 mb-2">Duration</p>
                    <div className="flex items-center gap-2 text-slate-600">
                      <MessageCircle className="w-4 h-4" />
                      {interview.duration} minutes
                    </div>
                  </div>
                )}
                <div className="border-t pt-4">
                  <p className="text-sm font-medium text-slate-700 mb-2">Messages</p>
                  <p className="text-slate-600">{interview.messages?.length || 0} messages</p>
                </div>
              </CardContent>
            </Card>

            {/* Key Points */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Key Points</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {keyPoints.length > 0 ? (
                    keyPoints.map((point, idx) => (
                      <li key={idx} className="text-sm text-slate-700 flex gap-2">
                        <span className="font-semibold text-blue-600">•</span>
                        <span className="line-clamp-3">{point.substring(0, 100)}</span>
                      </li>
                    ))
                  ) : (
                    <p className="text-sm text-slate-500">No key points identified</p>
                  )}
                </ul>
              </CardContent>
            </Card>

            {/* Action Items */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Action Items</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {actionItems.length > 0 ? (
                    actionItems.map((item, idx) => (
                      <li key={idx} className="text-sm text-slate-700 flex gap-2">
                        <span className="font-semibold text-green-600">→</span>
                        <span className="line-clamp-3">{item.substring(0, 100)}</span>
                      </li>
                    ))
                  ) : (
                    <p className="text-sm text-slate-500">No action items identified</p>
                  )}
                </ul>
              </CardContent>
            </Card>

            {/* Flag for Review */}
            <Button
              onClick={() => setShowFlagDialog(true)}
              variant="outline"
              className="w-full"
            >
              <Flag className="w-4 h-4 mr-2" />
              Flag for Review
            </Button>
          </div>

          {/* Right Content - Transcript */}
          <div className="col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Interview Transcript</CardTitle>
                <div className="mt-4">
                  <input
                    type="text"
                    placeholder="Search transcript..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </CardHeader>
              <CardContent>
                {searchQuery && filteredMessages.length === 0 ? (
                  <p className="text-slate-600 text-center py-8">No messages found matching "{searchQuery}"</p>
                ) : (
                  <div className="space-y-6">
                    {displayMessages.map(message => (
                      <div
                        key={message.id}
                        className="border-l-4 border-slate-200 pl-4 py-2"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <Badge
                            className={message.role === 'agent' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-700'}
                          >
                            {message.role === 'agent' ? 'Agent' : 'Team Member'}
                          </Badge>
                          <span className="text-xs text-slate-500">
                            {new Date(message.timestamp).toLocaleTimeString()}
                          </span>
                        </div>
                        <p className="text-slate-800 leading-relaxed">{message.content}</p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Full Text View */}
            {interview.transcript && (
              <Card>
                <CardHeader>
                  <CardTitle>Full Transcript Text</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 max-h-96 overflow-y-auto">
                    <p className="text-sm text-slate-700 whitespace-pre-wrap font-mono text-xs leading-relaxed">
                      {interview.transcript}
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Share Dialog */}
      <AlertDialog open={showShareDialog} onOpenChange={setShowShareDialog}>
        <AlertDialogContent>
          <AlertDialogTitle>Share Transcript</AlertDialogTitle>
          <AlertDialogDescription>
            <div className="space-y-4 mt-4">
              <div>
                <label className="text-sm font-medium text-slate-700 block mb-2">
                  Share Link
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    readOnly
                    value={`${typeof window !== 'undefined' ? window.location.origin : ''}/transcript/${interviewId}`}
                    className="flex-1 px-3 py-2 border border-slate-300 rounded-md text-sm bg-slate-50"
                  />
                  <Button
                    variant="outline"
                    onClick={() => {
                      navigator.clipboard.writeText(
                        `${typeof window !== 'undefined' ? window.location.origin : ''}/transcript/${interviewId}`
                      )
                    }}
                  >
                    Copy
                  </Button>
                </div>
              </div>
            </div>
          </AlertDialogDescription>
          <div className="flex gap-3 justify-end">
            <AlertDialogCancel>Close</AlertDialogCancel>
          </div>
        </AlertDialogContent>
      </AlertDialog>

      {/* Flag Dialog */}
      <AlertDialog open={showFlagDialog} onOpenChange={setShowFlagDialog}>
        <AlertDialogContent>
          <AlertDialogTitle>Flag Transcript for Review</AlertDialogTitle>
          <AlertDialogDescription>
            This interview will be marked for team lead review and follow-up.
          </AlertDialogDescription>
          <div className="flex gap-3 justify-end">
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                alert('Transcript flagged for review')
                setShowFlagDialog(false)
              }}
            >
              Flag for Review
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
