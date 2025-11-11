'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { CheckCircle, Clock, AlertCircle, Play, FileText, BarChart3, Filter, Calendar, User, Download, Share2 } from 'lucide-react'
import Link from 'next/link'

interface Interview {
  id: string
  teamMemberId: string
  teamMemberName: string
  status: 'pending' | 'in-progress' | 'completed'
  startedAt: string
  completedAt?: string
  transcript?: string
  duration?: number
}

interface Summary {
  id: string
  createdAt: string
  themes: string[]
  blockers: string[]
  achievements: string[]
  recommendations: string[]
  fullReport: string
}

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('interviews')
  const [interviews, setInterviews] = useState<Interview[]>([])
  const [summary, setSummary] = useState<Summary | null>(null)
  const [loading, setLoading] = useState(false)
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterDate, setFilterDate] = useState('all')
  const [showStartDialog, setShowStartDialog] = useState(false)
  const [startingInterview, setStartingInterview] = useState(false)
  const [showSummaryDialog, setShowSummaryDialog] = useState(false)
  const [generatingSummary, setGeneratingSummary] = useState(false)

  // Load interviews and summary from localStorage
  useEffect(() => {
    const savedInterviews = localStorage.getItem('interviews')
    const savedSummary = localStorage.getItem('summary')

    if (savedInterviews) setInterviews(JSON.parse(savedInterviews))
    if (savedSummary) setSummary(JSON.parse(savedSummary))
  }, [])

  // Save interviews to localStorage
  useEffect(() => {
    localStorage.setItem('interviews', JSON.stringify(interviews))
  }, [interviews])

  // Save summary to localStorage
  useEffect(() => {
    localStorage.setItem('summary', JSON.stringify(summary))
  }, [summary])

  const handleStartInterview = async () => {
    setStartingInterview(true)
    try {
      // Generate unique interview ID and team member name
      const interviewId = `interview_${Date.now()}`
      const teamMemberName = `Team Member ${interviews.length + 1}`

      const newInterview: Interview = {
        id: interviewId,
        teamMemberId: `user_${Date.now()}`,
        teamMemberName,
        status: 'in-progress',
        startedAt: new Date().toISOString()
      }

      setInterviews([...interviews, newInterview])

      // Redirect to interview page
      window.location.href = `/interview/${interviewId}`
    } finally {
      setStartingInterview(false)
      setShowStartDialog(false)
    }
  }

  const handleGenerateSummary = async () => {
    setGeneratingSummary(true)
    try {
      // Fetch summary from API
      const completedInterviews = interviews.filter(i => i.status === 'completed')

      if (completedInterviews.length === 0) {
        alert('No completed interviews to summarize')
        setGeneratingSummary(false)
        return
      }

      const response = await fetch('/api/summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          interviews: completedInterviews.map(i => ({
            name: i.teamMemberName,
            transcript: i.transcript
          }))
        })
      })

      const data = await response.json()

      if (data.success) {
        const newSummary: Summary = {
          id: `summary_${Date.now()}`,
          createdAt: new Date().toISOString(),
          themes: data.response?.themes || [],
          blockers: data.response?.blockers || [],
          achievements: data.response?.achievements || [],
          recommendations: data.response?.recommendations || [],
          fullReport: data.response?.fullReport || data.raw_response
        }

        setSummary(newSummary)
        setActiveTab('summary')
      } else {
        alert('Failed to generate summary')
      }
    } catch (error) {
      console.error('Error generating summary:', error)
      alert('Error generating summary')
    } finally {
      setGeneratingSummary(false)
      setShowSummaryDialog(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case 'in-progress':
        return <Clock className="w-5 h-5 text-blue-500" />
      default:
        return <AlertCircle className="w-5 h-5 text-gray-400" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-500/20 text-green-700">Completed</Badge>
      case 'in-progress':
        return <Badge className="bg-blue-500/20 text-blue-700">In Progress</Badge>
      default:
        return <Badge className="bg-gray-500/20 text-gray-700">Pending</Badge>
    }
  }

  const filteredInterviews = interviews.filter(interview => {
    if (filterStatus !== 'all' && interview.status !== filterStatus) return false

    if (filterDate !== 'all') {
      const now = new Date()
      const interviewDate = new Date(interview.startedAt)
      const daysDiff = Math.floor((now.getTime() - interviewDate.getTime()) / (1000 * 60 * 60 * 24))

      if (filterDate === 'today' && daysDiff > 0) return false
      if (filterDate === 'week' && daysDiff > 7) return false
      if (filterDate === 'month' && daysDiff > 30) return false
    }

    return true
  })

  const completedCount = interviews.filter(i => i.status === 'completed').length
  const inProgressCount = interviews.filter(i => i.status === 'in-progress').length
  const pendingCount = interviews.filter(i => i.status === 'pending').length

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Marketing Team Insights</h1>
              <p className="text-slate-600 mt-1">Conduct interviews and track team progress</p>
            </div>
            <div className="flex gap-3">
              <Button
                onClick={() => setShowStartDialog(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Play className="w-4 h-4 mr-2" />
                Start Interview
              </Button>
              <Button
                onClick={() => setShowSummaryDialog(true)}
                disabled={completedCount < 2 || generatingSummary}
                variant="outline"
              >
                <BarChart3 className="w-4 h-4 mr-2" />
                {generatingSummary ? 'Generating...' : 'Generate Summary'}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Statistics Panel */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="grid grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-slate-900">{completedCount}</div>
                  <p className="text-slate-600 text-sm mt-1">Completed</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">{inProgressCount}</div>
                  <p className="text-slate-600 text-sm mt-1">In Progress</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-slate-400">{pendingCount}</div>
                  <p className="text-slate-600 text-sm mt-1">Pending</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-slate-900">{interviews.length}</div>
                  <p className="text-slate-600 text-sm mt-1">Total</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList>
            <TabsTrigger value="interviews">Interviews</TabsTrigger>
            <TabsTrigger value="summary" disabled={!summary}>Summary</TabsTrigger>
          </TabsList>

          {/* Interviews Tab */}
          <TabsContent value="interviews" className="space-y-6">
            <div className="flex gap-4 items-end">
              <div className="flex-1">
                <label className="text-sm font-medium text-slate-700 block mb-2">Status</label>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex-1">
                <label className="text-sm font-medium text-slate-700 block mb-2">Date Range</label>
                <Select value={filterDate} onValueChange={setFilterDate}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Time</SelectItem>
                    <SelectItem value="today">Today</SelectItem>
                    <SelectItem value="week">This Week</SelectItem>
                    <SelectItem value="month">This Month</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {filteredInterviews.length === 0 ? (
              <Card className="text-center py-12">
                <AlertCircle className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-slate-900">No interviews yet</h3>
                <p className="text-slate-600 mt-2">Click "Start Interview" to begin conducting interviews with team members</p>
              </Card>
            ) : (
              <div className="grid gap-4">
                {filteredInterviews.map(interview => (
                  <Card key={interview.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            {getStatusIcon(interview.status)}
                            <h3 className="text-lg font-semibold text-slate-900">{interview.teamMemberName}</h3>
                            {getStatusBadge(interview.status)}
                          </div>
                          <div className="grid grid-cols-3 gap-4 text-sm text-slate-600">
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4" />
                              {new Date(interview.startedAt).toLocaleDateString()}
                            </div>
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4" />
                              {new Date(interview.startedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                            {interview.duration && (
                              <div className="flex items-center gap-2">
                                <FileText className="w-4 h-4" />
                                {interview.duration} minutes
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2 ml-4">
                          {interview.status === 'completed' && (
                            <Link href={`/transcript/${interview.id}`}>
                              <Button variant="outline" size="sm">
                                <FileText className="w-4 h-4 mr-2" />
                                View Transcript
                              </Button>
                            </Link>
                          )}
                          {interview.status === 'in-progress' && (
                            <Link href={`/interview/${interview.id}`}>
                              <Button variant="outline" size="sm">
                                <Play className="w-4 h-4 mr-2" />
                                Continue
                              </Button>
                            </Link>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Summary Tab */}
          <TabsContent value="summary" className="space-y-6">
            {summary ? (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle>Team Insights Summary</CardTitle>
                        <CardDescription>
                          Generated {new Date(summary.createdAt).toLocaleDateString()} at {new Date(summary.createdAt).toLocaleTimeString()}
                        </CardDescription>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Download className="w-4 h-4 mr-2" />
                          Export PDF
                        </Button>
                        <Button variant="outline" size="sm">
                          <Share2 className="w-4 h-4 mr-2" />
                          Share
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                </Card>

                <div className="grid grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Key Achievements</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-3">
                        {summary.achievements.map((achievement, idx) => (
                          <li key={idx} className="flex gap-3">
                            <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                            <span className="text-slate-700">{achievement}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Blockers & Challenges</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-3">
                        {summary.blockers.map((blocker, idx) => (
                          <li key={idx} className="flex gap-3">
                            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                            <span className="text-slate-700">{blocker}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle>Common Themes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {summary.themes.map((theme, idx) => (
                        <Badge key={idx} variant="secondary">
                          {theme}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Recommendations</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ol className="space-y-3">
                      {summary.recommendations.map((rec, idx) => (
                        <li key={idx} className="flex gap-3">
                          <span className="font-semibold text-slate-700 flex-shrink-0">{idx + 1}.</span>
                          <span className="text-slate-700">{rec}</span>
                        </li>
                      ))}
                    </ol>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Full Report</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                      <p className="text-slate-700 whitespace-pre-wrap">{summary.fullReport}</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <Card className="text-center py-12">
                <BarChart3 className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-slate-900">No summary yet</h3>
                <p className="text-slate-600 mt-2">Complete at least 2 interviews and click "Generate Summary" to create a report</p>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Start Interview Dialog */}
      <AlertDialog open={showStartDialog} onOpenChange={setShowStartDialog}>
        <AlertDialogContent>
          <AlertDialogTitle>Start Interview</AlertDialogTitle>
          <AlertDialogDescription>
            This will begin a conversational interview with the Interview Conductor Agent. You'll be asked about your current projects, progress, challenges, and upcoming plans.
          </AlertDialogDescription>
          <div className="flex gap-3 justify-end">
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleStartInterview} disabled={startingInterview}>
              {startingInterview ? 'Starting...' : 'Start Interview'}
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>

      {/* Generate Summary Dialog */}
      <AlertDialog open={showSummaryDialog} onOpenChange={setShowSummaryDialog}>
        <AlertDialogContent>
          <AlertDialogTitle>Generate Summary</AlertDialogTitle>
          <AlertDialogDescription>
            This will analyze all {completedCount} completed interviews using the Insights Aggregator Agent to identify themes, blockers, achievements, and provide recommendations.
          </AlertDialogDescription>
          <div className="flex gap-3 justify-end">
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleGenerateSummary} disabled={generatingSummary}>
              {generatingSummary ? 'Generating...' : 'Generate Summary'}
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
