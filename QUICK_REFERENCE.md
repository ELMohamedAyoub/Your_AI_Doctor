# Quick Reference - Post-Surgery Monitoring Platform

## 🚀 Quick Start
```bash
# 1. Set up environment
cp .env.example .env
# Edit .env with your credentials

# 2. Setup database
./setup-db.sh

# 3. Run application
npm run dev
```

## 📍 Key Routes

| Route | Access | Purpose |
|-------|--------|---------|
| `/onboarding` | Patient (first time) | Surgery selection & profile creation |
| `/patient-dashboard` | Patient | Main monitoring dashboard |
| `/doctor` | Doctor | Patient list overview |
| `/doctor/patient/[id]` | Doctor | Individual patient details |
| `/dashboard` | Any | Original chatbot (preserved) |

## 🔌 API Endpoints

### Patient APIs
```typescript
POST /api/patient/onboard
Body: { name, surgery, surgeryDate }
Response: { success, patient }

GET /api/patient/status
Response: { patient, lastSession, lastAlert, daysSinceSurgery }
```

### Clinical APIs
```typescript
POST /api/clinical/parse
Body: { transcript, patientId }
Response: { success, session, alert }
```

### Doctor APIs
```typescript
GET /api/doctor/patients
Response: { patients: [...] }

GET /api/doctor/patient/[id]
Response: { patient: {...} }
```

## 🗄️ Database Models

### Patient
```typescript
{
  id: string
  clerkUserId: string (unique)
  name: string
  surgery: string // "Appendectomy" | "Knee Replacement" | "Cesarean Section"
  surgeryDate: DateTime
  sessions: PatientSession[]
  alerts: Alert[]
}
```

### PatientSession
```typescript
{
  id: string
  patientId: string
  transcript: string
  painScore: number // 0-10
  symptoms: string[]
  emotion: string
  language: string // "fr" | "en"
  createdAt: DateTime
}
```

### Alert
```typescript
{
  id: string
  patientId: string
  level: string // "RED" | "ORANGE" | "NORMAL"
  reason: string
  createdAt: DateTime
}
```

## 🚨 Alert Rules

```typescript
// RED Alert
if (painScore >= 8 || symptoms.includes("bleeding")) {
  level = "RED"
}

// ORANGE Alert
else if (painScore >= 6 || emotion.includes("distressed")) {
  level = "ORANGE"
}

// NORMAL
else {
  level = "NORMAL"
}
```

## 📊 Surgery Baselines

```typescript
const SURGERY_BASELINES = {
  "Appendectomy": {
    normalPainMin: 1,
    normalPainMax: 4,
    recoveryDays: 7
  },
  "Knee Replacement": {
    normalPainMin: 3,
    normalPainMax: 6,
    recoveryDays: 90
  },
  "Cesarean Section": {
    normalPainMin: 2,
    normalPainMax: 5,
    recoveryDays: 42
  }
}
```

## 🌐 Bilingual Support

### French → English Mapping
```typescript
const SYMPTOM_MAPPING = {
  "fièvre": "fever",
  "nausée": "nausea",
  "saignement": "bleeding",
  "gonflement": "swelling",
  "douleur": "pain",
  "vertige": "dizziness",
  "fatigue": "fatigue"
}
```

## 🛠️ Common Commands

```bash
# Database
npx prisma studio          # View database
npx prisma migrate dev     # Create migration
npx prisma generate        # Generate client
npx prisma migrate reset   # Reset database (⚠️ deletes data)

# Development
npm run dev               # Start dev server
npm run build             # Production build
npm run lint              # Run linter

# Git
git add .
git commit -m "feat: add feature"
git push
```

## 🔐 Environment Variables

```bash
# Required for production
DATABASE_URL="postgresql://..."
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_..."
CLERK_SECRET_KEY="sk_..."
ASSEMBLYAI_API_KEY="..."
NEXT_PUBLIC_ASSEMBLYAI_API_KEY="..."
OPENAI_API_KEY="sk-..."
```

## 🧪 Test Data

### Sample Patient
```json
{
  "name": "John Doe",
  "surgery": "Appendectomy",
  "surgeryDate": "2025-12-20"
}
```

### Sample Voice Input (English)
> "I'm feeling pain around 6 out of 10, and I have some swelling. I'm a bit anxious."

### Sample Voice Input (French)
> "J'ai une douleur de 7 sur 10, avec un peu de saignement. Je suis inquiet."

## 📱 Component Usage

### Voice Monitoring
```tsx
import VoiceMonitoring from "@/app/(routes)/dashboard/_components/VoiceMonitoring";

<VoiceMonitoring 
  patientId={patientId}
  onSessionComplete={(data) => console.log(data)}
/>
```

### Surgery Baselines
```typescript
import { getSurgeryBaseline, isPainAbnormal } from "@/lib/surgeryBaselines";

const baseline = getSurgeryBaseline("Appendectomy");
const isAbnormal = isPainAbnormal("Appendectomy", 7); // true
```

## 🐛 Troubleshooting

### Prisma Client Error
```bash
rm -rf node_modules/.prisma
npx prisma generate
```

### Database Connection Failed
```bash
# Check .env
cat .env | grep DATABASE_URL

# Test connection
npx prisma db pull
```

### Voice Recording Not Working
- Check browser permissions
- Ensure HTTPS in production
- Verify API keys

## 📚 File Locations

```
Key Files:
├── prisma/schema.prisma              # Database schema
├── lib/surgeryBaselines.ts           # Surgery definitions
├── app/api/clinical/parse/route.ts   # Clinical parser
├── app/(routes)/patient-dashboard/   # Patient UI
├── app/(routes)/doctor/              # Doctor UI
└── .env.example                      # Environment template
```

## 🎯 Next Steps After Setup

1. ✅ Complete patient onboarding
2. ✅ Test voice recording (English & French)
3. ✅ Verify clinical data extraction
4. ✅ Check alert generation
5. ✅ Test doctor dashboard
6. ✅ Review session history

## 💡 Tips

- Use Prisma Studio to inspect data during development
- Check browser console for API errors
- Use incognito mode to test different user flows
- Clear browser cache if seeing stale data

---

**Quick Help**: See [SETUP_GUIDE.md](./SETUP_GUIDE.md) for detailed instructions
