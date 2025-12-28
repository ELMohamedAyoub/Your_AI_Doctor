/**
 * Medical Guidelines Knowledge Base for RAG System
 * Post-surgery care guidelines sourced from authoritative medical institutions
 * 
 * SOURCES:
 * - American Academy of Orthopaedic Surgeons (AAOS) - orthoinfo.aaos.org
 * - Mayo Clinic - mayoclinic.org
 * - Johns Hopkins Medicine - hopkinsmedicine.org
 * - MedlinePlus (NIH) - medlineplus.gov
 * - National Institute of Arthritis and Musculoskeletal and Skin Diseases (NIAMS)
 * 
 * Last Updated: December 28, 2025
 */

export interface MedicalGuideline {
  id: string;
  surgery: string;
  category: string;
  title: string;
  content: string;
  keywords: string[];
  severity?: 'normal' | 'warning' | 'critical';
  source?: string;
  sourceUrl?: string;
}

export const medicalGuidelines: MedicalGuideline[] = [
  // ACL SURGERY GUIDELINES
  {
    id: 'acl-pain-management',
    surgery: 'ACL Surgery',
    category: 'Pain Management',
    title: 'Managing Pain After ACL Surgery',
    content: `Pain after ACL surgery is normal and expected. Here are key guidelines:
    
    - Take prescribed pain medication on schedule, not just when pain is severe
    - Expected pain levels: Days 1-3: 6-8/10, Days 4-7: 4-6/10, Week 2+: 2-4/10
    - Use ice packs for 20 minutes every 2-3 hours during the first 48 hours
    - Elevate your leg above heart level to reduce swelling
    - If pain exceeds 8/10 or doesn't improve with medication, contact your surgeon
    
    RED FLAGS: Severe pain (9-10/10) that doesn't respond to medication may indicate complications.`,
    keywords: ['pain', 'ache', 'hurt', 'medication', 'pills', 'opioid', 'tylenol', 'ibuprofen'],
    severity: 'normal'
  },
  {
    id: 'acl-swelling',
    surgery: 'ACL Surgery',
    category: 'Swelling & Inflammation',
    title: 'Managing Swelling After ACL Surgery',
    content: `Swelling is a normal part of ACL recovery. Follow these guidelines:
    
    - Keep leg elevated above heart level as much as possible for first week
    - Apply ice packs 20 minutes on, 40 minutes off during waking hours
    - Wear compression bandage or sleeve as prescribed
    - Gentle ankle pumps (moving foot up and down) to improve circulation
    - Expect peak swelling days 2-3, gradual improvement over 2-4 weeks
    
    WHEN TO WORRY: Sudden increase in swelling, redness, warmth, or swelling that moves up the leg could indicate blood clot.`,
    keywords: ['swelling', 'swollen', 'inflammation', 'puffy', 'bloated', 'fluid', 'edema'],
    severity: 'normal'
  },
  {
    id: 'acl-mobility',
    surgery: 'ACL Surgery',
    category: 'Mobility & Exercise',
    title: 'Mobility and Range of Motion After ACL Surgery',
    content: `Regaining mobility is crucial for ACL recovery:
    
    WEEK 1-2:
    - Use crutches as prescribed (usually 1-2 weeks)
    - Gentle heel slides and leg raises 3x daily
    - Target: 90 degrees knee flexion by week 2
    
    WEEK 3-6:
    - Begin stationary bike (no resistance)
    - Progressive weight-bearing as tolerated
    - Target: Full extension, 120+ degrees flexion
    
    WEEK 7-12:
    - Light strength training
    - Swimming (once incision fully healed)
    - Target: Near-normal walking gait
    
    RED FLAGS: Inability to straighten knee, severe stiffness preventing any movement, or knee giving way.`,
    keywords: ['movement', 'exercise', 'walking', 'mobility', 'stiff', 'stiffness', 'bend', 'straighten', 'range of motion', 'flexibility'],
    severity: 'normal'
  },
  {
    id: 'acl-infection',
    surgery: 'ACL Surgery',
    category: 'Infection Prevention',
    title: 'Recognizing and Preventing Infection',
    content: `Infection after ACL surgery is rare but serious. Watch for these signs:
    
    NORMAL: Mild redness around incision edges, slight warmth, clear/light yellow drainage first 24-48 hours
    
    WARNING SIGNS (Call Doctor):
    - Increasing redness spreading away from incision
    - Fever above 101°F (38.3°C)
    - Thick, cloudy, or foul-smelling drainage
    - Incision opening or separating
    - Increasing pain after initial improvement
    - Chills or night sweats
    
    PREVENTION:
    - Keep incision clean and dry
    - Don't submerge in bath/pool until cleared by surgeon (usually 2-3 weeks)
    - Wash hands before touching dressing
    - Change dressing as instructed
    
    CRITICAL: If you have fever + severe pain + red streaks from incision, go to ER immediately.`,
    keywords: ['infection', 'fever', 'temperature', 'hot', 'red', 'redness', 'drainage', 'pus', 'discharge', 'wound'],
    severity: 'critical'
  },

  // APPENDECTOMY GUIDELINES
  {
    id: 'appendectomy-pain',
    surgery: 'Appendectomy',
    category: 'Pain Management',
    title: 'Pain After Appendectomy',
    content: `Pain after appendectomy varies by surgical approach (laparoscopic vs open):

LAPAROSCOPIC APPENDECTOMY (Most Common):
• Day 1-2: Moderate pain (4-6/10), especially at incision sites
• Day 3-5: Mild to moderate pain (2-4/10)
• Week 2+: Minimal pain (0-2/10)
• May have shoulder pain from gas used during surgery (resolves in 24-48 hours)

OPEN APPENDECTOMY:
• Day 1-3: Moderate to severe pain (5-7/10)
• Week 1: Moderate pain (3-5/10)
• Week 2-4: Mild pain (1-3/10)

PAIN MANAGEMENT:
• Take prescribed pain medication as directed
• Start with stronger medication, transition to over-the-counter as pain decreases
• Use ice packs on incision sites (wrapped in towel)
• Support abdomen with pillow when coughing or moving

WHEN TO CALL DOCTOR:
• Pain that worsens after first few days
• Severe pain (8+/10) not relieved by medication
• Pain with fever, nausea, or vomiting

Source: Based on standard post-operative care protocols`,
    keywords: ['pain', 'hurt', 'ache', 'sore', 'abdominal pain', 'stomach pain', 'incision pain', 'shoulder pain'],
    severity: 'normal',
    source: 'Standard Post-Operative Care Protocols',
    sourceUrl: 'https://www.hopkinsmedicine.org/'
  },
  {
    id: 'appendectomy-infection',
    surgery: 'Appendectomy',
    category: 'Infection Prevention',
    title: 'Infection Warning Signs After Appendectomy',
    content: `Watch for these signs of infection after appendectomy:

WARNING SIGNS (Call Doctor):
• Fever above 100.4°F (38°C)
• Increasing redness around incisions
• Warmth at incision sites
• Drainage from incisions (especially thick, cloudy, or foul-smelling)
• Increasing abdominal pain (especially if localized)
• Swelling or hardness around incisions
• Chills or sweats

EMERGENCY SIGNS (Go to ER):
• Fever above 102°F (38.9°C)
• Severe abdominal pain
• Rigid, board-like abdomen
• Persistent vomiting
• Unable to keep down fluids
• Red streaks extending from incision
• Pus or blood from incision

PREVENTION:
• Keep incisions clean and dry
• Don't submerge in bath/pool for 1-2 weeks (ask surgeon)
• Shower OK after 24-48 hours (pat dry, don't rub)
• Watch for signs of wound opening
• Wash hands before touching incisions

Note: Risk of infection is higher if appendix ruptured before surgery.

Source: Standard surgical infection prevention guidelines`,
    keywords: ['infection', 'fever', 'red', 'redness', 'drainage', 'pus', 'wound', 'incision', 'temperature'],
    severity: 'critical',
    source: 'Surgical Infection Prevention Guidelines',
    sourceUrl: 'https://www.hopkinsmedicine.org/'
  },
  {
    id: 'appendectomy-activity',
    surgery: 'Appendectomy',
    category: 'Activity & Recovery',
    title: 'Activity Restrictions After Appendectomy',
    content: `Follow these activity guidelines for optimal recovery:

WEEK 1:
• Rest as much as possible
• Short walks encouraged (promotes healing, prevents blood clots)
• No lifting >5-10 lbs
• No driving while taking narcotic pain medication
• Avoid strenuous activity

WEEK 2-3:
• Gradually increase activity
• No lifting >10-15 lbs
• Can return to desk work
• Still no exercise or sports
• OK to drive if not taking narcotics and can move comfortably

WEEK 4-6:
• Can resume most normal activities
• Gradual return to exercise (walking, light cardio)
• No heavy lifting >20 lbs
• Can return to physical work (with doctor clearance)

WEEK 6+:
• Usually full recovery for laparoscopic
• Can resume all activities including sports
• Open surgery may take 8-12 weeks for full recovery

GENERAL TIPS:
• Listen to your body - if it hurts, stop
• Support abdomen when coughing/sneezing
• Avoid constipation (can strain incision)
• Gradually increase activity, don't rush

Source: Standard post-appendectomy recovery guidelines`,
    keywords: ['activity', 'exercise', 'lifting', 'work', 'driving', 'walking', 'sports', 'recovery time'],
    severity: 'normal',
    source: 'Post-Appendectomy Recovery Guidelines',
    sourceUrl: 'https://www.hopkinsmedicine.org/'
  },

  // CESAREAN SECTION GUIDELINES
  {
    id: 'csection-pain',
    surgery: 'Cesarean Section',
    category: 'Pain Management',
    title: 'Pain Management After C-Section',
    content: `Pain after cesarean section is normal and manageable:

EXPECTED PAIN TIMELINE:
• Days 1-3: Moderate to severe pain (5-7/10), especially with movement
• Days 4-7: Moderate pain (3-5/10)
• Week 2: Mild to moderate pain (2-4/10)
• Week 3-6: Mild pain (1-3/10), mostly with activity
• Week 6+: Minimal to no pain

PAIN LOCATIONS:
• Incision site (most common)
• Cramping (uterus contracting back to normal size)
• Gas pain and bloating
• Shoulder pain (from surgery table position)
• After-pains (worse during breastfeeding - normal!)

PAIN MANAGEMENT:
• Take prescribed pain medication regularly (not just when severe)
• Most medications are safe for breastfeeding - ask doctor
• Alternate ibuprofen and acetaminophen if allowed
• Use ice packs on incision (wrapped in towel)
• Support incision with pillow when coughing, laughing, feeding baby
• Use abdominal binder if recommended

WHEN TO CALL DOCTOR:
• Pain that worsens after first week
• Severe pain (8+/10) not relieved by medication
• Pain with fever or foul discharge
• One-sided severe pain (could indicate infection or other issue)

Remember: You just had major surgery AND you're caring for a newborn. Be patient with yourself!

Source: Obstetric post-operative care standards`,
    keywords: ['pain', 'hurt', 'ache', 'cramping', 'incision pain', 'abdominal pain', 'after-pains', 'contractions'],
    severity: 'normal',
    source: 'Obstetric Post-Operative Care Standards',
    sourceUrl: 'https://www.hopkinsmedicine.org/'
  },
  {
    id: 'csection-infection',
    surgery: 'Cesarean Section',
    category: 'Infection Prevention',
    title: 'Infection Warning Signs After C-Section',
    content: `Watch for these infection warning signs after cesarean delivery:

INCISION INFECTION SIGNS (Call Doctor):
• Fever above 100.4°F (38°C)
• Increasing redness around incision (spreading)
• Warmth at incision site
• Swelling or hardness around incision
• Drainage from incision (especially thick, cloudy, yellow, green, or foul-smelling)
• Incision opening or separating
• Increasing pain at incision after initial improvement

ENDOMETRITIS (Uterine Infection) SIGNS (Call Doctor):
• Fever and chills
• Lower abdominal pain/tenderness
• Foul-smelling vaginal discharge
• Heavy bleeding
• Feeling generally unwell

EMERGENCY SIGNS (Go to ER):
• Fever above 102°F (38.9°C)
• Severe abdominal pain
• Heavy bleeding (soaking pad in <1 hour)
• Pus or blood from incision
• Red streaks from incision
• Unable to urinate
• Severe headache with vision changes

PREVENTION:
• Keep incision clean and dry
• Pat dry after shower, don't rub
• Wear loose, breathable clothing
• Watch for signs daily
• Wash hands before touching incision
• Change pads frequently (postpartum bleeding)
• Wipe front to back

NORMAL BLEEDING:
• Heavy bleeding first 2-3 days (like heavy period)
• Gradually decreases over 4-6 weeks
• May have clots (small ones normal)
• Increases slightly around day 7-10 (normal!)

Source: ACOG (American College of Obstetricians and Gynecologists) guidelines`,
    keywords: ['infection', 'fever', 'discharge', 'bleeding', 'red', 'redness', 'drainage', 'pus', 'wound', 'foul smell'],
    severity: 'critical',
    source: 'ACOG Guidelines',
    sourceUrl: 'https://www.acog.org/'
  },
  {
    id: 'csection-recovery',
    surgery: 'Cesarean Section',
    category: 'Recovery & Activity',
    title: 'Recovery Timeline and Activity After C-Section',
    content: `C-section recovery guidelines for safe healing:

WEEK 1-2 (HOSPITAL & EARLY HOME):
• REST as much as possible
• No lifting anything heavier than your baby
• OK to climb stairs slowly, once a day if possible
• Short walks around house (prevents blood clots)
• Accept help with household tasks
• No driving (especially while on pain medication)
• Focus on caring for baby and yourself

WEEK 3-6:
• Gradually increase activity
• Still no heavy lifting (>baby's weight)
• Can walk for exercise
• No driving until pain-free and can brake quickly
• Can do light household tasks
• Still need help with vacuuming, laundry, etc.
• NO exercise beyond walking

WEEK 6+ (After Doctor Clearance):
• Usually cleared at 6-week postpartum visit
• Can resume exercise gradually
• Can resume lifting
• Can resume sexual activity
• Can resume normal activities

SPECIAL CONSIDERATIONS:
• Breastfeeding: Support baby with pillow, try football hold
• Sleep: On back or side (not on stomach until comfortable)
• Driving: When you can brake quickly without pain (usually 2-4 weeks)
• Constipation: Very common, use stool softeners, drink water
• Emotions: Baby blues normal, postpartum depression needs treatment

SIGNS YOU'RE DOING TOO MUCH:
• Increased bleeding
• Pain worsening instead of improving
• Extreme fatigue
• Incision looks inflamed
• Feeling lightheaded or dizzy

Remember: This is major abdominal surgery. Recovery takes 6-8 weeks minimum. Be kind to yourself!

Source: ACOG postpartum recovery guidelines`,
    keywords: ['recovery', 'activity', 'exercise', 'lifting', 'driving', 'walking', 'healing', 'how long', 'when can i'],
    severity: 'normal',
    source: 'ACOG Postpartum Guidelines',
    sourceUrl: 'https://www.acog.org/'
  },
  {
    id: 'csection-breastfeeding',
    surgery: 'Cesarean Section',
    category: 'Breastfeeding After C-Section',
    title: 'Breastfeeding Tips After Cesarean Delivery',
    content: `Breastfeeding after C-section can be challenging but is definitely possible:

POSITIONING TIPS:
• Football/Clutch Hold: Baby at your side, avoids incision pressure
• Side-Lying: Lie on your side, baby facing you (good for night feeds)
• Laid-Back Position: Semi-reclined, baby on chest (gravity helps latch)
• Use pillows to support baby and protect incision

CHALLENGES & SOLUTIONS:
• Delayed milk production (may come in day 4-5 vs day 2-3)
  → Keep nursing/pumping, milk will come!
• Pain when holding baby
  → Use nursing pillows, try different positions
• Difficulty finding comfortable position
  → Experiment with positions, use lots of pillows
• Medication concerns
  → Most pain meds are safe for breastfeeding - ask doctor
• Fatigue from surgery + newborn
  → Rest when baby rests, accept help

PAIN MEDICATION & BREASTFEEDING:
• Ibuprofen: Safe
• Acetaminophen: Safe
• Prescribed narcotics: Usually safe in small amounts, discuss with doctor
• Always tell providers you're breastfeeding

TIPS FOR SUCCESS:
• Nurse early and often (helps milk come in)
• Ask for lactation consultant in hospital
• Support incision with pillow during nursing
• Stay hydrated and eat well
• Be patient - it gets easier!
• After-pains during nursing are NORMAL (means uterus contracting back)

WHEN TO SEEK HELP:
• Baby not latching after 24-48 hours
• Severe nipple pain
• Baby not having wet diapers
• Concerns about milk supply
• Signs of mastitis (breast infection)

Remember: C-section doesn't determine breastfeeding success. Many C-section moms successfully breastfeed!

Source: La Leche League & ACOG guidelines`,
    keywords: ['breastfeeding', 'nursing', 'milk', 'feeding baby', 'latch', 'breast', 'lactation'],
    severity: 'normal',
    source: 'La Leche League & ACOG',
    sourceUrl: 'https://www.llli.org/'
  },

  // KNEE REPLACEMENT GUIDELINES
  {
    id: 'acl-pain-management',
    surgery: 'ACL Surgery',
    category: 'Pain Management',
    title: 'Managing Pain After ACL Surgery',
    content: `Pain after ACL surgery is normal and expected. Here are key guidelines:
    
    - Take prescribed pain medication on schedule, not just when pain is severe
    - Expected pain levels: Days 1-3: 6-8/10, Days 4-7: 4-6/10, Week 2+: 2-4/10
    - Use ice packs for 20 minutes every 2-3 hours during the first 48 hours
    - Elevate your leg above heart level to reduce swelling
    - If pain exceeds 8/10 or doesn't improve with medication, contact your surgeon
    
    RED FLAGS: Severe pain (9-10/10) that doesn't respond to medication may indicate complications.`,
    keywords: ['pain', 'ache', 'hurt', 'medication', 'pills', 'opioid', 'tylenol', 'ibuprofen'],
    severity: 'normal'
  },
  {
    id: 'acl-swelling',
    surgery: 'ACL Surgery',
    category: 'Swelling & Inflammation',
    title: 'Managing Swelling After ACL Surgery',
    content: `Swelling is a normal part of ACL recovery. Follow these guidelines:
    
    - Keep leg elevated above heart level as much as possible for first week
    - Apply ice packs 20 minutes on, 40 minutes off during waking hours
    - Wear compression bandage or sleeve as prescribed
    - Gentle ankle pumps (moving foot up and down) to improve circulation
    - Expect peak swelling days 2-3, gradual improvement over 2-4 weeks
    
    WHEN TO WORRY: Sudden increase in swelling, redness, warmth, or swelling that moves up the leg could indicate blood clot.`,
    keywords: ['swelling', 'swollen', 'inflammation', 'puffy', 'bloated', 'fluid', 'edema'],
    severity: 'normal'
  },
  {
    id: 'acl-mobility',
    surgery: 'ACL Surgery',
    category: 'Mobility & Exercise',
    title: 'Mobility and Range of Motion After ACL Surgery',
    content: `Regaining mobility is crucial for ACL recovery:
    
    WEEK 1-2:
    - Use crutches as prescribed (usually 1-2 weeks)
    - Gentle heel slides and leg raises 3x daily
    - Target: 90 degrees knee flexion by week 2
    
    WEEK 3-6:
    - Begin stationary bike (no resistance)
    - Progressive weight-bearing as tolerated
    - Target: Full extension, 120+ degrees flexion
    
    WEEK 7-12:
    - Light strength training
    - Swimming (once incision fully healed)
    - Target: Near-normal walking gait
    
    RED FLAGS: Inability to straighten knee, severe stiffness preventing any movement, or knee giving way.`,
    keywords: ['movement', 'exercise', 'walking', 'mobility', 'stiff', 'stiffness', 'bend', 'straighten', 'range of motion', 'flexibility'],
    severity: 'normal'
  },
  {
    id: 'acl-infection',
    surgery: 'ACL Surgery',
    category: 'Infection Prevention',
    title: 'Recognizing and Preventing Infection',
    content: `Infection after ACL surgery is rare but serious. Watch for these signs:
    
    NORMAL: Mild redness around incision edges, slight warmth, clear/light yellow drainage first 24-48 hours
    
    WARNING SIGNS (Call Doctor):
    - Increasing redness spreading away from incision
    - Fever above 101°F (38.3°C)
    - Thick, cloudy, or foul-smelling drainage
    - Incision opening or separating
    - Increasing pain after initial improvement
    - Chills or night sweats
    
    PREVENTION:
    - Keep incision clean and dry
    - Don't submerge in bath/pool until cleared by surgeon (usually 2-3 weeks)
    - Wash hands before touching dressing
    - Change dressing as instructed
    
    CRITICAL: If you have fever + severe pain + red streaks from incision, go to ER immediately.`,
    keywords: ['infection', 'fever', 'temperature', 'hot', 'red', 'redness', 'drainage', 'pus', 'discharge', 'wound'],
    severity: 'critical'
  },

  // KNEE REPLACEMENT GUIDELINES
  {
    id: 'knee-replacement-infection-warning',
    surgery: 'Knee Replacement',
    category: 'Infection Prevention',
    title: 'Warning Signs of Infection After Knee Replacement',
    content: `According to the American Academy of Orthopaedic Surgeons (AAOS), watch for these infection warning signs:

CONTACT YOUR DOCTOR IMMEDIATELY IF YOU EXPERIENCE:
• Persistent fever (higher than 100°F / 37.8°C)
• Shaking chills
• Increasing redness, tenderness, or swelling of your wound
• Drainage from your wound
• Increasing pain with both activity and rest

Infection after knee replacement is rare but serious. Early detection and treatment are critical.

PREVENTION TIPS:
• Keep the wound area clean and dry
• Follow dressing change instructions from your surgeon
• Notify your doctor immediately if the wound appears red or begins to drain
• Some patients may need antibiotics before dental work to prevent infection

Source: American Academy of Orthopaedic Surgeons (AAOS)`,
    keywords: ['infection', 'fever', 'temperature', 'hot', 'red', 'redness', 'drainage', 'pus', 'discharge', 'wound', 'chills'],
    severity: 'critical',
    source: 'American Academy of Orthopaedic Surgeons',
    sourceUrl: 'https://orthoinfo.aaos.org/en/recovery/activities-after-knee-replacement/'
  },
  {
    id: 'knee-replacement-blood-clot',
    surgery: 'Knee Replacement',
    category: 'Blood Clot Prevention',
    title: 'Warning Signs of Blood Clots After Knee Replacement',
    content: `According to AAOS guidelines, blood clots (Deep Vein Thrombosis - DVT) are a serious risk. Watch for these warning signs:

CALL YOUR DOCTOR IF YOU EXPERIENCE:
• Pain in your leg or calf unrelated to your incision
• Tenderness or redness above or below your knee
• Increasing swelling of your calf, ankle, or foot

EMERGENCY SIGNS (CALL 911) - May indicate Pulmonary Embolism:
• Sudden shortness of breath
• Sudden onset of chest pain
• Rapid heartbeat
• Coughing up blood
• Localized chest pain with coughing

These indicate a blood clot may have traveled to your lungs - a life-threatening emergency.

PREVENTION:
• Take blood thinner medication as prescribed (don't skip doses)
• Perform ankle pumps 10 times every hour when awake
• Wear compression stockings as directed
• Stay well-hydrated
• Get up and move every 2 hours

Source: American Academy of Orthopaedic Surgeons (AAOS)`,
    keywords: ['blood clot', 'dvt', 'swelling', 'calf pain', 'leg pain', 'shortness of breath', 'breathing', 'chest pain', 'pulmonary embolism'],
    severity: 'critical',
    source: 'American Academy of Orthopaedic Surgeons',
    sourceUrl: 'https://orthoinfo.aaos.org/en/recovery/activities-after-knee-replacement/'
  },
  {
    id: 'knee-replacement-rehab',
    surgery: 'Knee Replacement',
    category: 'Rehabilitation',
    title: 'Physical Therapy and Rehabilitation After Knee Replacement',
    content: `According to AAOS, physical therapy is CRITICAL for knee replacement success:

EARLY PHASE (Days 1-7):
• Start exercises day 1 (even in hospital)
• Ankle pumps, quad sets, heel slides
• Goal: Prevent stiffness, maintain circulation

ACTIVE PHASE (Weeks 2-6):
• Formal physical therapy 2-3x per week
• Home exercises daily
• Goal: 0-115 degrees range of motion
• Progressive weight bearing with walker/cane

STRENGTHENING PHASE (Weeks 7-12):
• Focus on muscle strength
• Balance and gait training
• Goal: Independent walking, climbing stairs

LONG-TERM (3-6 months):
• Return to light activities
• Continue home exercises
• Swimming once wound healed
• Stationary bicycle to maintain flexibility
• Walking as much as desired (but not as substitute for prescribed exercises)

ACTIVITY GUIDELINES:
✅ RECOMMENDED: Walking, swimming, stationary cycling, golf, doubles tennis
❌ AVOID: Jumping, jogging, skiing, high-impact activities

IMPORTANT: Missing PT sessions significantly impacts recovery. If exercises cause sharp, severe pain (not just discomfort), contact your surgeon.

Source: American Academy of Orthopaedic Surgeons (AAOS)`,
    keywords: ['exercise', 'therapy', 'physical therapy', 'PT', 'rehab', 'rehabilitation', 'movement', 'flexibility', 'walking'],
    severity: 'normal',
    source: 'American Academy of Orthopaedic Surgeons',
    sourceUrl: 'https://orthoinfo.aaos.org/en/recovery/activities-after-knee-replacement/'
  },
  {
    id: 'knee-replacement-swelling',
    surgery: 'Knee Replacement',
    category: 'Swelling Management',
    title: 'Managing Swelling After Knee Replacement',
    content: `According to AAOS guidelines on post-knee replacement recovery:

EXPECTED SWELLING TIMELINE:
• Moderate to severe swelling: First few days to weeks after surgery
• Mild to moderate swelling: May persist for 3-6 months after surgery

MANAGEMENT:
• Elevate your leg slightly above heart level
• Apply ice packs
• Wear compression stockings as recommended
• Perform gentle ankle pumps regularly

WHEN TO CONTACT DOCTOR:
Tell your doctor if you experience new or severe swelling, as this may be a warning sign of a blood clot.

NORMAL vs CONCERNING:
• Normal: Gradual decrease in swelling over weeks/months
• Concerning: Sudden increase, one leg significantly more swollen than other, warmth/redness

Source: American Academy of Orthopaedic Surgeons (AAOS)`,
    keywords: ['swelling', 'swollen', 'inflammation', 'puffy', 'bloated', 'fluid', 'edema', 'ice', 'elevation'],
    severity: 'normal',
    source: 'American Academy of Orthopaedic Surgeons',
    sourceUrl: 'https://orthoinfo.aaos.org/en/recovery/activities-after-knee-replacement/'
  },

  // HIP REPLACEMENT GUIDELINES
  {
    id: 'hip-replacement-precautions',
    surgery: 'Hip Replacement',
    category: 'Movement Precautions',
    title: 'Hip Precautions After Surgery',
    content: `Follow these CRITICAL hip precautions for 6-12 weeks to prevent dislocation:
    
    DO NOT:
    ❌ Bend hip more than 90 degrees (no deep chairs, low toilets)
    ❌ Cross legs or bring knee past midline of body
    ❌ Twist or pivot on surgical leg
    ❌ Turn toes/knee inward (keep toes pointed forward)
    
    DO:
    ✅ Sleep on back with pillow between legs (or on non-surgical side)
    ✅ Use raised toilet seat and shower chair
    ✅ Use reaching tools (grabber/reacher) for socks, shoes
    ✅ Keep toes pointed forward or slightly outward
    ✅ Enter car backwards, keep legs apart
    
    DISLOCATION SIGNS (Emergency):
    - Sudden severe pain in hip/groin
    - Leg appears shorter or rotated
    - Inability to move hip
    - Audible "pop" with sudden pain
    
    If you suspect dislocation, call 911 or go to ER immediately.`,
    keywords: ['movement', 'bend', 'hip', 'precaution', 'dislocation', 'position', 'sitting', 'standing'],
    severity: 'critical'
  },

  // GENERAL POST-SURGERY GUIDELINES
  {
    id: 'general-pain-scale',
    surgery: 'General',
    category: 'Pain Management',
    title: 'Understanding and Communicating Your Pain Level',
    content: `According to MedlinePlus (National Library of Medicine), properly measuring and communicating your pain is crucial for effective treatment:

PAIN SCALE (0-10):
• 0 = No pain
• 1-3 = Mild pain (annoying but doesn't interfere with activities)
• 4-6 = Moderate pain (interferes with normal activities)
• 7-9 = Severe pain (unable to perform normal activities)
• 10 = Worst pain possible (emergency level)

HOW TO REPORT YOUR PAIN:
Tell your healthcare provider:
• What is causing the pain
• How much pain you have (use the 0-10 scale)
• What your pain feels like (sharp, dull, throbbing, burning)
• What makes your pain worse
• What makes your pain better
• When or in what situations you have pain

TRACK YOUR PAIN:
• Measure pain before and after treatments
• This helps you and your healthcare team see if treatment is working
• Keep a pain diary if pain varies throughout the day

PAIN TREATMENTS MAY INCLUDE:
• Medications (acetaminophen, NSAIDs, opioids for severe pain)
• Ice packs or heating pads
• Mind-body therapies (deep breathing, meditation)
• Physical therapy
• Distraction techniques

IMPORTANT: Don't wait for pain to become unbearable before taking medication. Pain is easier to control when treated early.

Source: MedlinePlus, National Library of Medicine (NIH)`,
    keywords: ['pain', 'pain scale', 'pain level', 'hurt', 'ache', 'how much pain', 'rate pain', 'measure pain'],
    severity: 'normal',
    source: 'MedlinePlus - National Library of Medicine',
    sourceUrl: 'https://medlineplus.gov/ency/patientinstructions/000532.htm'
  },
  {
    id: 'general-blood-clot',
    surgery: 'General',
    category: 'Blood Clot Prevention',
    title: 'Preventing Blood Clots After Surgery',
    content: `Blood clots (DVT) are a serious risk after orthopedic surgery:
    
    PREVENTION:
    - Take blood thinner medication as prescribed (don't skip doses)
    - Perform ankle pumps 10 times every hour when awake
    - Wear compression stockings as directed
    - Stay well-hydrated (8+ glasses water daily)
    - Get up and move every 2 hours (even just standing)
    
    EARLY WARNING SIGNS (Call Doctor):
    - Calf pain, tenderness, or cramping (especially one-sided)
    - Swelling in one leg more than the other
    - Warmth or redness in calf
    - Visible veins or discoloration
    
    EMERGENCY SIGNS (Call 911):
    - Sudden shortness of breath
    - Chest pain
    - Rapid heartbeat
    - Coughing up blood
    
    These indicate pulmonary embolism (clot in lung) - life-threatening emergency.`,
    keywords: ['blood clot', 'dvt', 'swelling', 'calf pain', 'leg pain', 'shortness of breath', 'breathing'],
    severity: 'critical'
  },
  {
    id: 'general-medication',
    surgery: 'General',
    category: 'Medication Management',
    title: 'Managing Post-Surgery Medications Safely',
    content: `According to AAOS and MedlinePlus guidelines, proper medication management is crucial for recovery:

PAIN MEDICATIONS:
• Take on schedule for first 3-5 days (don't wait for severe pain)
• Opioid and non-opioid options available
• Take with food to prevent nausea
• Gradually taper as pain improves
• Avoid alcohol while taking opioids
• Watch for constipation (common side effect)

According to MedlinePlus:
• Do not take less or more medicine than prescribed
• Do not take your medicines more often than directed
• If considering stopping a medicine, talk to your provider first - you may need to taper gradually
• Side effects like drowsiness may improve over time
• Some side effects (like constipation) may need separate treatment

BLOOD THINNERS:
• Take exactly as prescribed
• Don't skip doses (prevents blood clots)
• Report unusual bleeding/bruising
• Duration varies: typically 2-6 weeks
• May need to avoid certain foods if taking warfarin (vitamin K-rich foods)

ANTIBIOTICS (if prescribed):
• Complete full course even if feeling better
• Take at evenly spaced intervals

STOOL SOFTENERS:
• Start day 1 if taking opioids
• Prevents constipation (common and painful)

WHEN TO CALL DOCTOR:
• Severe nausea/vomiting preventing medication
• Rash or allergic reaction
• Pain not controlled by prescribed medication
• Constipation >3 days despite stool softeners
• Any concerns about your pain medicine

DEPENDENCY CONCERNS:
Some people who take narcotics for pain may become dependent. If you have concerns about this, talk to your provider about alternatives.

Sources: American Academy of Orthopaedic Surgeons (AAOS) & MedlinePlus (NIH)`,
    keywords: ['medication', 'pills', 'medicine', 'prescription', 'drug', 'dose', 'opioid', 'pain killer', 'blood thinner', 'side effects'],
    severity: 'normal',
    source: 'AAOS & MedlinePlus',
    sourceUrl: 'https://orthoinfo.aaos.org/en/recovery/activities-after-knee-replacement/'
  },
  {
    id: 'general-sleep',
    surgery: 'General',
    category: 'Sleep & Rest',
    title: 'Sleep and Recovery',
    content: `Quality sleep is essential for healing:
    
    SLEEP CHALLENGES AFTER SURGERY:
    - Pain interrupting sleep (common first 1-2 weeks)
    - Difficulty finding comfortable position
    - Medication affecting sleep patterns
    - Anxiety about recovery
    
    TIPS FOR BETTER SLEEP:
    - Take pain medication 30-60 minutes before bed
    - Use pillows to support and elevate surgical area
    - Keep room cool and dark
    - Avoid screens 1 hour before bed
    - Gentle stretching before bed (as allowed)
    - Set consistent sleep schedule
    
    SLEEPING POSITIONS:
    - Hip replacement: Back with pillow between legs
    - Knee surgery: Back with pillow under knee
    - Shoulder surgery: Reclined position or non-surgical side
    
    WHEN TO SEEK HELP:
    - Severe insomnia >5 days
    - Pain preventing all sleep
    - Breathing difficulties when lying down
    - Excessive daytime sleepiness affecting safety`,
    keywords: ['sleep', 'rest', 'insomnia', 'tired', 'fatigue', 'exhausted', 'sleeping', 'bed'],
    severity: 'normal'
  },
  {
    id: 'general-nutrition',
    surgery: 'General',
    category: 'Nutrition & Hydration',
    title: 'Nutrition for Healing',
    content: `Proper nutrition accelerates healing and recovery:
    
    PROTEIN (Most Important):
    - Goal: 80-100g daily
    - Sources: Lean meat, fish, eggs, Greek yogurt, protein shakes
    - Needed for tissue repair and wound healing
    
    HYDRATION:
    - Goal: 8-10 glasses (64-80 oz) water daily
    - More if taking pain medications (prevents constipation)
    - Avoid excessive caffeine and alcohol
    
    VITAMINS & MINERALS:
    - Vitamin C: Promotes collagen formation (citrus, berries)
    - Vitamin D & Calcium: Bone health (dairy, fortified foods)
    - Zinc: Wound healing (nuts, seeds, whole grains)
    - Iron: Replaces blood loss (red meat, spinach, beans)
    
    FOODS TO EMPHASIZE:
    - Colorful fruits and vegetables
    - Whole grains
    - Lean proteins
    - Healthy fats (avocado, olive oil, nuts)
    
    FOODS TO LIMIT:
    - Processed foods (slow healing)
    - Excessive sugar (inflammation)
    - Alcohol (interferes with medications and healing)
    
    SUPPLEMENTS:
    - Consult surgeon before taking (some interfere with blood thinners)
    - Generally safe: Vitamin D, calcium, multivitamin
    - Avoid: High-dose vitamin E, fish oil (increase bleeding risk)`,
    keywords: ['food', 'eating', 'nutrition', 'diet', 'appetite', 'hungry', 'protein', 'vitamins', 'hydration', 'water'],
    severity: 'normal'
  },
  {
    id: 'general-emotional',
    surgery: 'General',
    category: 'Emotional & Mental Health',
    title: 'Emotional Recovery After Surgery',
    content: `Emotional challenges are normal and often overlooked:
    
    COMMON FEELINGS:
    - Frustration with limited mobility
    - Anxiety about recovery timeline
    - Sadness or mild depression (affects 20-30% of patients)
    - Fear of re-injury
    - Impatience with healing process
    
    THESE ARE NORMAL AND TEMPORARY.
    
    COPING STRATEGIES:
    - Set small, achievable daily goals
    - Stay connected with friends/family (video calls count!)
    - Gentle meditation or breathing exercises
    - Celebrate small victories (walking further, less pain)
    - Maintain daily routine as much as possible
    - Engage in hobbies that don't require mobility
    
    WHEN TO SEEK HELP:
    - Depression lasting >2 weeks
    - Loss of interest in all activities
    - Thoughts of self-harm
    - Inability to sleep or sleeping all day
    - Severe anxiety preventing participation in recovery
    
    RESOURCES:
    - Ask surgeon for mental health referral
    - Join online support groups for your surgery type
    - Consider short-term counseling (many insurance plans cover)
    
    Remember: Mental health is part of physical recovery. Don't hesitate to ask for help.`,
    keywords: ['sad', 'depressed', 'anxiety', 'anxious', 'worried', 'scared', 'frustrated', 'emotional', 'mental health', 'cry'],
    severity: 'normal'
  }
];

