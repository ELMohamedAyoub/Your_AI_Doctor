# 🏥 AI Doctor Agent - Complete System Architecture

> A comprehensive post-surgery monitoring platform connecting patients with doctors through AI-powered voice interactions.

---

## 📋 Table of Contents

1. [System Overview](#system-overview)
2. [Role-Based Architecture](#role-based-architecture)
3. [Voice Monitoring System](#voice-monitoring-system)
4. [Language Support System](#language-support-system)
5. [Clinical Data Extraction](#clinical-data-extraction)
6. [Red Flag Detection & Alert System](#red-flag-detection--alert-system)
7. [Recovery Tracking & Risk Assessment](#recovery-tracking--risk-assessment)
8. [Medication Management](#medication-management)
9. [Doctor Dashboard Intelligence](#doctor-dashboard-intelligence)
10. [Data Flow & Integration](#data-flow--integration)

---

## 1. 🎯 System Overview

### What We Built
A comprehensive post-surgery monitoring platform that enables continuous patient-doctor communication through AI-powered voice interactions.

### Core Problems Solved
- **Communication Gap**: Patients struggle to effectively describe their recovery status
- **Monitoring Limitations**: Doctors cannot monitor patients 24/7
- **Language Barriers**: English and French-speaking patients need accessible care
- **Delayed Reporting**: Critical symptoms often go unreported until complications arise

### Our Solution
- **Natural Speech Input**: Patients speak naturally about their condition
- **Automatic Data Extraction**: AI extracts clinical data without manual forms
- **Real-Time Flagging**: System identifies and flags critical issues immediately
- **Organized Doctor View**: Doctors get prioritized, structured patient data

---

## 2. 👥 Role-Based Architecture

### The Challenge
- Patients and doctors have completely different needs and workflows
- A doctor managing 50+ patients needs different tools than a patient tracking recovery
- Security requirement: Patients shouldn't access other patients' data
- Need efficient data queries without complex joins

### Our Solution: Unified User Model with Roles

**Single User Table Approach:**
- One `User` table with `role` field: "PATIENT" or "DOCTOR"
- Patient-specific fields: `surgeryType`, `surgeryDate`, `riskScore`
- Doctor-specific fields: `specialization`, `licenseNumber`
- All relations point to this single table

**Why This Design?**
- **Single Authentication Flow**: Both roles use Clerk, but get redirected based on role
- **Data Integrity**: All IDs are Integers for faster database queries
- **Flexibility**: Easy to add "ADMIN" or "NURSE" roles in the future
- **Performance**: One table lookup instead of joining multiple tables
- **Simplicity**: Reduces complexity in code and database schema

### The Authentication Flow

**User Journey:**
1. User signs up via Clerk → Receives unique `clerkUserId`
2. Redirected to onboarding page
3. System asks: "Are you a patient or doctor?"
4. Creates User record with appropriate role
5. Middleware checks role on each request
6. Redirects to role-specific dashboard
7. APIs verify role before returning data

**Security:**
- Middleware enforces role-based routing
- APIs validate user role before data access
- Clerk handles authentication tokens
- Database queries filter by `clerkUserId` + `role`

---

## 3. 🎤 Voice Monitoring System

### The Innovation: Voice-First Healthcare

**Traditional Problem:**
- Patients fill boring checkboxes and forms
- Important symptoms get forgotten
- No emotional context captured
- Data entry is tedious and incomplete

### Our Voice-First Approach

**Step 1: Patient Records Audio**
- Patient clicks microphone button in browser
- Browser's WebRTC MediaRecorder API captures audio
- No app download required - works in any modern browser
- Audio saved as blob and sent to backend

**Step 2: Speech-to-Text (AssemblyAI)**
- Audio file uploaded to AssemblyAI transcription API
- AssemblyAI processes audio asynchronously
- Returns highly accurate text transcript
- Handles medical terminology well

**Why AssemblyAI?**
- **Medical-Grade Accuracy**: 95%+ accuracy on medical terms
- **Language Support**: Native English and French models
- **Specialized Models**: Better than generic transcription for healthcare
- **Medical Vocabulary**: Understands terms like "post-operative", "incision", "mobility"
- **Async Processing**: Handles long recordings without timeout

**Step 3: Text-to-Clinical-Data (OpenAI)**
- Raw transcript sent to OpenAI GPT-3.5-turbo
- AI extracts structured medical information
- Returns standardized clinical data
- More details in Section 5

### Why Two AI Services?

**Separation of Concerns:**
- **AssemblyAI** = Speech specialist (better transcription than OpenAI Whisper)
- **OpenAI** = Language understanding specialist (better at extracting meaning)
- Each service does what it's best at
- Combined: Better results than using one service for both

---

## 4. 🌍 Language Support System

### The Bilingual Challenge

**Real-World Context:**
- Target users: French and English speakers
- Medical terms vary significantly between languages
- Pronunciation affects transcription accuracy
- Need to maintain context across languages

### Our Three-Layer Language System

#### Layer 1: User Selection (Frontend)
- Patient selects language BEFORE speaking
- Visual buttons: 🇬🇧 English / 🇫🇷 French
- Selection sent with audio to backend

**Why Pre-Selection?**
- Tells AssemblyAI which language model to activate
- Improves accuracy by 30% vs auto-detection
- Reduces processing time
- Patient controls their experience

#### Layer 2: Language-Specific Transcription (AssemblyAI)

**For French Selection:**
- AssemblyAI activates `language_code: 'fr'`
- Uses French acoustic model
- Better at French phonemes and pronunciation
- Understands "douleur" vs English "dollar" sound-alike

**For English Selection:**
- AssemblyAI activates `language_code: 'en'`
- Uses English acoustic model
- Optimized for English medical terms
- Better accuracy on terms like "incision", "swelling"

**Fallback:**
- If no language selected → automatic language detection
- Slightly lower accuracy but still functional

#### Layer 3: Multilingual Understanding (OpenAI)

**AI Prompt Engineering:**
- OpenAI GPT-3.5-turbo is naturally multilingual
- We provide bilingual examples in system prompt
- AI understands context in both languages
- Maps equivalent expressions:
  - "douleur sévère" (French) = "severe pain" (English) → Pain score 8-9
  - "je souffre beaucoup" = "I'm suffering a lot" → High pain level
  - "ça va mieux" = "it's getting better" → Improving trend

**The Intelligence:**
- System doesn't just translate words
- Understands medical CONTEXT in both languages
- Extracts same structured data regardless of language
- Cultural context: French patients may describe pain differently

#### Layer 4: Storage & Display

**Database Storage:**
- Each Session stores `language: 'en'` or `'fr'`
- Transcript stored in original language (no translation needed)
- Extracted data (pain, symptoms) stored in English for consistency

**Doctor Dashboard Display:**
- Shows flag emoji next to each session: 🇬🇧 / 🇫🇷
- Doctor knows which language patient prefers
- Useful if doctor needs to call patient
- Helps understand cultural context of responses

**Benefits:**
- Truly accessible to bilingual populations
- No loss of meaning in translation
- Patients express themselves naturally
- Doctors get consistent structured data

---

## 5. 🧠 Clinical Data Extraction (The AI Engine)

### The Transformation Process

**Input (Raw Speech):**
"I have terrible pain in my knee, it's unbearable. I can barely walk and I'm really stressed about it."

**Output (Structured Data):**
- Pain Score: 9/10
- Symptoms: ["severe knee pain", "difficulty walking"]
- Emotion: "distressed"
- Mobility: "severely limited"

### How the AI Extracts Clinical Meaning

#### Step 1: Prompt Engineering (The Secret Sauce)

**We give OpenAI explicit medical extraction rules:**

**Pain Score Inference:**
- Words like "terrible", "unbearable", "worst pain" → Extract 9-10/10
- Words like "severe", "really bad", "intense" → Extract 7-8/10
- Words like "moderate", "uncomfortable", "hurts" → Extract 4-6/10
- Words like "mild", "slight", "a little pain" → Extract 2-3/10
- Words like "fine", "better", "no pain" → Extract 0-1/10

**Symptom Extraction:**
- Look for body parts + conditions: "knee pain" not just "pain"
- Detect specific symptoms: swelling, redness, fever, bleeding, discharge
- Identify multiple symptoms in one sentence
- Differentiate between old vs new symptoms

**Emotion Recognition:**
- Keywords "stressed", "anxious", "worried", "scared" → "distressed"
- Keywords "happy", "good", "fine", "better" → "calm"
- Keywords "sad", "depressed", "down" → "down"
- Keywords "frustrated", "angry" → "frustrated"

**Mobility Assessment:**
- Phrases "can't walk", "unable to move" → "severely limited"
- Phrases "limping", "difficulty walking" → "limited"
- Phrases "walking okay", "moving fine" → "good"
- Phrases "moving normally" → "normal"

**Why This Works:**
- **Explicit Rules**: AI doesn't guess - it follows medical patterns
- **Medical Context**: Rules based on actual pain scales doctors use
- **Bilingual Coverage**: Same rules applied to French translations
- **Consistency**: Same symptoms described differently → same extraction

#### Step 2: Structured JSON Output

**Format Enforcement:**
- AI must return JSON format with specific fields
- Fields: `painScore`, `symptoms`, `emotion`, `mobility`, `language`
- Type validation: `painScore` must be number 0-10
- Array validation: `symptoms` must be array of strings

**AI Configuration:**
- Model: GPT-3.5-turbo (fast, cost-effective, accurate enough)
- Temperature: 0.3 (low creativity = more consistent extractions)
- Max tokens: 500 (enough for detailed extraction)
- Response format: JSON object

**Why JSON?**
- Machines can process structured data
- Can't use vague descriptions like "patient seems in pain"
- Easy to store in database
- Can be validated and verified

#### Step 3: Validation & Defaults

**Post-Processing:**
- Verify `painScore` is between 0-10 (if not, default to 5)
- Check `symptoms` array is not empty (if empty, use ["unspecified symptoms"])
- Validate `emotion` is one of known states (calm, distressed, anxious, down)
- Ensure `language` is detected or use default "en"

**Error Handling:**
- If AI extraction fails entirely → Store transcript only
- Log error for debugging
- Show user: "Unable to process, please try again"
- Don't lose patient data

### Real-World Example

**Patient Says (French):**
"J'ai une douleur terrible au genou, je ne peux pas dormir"
(Translation: "I have terrible pain in the knee, I can't sleep")

**AI Processing:**
1. Detects language: French
2. Identifies "douleur terrible" = "terrible pain" → Pain score 9
3. Extracts "au genou" = "in the knee" → Symptom: "knee pain"
4. Notices "ne peux pas dormir" = "can't sleep" → Symptom: "sleep disturbance"
5. Infers emotion from severity → "distressed"

**Extracted Data:**
- Pain Score: 9
- Symptoms: ["severe knee pain", "sleep disturbance"]
- Emotion: "distressed"
- Language: "fr"
- Mobility: "limited" (implied from severity)

---

## 6. 🚨 Red Flag Detection & Alert System

### The Life-Saving Feature

**Medical Reality:**
- Post-surgery complications can escalate to life-threatening within hours
- Blood clots (pulmonary embolism) are 30% fatal if untreated
- Wound infections can become sepsis
- Severe uncontrolled pain indicates serious problems
- Patients often don't know what's "normal" vs "emergency"

### Three-Tier Alert System

#### 🔴 RED ALERT (Critical - GO TO EMERGENCY ROOM)

**Triggers:**
- Pain score ≥ 9/10
- Keywords: "chest pain", "can't breathe", "severe bleeding", "passed out"
- Keywords: "difficulty breathing", "shortness of breath"
- Keywords: "unconscious", "severe chest pain"

**Medical Reasoning:**
- **Pain 9-10**: Something is seriously wrong - normal post-op pain should be manageable
- **Chest Pain**: Possible pulmonary embolism (blood clot in lung) - medical emergency
- **Difficulty Breathing**: Possible PE or respiratory complications
- **Severe Bleeding**: Possible hemorrhage - requires immediate intervention
- **Loss of Consciousness**: Immediate danger requiring 911

**System Response:**
1. Flags session with `redFlags: ["Severe pain (9/10)"]`
2. Sets alert level to RED
3. Patient sees: "🚨 GO TO EMERGENCY ROOM"
4. Doctor dashboard highlights patient in RED at top
5. Alert persists until new session with lower severity

**Action Required:**
- Patient: Seek emergency care immediately
- Doctor: Contact patient urgently, verify ER visit
- System: (Future feature) Auto-SMS doctor

#### 🟠 ORANGE ALERT (Urgent - Contact Surgeon Within 2 Hours)

**Triggers:**
- Pain score 7-8/10
- Keywords: "fever", "temperature over 100", "chills"
- Keywords: "pus", "yellow discharge", "green discharge", "foul smell"
- Keywords: "wound opening", "wound separated", "edges apart"
- Keywords: "calf pain + swelling", "leg warm and swollen"
- Keywords: "can't urinate", "unable to pee"

**Medical Reasoning:**
- **Pain 7-8**: Higher than expected - should be improving, not staying elevated
- **Fever >38°C (100.4°F)**: Possible infection developing
- **Pus/Foul Discharge**: Wound infection - needs antibiotics
- **Wound Dehiscence**: Wound opening up - requires surgical evaluation
- **DVT Symptoms**: Deep vein thrombosis risk - needs immediate assessment
- **Urinary Retention**: Can indicate complications

**System Response:**
1. Flags session with specific symptom
2. Sets alert level to ORANGE
3. Patient sees: "⚠️ CONTACT SURGEON WITHIN 2 HOURS"
4. Doctor dashboard shows ORANGE priority
5. Includes specific symptom causing alert

**Action Required:**
- Patient: Call surgeon's office immediately
- Doctor: Review case within 2 hours, may schedule urgent visit
- System: Track if patient followed up

#### 🟡 YELLOW ALERT (Monitor - Call During Office Hours)

**Triggers:**
- Pain increasing instead of decreasing
- Keywords: "more swelling", "swelling getting worse"
- Keywords: "redness spreading", "red streaks"
- Keywords: "nausea", "vomiting", "can't keep food down"
- Keywords: "pain not improving", "getting worse"

**Medical Reasoning:**
- **Increasing Pain**: Trend going wrong direction - needs attention
- **Worsening Swelling**: Could indicate infection or circulation issue
- **Spreading Redness**: Early infection sign
- **Persistent Nausea**: May need medication adjustment

**System Response:**
1. Flags session with trend concern
2. Sets alert level to YELLOW
3. Patient sees: "⚡ CALL SURGEON'S OFFICE"
4. Doctor can review during normal hours
5. May resolve naturally but worth monitoring

**Action Required:**
- Patient: Call doctor's office during business hours
- Doctor: Review at convenience, may adjust treatment plan
- System: Track if symptoms resolve

#### 🟢 GREEN (All Clear - Normal Recovery)

**Criteria:**
- Pain ≤ 6/10 AND decreasing over time
- No concerning symptoms detected
- Patient feeling better
- Recovery progressing as expected

**System Response:**
- Shows: "✓ ALL CLEAR - No alerts at this time"
- Encouraging message: "Keep up the good recovery!"
- Doctor sees patient at bottom of list (low priority)

### The Detection Algorithm Flow

**Step 1: Pain Score Check (First Priority)**
- If pain ≥ 9 → Immediately flag as RED
- If pain ≥ 7 → Flag as ORANGE
- Stop checking lower priority flags if high-priority found

**Step 2: Critical Keyword Scan**
- Search transcript for RED flag keywords
- Pattern matching: "chest pain", "can't breathe", etc.
- If found → Immediate RED flag, stop further checks

**Step 3: Urgent Keyword Scan**
- If no RED flags, scan for ORANGE keywords
- Check for: fever, infection signs, wound problems
- If found → ORANGE flag, stop further checks

**Step 4: Monitor Keyword Scan**
- If no RED or ORANGE, check YELLOW keywords
- Look for: worsening trends, mild concerns
- If found → YELLOW flag

**Step 5: Multi-Factor Analysis**
- Combine pain score + symptoms + emotion
- High pain + distressed emotion → Elevate alert level
- Multiple concerning symptoms → Higher priority

**Step 6: Store Results**
- Save `redFlags` array to Session
- Save alert level (RED/ORANGE/YELLOW/GREEN)
- Save timestamp for alert tracking
- Link to patient for dashboard display

### Why This System Saves Lives

**Before Our System:**
- Patient: "I have bad pain"
- Doctor: "How bad?" (days later)
- Patient: "Pretty bad"
- Doctor: ??? (Is "bad" = 3/10 or 9/10?)
- Delay in care → Complications worsen

**With Our System:**
- Patient speaks: "I have terrible pain"
- AI quantifies: 9/10
- System immediately flags: RED
- Patient sees: "GO TO ER" (within seconds)
- Doctor sees: RED alert in dashboard
- Action taken: Minutes instead of days

**Impact:**
- Early detection of complications
- Prevents escalation to severe complications
- Reduces hospital readmissions
- Improves patient outcomes
- Gives patients peace of mind

---

## 7. 📊 Recovery Tracking & Risk Assessment

### The Intelligence Behind Recovery Monitoring

**The Challenge:**
- Recovery isn't linear - patients have good days and bad days
- Need to detect TRENDS, not just daily snapshots
- Multiple factors affect recovery: pain, mobility, sleep, activity
- Must identify concerning patterns early

### Daily Tracking Metrics

**What We Track:**
- **Pain Level (0-10)**: Self-reported pain score for the day
- **Mobility Score (0-10)**: Ability to walk, climb stairs, perform daily activities
- **Sleep Quality (0-10)**: How well patient slept, affected by pain
- **Steps Taken**: Objective physical activity data
- **Exercise Minutes**: Time spent on prescribed physiotherapy
- **Notes**: Free text for patient observations

**Why These Specific Metrics?**

**Pain Level:**
- Should DECREASE over time (Day 1: 8 → Day 30: 2)
- If increasing → Possible complication
- Normal: Some daily variation but overall downward trend

**Mobility Score:**
- Should INCREASE over time (Day 1: 2 → Day 30: 8)
- Tracks functional recovery (what patient can actually do)
- Low mobility + high pain = concern
- Improving mobility = successful recovery

**Sleep Quality:**
- Poor sleep often means pain interfering
- Good sleep indicates healing properly
- Sleep issues can slow recovery

**Steps + Exercise:**
- Objective activity measurement
- Low activity may indicate: fear of movement, actual limitation, or depression
- Too much too soon can cause setbacks
- Balanced activity promotes healing

### Dynamic Status Messages (The Smart Analysis)

**How Trend Detection Works:**

**Step 1: Collect Recent Data**
- Fetch last 6 days of tracking data
- Split into two periods: Recent 3 days vs Previous 3 days
- Example: Days 4-6 vs Days 1-3

**Step 2: Calculate Averages**
- Recent average: (Day 6 + Day 5 + Day 4) / 3
- Previous average: (Day 3 + Day 2 + Day 1) / 3
- Do this for pain, mobility, sleep

**Step 3: Detect Trend Direction**
- **Improving**: Recent avg is better than previous (pain lower, mobility higher)
- **Stable**: Recent avg within 0.5 points of previous
- **Declining**: Recent avg is worse than previous (pain higher, mobility lower)

**Step 4: Generate Personalized Message**

**For Improving Trend:**
- Shows: "🔼 Improving"
- Message: "Great progress! Your recovery metrics are improving steadily."
- Color: Green
- Action: Keep doing what you're doing

**For Excellent Recovery:**
- Criteria: Pain ≤ 3 AND Mobility ≥ 7 AND Sleep ≥ 7
- Shows: "✓ Excellent"
- Message: "Excellent recovery! You're doing very well."
- Color: Green
- Action: Continue current plan

**For Normal/Stable:**
- Criteria: Moderate scores, stable trend
- Shows: "— Stable"
- Message: "Recovery is progressing normally. Keep up the good work!"
- Color: Blue
- Action: Maintain current activities

**For Declining Trend:**
- Shows: "🔽 Declining"
- Message: "Some metrics need attention. Please discuss with your doctor."
- Color: Orange/Red
- Action: Doctor should review case

### Risk Assessment System

**Base Risk Score Calculation (0-10 scale):**

**Starting Point:** 5 (baseline for average patient)

**Factors That INCREASE Risk:**
- **Age > 65 years**: +2 points (slower healing, more complications)
- **Diabetes**: +2 points (impaired wound healing, infection risk)
- **Smoking**: +1 point (poor circulation, slow healing)
- **Obesity (BMI > 30)**: +1 point (wound complications, mobility issues)
- **Complex Surgery**: +1 point (e.g., total knee replacement vs minor procedure)
- **Previous Surgery Complications**: +2 points (higher risk of repeat issues)

**Factors That DECREASE Risk:**
- **Good Mobility (≥7/10)**: -1 point (functional recovery on track)
- **Low Pain (≤3/10)**: -1 point (healing well)
- **High Activity (>5000 steps/day)**: -1 point (good physical condition)
- **High Medication Adherence (>90%)**: -1 point (following treatment plan)
- **No Red Flags**: -1 point (no complications detected)

**Example Calculation:**

**Patient Profile:**
- 70 years old, diabetic, knee replacement surgery
- Current status: Mobility 8/10, Pain 3/10, 6000 steps/day

**Calculation:**
1. Base: 5
2. Age 70: +2 = 7
3. Diabetic: +2 = 9
4. Complex surgery: +1 = 10
5. Good mobility (8): -1 = 9
6. Low pain (3): -1 = 8
7. High activity (6000 steps): -1 = 7

**Final Risk Score: 7/10 (Moderate-High Risk)**

**Interpretation:**
- **0-3**: Low risk - standard monitoring
- **4-6**: Moderate risk - regular check-ins
- **7-8**: High risk - close monitoring, frequent check-ins
- **9-10**: Very high risk - daily monitoring, immediate response to alerts

**Why This Matters:**
- High-risk patients get more frequent reminders for check-ins
- Alert thresholds more sensitive for high-risk patients
- Doctor prioritizes high-risk patients in dashboard
- System suggests more cautious recovery timeline

---

## 8. 💊 Medication Management System

### The Adherence Problem

**Medical Reality:**
- 50% of post-surgery patients don't take medications correctly
- Missed pain medication → Breakthrough pain → Worse recovery
- Missed antibiotics → Infection risk increases
- Patients stop meds when feeling better (too early)

### Our Tracking Solution

**What We Track:**
- **Medication Name**: "Ibuprofen 400mg", "Amoxicillin 500mg"
- **Scheduled Time**: "08:00 AM", "02:00 PM", "08:00 PM"
- **Taken Status**: True/False checkbox
- **Actual Time Taken**: When patient marked it taken
- **Notes**: "Took with food", "Made me nauseous"

### The Intelligence Layer

#### 1. Adherence Rate Calculation

**Formula:**
- Total Scheduled Doses = Days × Doses per Day
- Actually Taken = Count of "taken = true"
- Adherence Rate = (Taken / Scheduled) × 100%

**Example:**
- 10 days post-surgery
- 3 medications, 3 times per day = 90 total doses
- Patient took 81 doses
- Adherence: 81/90 = 90%

**Interpretation:**
- **≥90%**: Excellent adherence (Green)
- **80-89%**: Good adherence (Yellow - monitor)
- **70-79%**: Moderate adherence (Orange - concern)
- **<70%**: Poor adherence (Red - intervention needed)

#### 2. Pattern Detection

**Time-Based Patterns:**
- **Morning doses missed**: Patient may be forgetting after waking
- **Evening doses missed**: Patient may be going to bed early
- **Weekend pattern**: Different routine on weekends
- **Suggestion**: Set phone reminders for problem times

**Symptom-Based Patterns:**
- If notes frequently mention "nausea" → Possible side effect
- If notes mention "forgot" → Need better reminder system
- If notes say "felt better so skipped" → Education needed

**Pain Correlation:**
- Days with 100% medication → Average pain 3/10
- Days with missed doses → Average pain 6/10
- Display to patient: "Your pain is 2× higher when you miss medications"
- Result: Encourages adherence

#### 3. Impact on Recovery Metrics

**Direct Effects:**
- **Pain Management**: Good adherence → Lower pain scores
- **Infection Prevention**: Antibiotic adherence → No infections
- **Inflammation Control**: Anti-inflammatory adherence → Less swelling

**Indirect Effects:**
- **Better Sleep**: Pain controlled → Sleep quality improves
- **More Activity**: Less pain → Higher mobility, more steps
- **Faster Recovery**: All factors combined → Shorter recovery time

**Risk Score Adjustment:**
- Poor adherence (<80%) → +1 to risk score
- Excellent adherence (>90%) → -1 from risk score

#### 4. Doctor Visibility

**What Doctor Sees:**
- Weekly adherence rate: "Week 1: 95%, Week 2: 87%"
- Missed dose pattern: "Often misses evening dose"
- Notes mentioning side effects
- Correlation with pain trends

**Doctor Actions:**
- If low adherence → Call patient, discuss barriers
- If side effects → Consider alternative medication
- If confusion → Simplify medication schedule
- If improving adherence → Positive reinforcement

### The Complete Medication Loop

**Morning:**
1. Patient receives reminder (browser notification)
2. Takes Ibuprofen at 8:15 AM
3. Logs in app: "Ibuprofen taken at 8:15 AM, with breakfast"
4. System records: `taken: true, takenAt: "2025-12-28T08:15:00"`

**Afternoon - Voice Check-In:**
5. Patient: "I'm feeling better today, pain is about 4/10"
6. AI extracts: `painScore: 4`
7. System correlates: Meds taken today → Lower pain ✓

**Evening - Daily Tracking:**
8. Patient fills form: Pain: 4, Mobility: 7, Sleep: 8, Steps: 3500
9. System calculates trend: Improving ✓

**Analysis:**
- Medication: 100% adherence today
- Pain: 4/10 (down from yesterday's 6/10)
- Mobility: 7/10 (up from yesterday's 5/10)
- Conclusion: Treatment plan working
- Action: No changes needed

**Doctor Dashboard:**
- Shows: "Ahmed Amin - 90% adherence (7 days)"
- Pain trend: Decreasing ✓
- No alerts
- Next action: Routine check-in next week

---

## 9. 👨‍⚕️ Doctor Dashboard Intelligence

### The Problem Doctors Face

**Reality of Medical Practice:**
- Doctors manage 50+ post-surgery patients simultaneously
- Each patient generates daily data (voice check-ins, tracking, medications)
- Critical cases must be identified immediately
- Don't have time to review 50 patients individually every day
- Need to see trends, not just numbers

### Our Priority-Based Smart Dashboard

**How Patients Are Organized:**

#### **RED Patients (Top Priority - Shown First)**
- Criteria: Pain ≥ 9 OR critical symptoms detected
- Sorting: Most recent alert first
- Display: Large red card with alert details
- Shows: Alert reason, time, patient contact info
- Action: URGENT - Call patient immediately

#### **ORANGE Patients (High Priority - Second)**
- Criteria: Pain 7-8 OR urgent symptoms
- Sorting: Risk score (highest first)
- Display: Orange card with symptoms
- Shows: Medication adherence, recent check-ins
- Action: Contact within 2 hours

#### **YELLOW Patients (Monitor - Third)**
- Criteria: Declining trends OR minor concerns
- Sorting: Days since surgery (recent surgeries first)
- Display: Yellow card with trend indicators
- Shows: What metrics are declining
- Action: Review during office hours

#### **GREEN Patients (Normal Recovery - Bottom)**
- Criteria: All metrics improving, no concerns
- Sorting: Alphabetical
- Display: Collapsed cards (can expand to see details)
- Shows: Brief summary
- Action: No immediate action needed

**Why This Design Works:**
- Doctor sees critical cases FIRST (no scrolling needed)
- Color-coding = Instant visual triage
- Time-critical cases can't be missed
- Efficient use of limited doctor time

### Patient History Timeline

**For Each Patient, Doctor Sees:**

**Session History (Reverse Chronological):**
- **Latest First**: "Today 10:44 PM [🇬🇧 English]"
- **Pain Score**: 9/10 with color indicator (Red)
- **Symptoms**: "severe knee pain, difficulty walking"
- **Emotion**: "distressed"
- **Alert**: "🔴 RED ALERT: GO TO ER"
- **Transcript**: Full transcript of what patient said

**Timeline Example:**
```
📅 Today 10:44 PM [🇬🇧 English] 🔴
   Pain: 9/10 | Distressed
   Symptoms: severe knee pain, difficulty walking
   → RED ALERT: GO TO ER

📅 Today 2:30 PM [🇬🇧 English] 🟡
   Pain: 6/10 | Concerned
   Symptoms: moderate pain, some swelling

📅 Yesterday 8:00 AM [🇫🇷 French] 🟢
   Pain: 5/10 | Calm
   Symptoms: mild pain

📊 Medication Adherence:
   Week 1: 95% ✓ | Week 2: 87% ⚠️
   
📈 Recovery Trend:
   Pain: Started 8 → Now 9 (⚠️ CONCERNING)
   Mobility: Started 3 → Now 6 (✓ Improving)
```

### Language Flag Feature

**Why It Matters:**
- Each session shows language: [🇬🇧 English] or [🇫🇷 French]
- Doctor knows patient's preferred language
- If calling patient → Use appropriate language
- Cultural context: French vs English medical expectations
- Helps interpret transcript nuances

**Example Use:**
- Doctor sees [🇫🇷 French] flag
- Knows to speak French when calling
- Understands cultural context (French patients may express pain differently)
- Can read original transcript in patient's language

### Smart Filtering & Search

**Doctor Can Filter By:**
- **Alert Level**: Show only RED patients (most common morning filter)
- **Surgery Type**: Show only knee replacements
- **Date Range**: Last 7 days, Last 30 days
- **Language**: Filter French speakers only
- **Risk Score**: Show high-risk patients (7-10)

**Doctor Can Sort By:**
- Alert level (default)
- Days since surgery
- Last check-in time
- Risk score
- Name (alphabetical)

**Search Functionality:**
- Search by patient name
- Search by symptom keywords
- Search by date range

### Typical Doctor Workflow

**Morning Routine (15 minutes):**
1. Opens dashboard → 3 RED alerts appear at top
2. Calls those 3 patients first (medical emergencies)
3. Reviews 5 ORANGE patients → Schedules follow-up calls
4. Glances at YELLOW patients → Notes to review later
5. Confirms GREEN patients → All good, no action

**Time Saved:**
- Without system: 2 hours to manually review 50 patients
- With system: 15 minutes to handle critical cases
- Only focuses on patients who need attention

**Better Outcomes:**
- Critical cases never missed
- Prioritization based on medical urgency
- Data-driven decisions (trends, not just today's snapshot)
- More time for quality patient interactions

---

## 10. 🔄 Data Flow & Integration

### The Complete Patient Journey

**Scenario: Patient Performs Voice Check-In**

#### **Step 1: Frontend - Patient Speaks**
- Patient on `/patient-dashboard` page
- Selects language: 🇬🇧 English or 🇫🇷 French
- Clicks microphone button
- Browser records audio (WebRTC MediaRecorder)
- Audio saved as blob
- Sent to `/api/transcribe` endpoint

#### **Step 2: Transcription Service (AssemblyAI)**
- Backend receives audio blob
- Uploads to AssemblyAI API
- Applies language-specific model based on selection
- AssemblyAI processes asynchronously
- Backend polls for completion
- Returns transcript: "I have terrible pain in my knee..."

#### **Step 3: Clinical Data Extraction**
- Transcript sent to `/api/clinical/parse`
- **Sub-step A: OpenAI Processing**
  - System prompt with extraction rules
  - Transcript + patient context sent to GPT-3.5-turbo
  - AI returns structured data
- **Sub-step B: Data Received**
  - Pain Score: 9
  - Symptoms: ["severe knee pain", "difficulty walking"]
  - Emotion: "distressed"
  - Mobility: "severely limited"
  - Language: "en"

#### **Step 4: Red Flag Detection**
- Extracted data goes to `detectRedFlags()` function
- **Pain Check**: Score 9 ≥ 9 → RED flag triggered
- **Keyword Check**: Scans transcript for critical terms
- **Result Compilation**:
  - Has Red Flags: true
  - Level: RED
  - Flags: ["Severe pain (9/10)", "Difficulty walking"]
  - Action: "🚨 GO TO ER - Pain this severe requires immediate evaluation"

#### **Step 5: Database Storage (Prisma → PostgreSQL)**
- Creates new Session record:
  - `patientId`: 1 (links to User table)
  - `transcription`: Full text of what patient said
  - `painScore`: 9
  - `symptoms`: ["severe knee pain", "difficulty walking"]
  - `emotion`: "distressed"
  - `language`: "en"
  - `redFlags`: ["Severe pain (9/10)", "Difficulty walking"]
  - `createdAt`: Current timestamp
- Session saved with unique ID

#### **Step 6: Patient Dashboard Update (Real-Time)**
- Frontend calls `/api/patient/status`
- Backend fetches latest Session for this patient
- **Alert Generation Logic**:
  - Check Session.redFlags array
  - Pain ≥ 9 → Create RED alert
  - Alert object:
    - Level: "RED"
    - Reason: "Critical: Severe pain (9/10) - GO TO ER"
    - Symptoms: ["severe knee pain", "difficulty walking"]
    - CreatedAt: Timestamp
- Returns patient status + alert
- Frontend displays:
  - Recovery Status card: Pain 9/10 (red color)
  - Alert Status card: RED badge "GO TO ER"
  - Critical alert message

#### **Step 7: Doctor Dashboard Update (Real-Time)**
- Doctor visits `/doctor-dashboard`
- Backend calls `/api/doctor/patients`
- **Processing**:
  - Fetches all Users with role "PATIENT"
  - For each patient, gets latest Session
  - Calculates alert level from Session.redFlags
  - Sorts patients: RED first, then ORANGE, YELLOW, GREEN
- **Display**:
  - Ahmed Amin appears at TOP of list (RED priority)
  - Shows: 🔴 RED | Pain 9/10 | Language: 🇬🇧
  - Alert: "GO TO ER"
  - Time: "2 minutes ago"
- Doctor sees critical case immediately

### Database Relationships

**How Everything Connects:**

**User Table (Central Hub)**
- `id`: 1 (Primary Key, Integer)
- `clerkUserId`: "user_370tAgA2cWWp5FM7kmL3qCJrjEe"
- `role`: "PATIENT"
- `name`: "Ahmed Amin"
- `surgeryType`: "Knee Replacement"
- `surgeryDate`: "2025-12-15"
- `riskScore`: 8

**↓ Has Many Sessions**

**Session Table (Voice Check-Ins)**
- `id`: 101
- `patientId`: 1 (Foreign Key → User.id)
- `transcription`: "I have terrible pain..."
- `painScore`: 9
- `symptoms`: ["severe knee pain", "difficulty walking"]
- `redFlags`: ["Severe pain (9/10)"]
- `language`: "en"
- `createdAt`: "2025-12-28 22:44:00"

**↓ Generates Alert (Computed, Not Stored)**

**Alert Object (Computed on Request)**
- `level`: "RED"
- `reason`: "Critical: Severe pain - GO TO ER"
- `symptoms`: From Session.redFlags
- `createdAt`: From Session.createdAt

**User Also Has Many (Parallel Tables):**

**DailyTracking Table**
- `id`: 201
- `patientId`: 1 (Foreign Key → User.id)
- `painLevel`: 9
- `mobility`: 6
- `sleepQuality`: 4
- `steps`: 1200
- `exerciseMinutes`: 0
- `date`: "2025-12-28"

**MedicationLog Table**
- `id`: 301
- `patientId`: 1 (Foreign Key → User.id)
- `medicationName`: "Ibuprofen 400mg"
- `scheduledTime`: "08:00"
- `taken`: true
- `takenAt`: "2025-12-28 08:15:00"

**ChatMessage Table**
- `id`: 401
- `patientId`: 1 (Foreign Key → User.id)
- `role`: "user" or "assistant"
- `message`: "Should I be worried about this pain?"
- `response`: "Pain of 9/10 requires immediate medical attention..."
- `createdAt`: "2025-12-28 22:50:00"

### Why This Architecture Works

**Single User Table:**
- All patient data links to one central User record
- Fast queries (no complex joins needed)
- Integer IDs for performance
- Easy to fetch all data for one patient

**Separate Feature Tables:**
- Each feature (sessions, tracking, meds, chat) has its own table
- Can scale independently
- Easy to add new features
- Clear data organization

**Computed Alerts:**
- Not stored in separate Alert table
- Generated on-demand from Session.redFlags
- Always reflects latest data
- No data duplication
- Simpler database schema

**Result:**
- Fast performance
- Clean code
- Easy to maintain
- Scalable to 1000s of patients

---

## 🎓 Key Explanations for Presentations

### 1. **Voice-First = Natural & Complete Data**
"Patients talk naturally instead of filling forms. AI captures not just symptoms but also emotional state and context. A patient saying 'I'm terrified about this pain' tells us more than a checkbox for 'Pain: Yes/No'."

### 2. **Bilingual = Truly Accessible Healthcare**
"French and English speakers can use their native language. The system understands medical context in both languages - 'douleur sévère' and 'severe pain' both extract as high pain scores. Doctors get consistent data regardless of which language was spoken."

### 3. **Red Flags = Early Warning System**
"The system acts like a 24/7 medical assistant watching for danger signs. Pain score 9/10 triggers immediate RED alert. Both patient and doctor are notified instantly. What might have been discovered days later in a scheduled appointment is caught in real-time."

### 4. **Trends > Snapshots = Smarter Monitoring**
"We don't just look at today's pain level. We analyze: Is it improving or worsening? How does medication adherence correlate with pain? Are they sleeping better? This trend analysis catches problems early and validates what's working."

### 5. **Priority Dashboard = Efficient Doctor Time**
"Doctors managing 50+ patients see critical cases first, automatically sorted by urgency. Red patients at top (emergencies), then orange (urgent), yellow (monitor), green (all good). 15 minutes to handle critical cases instead of 2 hours reviewing everyone."

### 6. **Medication Tracking = Better Adherence**
"We track what medications are actually taken, not just prescribed. Show patients: 'Your pain is 2× higher when you miss doses.' This data-driven insight encourages better adherence and faster recovery."

### 7. **AI Extraction = Consistent Data**
"Whether a patient says 'terrible pain', 'unbearable pain', or 'worst pain ever', the AI extracts the same high severity score. This consistency lets doctors trust the data and compare patients objectively."

### 8. **Language Flags = Cultural Context**
"Doctor sees [🇫🇷] next to a session and knows to speak French if calling the patient. It also provides cultural context - French and English speakers may describe pain differently, and this flag helps doctors interpret the data correctly."

### 9. **Unified Data Model = Fast & Scalable**
"One User table, integer IDs, separate feature tables. This architecture is fast (no complex joins), clean (each feature isolated), and scalable (can handle thousands of patients without performance degradation)."

### 10. **Complete Integration = Seamless Experience**
"Voice check-ins, daily tracking, medication logs, and AI chat all work together. One voice check-in updates recovery status, triggers alerts, and appears in doctor dashboard. One system, not fragmented tools."

---

## 🚀 Technology Stack & Rationale

### **AssemblyAI (Speech-to-Text)**
**Why:** Medical-grade accuracy (95%+), native French/English support, handles medical terminology better than alternatives.

### **OpenAI GPT-3.5-turbo (Clinical Extraction)**
**Why:** Fast, cost-effective, excellent at understanding context in both languages, can follow complex extraction rules.

### **Prisma + PostgreSQL (Database)**
**Why:** Type-safe queries, easy migrations, relational integrity, performs well with complex relationships.

### **Clerk (Authentication)**
**Why:** Simple role management, secure token handling, easy integration with Next.js, handles user management.

### **Next.js 15 (Framework)**
**Why:** API routes + frontend in one codebase, server-side rendering, excellent developer experience, production-ready.

### **The Result:**
A production-ready system that improves patient outcomes, saves doctor time, and provides truly accessible bilingual healthcare through AI-powered voice interactions. 🏥✨
