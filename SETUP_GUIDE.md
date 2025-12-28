# Post-Surgery Monitoring Platform - Setup Guide

## Overview
This application has been transformed from a general medical chatbot into a bilingual (French/English) post-surgery patient monitoring platform with clinical data extraction, alerting, and doctor dashboard.

## Setup Instructions

### 1. Environment Variables
Create a `.env` file in the root directory with the following variables:

```bash
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/ai_doctor_agent?schema=public"

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key

# AssemblyAI (Speech-to-Text)
ASSEMBLYAI_API_KEY=your_assemblyai_api_key
NEXT_PUBLIC_ASSEMBLYAI_API_KEY=your_assemblyai_api_key

# OpenAI
OPENAI_API_KEY=your_openai_api_key
```

### 2. Database Setup

```bash
# Install dependencies
npm install

# Generate Prisma client
npx prisma generate

# Run database migration
npx prisma migrate dev --name add_patient_session_alert_models

# (Optional) Open Prisma Studio to view database
npx prisma studio
```

### 3. Run the Application

```bash
# Development mode
npm run dev

# Production build
npm run build
npm start
```

## Key Features Implemented

### 1. Database Schema Extensions ✅
- **Patient Model**: Stores patient info, surgery type, and surgery date
- **PatientSession Model**: Records voice check-ins with extracted clinical data
- **Alert Model**: Stores alerts with severity levels (NORMAL, ORANGE, RED)

### 2. Clinical Data Extraction ✅
- `/api/clinical/parse`: Bilingual (French/English) clinical data extraction
- Extracts: painScore (0-10), symptoms[], emotion, language
- Returns structured JSON only
- Normalizes French medical terms to English

### 3. Alert Detection Engine ✅
- **RED**: painScore ≥ 8 OR bleeding mentioned
- **ORANGE**: Emotional distress OR painScore ≥ 6
- **NORMAL**: No critical symptoms
- Automatic alert creation on detection

### 4. Voice Workflow Integration ✅
- Reuses existing AssemblyAI transcription pipeline
- Sends transcripts to clinical parser instead of chatbot
- Displays extracted pain score and symptoms to patient
- Real-time alerts for critical conditions

### 5. Patient Onboarding ✅
- `/onboarding`: Surgery selection form
- Supports: Appendectomy, Knee Replacement, Cesarean Section
- Collects surgery date
- Creates Patient record on first login
- Auto-redirects if no patient profile exists

### 6. Patient Dashboard ✅
- `/patient-dashboard`: Patient's personal monitoring page
- Shows recovery status and alerts
- Voice check-in component with real-time analysis
- Surgery-specific recovery guidelines
- Days since surgery tracking

### 7. Doctor Dashboard ✅
- `/doctor`: List of all patients with key metrics
- Shows: surgery type, days post-op, last pain score, alert level
- Color-coded alert badges
- Clickable patient cards for detailed view

### 8. Patient Detail View ✅
- `/doctor/patient/[id]`: Individual patient history
- Pain trend visualization with Chart.js
- Baseline reference lines for normal pain ranges
- Session timeline with transcripts
- Alert history

### 9. Surgery Baselines ✅
Implemented in `/lib/surgeryBaselines.ts`:
- **Appendectomy**: Normal pain 1-4/10, 7-day recovery
- **Knee Replacement**: Normal pain 3-6/10, 90-day recovery
- **Cesarean Section**: Normal pain 2-5/10, 42-day recovery
- Flags pain outside expected ranges

### 10. Multilingual Support ✅
- Accepts French and English transcripts
- Clinical extraction prompt handles both languages
- French symptom normalization to English keys
- Language detection in session data

## User Flows

### Patient Flow
1. Sign in with Clerk authentication
2. Complete onboarding (if first time)
3. Access patient dashboard
4. Perform voice check-in
5. Receive immediate analysis and alerts
6. View recovery guidelines

### Doctor Flow
1. Sign in with Clerk authentication
2. View patient list on doctor dashboard
3. Click patient to view detailed history
4. Analyze pain trends and symptoms
5. Review alerts and session transcripts

## API Endpoints

### Patient APIs
- `POST /api/patient/onboard` - Create patient profile
- `GET /api/patient/onboard` - Get patient profile
- `GET /api/patient/status` - Get patient status with latest data

### Clinical APIs
- `POST /api/clinical/parse` - Extract clinical data from transcript

### Doctor APIs
- `GET /api/doctor/patients` - List all patients
- `GET /api/doctor/patient/[id]` - Get patient detail

### Existing APIs (Preserved)
- `POST /api/transcribe` - Speech-to-text (AssemblyAI)
- `POST /api/chat` - Chatbot (still available for general use)
- `POST /api/tts` - Text-to-speech

## Components

### New Components
- `/app/(routes)/onboarding/page.tsx` - Patient onboarding form
- `/app/(routes)/patient-dashboard/page.tsx` - Patient monitoring dashboard
- `/app/(routes)/doctor/page.tsx` - Doctor dashboard
- `/app/(routes)/doctor/patient/[id]/page.tsx` - Patient detail view
- `/app/(routes)/dashboard/_components/VoiceMonitoring.tsx` - Voice check-in widget
- `/components/ui/badge.tsx` - Badge component for alerts

### Updated Files
- `/prisma/schema.prisma` - Extended with new models
- `/lib/surgeryBaselines.ts` - Surgery baseline definitions

## Technologies Used
- **Next.js 15** - React framework
- **Prisma** - Database ORM
- **PostgreSQL** - Database
- **Clerk** - Authentication
- **AssemblyAI** - Speech-to-text
- **OpenAI GPT-4** - Clinical data extraction
- **Recharts** - Data visualization
- **Tailwind CSS** - Styling
- **shadcn/ui** - UI components

## Security Considerations
- All API routes protected with Clerk authentication
- Patient data isolation by `clerkUserId`
- Input validation on all endpoints
- Secure environment variable handling

## Next Steps (Future Enhancements)
1. Add email/SMS notifications for RED alerts
2. Implement doctor role-based access control
3. Add export functionality for medical reports
4. Integrate with EHR systems
5. Add video consultation scheduling
6. Implement multi-language UI (not just voice)
7. Add medication reminder system
8. Create mobile app version

## Troubleshooting

### Database Connection Issues
```bash
# Check DATABASE_URL is correct
echo $DATABASE_URL

# Test database connection
npx prisma db pull
```

### Prisma Client Not Found
```bash
# Regenerate Prisma client
npx prisma generate
```

### Migration Errors
```bash
# Reset database (WARNING: deletes all data)
npx prisma migrate reset

# Create new migration
npx prisma migrate dev
```

### Voice Recording Not Working
- Check browser permissions for microphone
- Ensure HTTPS in production (required for getUserMedia)
- Verify AssemblyAI API key is set

## Support
For issues or questions, please refer to:
- Prisma Docs: https://www.prisma.io/docs
- Clerk Docs: https://clerk.com/docs
- Next.js Docs: https://nextjs.org/docs
- AssemblyAI Docs: https://www.assemblyai.com/docs
