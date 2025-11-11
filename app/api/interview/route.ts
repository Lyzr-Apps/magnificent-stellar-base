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

export async function POST(request: NextRequest) {
  try {
    const body: InterviewRequest = await request.json()
    const { message, interview_id, stage, conversation_history } = body

    // Build conversation history for agent context
    const conversationText = conversation_history
      .map(m => `${m.role === 'agent' ? 'Agent' : 'User'}: ${m.content}`)
      .join('\n')

    const agentPrompt = `You are an expert interview conductor for a marketing team insights dashboard. You're conducting a structured interview with a team member.

Current Stage: ${stage}
Interview ID: ${interview_id}

Conversation History:
${conversationText}

Recent User Response: "${message}"

Your task:
1. Acknowledge the user's response
2. Ask a thoughtful follow-up question that digs deeper into the "${stage}" topic
3. Keep responses conversational and natural (2-3 sentences)
4. After gathering enough information on this stage, transition to the next stage if appropriate

IMPORTANT: You must respond with a JSON object in this exact format:
{
  "agent_message": "Your conversational response here",
  "next_stage": ${INTERVIEW_STAGES.indexOf(stage)},
  "conversation_history_updated": [],
  "interview_complete": false,
  "transcript_summary": null,
  "status": "in-progress",
  "confidence": 0.9,
  "metadata": {
    "stage": "${stage}",
    "messages_count": ${conversation_history.length}
  }
}

If you determine the interview should progress to the next stage, increment next_stage by 1.
If all stages are complete (next_stage >= ${INTERVIEW_STAGES.length}), set interview_complete to true.`

    // Call the AI Agent API to get Interview Conductor Agent response
    const agentResponse = await fetch('http://localhost:3000/api/agent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: agentPrompt,
        agent_id: '68fd263d71c6b27d6c8eb80f', // Interview Conductor Agent ID from PRD
      })
    })

    const agentData = await agentResponse.json()

    // Parse agent response
    let parsedResponse = agentData.response

    // If response is a string, try to parse it as JSON
    if (typeof parsedResponse === 'string') {
      try {
        parsedResponse = JSON.parse(parsedResponse)
      } catch {
        // If not JSON, structure it
        parsedResponse = {
          agent_message: parsedResponse,
          next_stage: INTERVIEW_STAGES.indexOf(stage),
          conversation_history_updated: [],
          interview_complete: false,
          transcript_summary: null,
          status: 'in-progress',
          confidence: 0.8,
          metadata: {
            stage,
            messages_count: conversation_history.length
          }
        }
      }
    }

    // Determine stage progression
    let nextStage = parsedResponse.next_stage ?? INTERVIEW_STAGES.indexOf(stage)
    let interviewComplete = parsedResponse.interview_complete ?? false

    // Auto-advance stage after 2-3 exchanges per stage
    const stageMessageCount = conversation_history.filter(m =>
      m.content.includes('progress') || m.content.includes('challenge') || m.content.includes('plan') || m.content.includes('project')
    ).length

    if (stageMessageCount > 4 && nextStage < INTERVIEW_STAGES.length - 1) {
      nextStage = nextStage + 1
    }

    if (nextStage >= INTERVIEW_STAGES.length) {
      interviewComplete = true
      parsedResponse.agent_message = `Thank you for sharing such detailed information! That concludes our interview. Your insights have been recorded and will be included in the team summary report. Great work!`
    }

    return NextResponse.json({
      success: true,
      response: {
        agent_message: parsedResponse.agent_message || 'Thank you for your response.',
        next_stage: nextStage,
        conversation_history_updated: conversation_history,
        interview_complete: interviewComplete,
        transcript_summary: parsedResponse.transcript_summary,
        status: interviewComplete ? 'completed' : 'in-progress',
        confidence: parsedResponse.confidence ?? 0.85,
        metadata: {
          stage: INTERVIEW_STAGES[nextStage] || stage,
          messages_count: conversation_history.length + 1,
          timestamp: new Date().toISOString()
        }
      },
      raw_response: agentData.raw_response
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
