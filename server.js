const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));

// ENVIRONMENT VARIABLES
const API_KEY = process.env.API_KEY || '';
const PHONE_NUMBER_ID = process.env.PHONE_NUMBER_ID || '';
const WEBHOOK_VERIFY_TOKEN = process.env.WEBHOOK_VERIFY_TOKEN || 'cornerstone2024';
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || '';
const WHATSAPP_API = 'https://waba-v2.360dialog.io';

// ============================================================
// JSON FILE DATABASE
// ============================================================
const DB_FILE = path.join(__dirname, 'database.json');

function loadDB() {
  if (fs.existsSync(DB_FILE)) {
    try { return JSON.parse(fs.readFileSync(DB_FILE, 'utf8')); } catch(e) {}
  }
  return createDefaultDB();
}

function saveDB() {
  fs.writeFileSync(DB_FILE, JSON.stringify(DB, null, 2));
}

function createDefaultDB() {
  return {
    courses: [
      { id: 1, title: 'Entrepreneurship Training Online Short Course', category: 'Business', price: 'R4,500', duration: '6 months', description: 'Whether starting a business, launching a new division, or seeking to invest in new ventures, entrepreneurship and business management skills are vital to success. Integrates multiple core modules to prepare students for the real world of entrepreneurship. Advanced Certificate.', format: 'Online', certification: 'Advanced Certificate', status: 'published' },
      { id: 2, title: 'Health and Safety in the Workplace', category: 'Health & Safety', price: 'R2,500', duration: '3 months', description: 'Equips you with skills to ensure legal compliance and create a safe, productive working environment. Covers NLP, Emotional Intelligence, Safety Procedure Manual, Workplace Safety & Ergonomics, and core OHS principles. Advanced Certificate.', format: 'Online', certification: 'Advanced Certificate', status: 'published' },
      { id: 3, title: 'Health and Safety Online Short Course', category: 'Health & Safety', price: 'R1,300', duration: '3 weeks', description: 'A 3-week online certificate course giving you the foundation to build a safety culture. Covers defining safety culture, identifying hazards, writing a safety plan, incident management, and reviewing the programme.', format: 'Online', certification: 'Certificate', status: 'published' },
      { id: 4, title: 'Human Resources Management', category: 'HR', price: 'R4,500', duration: '6 months', description: 'Equips HR professionals to attract, hire, train, and retain top talent while managing performance, grievances, and workplace wellness. 17 comprehensive modules covering people & leadership, business & process, workplace & digital skills.', format: 'Online', certification: 'Advanced Certificate', status: 'published' },
      { id: 5, title: 'Logistics and Supply Chain Management', category: 'Business', price: 'R4,500', duration: '6 months', description: 'Master core concepts of supply chain management including flow, core models, supply chain drivers, key metrics, benchmarking techniques. Covers Plan, Source, Deliver, and Return. Advanced Certificate.', format: 'Online', certification: 'Advanced Certificate', status: 'published' },
      { id: 6, title: 'Medical Call Centre Training', category: 'Healthcare', price: 'R3,500', duration: '3 months', description: 'Equips individuals with skills to effectively handle calls and inquiries in a healthcare setting. Covers medical terminology, communication skills, confidentiality, emergency management, call management, and legal & ethical obligations.', format: 'Online', certification: 'Certificate', status: 'published' },
      { id: 7, title: 'National Certificate Financial Markets and Instruments NQF 6', category: 'Finance', price: 'R22,000', duration: '12 months', description: 'One-year online qualification (SAQA ID: 50481, 120 Credits, NQF Level 6). Develops competent professionals who can analyse and make informed decisions in the financial landscape. Covers investment decisions, company analysis, debt market, market trends, cash flow analysis, and risk management.', format: 'Online', certification: 'National Certificate NQF 6', status: 'published' },
      { id: 8, title: 'Online Advanced Business Administration', category: 'Business', price: 'R4,500', duration: '6 months', description: 'Teaches essential administrative duties, business operations, processes, and customer service basics. 15 modules spanning leadership, finance, technology, and core business skills. Advanced Certificate.', format: 'Online', certification: 'Advanced Certificate', status: 'published' },
      { id: 9, title: 'Professional Receptionist Online Short Course', category: 'Business', price: 'R4,500', duration: '6 months', description: 'Launch your career in business administration, customer service, and office management. 16 comprehensive modules including business foundations, communication & relations, service & marketing, and Microsoft Office Suite.', format: 'Online', certification: 'Advanced Certificate', status: 'published' },
      { id: 10, title: 'RE 5 Regulatory Examination Preparation (Online)', category: 'Finance', price: 'R1,000', duration: '6 weeks', description: 'Online preparation for the RE 5 Regulatory Examination, mandatory for financial services providers in South Africa. Covers all 10 RE 5 modules via live facilitator-led sessions. Full upfront payment required.', format: 'Online', certification: 'Certificate of Completion', status: 'published' },
      { id: 13, title: 'RE 5 Regulatory Examination Preparation (Face-to-Face)', category: 'Finance', price: 'R1,500', duration: '6 weeks', description: 'Face-to-face preparation for the RE 5 Regulatory Examination at our Randburg headquarters. Attends every Monday for 6 weeks. Includes everything from the online programme plus in-person instruction. Full upfront payment required.', format: 'Face-to-Face', certification: 'Certificate of Completion', status: 'published' },
      { id: 11, title: 'Risk Management Training Programme', category: 'Business', price: 'R6,000', duration: '3 weeks', description: 'Aligned to SAQA ID 252025. Prepares you to identify, assess, and manage risk within your unit. Grounded in ISO 31000 and COSO internationally recognised standards. Certificate of Competence.', format: 'Online & Face-to-Face', certification: 'Certificate of Competence', status: 'published' },
      { id: 12, title: 'National Certificate Banking NQF 5', category: 'Banking', price: 'R12,000', duration: '12 months', description: '120-credit qualification (SAQA ID: 20186, NQF Level 5). Gateway to commercial banks, consumer lending institutions, cooperative financial organizations, and government regulatory departments. Six core modules. BankSETA Accredited.', format: 'Online', certification: 'National Certificate NQF 5', status: 'published' }
    ],
    students: [],
    conversations: [],
    messages: [],
    enrollments: [],
    brochures: [],
    leads: [],
    settings: {
      companyName: 'Cornerstone Supreme Education',
      companyPhone: '0718374853',
      officePhone: '087 152 0606',
      companyWebsite: 'https://www.cornerstonehr.co.za',
      companyEmail: 'info@cornerstonehr.co.za',
      brochureUrl: 'https://www.cornerstonehr.co.za',
      bankName: 'FNB',
      accountName: 'Cornerstone Supreme',
      accountNumber: '62653109283',
      branchCode: '261750',
      swiftCode: 'FIRNZAJJ'
    },
    context: {},
    _nextId: { courses: 14, students: 1, conversations: 1, messages: 1, enrollments: 1, brochures: 1, leads: 1 }
  };
}

