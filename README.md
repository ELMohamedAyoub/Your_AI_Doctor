# AI Doctor - Post-Surgery Patient Monitoring Platform

Enterprise-grade Next.js application providing bilingual voice-enabled patient monitoring with clinical data extraction, RAG-enhanced medical guidance, and comprehensive healthcare provider dashboards.

## Overview

This platform transforms voice conversations into structured clinical data, monitors post-surgical recovery trajectories, detects anomalies through intelligent alerting systems, and provides healthcare providers with actionable insights through intuitive interfaces. The system incorporates Retrieval-Augmented Generation (RAG) technology to deliver evidence-based medical guidance sourced from authoritative healthcare institutions.

## Core Capabilities

### Patient Features
- Voice-based symptom reporting with natural language processing (French/English)
- Automated clinical data extraction including pain scores, symptoms, and emotional state
- Real-time alert generation for critical symptoms
- Surgery-specific recovery guidelines with source citations
- RAG-powered AI assistant with evidence-based medical knowledge
- Visual progress tracking and trend analysis

### Healthcare Provider Features
- Multi-patient dashboard with comprehensive metrics overview
- Pain score visualization against surgery-specific baselines
- Three-tier alert management system (NORMAL, ORANGE, RED)
- Complete session history with clinical annotations
- Efficient monitoring workflows for post-operative patient cohorts

### Technical Capabilities
- Bilingual natural language processing (French/English)
- Automated medical term normalization across languages
- Rule-based clinical alert detection system
- RAG system with 21+ evidence-based medical guidelines
- Surgery-specific baseline definitions for Appendectomy, Knee Replacement, and Cesarean Section
- Real-time speech-to-text transcription via AssemblyAI
- Structured clinical data extraction using GPT-3.5-turbo
- Enterprise authentication and authorization via Clerk

## Installation and Setup

### Prerequisites
- Node.js 18.x or higher
- PostgreSQL 14.x or higher
- API credentials for AssemblyAI, OpenAI, and Clerk

### Environment Configuration

1. Clone the repository:
```bash
git clone https://github.com/ELMohamedAyoub/Your_AI_Doctor.git
cd Your_AI_Doctor
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables (create `.env.local`):
```bash
# Database Configuration
DATABASE_URL="postgresql://username:password@localhost:5432/ai_doctor_agent?schema=public"

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key

# AssemblyAI Speech-to-Text
ASSEMBLYAI_API_KEY=your_assemblyai_api_key
NEXT_PUBLIC_ASSEMBLYAI_API_KEY=your_assemblyai_api_key

# OpenAI API
OPENAI_API_KEY=your_openai_api_key

# Murf AI Text-to-Speech (optional)
MURF_API_KEY=your_murf_api_key
```

4. Initialize database:
```bash
npx prisma generate
npx prisma migrate dev
```

5. Start development server:
```bash
npm run dev
```

Access the application at `http://localhost:3000`

## Surgery Type Support

| Surgery Type | Normal Pain Range | Recovery Duration | Monitored Symptoms |
|--------------|------------------|-------------------|-------------------|
| Appendectomy | 1-4/10 | 7 days | Mild pain, fatigue, nausea, infection signs |
| Knee Replacement | 3-6/10 | 90 days | Swelling, stiffness, bruising, limited mobility |
| Cesarean Section | 2-5/10 | 42 days | Cramping, bleeding, incision pain, breastfeeding concerns |

## RAG-Enhanced Medical Guidance

The platform incorporates a Retrieval-Augmented Generation system with 21 evidence-based medical guidelines sourced from authoritative healthcare institutions:

- American Academy of Orthopaedic Surgeons (AAOS)
- Mayo Clinic
- American College of Obstetricians and Gynecologists (ACOG)
- MedlinePlus (NIH)
- National Institute of Arthritis and Musculoskeletal and Skin Diseases (NIAMS)
- Johns Hopkins Medicine

### RAG System Architecture
- Keyword-based search with relevance scoring algorithm
- Context injection into AI responses with source citations
- Surgery-specific guideline filtering
- Severity-based guideline prioritization (CRITICAL, HIGH, MEDIUM, LOW)

