# Medical Guidelines Sources

## Overview

All medical guidelines in this application are sourced from authoritative, peer-reviewed medical institutions to ensure accurate, evidence-based patient care advice.

---

## Primary Sources

### 1. **American Academy of Orthopaedic Surgeons (AAOS)**
- **Website**: https://orthoinfo.aaos.org
- **Authority**: Leading professional organization of orthopaedic surgeons
- **Content Used**:
  - Post-knee replacement recovery guidelines
  - Infection warning signs
  - Blood clot prevention
  - Physical therapy protocols
  - Activity recommendations
- **Last Accessed**: December 28, 2025
- **Peer Review**: All AAOS content is peer-reviewed by board-certified orthopaedic surgeons

**Specific Pages Referenced**:
- Activities After Total Knee Replacement: https://orthoinfo.aaos.org/en/recovery/activities-after-knee-replacement/
- Preventing Blood Clots After Orthopaedic Surgery
- Joint Replacement Infection Prevention

---

### 2. **Mayo Clinic**
- **Website**: https://www.mayoclinic.org
- **Authority**: World-renowned nonprofit medical center
- **Content Used**:
  - ACL injury symptoms and recovery
  - Surgery complications
  - Prevention strategies
  - Risk factors
- **Last Accessed**: December 28, 2025
- **Peer Review**: Reviewed by Mayo Clinic medical professionals

**Specific Pages Referenced**:
- ACL Reconstruction: https://www.mayoclinic.org/tests-procedures/acl-reconstruction/about/pac-20384598
- ACL Injury Overview: https://www.mayoclinic.org/diseases-conditions/acl-injury/symptoms-causes/syc-20350738

---

### 3. **MedlinePlus (National Library of Medicine - NIH)**
- **Website**: https://medlineplus.gov
- **Authority**: U.S. National Library of Medicine, part of National Institutes of Health (NIH)
- **Content Used**:
  - Pain scale and measurement
  - Pain management strategies
  - Medication safety
  - Patient communication guidelines
- **Last Accessed**: December 28, 2025
- **Peer Review**: Reviewed by medical professionals at NIH

**Specific Pages Referenced**:
- Palliative Care - Managing Pain: https://medlineplus.gov/ency/patientinstructions/000532.htm

**Citation**: 
> Updated by: Frank D. Brodkey, MD, FCCM, Associate Professor, Section of Pulmonary and Critical Care Medicine, University of Wisconsin School of Medicine and Public Health, Madison, WI. Also reviewed by David C. Dugdale, MD, Medical Director, Brenda Conaway, Editorial Director, and the A.D.A.M. Editorial team.

---

### 4. **Johns Hopkins Medicine**
- **Website**: https://www.hopkinsmedicine.org
- **Authority**: Academic medical institution
- **Content Used**: Reference for general surgical care standards
- **Last Accessed**: December 28, 2025

---

### 5. **National Institute of Arthritis and Musculoskeletal and Skin Diseases (NIAMS)**
- **Website**: https://www.niams.nih.gov
- **Authority**: Part of National Institutes of Health (NIH)
- **Content Used**: Reference for musculoskeletal disease management
- **Last Accessed**: December 28, 2025

---

## Guidelines by Surgery Type

### ACL Surgery Guidelines
**Sources**: Mayo Clinic, AAOS
- Pain management timelines
- Swelling expectations
- Mobility progression
- Infection prevention

### Knee Replacement Guidelines  
**Sources**: AAOS (primary source)
- Infection warning signs
- Blood clot prevention and detection
- Physical therapy protocols
- Swelling management
- Activity restrictions

### Hip Replacement Guidelines
**Sources**: AAOS
- Movement precautions (hip dislocation prevention)
- Post-operative care

### General Post-Surgery Guidelines
**Sources**: AAOS, MedlinePlus (NIH), Mayo Clinic
- Pain measurement and management
- Medication management
- Blood clot prevention
- Sleep and recovery
- Nutrition for healing
- Emotional health

---

## Medical Disclaimer

### From AAOS:
> "AAOS does not endorse any treatments, procedures, products, or physicians referenced herein. This information is provided as an educational service and is not intended to serve as medical advice. Anyone seeking specific orthopaedic advice or assistance should consult his or her orthopaedic surgeon."

### From Mayo Clinic:
> "© 1998-2025 Mayo Foundation for Medical Education and Research (MFMER). All rights reserved."

### From MedlinePlus:
> "The information provided herein should not be used during any medical emergency or for the diagnosis or treatment of any medical condition. A licensed medical professional should be consulted for diagnosis and treatment of any and all medical conditions."

---

## How Guidelines Are Used in the AI System

### RAG (Retrieval-Augmented Generation) Process:

1. **Patient asks a question**: 
   - Example: "Why is my knee so swollen?"

2. **System searches guidelines**: 
   - Keyword matching algorithm searches all guidelines
   - Prioritizes surgery-specific guidelines
   - Scores relevance based on keyword overlap