/**
 * Search guidelines by keywords and surgery type
 */
export function searchGuidelines(
  query: string,
  surgeryType?: string,
  limit: number = 3
): MedicalGuideline[] {
  const queryLower = query.toLowerCase();
  const words = queryLower.split(/\s+/);

  const scored = medicalGuidelines
    .filter(guideline => {
      // Filter by surgery type if specified
      if (surgeryType && guideline.surgery !== 'General' && guideline.surgery !== surgeryType) {
        return false;
      }
      return true;
    })
    .map(guideline => {
      let score = 0;

      // Check if any keyword matches
      guideline.keywords.forEach(keyword => {
        if (queryLower.includes(keyword)) {
          score += 10;
        }
      });

      // Check if any word matches keywords
      words.forEach(word => {
        if (guideline.keywords.some(k => k.includes(word) || word.includes(k))) {
          score += 5;
        }
      });

      // Check title and content for matches
      if (guideline.title.toLowerCase().includes(queryLower)) {
        score += 15;
      }
      if (guideline.content.toLowerCase().includes(queryLower)) {
        score += 3;
      }

      // Boost score for surgery-specific guidelines
      if (guideline.surgery === surgeryType) {
        score += 5;
      }

      return { guideline, score };
    })
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(item => item.guideline);

  return scored;
}

/**
 * Get all guidelines for a specific surgery type
 */
export function getGuidelinesBySurgery(surgeryType: string): MedicalGuideline[] {
  return medicalGuidelines.filter(
    g => g.surgery === surgeryType || g.surgery === 'General'
  );
}

/**
 * Get critical/warning guidelines
 */
export function getCriticalGuidelines(surgeryType?: string): MedicalGuideline[] {
  return medicalGuidelines.filter(
    g => g.severity === 'critical' && 
    (!surgeryType || g.surgery === surgeryType || g.surgery === 'General')
  );
}
