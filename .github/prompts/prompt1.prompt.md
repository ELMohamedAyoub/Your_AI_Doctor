{
  "role": "system",
  "project": "Post-Surgery Recovery Monitoring Platform",
  "objective": "Refactor the Ai-Docter-Agent project into a dual-role healthcare platform with Patient and Doctor dashboards and full Dockerized backend infrastructure.",
  "constraints": [
    "Do not remove legacy chatbot routes but hide them from all navigation.",
    "Use Clerk publicMetadata.role to distinguish patient vs doctor.",
    "All new routes must be protected and role-gated.",
    "System must run via docker-compose with PostgreSQL, Prisma migrations auto-run.",
    "Frontend must be redesigned to center post-surgery recovery, not chatbot UI."
  ],
  "tasks": [
    {
      "step": 1,
      "title": "Role-Based Entry Page",
      "instructions": [
        "Replace homepage / with two cards: I am a Patient and I am a Doctor.",
        "Buttons redirect to /patient/sign-in and /doctor/sign-in.",
        "Remove all links to /dashboard from UI navigation."
      ]
    },
    {
      "step": 2,
      "title": "Clerk Role Assignment",
      "instructions": [
        "On patient sign-up set publicMetadata.role = 'patient'.",
        "On doctor sign-up set publicMetadata.role = 'doctor'.",
        "Create middleware that redirects logged users based on role to /patient-dashboard or /doctor."
      ]
    },
    {
      "step": 3,
      "title": "Patient Dashboard UX",
      "instructions": [
        "Redesign /patient-dashboard UI with Recovery Status Card, Voice Check-in, Days Since Surgery, Surgery Guidelines.",
        "Ensure no chatbot components appear in patient flow."
      ]
    },
    {
      "step": 4,
      "title": "Doctor Dashboard UX",
      "instructions": [
        "Redesign /doctor as a monitoring cockpit.",
        "Display patient list with alert badges, surgery type, days post-op, last pain score.",
        "Clickable cards route to /doctor/patient/[id]."
      ]
    },
    {
      "step": 5,
      "title": "Docker Backend Infrastructure",
      "instructions": [
        "Create docker-compose.yml with services: web (Next.js), postgres.",
        "Expose PostgreSQL on port 5432.",
        "Create Dockerfile for Next.js app.",
        "On container startup run prisma migrate deploy.",
        "Ensure DATABASE_URL is injected from docker-compose env."
      ]
    },
    {
      "step": 6,
      "title": "Environment Configuration",
      "instructions": [
        "Create .env.example with Clerk, OpenAI, AssemblyAI, DATABASE_URL.",
        "Ensure backend fails gracefully if env vars missing."
      ]
    },
    {
      "step": 7,
      "title": "Clinical Monitoring Enforcement",
      "instructions": [
        "Ensure all voice check-ins route through /api/clinical/parse.",
        "Persist structured clinical data.",
        "Trigger alerts based on painScore and symptoms."
      ]
    }
  ],
  "output_expectation": "The system must run fully via docker-compose up, provide role-based frontend flows, persist data in PostgreSQL, and present distinct patient and doctor recovery dashboards."
}
