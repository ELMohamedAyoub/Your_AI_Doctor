// Red Flag Symptom Detection System
// Critical symptoms that require immediate medical attention

export type AlertLevel = "GREEN" | "YELLOW" | "ORANGE" | "RED";

export interface RedFlag {
  symptom: string;
  level: AlertLevel;
  action: string;
  category: "infection" | "bloodClot" | "wound" | "circulation" | "pain" | "other";
}

export interface RedFlagResult {
  hasRedFlags: boolean;
  level: AlertLevel;
  flags: RedFlag[];
  urgentAction: string;
  summary: string;
}

// Red flag patterns by category
const RED_FLAG_PATTERNS = {
  // CRITICAL - Call 911 / Go to ER immediately
  critical: [
    {
      keywords: ["chest pain", "difficulty breathing", "can't breathe", "shortness of breath", "severe chest"],
      symptom: "Severe chest pain or difficulty breathing",
      level: "RED" as AlertLevel,
      action: "🚨 CALL 911 IMMEDIATELY - Possible pulmonary embolism (blood clot in lung)",
      category: "bloodClot" as const
    },
    {
      keywords: ["severe bleeding", "heavy bleeding", "won't stop bleeding", "blood soaking"],
      symptom: "Severe uncontrolled bleeding",
      level: "RED" as AlertLevel,
      action: "🚨 CALL 911 IMMEDIATELY - Apply pressure and seek emergency care",
      category: "wound" as const
    },
    {
      keywords: ["unconscious", "passed out", "fainted", "can't wake"],
      symptom: "Loss of consciousness",
      level: "RED" as AlertLevel,
      action: "🚨 CALL 911 IMMEDIATELY - Medical emergency",
      category: "other" as const
    },
    {
      keywords: ["severe pain", "unbearable pain", "pain 9", "pain 10", "worst pain"],
      symptom: "Severe uncontrolled pain (9-10/10)",
      level: "RED" as AlertLevel,
      action: "🚨 GO TO ER - Pain this severe requires immediate evaluation",
      category: "pain" as const
    }
  ],

  // URGENT - Contact surgeon within 2 hours
  urgent: [
    {
      keywords: ["fever", "temperature", "hot", "chills", "sweating", "38", "100.4", "101"],
      symptom: "Fever above 38°C (100.4°F)",
      level: "ORANGE" as AlertLevel,
      action: "⚠️ CONTACT SURGEON WITHIN 2 HOURS - Possible infection",
      category: "infection" as const
    },
    {
      keywords: ["pus", "yellow discharge", "green discharge", "foul smell", "smells bad"],
      symptom: "Wound drainage with pus or foul odor",
      level: "ORANGE" as AlertLevel,
      action: "⚠️ CONTACT SURGEON WITHIN 2 HOURS - Possible wound infection",
      category: "infection" as const
    },
    {
      keywords: ["calf pain", "leg swelling", "leg warm", "one leg bigger", "deep pain leg"],
      symptom: "Calf pain, swelling, or warmth (one leg)",
      level: "ORANGE" as AlertLevel,
      action: "⚠️ CONTACT SURGEON WITHIN 2 HOURS - Possible deep vein thrombosis (DVT)",
      category: "bloodClot" as const
    },
    {
      keywords: ["wound opening", "wound separated", "edges apart", "gap in incision"],
      symptom: "Wound dehiscence (wound opening up)",
      level: "ORANGE" as AlertLevel,
      action: "⚠️ CONTACT SURGEON WITHIN 2 HOURS - Wound needs evaluation",
      category: "wound" as const
    },
    {
      keywords: ["can't urinate", "can't pee", "no urine", "unable to urinate"],
      symptom: "Urinary retention (unable to urinate)",
      level: "ORANGE" as AlertLevel,
      action: "⚠️ CONTACT SURGEON WITHIN 2 HOURS - Urinary retention requires attention",
      category: "other" as const
    },
    {
      keywords: ["cold leg", "numb leg", "blue leg", "pale leg", "no pulse"],
      symptom: "Cold, numb, or discolored extremity",
      level: "ORANGE" as AlertLevel,
      action: "⚠️ CONTACT SURGEON WITHIN 2 HOURS - Possible circulation problem",
      category: "circulation" as const
    }
  ],

  // MONITOR - Call surgeon's office during business hours
  monitor: [
    {
      keywords: ["redness spreading", "red streaks", "expanding redness"],
      symptom: "Increasing redness around wound",
      level: "YELLOW" as AlertLevel,
      action: "⚡ CALL SURGEON'S OFFICE - Monitor closely, may indicate infection",
      category: "infection" as const
    },
    {
      keywords: ["more swelling", "increased swelling", "swelling worse"],
      symptom: "Increasing swelling",
      level: "YELLOW" as AlertLevel,
      action: "⚡ CALL SURGEON'S OFFICE - Swelling should decrease over time",
      category: "wound" as const
    },
    {
      keywords: ["pain getting worse", "pain increasing", "more pain", "pain not better"],
      symptom: "Pain worsening instead of improving",
      level: "YELLOW" as AlertLevel,
      action: "⚡ CALL SURGEON'S OFFICE - Pain should gradually improve",
      category: "pain" as const
    },
    {
      keywords: ["nausea", "vomiting", "throwing up", "can't keep down"],
      symptom: "Persistent nausea or vomiting",
      level: "YELLOW" as AlertLevel,
      action: "⚡ CALL SURGEON'S OFFICE - May need anti-nausea medication",
      category: "other" as const
    }
  ]
};

