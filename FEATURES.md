# Marketing Team Insights Dashboard

A collaborative dashboard that conducts structured interviews with marketing team members about their ongoing projects, then aggregates and summarizes responses to provide leadership with actionable insights.

## Features

### 1. Main Dashboard
- **Interview Management**: View all team member interviews with real-time status updates
- **Statistics Panel**: Quick overview of completed, in-progress, and pending interviews
- **Status Filtering**: Filter interviews by status (Completed, In Progress, Pending)
- **Date Range Filtering**: Filter by time period (Today, This Week, This Month, All Time)
- **Quick Actions**:
  - Start new interview with one click
  - Generate comprehensive summary from completed interviews
  - View individual transcripts

### 2. Interview Conductor Interface
- **Conversational AI**: Intelligent multi-stage interview flow with the Interview Conductor Agent
- **Stage Tracking**: Progress through 4 key stages:
  1. Projects - What are you working on?
  2. Progress - What progress have you made?
  3. Challenges - What challenges are you facing?
  4. Plans - What are your upcoming plans?
- **Real-time Progress**: Visual progress bar showing interview completion
- **Auto-save**: Interview progress saved automatically
- **Resume Later**: Save and exit to continue interview at any time
- **Keyboard Shortcuts**: Shift+Enter for new line, Enter to send

### 3. Transcript Management
- **Full Transcript View**: Complete record of agent and user messages
- **Key Points Extraction**: Automatically extract important highlights from conversation
- **Action Items Identification**: Identify next steps and commitments
- **Search Functionality**: Search through entire transcript by keyword
- **Metadata Display**: See interview date, time, duration, and team member info
- **Share & Export**:
  - Copy shareable link
  - Export PDF (placeholder for full implementation)
  - Flag for management review

### 4. Insights Aggregator
- **Summary Generation**: Analyze multiple completed interviews using Insights Aggregator Agent
- **Themes Identification**: Extract 4-6 recurring themes across team
- **Blocker Analysis**: Identify key challenges and obstacles
- **Achievement Tracking**: Highlight wins and completed projects
- **Recommendations**: Generate 4-6 actionable recommendations for leadership
- **Comprehensive Report**: Full narrative summary for executive review

### 5. Data Persistence
- **Local Storage**: All interview data and summaries saved in browser localStorage
- **Automatic Sync**: Changes synced automatically across components
- **Session Recovery**: Resume interviews from last saved state

## Agent Integration

### Interview Conductor Agent
- **Purpose**: Conducts conversational interviews with team members
- **Capabilities**:
  - Contextual follow-up questions
  - Natural conversation flow
  - Stage progression logic
  - Interview completion detection
- **Response Format**:
  - agent_message: The AI's conversational response
  - next_stage: Index of next interview stage
  - interview_complete: Boolean indicating completion
  - confidence: Confidence score for response
  - metadata: Stage and context information

### Insights Aggregator Agent
- **Purpose**: Analyzes completed interviews to extract insights
- **Capabilities**:
  - Pattern recognition across multiple interviews
  - Theme identification
  - Blocker and achievement extraction
  - Recommendation generation
- **Response Format**:
  - themes: Array of recurring themes
  - blockers: Array of identified challenges
  - achievements: Array of wins and completions
  - recommendations: Array of actionable items
  - fullReport: Comprehensive narrative summary

## API Routes

### `/api/interview` (POST)
- **Purpose**: Process user input through Interview Conductor Agent
- **Request**:
  ```json
  {
    "message": "User's response",
    "interview_id": "unique_interview_id",
    "stage": "Current stage name",
    "conversation_history": [...]
  }
  ```
- **Response**: Structured agent response with next stage and completion status

### `/api/summary` (POST)
- **Purpose**: Generate insights summary from completed interviews
- **Request**:
  ```json
  {
    "interviews": [
      {
        "name": "Team Member Name",
        "transcript": "Full transcript text"
      }
    ]
  }
  ```
- **Response**: Themes, blockers, achievements, recommendations, and full report

## Data Model

### Interview
```typescript
interface Interview {
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
```

### Message
```typescript
interface Message {
  id: string
  role: 'agent' | 'user'
  content: string
  timestamp: string
}
```

### Summary
```typescript
interface Summary {
  id: string
  createdAt: string
  themes: string[]
  blockers: string[]
  achievements: string[]
  recommendations: string[]
  fullReport: string
}
```

## User Workflows

### Team Member Journey
1. Click "Start Interview" on dashboard
2. Agent asks about current projects
3. Respond conversationally to questions
4. Agent guides through Challenges and Plans stages
5. Interview completes automatically
6. Status updates to "Completed" on dashboard

### Manager Journey
1. Review list of completed interviews on dashboard
2. Click "View Transcript" to read individual interviews
3. Search and flag important discussions
4. Click "Generate Summary" once 2+ interviews completed
5. Review themes, blockers, achievements, and recommendations
6. Share report with leadership or export as PDF

## Technical Stack
- **Frontend**: React 18 + Next.js 15 App Router
- **Styling**: Tailwind CSS + shadcn/ui components
- **State Management**: React hooks + localStorage
- **API Integration**: Secure backend routes with agent support
- **Icons**: Lucide React

## Key Features Implementation

### Responsive Design
- Mobile-friendly layout
- Adaptive grid layouts
- Touch-friendly buttons and inputs

### Accessibility
- Semantic HTML
- ARIA labels for interactive elements
- Focus management
- Keyboard navigation support

### Performance
- Lazy loading of transcripts
- Efficient filtering and search
- Automatic cleanup of old sessions

### Security
- API routes handle sensitive operations
- No sensitive data in client-side code
- Secure agent communication

## Future Enhancements
- Real-time collaboration with multiple managers
- Advanced analytics dashboard
- Automated email reports
- Integration with project management tools
- Multi-language interview support
- Video interview recording
- Advanced sentiment analysis
- Team member performance metrics