3. **Top guidelines retrieved**:
   - Typically 2-3 most relevant guidelines
   - Includes critical safety warnings if applicable
   - Guidelines include source citations

4. **AI generates response**:
   - GPT-3.5-turbo uses guidelines as context
   - Cites specific sources in response
   - Provides evidence-based advice
   - Maintains empathetic, conversational tone

5. **Patient receives**:
   - Accurate medical information
   - Source citations (e.g., "According to AAOS...")
   - Appropriate urgency level
   - Clear action steps

---

## Example Response with Citations

**Patient Question**: "Is it normal to have swelling 5 days after knee replacement?"

**AI Response**: 
> "Yes, swelling at day 5 is completely normal after knee replacement surgery. According to the American Academy of Orthopaedic Surgeons (AAOS), moderate to severe swelling is expected in the first few days to weeks, and mild to moderate swelling can persist for 3-6 months. To manage it, keep your leg elevated above heart level and apply ice packs. However, if you notice sudden increases in swelling, redness, or warmth, please contact your surgeon immediately as this could indicate a blood clot."

**Sources Cited**: AAOS guideline on post-knee replacement swelling management

---

## Updating Guidelines

### When to Update:
- New medical research published
- Updated recommendations from source institutions
- Changes in standard of care
- Addition of new surgery types

### How to Update:
1. Visit source websites (AAOS, Mayo Clinic, MedlinePlus)
2. Review latest peer-reviewed guidelines
3. Update `lib/medicalGuidelines.ts` with new information
4. Add source citations and URLs
5. Update this documentation with new references
6. Test RAG system to ensure proper retrieval

### Maintenance Schedule:
- **Quarterly reviews**: Check source websites for updates
- **Annual comprehensive review**: Review all guidelines against latest medical literature
- **As-needed updates**: When new surgery types are added to the system

---

## Compliance & Legal

### Medical Device Regulations:
This application provides **educational information** and **decision support**, not medical diagnosis or treatment. It does not replace the patient-physician relationship.

### Content Licensing:
- All content is used for educational and informational purposes
- Original sources retain all copyrights
- Application provides proper attribution to all sources
- Users are directed to consult with their own healthcare providers

### Privacy:
- Patient conversations are stored securely
- No patient data is shared with external guideline sources
- Guidelines are retrieved and processed locally

---

## Future Enhancements

### Planned Improvements:

1. **Vector Embeddings**
   - Use OpenAI embeddings for semantic search
   - Better matching of patient questions to guidelines
   - Understand intent beyond keywords

2. **Multilingual Guidelines**
   - French translations from Canadian/European sources
   - Maintain source accuracy in translation

3. **Additional Surgery Types**
   - Shoulder surgery (rotator cuff)
   - Spine surgery
   - Hip arthroscopy
   - Carpal tunnel release

4. **Dynamic Updates**
   - API integration with medical databases
   - Automated alerts for guideline updates
   - Version control for guidelines

5. **Personalization**
   - Track which guidelines patient has already seen
   - Progressive disclosure of information
   - Adjust detail level based on patient understanding

---

## Contact for Medical Concerns

**This AI system provides information only. For medical concerns:**

### Emergencies (Call 911):
- Severe bleeding
- Difficulty breathing
- Chest pain
- Signs of stroke
- Severe allergic reaction

### Urgent (Call Doctor Immediately):
- High fever (>100°F / 37.8°C)
- Severe pain not controlled by medication
- Signs of infection (redness, drainage, increasing pain)
- Signs of blood clot (calf pain, swelling, shortness of breath)

### Non-Urgent (Call During Office Hours):
- Questions about medications
- Pain management concerns
- Recovery timeline questions
- Physical therapy modifications

---

## References

1. American Academy of Orthopaedic Surgeons. (2025). *Activities After Total Knee Replacement*. OrthoInfo. Retrieved December 28, 2025, from https://orthoinfo.aaos.org/en/recovery/activities-after-knee-replacement/

2. Mayo Clinic Staff. (2022). *ACL Injury*. Mayo Clinic. Retrieved December 28, 2025, from https://www.mayoclinic.org/diseases-conditions/acl-injury/symptoms-causes/syc-20350738

3. Brodkey, F. D., MD, FCCM. (2024). *Palliative Care - Managing Pain*. MedlinePlus Medical Encyclopedia. U.S. National Library of Medicine. Retrieved December 28, 2025, from https://medlineplus.gov/ency/patientinstructions/000532.htm

4. National Institute of Arthritis and Musculoskeletal and Skin Diseases. (2025). *Joint Replacement Surgery*. NIAMS. Retrieved December 28, 2025, from https://www.niams.nih.gov/health-topics/joint-replacement-surgery

---

**Last Updated**: December 28, 2025  
**Next Review Date**: March 28, 2026