export function detectRedFlags(text: string, painScore?: number): RedFlagResult {
  const lowerText = text.toLowerCase();
  const detectedFlags: RedFlag[] = [];
  let highestLevel: AlertLevel = "GREEN";

  // Check pain score
  if (painScore !== undefined && painScore >= 9) {
    detectedFlags.push({
      symptom: `Severe pain reported (${painScore}/10)`,
      level: "RED",
      action: "🚨 GO TO ER - Pain this severe requires immediate evaluation",
      category: "pain"
    });
    highestLevel = "RED";
  } else if (painScore !== undefined && painScore >= 7) {
    detectedFlags.push({
      symptom: `High pain level (${painScore}/10)`,
      level: "ORANGE",
      action: "⚠️ CONTACT SURGEON - Pain should be manageable with prescribed medication",
      category: "pain"
    });
    highestLevel = "ORANGE";
  }

  // Check critical symptoms
  for (const pattern of RED_FLAG_PATTERNS.critical) {
    if (pattern.keywords.some(keyword => lowerText.includes(keyword))) {
      detectedFlags.push({
        symptom: pattern.symptom,
        level: pattern.level,
        action: pattern.action,
        category: pattern.category
      });
      highestLevel = "RED";
    }
  }

  // Check urgent symptoms (only if no critical found)
  if (highestLevel !== "RED") {
    for (const pattern of RED_FLAG_PATTERNS.urgent) {
      if (pattern.keywords.some(keyword => lowerText.includes(keyword))) {
        detectedFlags.push({
          symptom: pattern.symptom,
          level: pattern.level,
          action: pattern.action,
          category: pattern.category
        });
        highestLevel = "ORANGE";
      }
    }
  }

  // Check monitor symptoms (only if no critical/urgent found)
  if (highestLevel !== "RED" && highestLevel !== "ORANGE") {
    for (const pattern of RED_FLAG_PATTERNS.monitor) {
      if (pattern.keywords.some(keyword => lowerText.includes(keyword))) {
        detectedFlags.push({
          symptom: pattern.symptom,
          level: pattern.level,
          action: pattern.action,
          category: pattern.category
        });
        highestLevel = "YELLOW";
      }
    }
  }

  // Generate summary
  let urgentAction = "";
  let summary = "";

  if (highestLevel === "RED") {
    urgentAction = "SEEK EMERGENCY CARE IMMEDIATELY";
    summary = "Critical symptoms detected that require immediate medical attention.";
  } else if (highestLevel === "ORANGE") {
    urgentAction = "CONTACT YOUR SURGEON WITHIN 2 HOURS";
    summary = "Urgent symptoms detected that need prompt medical evaluation.";
  } else if (highestLevel === "YELLOW") {
    urgentAction = "CALL SURGEON'S OFFICE DURING BUSINESS HOURS";
    summary = "Symptoms that should be monitored and discussed with your surgeon.";
  } else {
    urgentAction = "Continue normal recovery";
    summary = "No concerning symptoms detected. Continue following your recovery plan.";
  }

  return {
    hasRedFlags: detectedFlags.length > 0,
    level: highestLevel,
    flags: detectedFlags,
    urgentAction,
    summary
  };
}

// Helper to get color class for alert level
export function getAlertColor(level: AlertLevel): string {
  switch (level) {
    case "RED":
      return "bg-red-500 text-white";
    case "ORANGE":
      return "bg-orange-500 text-white";
    case "YELLOW":
      return "bg-yellow-500 text-black";
    case "GREEN":
      return "bg-green-500 text-white";
    default:
      return "bg-gray-500 text-white";
  }
}

export function getAlertIcon(level: AlertLevel): string {
  switch (level) {
    case "RED":
      return "🚨";
    case "ORANGE":
      return "⚠️";
    case "YELLOW":
      return "⚡";
    case "GREEN":
      return "✅";
    default:
      return "ℹ️";
  }
}