const DB = loadDB();

function nextId(table) {
  if (!DB._nextId[table]) DB._nextId[table] = 1;
  return DB._nextId[table]++;
}

process.on('exit', () => saveDB());
process.on('SIGINT', () => { saveDB(); process.exit(0); });
process.on('SIGTERM', () => { saveDB(); process.exit(0); });
setInterval(saveDB, 30000);

console.log('Database loaded. Courses:', DB.courses.length);

// ============================================================
// tRPC HELPER
// ============================================================
function trpc(data) {
  return { result: { data: { json: data } } };
}

function parseInput(req) {
  return req.body?.json || req.body || {};
}

// ============================================================
// COURSE HELPERS
// ============================================================
function getCourseByTitle(title) {
  const lower = title.toLowerCase();
  return DB.courses.find(c => c.status === 'published' && c.title.toLowerCase().includes(lower));
}

function getContext(phone) {
  if (!DB.context[phone]) {
    DB.context[phone] = { last_intent: '', last_course_mentioned: '', message_history: [], stage: 'greeting', lead_info: {} };
  }
  return DB.context[phone];
}

function updateContext(phone, intent, courseMentioned, studentMessage, leratoReply) {
  const ctx = getContext(phone);
  ctx.last_intent = intent;
  if (courseMentioned) ctx.last_course_mentioned = courseMentioned;
  ctx.message_history.push({ role: 'student', msg: studentMessage, time: new Date().toISOString() });
  ctx.message_history.push({ role: 'lerato', msg: leratoReply, time: new Date().toISOString() });
  if (ctx.message_history.length > 20) ctx.message_history = ctx.message_history.slice(-20);
  saveDB();
}

// ============================================================
// DYNAMIC INTAKE DATE CALCULATOR
// ============================================================
function getIntakeInfo() {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const monthNames = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  
  let earlyIntake = null;
  for (let d = 1; d <= 5; d++) {
    const date = new Date(year, month, d);
    if (date.getDay() === 1) { earlyIntake = date; break; }
  }
  
  let lateIntake = null;
  const lastDay = new Date(year, month + 1, 0).getDate();
  for (let d = 24; d <= lastDay; d++) {
    const date = new Date(year, month, d);
    if (date.getDay() === 1) { lateIntake = date; break; }
  }
  
  let nextMonthIntake = null;
  for (let d = 1; d <= 5; d++) {
    const date = new Date(year, month + 1, d);
    if (date.getDay() === 1) { nextMonthIntake = date; break; }
  }
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  let currentIntake = null;
  let currentIntakeLabel = '';
  let urgencyMessage = '';
  
  if (earlyIntake) {
    const earlyDate = new Date(earlyIntake);
    earlyDate.setHours(0, 0, 0, 0);
    if (earlyDate >= today) {
      currentIntake = earlyIntake;
      currentIntakeLabel = `Monday, ${earlyIntake.getDate()} ${monthNames[earlyIntake.getMonth()]} ${earlyIntake.getFullYear()}`;
      const daysUntil = Math.ceil((earlyIntake - today) / (1000 * 60 * 60 * 24));
      if (daysUntil <= 7) {
        urgencyMessage = `Our next intake is coming up very soon — ${currentIntakeLabel}. Spaces are limited, so I'd recommend securing your spot today to avoid missing out.`;
      } else {
        urgencyMessage = `We have an upcoming intake on ${currentIntakeLabel}. It's a great time to register and get your study materials ready.`;
      }
    }
  }
  
  if (!currentIntake && lateIntake) {
    const lateDate = new Date(lateIntake);
    lateDate.setHours(0, 0, 0, 0);
    if (lateDate >= today) {
      currentIntake = lateIntake;
      currentIntakeLabel = `Monday, ${lateIntake.getDate()} ${monthNames[lateIntake.getMonth()]} ${lateIntake.getFullYear()}`;
      const daysUntil = Math.ceil((lateIntake - today) / (1000 * 60 * 60 * 24));
      if (daysUntil <= 7) {
        urgencyMessage = `Our next intake is coming up very soon — ${currentIntakeLabel}. Spaces are filling up, so I'd recommend registering now to secure your place.`;
      } else {
        urgencyMessage = `Our next intake is on ${currentIntakeLabel}. Registering now gives you plenty of time to get everything sorted before classes begin.`;
      }
    }
  }
  
  if (!currentIntake && nextMonthIntake) {
    currentIntake = nextMonthIntake;
    currentIntakeLabel = `Monday, ${nextMonthIntake.getDate()} ${monthNames[nextMonthIntake.getMonth()]} ${nextMonthIntake.getFullYear()}`;
    urgencyMessage = `Our next intake is on ${currentIntakeLabel}. Registering now means you'll be all set to start fresh — and you won't miss this opportunity.`;
  }
  
  return { currentIntake, currentIntakeLabel, urgencyMessage, earlyIntakeLabel: earlyIntake ? `${earlyIntake.getDate()} ${monthNames[earlyIntake.getMonth()]}` : null, lateIntakeLabel: lateIntake ? `${lateIntake.getDate()} ${monthNames[lateIntake.getMonth()]}` : null };
}

// ============================================================
// LEAD INFO EXTRACTION
// ============================================================
function extractLeadInfo(phone, message) {
  const ctx = getContext(phone);
  if (!ctx.lead_info) ctx.lead_info = {};
  
  const namePatterns = [
    /(?:my name is|i am|i'm|call me|this is)\s+([A-Za-z\s]+?)(?:\.|,|$|\n|\d)/i,
    /(?:full name|name and surname)\s*:?\s*([A-Za-z\s]+?)(?:\.|,|$|\n|\d)/i
  ];
  for (const p of namePatterns) {
    const m = message.match(p);
    if (m && m[1] && m[1].trim().length > 2) { ctx.lead_info.fullName = m[1].trim(); break; }
  }
  
  const emailMatch = message.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  if (emailMatch) ctx.lead_info.email = emailMatch[0];
  
  const phonePatterns = [
    /(?:alternative|other|contact|cell|phone|number|reach me).*?(?:is|:)?\s*(\d[\d\s]{8,})/i,
    /(?:\+?27|0)[\s\d]{9,}/
  ];
  for (const p of phonePatterns) {
    const m = message.match(p);
    if (m) {
      const num = m[1] || m[0];
      if (num && num.replace(/\D/g, '').length >= 9) { ctx.lead_info.altPhone = num.trim(); break; }
    }
  }
  
  const dobPatterns = [
    /(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4})/,
    /(?:dob|date of birth|born).*?(?:is|:)?\s*(\d{1,2}[\s\/\-\.]+[A-Za-z]+[\s\/\-\.]+\d{2,4})/i,
    /(?:dob|date of birth|born).*?(?:is|:)?\s*(\d{1,2}[\s\/\-\.]+\d{1,2}[\s\/\-\.]+\d{2,4})/i
  ];
  for (const p of dobPatterns) {
    const m = message.match(p);
    if (m && m[1]) { ctx.lead_info.dateOfBirth = m[1]; break; }
  }
  
  if (Object.keys(ctx.lead_info).length > 0) saveDB();
  return ctx.lead_info;
}