For detailed information about the RAG implementation and medical sources, see `MEDICAL_GUIDELINES_SOURCES.md`

## System Architecture

### Database Schema
```prisma
model Patient {
  id           String          @id @default(cuid())
  clerkUserId  String          @unique
  name         String
  surgery      String
  surgeryDate  DateTime
  sessions     PatientSession[]
  alerts       Alert[]
}

model PatientSession {
  id          String   @id @default(cuid())
  patientId   String
  patient     Patient  @relation(fields: [patientId], references: [id])
  transcript  String
  painScore   Int?
  symptoms    String[]
  emotion     String?
  language    String?
  createdAt   DateTime @default(now())
}

model Alert {
  id        String   @id @default(cuid())
  patientId String
  patient   Patient  @relation(fields: [patientId], references: [id])
  level     String   // RED, ORANGE, NORMAL
  reason    String
  createdAt DateTime @default(now())
}
```

### Clinical Alert Detection Rules
- **RED Alert**: Pain score ≥ 8 OR bleeding symptoms detected
- **ORANGE Alert**: Emotional distress indicators OR pain score ≥ 6
- **NORMAL**: No critical symptoms identified

### API Routes

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/patient/onboard` | POST | Patient profile creation |
| `/api/patient/status` | GET | Current patient status retrieval |
| `/api/patient/chat` | POST | RAG-enhanced AI consultation |
| `/api/clinical/parse` | POST | Clinical data extraction from transcripts |
| `/api/doctor/patients` | GET | Patient list for healthcare providers |
| `/api/doctor/patient/[id]` | GET | Individual patient detail view |
| `/api/transcribe` | POST | Speech-to-text conversion |

### Core Components
- **VoiceMonitoring**: Voice recording and clinical analysis interface
- **PatientDashboard**: Patient monitoring and interaction interface
- **DoctorDashboard**: Healthcare provider overview interface
- **PatientDetailPage**: Individual patient history with data visualization

## Clinical Data Processing

### Voice-to-Clinical Data Pipeline

**Input Example** (Multilingual):
```text
"J'ai mal au niveau de la cicatrice, la douleur est à 7 sur 10, et je me sens un peu anxieux"
```

**Structured Output**:
```json
{
  "painScore": 7,
  "symptoms": ["incision pain"],
  "emotion": "anxious",
  "language": "fr"
}
```

### Multilingual Support

**Supported Languages**: English (en), French (fr)

**French to English Medical Term Normalization**:
| French Term | English Equivalent |
|-------------|-------------------|
| fièvre | fever |
| nausée | nausea |
| saignement | bleeding |
| gonflement | swelling |
| douleur | pain |
| vertige | dizziness |

## Security

- Authentication and authorization via Clerk
- Patient data isolation using `clerkUserId`
- Input validation across all API endpoints
- Environment variable configuration for sensitive credentials
- HTTPS enforcement in production (required for voice recording)
- No hardcoded API keys or secrets in codebase

## Technology Stack

- **Framework**: Next.js 15, React 19
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui, Radix UI
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: Clerk
- **Speech Recognition**: AssemblyAI
- **Natural Language Processing**: OpenAI GPT-3.5-turbo
- **Data Visualization**: Recharts
- **Deployment**: Vercel (recommended)

## Project Structure

```
Your_AI_Doctor/
├── app/
│   ├── (auth)/                    # Authentication routes
│   ├── (routes)/
│   │   ├── patient-dashboard/     # Patient monitoring interface
│   │   ├── doctor/                # Healthcare provider dashboard
│   │   └── onboarding/            # Patient onboarding flow
│   └── api/
│       ├── clinical/parse/        # Clinical data extraction
│       ├── patient/               # Patient-facing APIs
│       │   └── chat/              # RAG-enhanced AI consultation
│       ├── doctor/                # Provider-facing APIs
│       └── transcribe/            # Speech-to-text conversion
├── components/
│   ├── ui/                        # Base UI components
│   └── sections/                  # Landing page sections
├── lib/
│   ├── medicalGuidelines.ts       # RAG knowledge base (21 guidelines)
│   ├── surgeryBaselines.ts        # Surgery type definitions
│   ├── surgeryPrompts.ts          # AI prompt templates
│   └── generated/prisma/          # Generated Prisma client
├── prisma/
│   ├── schema.prisma              # Database schema definition
│   └── migrations/                # Database migration history
└── public/                        # Static assets
```

## Development and Testing

```bash
# Run linting
npm run lint

