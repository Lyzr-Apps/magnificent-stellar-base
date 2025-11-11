# Quick Start Guide - Marketing Team Insights Dashboard

## Getting Started

The application is now running at `http://localhost:3333`

### What to Do First

#### 1. Start Your First Interview
- Click the blue **"Start Interview"** button in the top right
- Confirm to begin the interview
- You'll be taken to the interview chat interface

#### 2. Conduct the Interview
The interview has 4 stages:
- **Projects**: Answer what projects you're currently working on
- **Progress**: Share your recent accomplishments and progress
- **Challenges**: Discuss any blockers or difficulties
- **Plans**: Outline your upcoming goals and plans

Tips:
- Respond naturally and conversationally
- The agent will ask follow-up questions
- You can save and exit anytime with "Save & Exit" button
- The interview auto-saves every 2 minutes

#### 3. Complete Multiple Interviews
- Return to dashboard after completing first interview
- Start interviews for other team members
- Complete at least 2 interviews before generating summary

#### 4. View Transcripts
- From dashboard, click **"View Transcript"** on any completed interview
- See full conversation history
- View automatically extracted key points and action items
- Search through transcript by keyword
- Flag for review if needed

#### 5. Generate Summary Report
- Once 2+ interviews are completed, the **"Generate Summary"** button activates
- Click to analyze all interviews
- View:
  - Common themes across team
  - Key blockers and challenges
  - Team achievements and wins
  - Actionable recommendations
  - Full executive summary report

## Sample Workflow

### Simulating Multiple Team Members
Since the dashboard stores data locally, you can test with multiple interviews:

1. **First Interview** (Sarah - Marketing Manager)
   - Click "Start Interview"
   - "I'm leading the Q4 campaign refresh and social media strategy"
   - Continue with responses about progress, challenges, and plans
   - Save & Exit when done

2. **Second Interview** (James - Content Lead)
   - Click "Start Interview"
   - "Currently working on blog series and video content"
   - Share your progress and blockers
   - Complete the interview

3. **Generate Summary**
   - Click "Generate Summary"
   - Review insights and recommendations
   - Explore the Summary tab

## Features to Explore

### Dashboard Features
- **Status Filters**: Filter interviews by completion status
- **Date Filters**: View interviews from specific time periods
- **Statistics**: See overview of interview completion
- **Tabs**: Switch between Interviews and Summary

### Interview Features
- **Progress Bar**: Visual indicator of stage completion
- **Auto-scroll**: Chat automatically scrolls to latest messages
- **Save & Exit**: Pause interview and continue later
- **Keyboard Shortcuts**: Shift+Enter for new line, Enter to send

### Transcript Features
- **Search**: Find specific topics in transcript
- **Key Points**: Auto-extracted important highlights
- **Action Items**: Identified next steps and commitments
- **Metadata**: Interview date, time, and duration
- **Share**: Copy link to share transcript with others
- **Flag for Review**: Mark for management attention

### Summary Features
- **Achievements**: View team wins and completions
- **Blockers**: See challenges and obstacles
- **Themes**: Identify patterns across team
- **Recommendations**: Get actionable next steps
- **Full Report**: Read comprehensive narrative summary
- **Export**: Download PDF version (ready for implementation)

## Common Tasks

### Resume an In-Progress Interview
1. Go to dashboard
2. Find the interview with "In Progress" status
3. Click "Continue" button
4. Resume where you left off

### Search a Transcript
1. View any completed interview transcript
2. Use search box at top of transcript
3. Results highlight matching messages
4. Click to jump to specific parts

### Share Interview Results
1. View transcript page
2. Click "Share" button
3. Copy the link
4. Send to colleagues

### Download Report
1. Go to Summary tab
2. Click "Export PDF" button
3. Report downloads with all insights

## Data Storage

All data is stored in your browser's localStorage:
- **Interviews**: Stored with full transcripts and messages
- **Summary**: Latest generated report
- **Auto-saving**: Changes save automatically

To clear all data: Open browser DevTools → Application → Local Storage → Clear

## Tips & Tricks

1. **Realistic Responses**: Use actual project details for better insights
2. **Follow Questions**: Agent asks intelligent follow-ups based on your answers
3. **Multiple Stages**: Interview auto-advances through stages
4. **Detailed Summaries**: More completed interviews = better aggregate insights
5. **Review Transcripts**: Check transcripts to see agent's conversation flow

## Troubleshooting

### Interview Won't Start
- Check if server is running (http://localhost:3333)
- Refresh page
- Check browser console for errors

### Can't Generate Summary
- Need at least 2 completed interviews
- Ensure interviews were saved properly
- Check if transcript data is present

### Lost Progress
- Check browser localStorage settings
- Ensure cookies/storage not cleared
- Try browser's back/forward buttons

### Page Not Found
- Make sure you're on http://localhost:3333
- Check the interview/transcript IDs are correct
- Refresh page and try again

## Next Steps

1. **Test Interview Workflow**: Create 3-4 sample interviews
2. **Explore Summary**: Generate and review insights
3. **Review Transcripts**: Check transcript details
4. **Customize**: Modify agent prompts for your use case
5. **Integrate**: Connect to your actual team member database
6. **Deploy**: Set up production environment

## API Integration Notes

The dashboard integrates with two AI agents:

1. **Interview Conductor Agent** (`/api/interview`)
   - Processes user responses
   - Generates follow-up questions
   - Manages interview progression
   - Detects completion

2. **Insights Aggregator Agent** (`/api/summary`)
   - Analyzes completed interviews
   - Extracts themes and blockers
   - Identifies achievements
   - Generates recommendations

Both agents communicate via secure API routes with bulletproof JSON parsing.

## Support

For issues or questions:
1. Check FEATURES.md for detailed documentation
2. Review error messages in browser console
3. Check localStorage for data persistence
4. Verify server is running on port 3333

---

Ready to start? Click **"Start Interview"** and begin!