function saveLead(phone, leadInfo, courseInterest) {
  if (!leadInfo || !leadInfo.fullName) return;
  const existing = DB.leads.find(l => l.phone === phone);
  if (existing) {
    Object.assign(existing.leadInfo, leadInfo);
    if (courseInterest) existing.courseInterest = courseInterest;
    existing.updated_at = new Date().toISOString();
  } else {
    DB.leads.push({ id: nextId('leads'), phone, leadInfo: { ...leadInfo }, courseInterest: courseInterest || '', status: 'qualified', source: 'whatsapp', created_at: new Date().toISOString(), updated_at: new Date().toISOString() });
  }
  saveDB();
}
// ============================================================
// LERATO AI — OpenAI-Powered Consultative Sales Agent
// ============================================================
function buildSystemPrompt() {
  const intake = getIntakeInfo();
  
  return `You are Lerato, a warm, professional, and highly skilled Course Advisor at Cornerstone Supreme Education in South Africa. You are NOT an AI — you are a real human sales consultant named Lerato who works for the company. You are speaking to a prospective student on WhatsApp.

## YOUR PERSONALITY
- Warm, friendly, and genuinely human — NOT robotic
- Conversational but always professional
- You are a consultative sales advisor — you guide, not push
- You speak the student's language (English, Afrikaans, or Zulu)
- Keep responses concise (WhatsApp-friendly, 2-4 short paragraphs max)
- NEVER say "I'm an AI", "I'm a bot", "virtual assistant", or "automated" — you are Lerato, a real course advisor
- NEVER repeat the same information twice in one conversation
- Always ask a follow-up question to keep the conversation moving forward

## CONTACT INFORMATION
- WhatsApp: 0718374853
- Office Line: 087 152 0606
- Email: info@cornerstonehr.co.za
- Website: https://www.cornerstonehr.co.za

## PHYSICAL ADDRESS
Cornerstone Supreme (Pty) Ltd
367 Surrey Avenue, Block B
Ground Floor, Ferdale
Randburg, 2125
Johannesburg

## COURSES YOU OFFER (with pricing in South African Rand)
1. Entrepreneurship Training Online Short Course — R4,500 — 6 months — Advanced Certificate
2. Health and Safety in the Workplace — R2,500 — 3 months — Advanced Certificate
3. Health and Safety Online Short Course — R1,300 — 3 weeks — Certificate
4. Human Resources Management — R4,500 — 6 months — Advanced Certificate
5. Logistics and Supply Chain Management — R4,500 — 6 months — Advanced Certificate
6. Medical Call Centre Training — R3,500 — 3 months — Certificate
7. National Certificate Financial Markets and Instruments NQF 6 — R22,000 — 12 months — National Certificate
8. Online Advanced Business Administration — R4,500 — 6 months — Advanced Certificate
9. Professional Receptionist Online Short Course — R4,500 — 6 months — Advanced Certificate
10. RE 5 Regulatory Examination Preparation (Online) — R1,000 — 6 weeks — Certificate of Completion
11. RE 5 Regulatory Examination Preparation (Face-to-Face) — R1,500 — 6 weeks — Certificate of Completion
12. Risk Management Training Programme — R6,000 — 3 weeks — Certificate of Competence
13. National Certificate Banking NQF 5 — R12,000 — 12 months — National Certificate (BankSETA Accredited)

## RE 5 REGULATORY EXAMINATION PREPARATION — SPECIAL DETAILED INFORMATION
The RE 5 is a **mandatory legal requirement** for all financial services providers in South Africa. Without it, you cannot legally operate in the financial services industry. This is a powerful motivator — lead with the problem.

### TWO LEARNING OPTIONS:

**Option A — Online Preparation: R1,000**
• Face-to-face and online blended learning experience
• Full coverage of all 10 RE 5 modules
• Live facilitator-led training sessions
• Access to experienced instructors throughout the programme
• Comprehensive study guides and practice examinations
• Web pocket quick learning platform
• Podcasts and revision support material
• Pre-recorded video course explainers
• Mock examinations under exam conditions
• Topic-based questions and activities
• 24/7 access to recorded sessions

**Option B — Face-to-Face Preparation: R1,500**
• **Includes everything the online learner gets**
• Plus: Attends every Monday for 6 weeks at our headquarters
• In-person instruction at: 367 Surrey Avenue, Ground Floor, Block B, Randburg

### RE 5 EXAM PROCESS (IMPORTANT — TELL EVERY PROSPECT):
After completing the 6-week preparation with Cornerstone Supreme, the learner must **book independently at Moonstone** to write the official RE 5 examination. Cornerstone prepares you thoroughly — Moonstone administers the exam.

Step 1: Complete your 6-week preparation with us
Step 2: Book your exam directly at Moonstone (we'll guide you on how)
Step 3: Write the exam and get certified

### RE 5 PAYMENT RULES (STRICT):
• **Full upfront payment only** — NO instalments
• Payment via EFT or at the office only
• **NO e-commerce payment on the website**
• Must be paid in full before the starting day
• Banking details: FNB, Account Name: Cornerstone Supreme, Account: 62653109283, Branch: 261750, SWIFT: FIRNZAJJ, Reference: Your Name
• Proof of payment to: info@cornerstonehr.co.za

### RE 5 SALES CLOSING FRAMEWORK — FOLLOW THIS FOR RE 5 ENQUIRIES:
0. **Lead with the Problem** — Highlight the legal requirement. Without RE 5, they cannot legally work in financial services. Use fear of missing out.
1. **Focus on Benefits, Not Features** — Don't just list modules. Explain how each element helps them pass the exam and advance their career.
2. **Use Social Proof** — Mention "hundreds of successful candidates" who have passed through Cornerstone Supreme.
3. **Create Urgency** — Limited spaces per intake. This month intakes are on the 22nd and 29th.
4. **Keep it Scannable** — Use bullet points, emojis, and short paragraphs.
5. **Include All Contact Methods** — Phone, WhatsApp, and physical address for credibility.

### RE 5 INTAKE DATES (THIS MONTH):
• 22nd of this month
• 29th of this month
Learner should decide which date suits them. Payment must be made in full upfront before the starting day.

## WEBSITE AND LMS ACCESS
• Main Website: www.cornerstonehr.co.za
• LMS Login (study kit): www.cornerstonehr.co.za/lms
• Alternative LMS: www.cornerstonehr.co.za/learn

## CURRENT INTAKE INFORMATION (AUTOMATICALLY UPDATED)
${intake.urgencyMessage}

When discussing intakes:
- ALWAYS present the current intake as the relevant registration opportunity
- Create a sense of urgency — spaces are limited
- Guide prospects toward securing their place NOW
- Do NOT mention that bookings happen every month
- Do NOT reveal the full intake schedule
- Focus on the current intake period only
- Use phrases like "our upcoming intake", "the next available intake", "register now to secure your spot"

## BANKING DETAILS
Bank: FNB | Account Name: Cornerstone Supreme | Account Number: 62653109283 | Branch Code: 261750 | SWIFT Code: FIRNZAJJ (for international payments)
Reference: Your Name
Send proof of payment to info@cornerstonehr.co.za

## PAYMENT OPTIONS
- Full payment (5% discount)
- Monthly installments
- Employer-sponsored
- EFT or direct deposit

## SALES AND CLIENT ENGAGEMENT FRAMEWORK — FOLLOW THIS STRICTLY

### STEP 1: GREETING
Professionally greet the prospect. Be warm and welcoming.

### STEP 2: INTRODUCTION
Introduce yourself on behalf of Cornerstone Supreme Education. Example: "My name is Lerato, and I'm a course advisor at Cornerstone Supreme Education."

### STEP 3: NEEDS DISCOVERY
Ask the prospect about the reason for their enquiry. Understand their:
- Goals and career aspirations
- Interests and preferred field
- Training needs and current situation

Use questions like:
- "What brings you to Cornerstone Supreme today?"
- "What field are you looking to build your career in?"
- "Are you looking to upskill, change careers, or start fresh?"

### STEP 4: OFFER ASSISTANCE
Provide relevant information and guidance based on the prospect's needs. Match them to the right course(s).

### STEP 5: QUESTION-BASED SELLING
Use effective questioning techniques to:
- Identify motivations and build interest
- Highlight the benefits and value of the programmes
- Address concerns and guide the prospect toward a registration decision

Key benefit areas to highlight:
- Industry-recognized certifications
- Flexible online learning
- SAQA-registered and BankSETA-accredited qualifications
- Skills portfolio and reference letter on completion
- Upcoming intake with limited spaces

### STEP 6: LEAD QUALIFICATION — COLLECT THIS INFORMATION
When a prospect shows interest, collect the following:
1. Full Name and Surname
2. Date of Birth
3. Email Address
4. Alternative Contact Number

Collect this information naturally through conversation — don't make it feel like a form. Ask one or two details at a time.

### STEP 7: CLOSING THE OPPORTUNITY
Reassure the prospect that management will send the necessary registration documents, including:
- Registration Form
- Invoice
- Any additional enrolment documentation required to complete the registration process

Example close: "Thank you so much for sharing those details with me, [Name]. I'll pass everything along to our management team, and they will send you the registration form and invoice shortly. In the meantime, do you have any other questions I can help you with?"

## GENERAL INFO
- All courses are online via live virtual sessions (except RE 5 Face-to-Face which is at our Randburg office)
- Study from anywhere in South Africa
- Requirements: Matric certificate + basic computer literacy
- Certifications are industry-recognized, aligned with NQF standards
- Recorded sessions available for revision
- Website: www.cornerstonehr.co.za
- LMS Access (for study materials): www.cornerstonehr.co.za/lms or www.cornerstonehr.co.za/learn

## CONVERSATION RULES
- ALWAYS follow the Sales Framework: Greet → Intro → Needs Discovery → Assist → Question-Based Selling → Lead Qualification → Close
- If the student asks about a specific course, give details AND ask a follow-up question
- If they ask about pricing, give the price AND mention payment options
- If they ask about duration, give it AND mention the format
- If they ask about next intake, present the CURRENT intake with urgency. Encourage immediate registration
- If they're interested, move naturally to collecting their details (Lead Qualification)
- Don't overwhelm with info — answer what they asked, then ask what else they want to know
- Always be persuasive, helpful, and client-focused`;
}

