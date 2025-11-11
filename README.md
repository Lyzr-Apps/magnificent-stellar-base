# Marketing Team Insights Dashboard

A professional-grade collaborative dashboard that conducts structured interviews with marketing team members, then aggregates responses to provide leadership with actionable insights into team activities, progress, and challenges.

## Quick Start

The application is running on **http://localhost:3333**

1. Open the dashboard
2. Click "Start Interview" to begin
3. Answer questions about your projects, progress, challenges, and plans
4. Complete multiple interviews to generate summaries
5. View team insights and recommendations

## Features

- **Interview Conductor**: Conversational 4-stage interviews with intelligent follow-up questions
- **Transcript Management**: Full conversation records with search and key points extraction
- **Insights Aggregation**: Automated analysis identifying themes, blockers, and achievements
- **Executive Reports**: Comprehensive summaries with actionable recommendations
- **Real-time Status Tracking**: Visual progress indicators and completion metrics
- **Data Persistence**: All data stored locally in browser localStorage

## Key Pages

- **Dashboard** (`/`) - Interview overview and summary generation
- **Interview** (`/interview/[id]`) - Conversational chat with agent
- **Transcript** (`/transcript/[id]`) - Full conversation review and analysis

## Technology Stack

- Next.js 15 + React 18 + TypeScript
- Tailwind CSS + shadcn/ui (51 pre-built components)
- Lucide React icons
- localStorage for data persistence

## API Endpoints

### POST `/api/interview`
Processes user responses through the Interview Conductor Agent

### POST `/api/summary`
Analyzes completed interviews to generate insights

## Documentation

- **FEATURES.md** - Complete feature documentation
- **QUICKSTART.md** - Tutorial and workflow guide

## Interview Flow

1. **Projects** - Describe current work and initiatives
2. **Progress** - Share accomplishments and milestones
3. **Challenges** - Discuss obstacles and blockers
4. **Plans** - Outline upcoming goals and priorities

Each stage auto-advances after 2-3 conversational exchanges.

## Data Storage

All interview data is stored in browser localStorage:
- Interviews with full transcripts
- Team member information
- Generated summaries
- Conversation history

Clear localStorage to reset all data.

## Support

For detailed information:
- Check FEATURES.md for complete feature guide
- See QUICKSTART.md for step-by-step tutorial
- Review browser console for any errors