# Build for production
npm run build

# Inspect database via Prisma Studio
npx prisma studio
```

## Deployment

### Vercel Deployment (Recommended)
1. Connect GitHub repository to Vercel
2. Configure environment variables in Vercel dashboard
3. Deploy with automatic builds on push

### Environment Variables Required
- `DATABASE_URL`: PostgreSQL connection string
- `CLERK_SECRET_KEY`: Clerk authentication secret
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`: Clerk publishable key
- `OPENAI_API_KEY`: OpenAI API key
- `ASSEMBLYAI_API_KEY`: AssemblyAI API key
- `NEXT_PUBLIC_ASSEMBLYAI_API_KEY`: Client-side AssemblyAI key
- `MURF_API_KEY`: Murf AI text-to-speech key (optional)

### Production Considerations
- Ensure HTTPS is enabled for microphone access
- Configure database connection pooling for Vercel serverless
- Set up monitoring and logging infrastructure
- Implement backup strategy for patient data
- Review HIPAA compliance requirements if applicable

## User Workflows

### Patient Workflow
1. Authentication via Clerk
2. Complete onboarding with surgery type selection
3. Access patient dashboard
4. Perform voice check-ins or AI consultations
5. View recovery progress and alerts

### Healthcare Provider Workflow
1. Authentication via Clerk
2. Access doctor dashboard with patient overview
3. Review patient alerts and pain trends
4. Analyze individual patient histories
5. Review session transcripts and clinical data

## Troubleshooting

### Database Connection Issues
```bash
# Verify DATABASE_URL configuration
echo $DATABASE_URL

# Test database connectivity
npx prisma db pull
```

### Prisma Client Errors
```bash
# Regenerate Prisma client
npx prisma generate
```

### Voice Recording Not Functional
- Verify browser microphone permissions granted
- Ensure HTTPS in production environment
- Confirm AssemblyAI API key validity
- Check browser compatibility (Chrome/Edge recommended)

### Common Issues
- **Microphone Access**: Ensure browser permissions are granted
- **AssemblyAI API**: Verify API key and account credits
- **Murf AI TTS**: System falls back to browser TTS if Murf API unavailable
- **Authentication**: Verify Clerk API keys and redirect URLs
- **WebSocket Errors**: Check browser compatibility for Web Audio API

## Documentation

- `MEDICAL_GUIDELINES_SOURCES.md` - RAG knowledge base sources and citations
- `RAG_AND_FEATURES_EXPLAINED.md` - Detailed RAG implementation and feature documentation
- `prisma/schema.prisma` - Database schema definition

## Contributing

Contributions are welcome. Please follow standard Git workflow:
1. Fork the repository
2. Create feature branch
3. Commit changes with descriptive messages
4. Push to branch
5. Submit pull request

## License

MIT License

## Medical Disclaimer

This platform is a medical monitoring tool and does not replace professional medical advice, diagnosis, or treatment. Always consult qualified healthcare providers for medical decisions. The RAG system provides general educational information sourced from reputable medical institutions but should not be considered personalized medical advice.

The information provided through this platform:
- Is for informational purposes only
- Should not replace consultation with healthcare professionals
- May not be applicable to individual medical situations
- Requires verification with qualified medical providers

## Acknowledgments

- American Academy of Orthopaedic Surgeons (AAOS) - Orthopedic surgery guidelines
- Mayo Clinic - General medical information
- American College of Obstetricians and Gynecologists (ACOG) - Cesarean section guidelines
- MedlinePlus (NIH) - Medical terminology and definitions
- AssemblyAI - Speech recognition technology
- OpenAI - Natural language processing capabilities
- Clerk - Authentication infrastructure