async function generateAIResponse(studentMsg, phone) {
  const ctx = getContext(phone);
  const messages = [{ role: 'system', content: buildSystemPrompt() }];
  
  const recentHistory = ctx.message_history.slice(-10);
  for (const msg of recentHistory) {
    messages.push({ role: msg.role === 'student' ? 'user' : 'assistant', content: msg.msg });
  }
  messages.push({ role: 'user', content: studentMsg });
  
  const leadInfo = extractLeadInfo(phone, studentMsg);
  const courseInterest = extractCourseMention(studentMsg);
  if (leadInfo.fullName && (leadInfo.email || leadInfo.altPhone)) {
    saveLead(phone, leadInfo, courseInterest);
  }
  
  if (!OPENAI_API_KEY) return fallbackResponse(studentMsg, phone);
  
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${OPENAI_API_KEY}` },
      body: JSON.stringify({ model: 'gpt-4o-mini', messages, temperature: 0.7, max_tokens: 500 })
    });
    
    if (!response.ok) {
      console.error('OpenAI error:', response.status);
      return fallbackResponse(studentMsg, phone);
    }
    
    const data = await response.json();
    const aiReply = data.choices?.[0]?.message?.content?.trim();
    if (!aiReply) return fallbackResponse(studentMsg, phone);
    
    const intent = detectIntent(studentMsg);
    const lang = detectLanguage(studentMsg);
    updateContext(phone, intent, courseInterest, studentMsg, aiReply);
    return { response: aiReply, intent, lang };
    
  } catch (err) {
    console.error('OpenAI error:', err.message);
    return fallbackResponse(studentMsg, phone);
  }
}

function detectIntent(msg) {
  const lower = msg.toLowerCase();
  if (/\b(hi|hello|hey|sawubona|hallo|good morning|good afternoon|good evening)\b/.test(lower)) return 'greeting';
  if (/\b(price|cost|how much|fee|r\d|rand)\b/.test(lower)) return 'pricing';
  if (/\b(payment|pay|installment|deposit|eft|transfer|banking details|bank details)\b/.test(lower) && !/\b(enroll|register|sign up|apply)\b/.test(lower)) return 'payment_details';
  if (/\b(enroll|register|sign up|apply|registration)\b/.test(lower)) return 'enrollment';
  if (/\b(brochure|catalog|pdf|send me|download)\b/.test(lower)) return 'brochure';
  if (/\b(course|learn|study|training|qualification|programme)\b/.test(lower)) return 'courses';
  if (/\b(thank|thanks)\b/.test(lower)) return 'thanks';
  if (/\b(bye|goodbye)\b/.test(lower)) return 'goodbye';
  if (/\b(my name is|i am|i'm|call me|full name|surname|date of birth|dob|email|alternative number|contact number|you can reach me)\b/.test(lower)) return 'lead_info';
  if (/\b(intake|start date|when does it start|next class|begin|commence)\b/.test(lower)) return 'intake_dates';
  if (/\b(contact|phone|number|call|reach|office)\b/.test(lower)) return 'contact';
  return 'general';
}

function detectLanguage(msg) {
  const lower = msg.toLowerCase();
  if (/\b(dankie|hoeveel|kursus|leer|ja|nee|goeie|more|middag)\b/.test(lower)) return 'af';
  if (/\b(ngiyabonga|kanjani|isifundo|funda|yebo|cha|sawubona|sanibonani)\b/.test(lower)) return 'zu';
  return 'en';
}

function extractCourseMention(msg) {
  const lower = msg.toLowerCase();
  for (const c of DB.courses) {
    if (lower.includes(c.title.toLowerCase())) return c.title;
  }
  const keywords = {
    'entrepreneurship': 'Entrepreneurship Training Online Short Course',
    'hr': 'Human Resources Management',
    'human resource': 'Human Resources Management',
    'health and safety': 'Health and Safety in the Workplace',
    'logistics': 'Logistics and Supply Chain Management',
    'supply chain': 'Logistics and Supply Chain Management',
    'medical call': 'Medical Call Centre Training',
    'call centre': 'Medical Call Centre Training',
    'financial markets': 'National Certificate Financial Markets and Instruments NQF 6',
    'business admin': 'Online Advanced Business Administration',
    'receptionist': 'Professional Receptionist Online Short Course',
    're 5': 'RE 5 Regulatory Examination Preparation (Online)',
    're5': 'RE 5 Regulatory Examination Preparation (Online)',
    're5 online': 'RE 5 Regulatory Examination Preparation (Online)',
    're5 face': 'RE 5 Regulatory Examination Preparation (Face-to-Face)',
    're 5 face': 'RE 5 Regulatory Examination Preparation (Face-to-Face)',
    'regulatory exam': 'RE 5 Regulatory Examination Preparation (Online)',
    'risk management': 'Risk Management Training Programme',
    'banking': 'National Certificate Banking NQF 5'
  };
  for (const [kw, course] of Object.entries(keywords)) {
    if (lower.includes(kw)) return course;
  }
  return '';
}
// ============================================================
// FALLBACK RESPONSES — Consultative Sales Framework
// ============================================================
function fallbackResponse(studentMsg, phone) {
  const lower = studentMsg.toLowerCase().trim();
  const lang = detectLanguage(studentMsg);
  const ctx = getContext(phone);
  const relevantCourse = getCourseByTitle(studentMsg);
  const intent = detectIntent(studentMsg);
  const courseInterest = extractCourseMention(studentMsg);
  const intake = getIntakeInfo();
  const leadInfo = extractLeadInfo(phone, studentMsg);
  let response = '';

  switch(intent) {
    case 'greeting':
      response = `Hello there! 👋 Welcome to Cornerstone Supreme Education.

My name is Lerato, and I'm a course advisor here. It's lovely to hear from you!

May I ask what brings you to us today? Are you looking to upskill in your current field, start a new career, or perhaps explore professional qualifications? I'd love to help you find the right path. 😊`;
      ctx.stage = 'needs_discovery';
      break;

    case 'thanks':
      response = `You're very welcome! It's been a pleasure chatting with you. 

If you think of any other questions, just send me a message — I'm always here to help. Have a wonderful day! 🌟`;
      break;

    case 'goodbye':
      response = `Goodbye for now! Thank you for considering Cornerstone Supreme Education. 

Feel free to reach out on WhatsApp (0718374853) or give our office a call on 087 152 0606 whenever you're ready. Take care! 👋`;
      break;

    case 'lead_info':
      if (leadInfo.fullName || leadInfo.email || leadInfo.altPhone || leadInfo.dateOfBirth) {
        saveLead(phone, leadInfo, courseInterest);
        const missing = [];
        if (!leadInfo.fullName) missing.push('your full name and surname');
        if (!leadInfo.dateOfBirth) missing.push('your date of birth');
        if (!leadInfo.email) missing.push('your email address');
        if (!leadInfo.altPhone) missing.push('an alternative contact number');
        
        if (missing.length === 0) {
          response = `Perfect! Thank you so much for providing all your details, ${leadInfo.fullName || 'there'}. 

I'll pass everything along to our management team right away, and they will send you:
📋 The Registration Form
🧾 The Invoice  
📎 Any additional enrolment documentation you need

This will be sent to ${leadInfo.email || 'your email'} shortly. In the meantime, do you have any other questions I can help you with? 😊`;
          ctx.stage = 'closed';
        } else if (missing.length <= 2 && (leadInfo.fullName && leadInfo.email)) {
          response = `Thank you, ${leadInfo.fullName}! I have most of your details. Just to complete everything, could you also share ${missing.join(' and ')}?

Once I have that, our management team will send your registration form and invoice directly to you.`;
        } else {
          response = `Thank you for that! To get your registration processed smoothly, could you also share ${missing.join(', ')}?

This helps our management team prepare your registration pack with everything you need.`;
        }
      } else {
        response = `Thank you for getting in touch! To help me assist you better, could you share a bit more about yourself?

• Your full name and surname
• What field or career you're interested in
• Whether you're looking to study online while working

This will help me recommend the best programme for your goals. 😊`;
      }
      break;

    case 'pricing':
      if (relevantCourse) {
        response = `The ${relevantCourse.title} is ${relevantCourse.price} for the full ${relevantCourse.duration} programme.

We offer flexible payment options to make it easier:
💳 Pay in full upfront and receive a 5% discount
📅 Spread the cost with monthly installments
🏢 Employer-sponsored (your company pays)

Which payment option would work best for you? And would you like me to help you get the registration process started?`;
      } else {
        response = `Our courses range from R1,300 to R22,000 depending on the programme and level.

Here's a quick overview:
• Short Certificate Courses: R1,300 – R3,500
• Advanced Certificate Programmes: R4,500
• Specialist Programmes: R6,000
• National Certificate Banking NQF 5: R12,000
• National Certificate Financial Markets NQF 6: R22,000

We also offer a 5% discount for full upfront payment, plus monthly installment options.

${intake.urgencyMessage}

Which area interests you — Finance, Business & HR, or Healthcare? I can give you exact pricing for specific courses. 😊`;
      }
      break;

    case 'courses':
      response = `Great question! We have a wide range of professional programmes. Here's what we offer:

📊 **Finance & Banking**
• RE 5 Exam Prep — R1,500 (6 weeks)
• National Certificate Banking NQF 5 — R12,000 (12 months) — BankSETA Accredited
• Financial Markets NQF 6 — R22,000 (12 months)

👔 **Business & HR**
• Entrepreneurship — R4,500 (6 months)
• HR Management — R4,500 (6 months)
• Business Administration — R4,500 (6 months)
• Professional Receptionist — R4,500 (6 months)
• Logistics & Supply Chain — R4,500 (6 months)

🏥 **Healthcare & Safety**
• Medical Call Centre — R3,500 (3 months)
• Health & Safety — R2,500 (3 months) / R1,300 (3 weeks)
• Risk Management — R6,000 (3 weeks)

${intake.urgencyMessage}

All our certifications are industry-recognised and SAQA-aligned. Which field are you most drawn to? 😊`;
      break;

    case 'enrollment':
      if (relevantCourse) {
        response = `Excellent choice! The ${relevantCourse.title} is a fantastic programme. Here's how to get started:

${intake.urgencyMessage}

To register, simply:
1️⃣ Visit https://www.cornerstonehr.co.za and click "Enrol Now"
2️⃣ Fill in your details
3️⃣ Choose your preferred payment option
4️⃣ Our team will send you confirmation within 24 hours

Or, to make it even easier, I can pass your details directly to our management team and they'll send you the registration form and invoice. 

Could you share with me:
• Your full name and surname
• Your email address
• An alternative contact number

This way we can get everything prepared for you right away!`;
      } else {
        response = `I'd love to help you get enrolled! Here's how it works:

${intake.urgencyMessage}

1️⃣ Visit https://www.cornerstonehr.co.za and select your course
2️⃣ Click "Enrol Now" and fill in your details
3️⃣ Choose your payment option (full payment = 5% discount, or monthly installments)
4️⃣ You'll receive confirmation within 24 hours

Or, if you'd like, I can have our management team send the registration documents directly to you. Just share:
• Your full name and surname
• Which course you're interested in
• Your email address

Which course has caught your eye?`;
      }
      ctx.stage = 'lead_collection';
      break;

    case 'brochure':
      response = `Absolutely! You can view all our course details on our website:
https://www.cornerstonehr.co.za

But honestly, if you tell me which area you're interested in — Finance, Business & HR, or Healthcare — I can give you all the details right here, including pricing, duration, certification, and career prospects. It might save you some time!

${intake.urgencyMessage}

What field are you looking at?`;
      break;

    case 'payment_details':
      response = `Great question! We have flexible payment options to suit your budget:

💳 **Full Payment** — Pay upfront and get a **5% discount**
📅 **Monthly Installments** — Spread the cost over the duration of your course
🏢 **Employer-Sponsored** — Your company pays on your behalf

Our banking details for EFT or direct deposit:

🏦 Bank: FNB
📋 Account Name: Cornerstone Supreme
📋 Account Number: 62653109283
📋 Branch Code: 261750
📋 SWIFT Code: FIRNZAJJ (for international payments)
📝 Reference: Your Name

Once you've paid, email your proof of payment to info@cornerstonehr.co.za

${intake.urgencyMessage}

Would you like me to help you choose a course, or do you have other questions? 😊`;
      break;

    case 'intake_dates':
      response = `${intake.urgencyMessage}

I'd really encourage you to register as soon as possible so we can secure your spot and get your study materials prepared. Would you like me to help you get the registration process started? 

I can have our management team send you the registration form and invoice directly. Just share your full name, email, and which course you're interested in, and we'll take care of the rest! 😊`;
      break;

    case 'contact':
      response = `You can reach us in a few ways:

📱 WhatsApp: 0718374853
☎️ Office Line: 087 152 0606
📧 Email: info@cornerstonehr.co.za
🌐 Website: https://www.cornerstonehr.co.za

📍 Our Office:
Cornerstone Supreme (Pty) Ltd
367 Surrey Avenue, Block B
Ground Floor, Ferdale
Randburg, 2125
Johannesburg

Is there something specific I can help you with right now? 😊`;
      break;

    default:
      if (/\b(pay|payment|installment|deposit|eft|transfer)\b/.test(lower)) {
        response = `We have flexible payment options:

💳 **Full Payment** — 5% discount
📅 **Monthly Installments** — Spread the cost
🏢 **Employer-Sponsored** — Company pays

🏦 Bank: FNB
📋 Account Name: Cornerstone Supreme
📋 Account Number: 62653109283
📋 Branch Code: 261750
📋 SWIFT Code: FIRNZAJJ (for international payments)
📝 Reference: Your Name

Send proof of payment to info@cornerstonehr.co.za

${intake.urgencyMessage}

Which course are you interested in? I can give you the exact price!`;
      } else if (/\b(address|location|office|where are you|visit|physical|postal|direction)\b/.test(lower)) {
        response = `Our office is located at:

📍 Cornerstone Supreme (Pty) Ltd
367 Surrey Avenue, Block B
Ground Floor, Ferdale
Randburg, 2125
Johannesburg

You can also reach us on:
📱 WhatsApp: 0718374853
☎️ Office: 087 152 0606
📧 Email: info@cornerstonehr.co.za

Would you like to book a visit or do you have questions about our courses?`;
      } else if (/\b(requirement|need|matric|grade|qualification|entry requirement)\b/.test(lower)) {
        response = `Most of our courses require a Matric certificate and basic computer literacy. For the NQF 5 and NQF 6 qualifications, work experience in the field is a plus but not always required.

${intake.urgencyMessage}

Which course are you interested in? I can tell you the specific requirements for that one, and we can check if you're a good fit. 😊`;
      } else if (/\b(duration|how long|period|time)\b/.test(lower)) {
        if (relevantCourse) {
          response = `The ${relevantCourse.title} runs for ${relevantCourse.duration}. All sessions are conducted online via live virtual classes, so you can study from anywhere in South Africa with flexible scheduling.

Recorded sessions are also available if you miss a live class, which is great if you're working while studying.

${intake.urgencyMessage}

Would you like to know about the payment options or registration process for this course?`;
        } else {
          response = `Our courses range from 3 weeks to 12 months:
• Short Certificate Courses: 3 weeks – 3 months
• Advanced Certificate Programmes: 6 months
• National Certificates (NQF 5 & 6): 12 months

All are online with flexible scheduling. ${intake.urgencyMessage} Which course would you like to know about?`;
        }
      } else if (/\b(cert|certificate|accredited|nqf|saqa|recognised|recognized)\b/.test(lower)) {
        response = `All our courses come with industry-recognized certifications. Our National Certificates (NQF 5 and NQF 6) are SAQA-registered and accredited by BankSETA.

After completion, you'll receive:
🎓 Your official certificate
📁 A skills portfolio
📝 A reference letter (on request)

These qualifications are recognised by employers across South Africa. ${intake.urgencyMessage} Which course are you looking at?`;
      } else if (/\b(job|work|career|employment|opportunity|salary|earn)\b/.test(lower)) {
        response = `Great question! Our programmes are designed to open doors in the job market. For example:

• **Banking NQF 5** → Commercial banks, lending institutions, regulatory departments
• **Financial Markets NQF 6** → Investment firms, financial analysis, wealth management
• **HR Management** → HR departments across all industries
• **Medical Call Centre** → Healthcare administration, hospital call centres
• **Business Administration** → Office management, operations, administration

Many of our students study while working and use their new qualification to advance in their current role or switch careers.

${intake.urgencyMessage}

What field are you currently in, or what career are you aiming for? I can recommend the best course for your goals. 😊`;
      } else if (/\b(re5|re 5|regulatory exam|fais|fsca)\b/.test(lower)) {
        response = `Did you know the RE 5 Regulatory Examination is a **legal requirement** for anyone working in financial services in South Africa? Without it, you cannot legally operate in the industry. Don't let your career be held back!

We have **two preparation options** — both completed within 6 weeks:

💻 **Online Preparation — R1,000**
• Face-to-face and online blended learning experience
• Full coverage of all 10 RE 5 modules
• Live facilitator-led training sessions
• Access to experienced instructors throughout
• Comprehensive study guides and practice examinations
• Web pocket quick learning platform
• Podcasts and revision support material
• Pre-recorded video course explainers
• Mock examinations under exam conditions
• Topic-based questions and activities
• 24/7 access to recorded sessions

🏢 **Face-to-Face Preparation — R1,500**
• **Includes everything the online learner gets**
• Plus: Attends every Monday for 6 weeks at our headquarters
• In-person instruction at 367 Surrey Avenue, Ground Floor, Block B, Randburg

⚡ **This month's intakes:** 22nd and 29th — limited spaces available!

📝 **What happens after training?**
After your 6-week preparation with us, you'll book directly at **Moonstone** to write the official RE 5 exam. We prepare you thoroughly — Moonstone administers the exam. We'll guide you through the booking process.

💳 **Payment:** Full upfront required (no instalments). Pay via EFT or at our office. No online e-commerce payments.

🏦 **Banking Details:**
Bank: FNB | Account Name: Cornerstone Supreme
Account: 62653109283 | Branch: 261750 | SWIFT: FIRNZAJJ
Reference: Your Name | Email proof to: info@cornerstonehr.co.za

We've helped hundreds of candidates successfully pass their RE 5. Which option suits you better — online or face-to-face? 😊`;
        ctx.stage = 'lead_collection';
      } else if (relevantCourse) {
        response = `${relevantCourse.title} is an excellent choice! Here's what you need to know:

💰 Price: ${relevantCourse.price}
⏱️ Duration: ${relevantCourse.duration}
🎓 Certification: ${relevantCourse.certification}
📍 Format: ${relevantCourse.format}

${relevantCourse.description}

${intake.urgencyMessage}

Would you like me to help you get started with the registration? I just need a few details from you and our management team will send the registration form and invoice directly to you. 😊`;
        ctx.stage = 'lead_collection';
      } else {
        response = `Thank you for your message! I'm Lerato from Cornerstone Supreme Education.

I'd love to help you find the right course. We offer professional programmes in:
• 📊 Finance & Banking
• 👔 Business & HR
• 🏥 Healthcare & Safety

${intake.urgencyMessage}

Could you tell me a bit about what you're looking for? For example:
- What field interests you?
- Are you working and studying part-time?
- What are your career goals?

You can also browse our courses at www.cornerstonehr.co.za or access your study materials via our LMS at www.cornerstonehr.co.za/lms

This will help me recommend the perfect course for you! 😊`;
        ctx.stage = 'needs_discovery';
      }
  }

  updateContext(phone, intent, relevantCourse ? relevantCourse.title : courseInterest, studentMsg, response);
  return { response, intent, lang };
}
// ============================================================
// WHATSAPP API
// ============================================================
async function sendWhatsAppMessage(to, message) {
  if (!API_KEY) { console.log('No API key configured'); return; }
  try {
    await fetch(`${WHATSAPP_API}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'D360-API-Key': API_KEY },
      body: JSON.stringify({ messaging_product: 'whatsapp', recipient_type: 'individual', to, type: 'text', text: { body: message } })
    });
  } catch (err) {
    console.error('Send error:', err.message);
  }
}

function saveConversation(phone, name, studentMsg, leratoReply, intent, lang) {
  let conv = DB.conversations.find(c => c.student_phone === phone);
  if (!conv) {
    conv = { id: nextId('conversations'), student_phone: phone, student_name: name, language: lang, status: 'active', intent, last_message: studentMsg.substring(0, 200), message_count: 1, created_at: new Date().toISOString(), updated_at: new Date().toISOString() };
    DB.conversations.push(conv);
  } else {
    conv.last_message = studentMsg.substring(0, 200);
    conv.intent = intent;
    conv.message_count = (conv.message_count || 0) + 1;
    conv.updated_at = new Date().toISOString();
  }
  DB.messages.push({ id: nextId('messages'), conversation_id: conv.id, sender: 'student', content: studentMsg, created_at: new Date().toISOString() });
  DB.messages.push({ id: nextId('messages'), conversation_id: conv.id, sender: 'lerato', content: leratoReply, created_at: new Date().toISOString() });
  saveDB();
}

// ============================================================
// API ROUTES
// ============================================================
app.get('/api/ping', (req, res) => res.json(trpc({ ok: true, db: 'json-file', ai: OPENAI_API_KEY ? 'openai' : 'rule-based' })));

app.post('/api/trpc/courses.list', (req, res) => {
  const input = parseInput(req);
  let result = DB.courses.filter(c => c.status === 'published');
  if (input.category) result = result.filter(c => c.category === input.category);
  if (input.search) result = result.filter(c => c.title.toLowerCase().includes(input.search.toLowerCase()));
  res.json(trpc(result.reverse()));
});

app.post('/api/trpc/courses.count', (req, res) => res.json(trpc(DB.courses.filter(c => c.status === 'published').length)));

app.post('/api/trpc/courses.create', (req, res) => {
  const input = parseInput(req);
  const course = { id: nextId('courses'), title: input.title, category: input.category, price: input.price, duration: input.duration, description: input.description, format: input.format || 'Online', certification: input.certification || 'Certificate of Completion', status: 'published', created_at: new Date().toISOString() };
  DB.courses.push(course); saveDB();
  res.json(trpc({ id: course.id }));
});

app.post('/api/trpc/students.list', (req, res) => {
  const input = parseInput(req);
  let result = [...DB.students];
  if (input.status) result = result.filter(s => s.status === input.status);
  res.json(trpc(result.reverse()));
});

app.post('/api/trpc/students.create', (req, res) => {
  const input = parseInput(req);
  const student = { id: nextId('students'), name: input.name, phone: input.phone, email: input.email || null, status: input.status || 'new', source: input.source || 'whatsapp', created_at: new Date().toISOString() };
  DB.students.push(student); saveDB();
  res.json(trpc({ id: student.id }));
});

app.post('/api/trpc/students.bulkImport', (req, res) => {
  const input = parseInput(req);
  let count = 0;
  for (const s of (input.leads || [])) {
    DB.students.push({ id: nextId('students'), name: s.name, phone: s.phone, email: s.email || null, status: s.status || 'interested', source: 'bulk_import', created_at: new Date().toISOString() });
    count++;
  }
  saveDB();
  res.json(trpc({ inserted: count, total: input.leads?.length || 0 }));
});

app.post('/api/trpc/conversations.list', (req, res) => {
  res.json(trpc([...DB.conversations].sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at)).slice(0, 50)));
});

app.post('/api/trpc/messages.list', (req, res) => {
  const input = parseInput(req);
  res.json(trpc(DB.messages.filter(m => m.conversation_id === input.conversationId)));
});

app.post('/api/trpc/enrollments.list', (req, res) => res.json(trpc([...DB.enrollments].reverse())));

app.post('/api/trpc/enrollments.create', (req, res) => {
  const input = parseInput(req);
  const enroll = { id: nextId('enrollments'), student_name: input.studentName, student_phone: input.studentPhone, course_name: input.courseName, amount: input.amount || '', status: input.status || 'pending', created_at: new Date().toISOString() };
  DB.enrollments.push(enroll); saveDB();
  res.json(trpc({ id: enroll.id }));
});

app.post('/api/trpc/brochures.list', (req, res) => {
  res.json(trpc([...DB.brochures].reverse().map(b => ({ id: b.id, name: b.name, filename: b.filename, mime_type: b.mime_type, size: b.size, category: b.category, is_default: b.is_default, created_at: b.created_at }))));
});

app.post('/api/trpc/brochures.upload', (req, res) => {
  const input = parseInput(req);
  const isDefault = DB.brochures.length === 0 ? 1 : 0;
  const brochure = { id: nextId('brochures'), name: input.name, filename: input.filename, mime_type: input.mimeType, size: input.size, data: input.data, category: input.category || 'General', is_default: isDefault, created_at: new Date().toISOString() };
  DB.brochures.push(brochure); saveDB();
  res.json(trpc({ id: brochure.id, isDefault: isDefault === 1 }));
});

app.post('/api/trpc/brochures.delete', (req, res) => {
  const input = parseInput(req);
  DB.brochures = DB.brochures.filter(b => b.id !== input.id);
  saveDB();
  res.json(trpc({ success: true }));
});

app.get('/api/brochures/:id', (req, res) => {
  const b = DB.brochures.find(b => b.id === parseInt(req.params.id));
  if (!b) return res.status(404).send('Not found');
  const binary = Buffer.from(b.data, 'base64');
  res.set('Content-Type', b.mime_type);
  res.set('Content-Disposition', `inline; filename="${b.filename}"`);
  res.send(binary);
});

// LEADS API
app.post('/api/trpc/leads.list', (req, res) => {
  res.json(trpc([...DB.leads].sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at))));
});

app.post('/api/trpc/leads.create', (req, res) => {
  const input = parseInput(req);
  const lead = {
    id: nextId('leads'),
    phone: input.phone || '',
    leadInfo: input.leadInfo || {},
    courseInterest: input.courseInterest || '',
    status: input.status || 'qualified',
    source: input.source || 'manual',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  DB.leads.push(lead); saveDB();
  res.json(trpc({ id: lead.id }));
});

app.post('/api/trpc/leads.updateStatus', (req, res) => {
  const input = parseInput(req);
  const lead = DB.leads.find(l => l.id === input.id);
  if (lead) { lead.status = input.status; lead.updated_at = new Date().toISOString(); saveDB(); }
  res.json(trpc({ success: true }));
});

app.post('/api/trpc/company.getSettings', (req, res) => res.json(trpc(DB.settings)));
app.post('/api/trpc/company.update', (req, res) => {
  const input = parseInput(req);
  for (const [key, value] of Object.entries(input)) {
    if (value !== undefined) DB.settings[key] = value;
  }
  saveDB();
  res.json(trpc({ success: true }));
});

app.post('/api/trpc/agents.list', (req, res) => {
  res.json(trpc([
    { agentId: 'intent_detector', name: 'Intent Detector', isActive: true },
    { agentId: 'context_analyzer', name: 'Context Analyzer', isActive: true },
    { agentId: 'sales_responder', name: 'Sales Advisor (Lerato)', isActive: true },
    { agentId: 'objection_handler', name: 'Objection Handler', isActive: true },
    { agentId: 'follow_up', name: 'Follow-up Agent', isActive: true },
    { agentId: 'language_adapter', name: 'Language Adapter', isActive: true },
    { agentId: 'post_enrollment', name: 'Student Success', isActive: true },
    { agentId: 'prospector', name: 'Outbound Sales', isActive: true },
  ]));
});

app.post('/api/trpc/analytics.getStats', (req, res) => {
  res.json(trpc({
    totalConversations: DB.conversations.length,
    activeConversations: DB.conversations.filter(c => c.status === 'active').length,
    enrolledCount: DB.conversations.filter(c => c.status === 'enrolled').length,
    totalLeads: DB.leads.length,
    conversionRate: DB.conversations.length > 0 ? ((DB.conversations.filter(c => c.status === 'enrolled').length / DB.conversations.length) * 100).toFixed(1) + '%' : '0%',
  }));
});

// ---- WHATSAPP WEBHOOK ----
app.get('/api/webhook/whatsapp', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];
  if (mode === 'subscribe' && token === WEBHOOK_VERIFY_TOKEN) {
    res.status(200).send(challenge);
  } else {
    res.sendStatus(403);
  }
});

app.post('/api/webhook/whatsapp', async (req, res) => {
  res.sendStatus(200);
  try {
    const messages = req.body?.entry?.[0]?.changes?.[0]?.value?.messages;
    if (!messages || messages.length === 0) return;
    const msg = messages[0];
    const from = msg.from;
    const text = msg.text?.body || '';
    const name = msg.contacts?.[0]?.profile?.name || 'Student';
    console.log(`[IN] ${from}: ${text}`);
    const { response, intent, lang } = await generateAIResponse(text, from);
    saveConversation(from, name, text, response, intent, lang);
    await sendWhatsAppMessage(from, response);
    console.log(`[OUT] ${from}: ${response.substring(0, 80)}...`);
  } catch (err) {
    console.error('Webhook error:', err.message);
  }
});

// STATIC FILES
const publicPath = path.join(__dirname, 'public');
app.use(express.static(publicPath));
app.get('*', (req, res) => res.sendFile(path.join(publicPath, 'index.html')));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log('='.repeat(60));
  console.log('  Cornerstone Supreme AI - Lerato is LIVE');
  console.log('  AI Mode:', OPENAI_API_KEY ? 'GPT-4o Mini (Smart)' : 'Rule-Based');
  console.log('  Port:', PORT);
  console.log('  Courses:', DB.courses.length);
  console.log('  WhatsApp: /api/webhook/whatsapp');
  console.log('='.repeat(60));
});
