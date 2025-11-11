import { NextRequest, NextResponse } from 'next/server'

interface InterviewRequest {
  message: string
  interview_id: string
  stage: string
  conversation_history: Array<{
    id: string
    role: 'agent' | 'user'
    content: string
    timestamp: string
  }>
}

const INTERVIEW_STAGES = [
  'Projects',
  'Progress',
  'Challenges',
  'Plans'
]

// Follow-up question prompts for each stage
const STAGE_QUESTIONS: Record<string, string[]> = {
  'Projects': [
    'Can you tell me more about the scope and goals of this project?',
    'What are the key deliverables you\'re aiming for?',
    'Who are the main stakeholders involved in this project?',
    'How long is this project expected to take?'
  ],
  'Progress': [
    'What specific milestones have you reached recently?',
    'How are you tracking progress compared to your initial timeline?',
    'What\'s working well so far?',
    'Have you had any quick wins to celebrate?',
    'What metrics are you using to measure success?'
  ],
  'Challenges': [
    'What specific obstacles are you facing?',
    'How is this affecting your project timeline?',
    'Have you identified any resource constraints?',
    'What support or tools would help you overcome this?',
    'Is this something you can handle internally or do you need escalation?'
  ],
  'Plans': [
    'What are your priorities for the next sprint or period?',
    'How are you planning to build on the progress you\'ve made?',
    'What dependencies do you need to watch for?',
    'How will you measure success going forward?',
    'Any skills or training you\'d like to develop?'
  ]
}

function generateFollowUpQuestion(stage: string, messageCount: number): string {
  const questions = STAGE_QUESTIONS[stage] || ['Tell me more.']
  return questions[messageCount % questions.length]
}

function shouldAdvanceStage(stage: string, historyLength: number): boolean {
  // Advance after 2-3 user responses per stage (each response adds 2 messages - user + agent)
  const exchangesPerStage = 3
  const minMessages = exchangesPerStage * 2
  return historyLength > minMessages && historyLength % (exchangesPerStage * 2) === 0
}

export async function POST(request: NextRequest) {
  try {
    const body: InterviewRequest = await request.json()
    const { message, interview_id, stage, conversation_history } = body

    const currentStageIndex = INTERVIEW_STAGES.indexOf(stage)
    const isLastStage = currentStageIndex === INTERVIEW_STAGES.length - 1

    // Generate appropriate response based on stage
    let agentMessage = ''

    switch (stage) {
      case 'Projects':
        agentMessage = `That's great! ${message.substring(0, 50)}... sounds like important work. ${generateFollowUpQuestion(stage, conversation_history.length)}`
        break
      case 'Progress':
        agentMessage = `Excellent progress! It sounds like you've made meaningful strides. ${generateFollowUpQuestion(stage, conversation_history.length)}`
        break
      case 'Challenges':
        agentMessage = `I understand - those are common challenges. ${generateFollowUpQuestion(stage, conversation_history.length)}`
        break
      case 'Plans':
        agentMessage = `Those are solid plans moving forward. ${generateFollowUpQuestion(stage, conversation_history.length)}`
        break
      default:
        agentMessage = 'Thank you for that response. Can you tell me more?'
    }

    let nextStage = currentStageIndex
    let interviewComplete = false

    // Determine if we should advance to next stage
    if (shouldAdvanceStage(stage, conversation_history.length)) {
      if (isLastStage) {
        interviewComplete = true
        agentMessage = 'Thank you for sharing such detailed information! That concludes our interview. Your insights have been recorded and will be included in the team summary report. Great work!'
      } else {
        nextStage = currentStageIndex + 1
        const nextStageName = INTERVIEW_STAGES[nextStage]
        agentMessage = `Great insights on ${stage.toLowerCase()}! Now let's move to the next topic: ${nextStageName}. ${generateFollowUpQuestion(nextStageName, 0)}`
      }
    }

    return NextResponse.json({
      success: true,
      response: {
        agent_message: agentMessage,
        next_stage: nextStage,
        conversation_history_updated: conversation_history,
        interview_complete: interviewComplete,
        transcript_summary: null,
        status: interviewComplete ? 'completed' : 'in-progress',
        confidence: 0.9,
        metadata: {
          stage: INTERVIEW_STAGES[nextStage] || stage,
          messages_count: conversation_history.length + 1,
          timestamp: new Date().toISOString()
        }
      },
      raw_response: agentMessage
    })
  } catch (error) {
    console.error('Interview API error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to process interview response',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
