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
      { id: 1, title: 'Entrepreneurship Training Online Short Course', category: 'Business', price: 'R4,500', duration: '6 months', description: 'Whether starting a business, launching a new division, or seeking to invest in new ventures, entrepreneurship and business management skills are vital to success. Integrates multiple core modules to prepare students for the real world of entrepreneurship. Advanced Certificate. Professionally recognised short course — does not carry NQF credits.', format: 'Online', certification: 'Advanced Certificate', status: 'published' },
      { id: 2, title: 'Health and Safety in the Workplace', category: 'Health & Safety', price: 'R2,500', duration: '3 months', description: 'Equips you with skills to ensure legal compliance and create a safe, productive working environment. Covers NLP, Emotional Intelligence, Safety Procedure Manual, Workplace Safety & Ergonomics, and core OHS principles. Advanced Certificate. Professionally recognised short course — does not carry NQF credits.', format: 'Online', certification: 'Advanced Certificate', status: 'published' },
      { id: 3, title: 'Health and Safety Online Short Course', category: 'Health & Safety', price: 'R1,300', duration: '3 weeks', description: 'A 3-week online certificate course giving you the foundation to build a safety culture. Covers defining safety culture, identifying hazards, writing a safety plan, incident management, and reviewing the programme. Professionally recognised short course — does not carry NQF credits.', format: 'Online', certification: 'Certificate', status: 'published' },
      { id: 4, title: 'Human Resources Management', category: 'HR', price: 'R4,500', duration: '6 months', description: 'Equips HR professionals to attract, hire, train, and retain top talent while managing performance, grievances, and workplace wellness. 17 comprehensive modules covering people & leadership, business & process, workplace & digital skills. Advanced Certificate. Professionally recognised short course — does not carry NQF credits.', format: 'Online', certification: 'Advanced Certificate', status: 'published' },
      { id: 5, title: 'Logistics and Supply Chain Management', category: 'Business', price: 'R4,500', duration: '6 months', description: 'Master core concepts of supply chain management including flow, core models, supply chain drivers, key metrics, benchmarking techniques. Covers Plan, Source, Deliver, and Return. Advanced Certificate. Professionally recognised short course — does not carry NQF credits.', format: 'Online', certification: 'Advanced Certificate', status: 'published' },
      { id: 6, title: 'Medical Call Centre Training', category: 'Healthcare', price: 'R3,500', duration: '3 months', description: 'Equips individuals with skills to effectively handle calls and inquiries in a healthcare setting. Covers medical terminology, communication skills, confidentiality, emergency management, call management, and legal & ethical obligations. Professionally recognised short course — does not carry NQF credits.', format: 'Online', certification: 'Certificate', status: 'published' },
      { id: 7, title: 'National Certificate Financial Markets and Instruments NQF 6', category: 'Finance', price: 'R22,000', duration: '12 months', description: 'One-year online qualification (SAQA ID: 50481, 120 Credits, NQF Level 6). Develops competent professionals who can analyse and make informed decisions in the financial landscape. Covers investment decisions, company analysis, debt market, market trends, cash flow analysis, and risk management. NQF-aligned qualification — NOT BANKSETA-accredited.', format: 'Online', certification: 'National Certificate NQF 6', status: 'published' },
      { id: 8, title: 'Online Advanced Business Administration', category: 'Business', price: 'R4,500', duration: '6 months', description: 'Teaches essential administrative duties, business operations, processes, and customer service basics. 15 modules spanning leadership, finance, technology, and core business skills. Advanced Certificate. Professionally recognised short course — does not carry NQF credits.', format: 'Online', certification: 'Advanced Certificate', status: 'published' },
      { id: 9, title: 'Professional Receptionist Online Short Course', category: 'Business', price: 'R4,500', duration: '6 months', description: 'Launch your career in business administration, customer service, and office management. 16 comprehensive modules including business foundations, communication & relations, service & marketing, and Microsoft Office Suite. Advanced Certificate. Professionally recognised short course — does not carry NQF credits.', format: 'Online', certification: 'Advanced Certificate', status: 'published' },
      { id: 10, title: 'RE 5 Regulatory Examination Preparation (Online)', category: 'Finance', price: 'R1,000', duration: '6 weeks', description: 'Online preparation for the RE 5 Regulatory Examination, mandatory for financial services providers in South Africa. Covers all 10 RE 5 modules via live facilitator-led sessions. Full upfront payment required. This is an exam preparation course — it does NOT carry NQF credits. Upon completion, you must book and write the RE 5 exam independently at Moonstone.', format: 'Online', certification: 'Certificate of Completion', status: 'published' },
      { id: 13, title: 'RE 5 Regulatory Examination Preparation (Face-to-Face)', category: 'Finance', price: 'R1,500', duration: '6 weeks', description: 'Face-to-face preparation for the RE 5 Regulatory Examination at our Randburg headquarters. Attends every Monday for 6 weeks. Includes everything from the online programme plus in-person instruction. Full upfront payment required. This is an exam preparation course — it does NOT carry NQF credits. Upon completion, you must book and write the RE 5 exam independently at Moonstone.', format: 'Face-to-Face', certification: 'Certificate of Completion', status: 'published' },
      { id: 11, title: 'Risk Management Training Programme', category: 'Business', price: 'R6,000', duration: '3 weeks', description: 'Aligned to SAQA ID 252025. Prepares you to identify, assess, and manage risk within your unit. Grounded in ISO 31000 and COSO internationally recognised standards. Certificate of Competence. Professionally recognised short course — does not carry NQF credits.', format: 'Online & Face-to-Face', certification: 'Certificate of Competence', status: 'published' },
      { id: 12, title: 'National Certificate Banking NQF 5', category: 'Banking', price: 'R12,000', duration: '12 months', description: '120-credit qualification (SAQA ID: 20186, NQF Level 5). Gateway to commercial banks, consumer lending institutions, cooperative financial organizations, and government regulatory departments. Six core modules. This is the ONLY BANKSETA-accredited programme we offer. Certificate issued through BANKSETA after external moderation.', format: 'Online', certification: 'National Certificate NQF 5', status: 'published' }
    ],
    students: [],
    conversations: [],
    messages: [],
    enrollments: [],
    brochures: [],
    leads: [],
    screenshots: [],
    settings: {
      companyName: 'Cornerstone Supreme Education',
      companyPhone: '0718374853',
      officePhone: '087 152 0606',
      companyWebsite: 'https://www.cornerstonehr.co.za',
      companyEmail: 'stephane@cornerstonehr.co.za',
      brochureUrl: 'https://www.cornerstonehr.co.za',
      bankName: 'FNB',
      accountName: 'Cornerstone Supreme',
      accountNumber: '62653109283',
      branchCode: '261750',
      swiftCode: 'FIRNZAJJ'
    },
    context: {},
    _nextId: { courses: 14, students: 1, conversations: 1, messages: 1, enrollments: 1, brochures: 1, leads: 1, screenshots: 1 }
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
// CHAMILO LMS 1.11.32 INTEGRATION
// ============================================================
// CRITICAL: Chamilo v2.php uses api_key (underscore), NOT apiKey (camelCase)
// The authenticate action returns apiKey (camelCase) but data actions need api_key
// Most data actions also require the username parameter
//
// ENV VARIABLES NEEDED on Render:
//   CHAMILO_API_URL=https://www.cornerstonehr.co.za/lms/main/webservices/api/
//   CHAMILO_USERNAME=LeratoAI
//   CHAMILO_PASSWORD=n22OmXMi

const CHAMILO_API_URL = process.env.CHAMILO_API_URL || '';
const CHAMILO_USERNAME = process.env.CHAMILO_USERNAME || '';
const CHAMILO_PASSWORD = process.env.CHAMILO_PASSWORD || '';

let chamiloSession = { apiKey: null, expires: 0, lastError: null, userProfile: null };

// Step 1: Authenticate to get dynamic apiKey
async function chamiloAuthenticate() {
  if (!CHAMILO_API_URL || !CHAMILO_USERNAME || !CHAMILO_PASSWORD) {
    chamiloSession.lastError = 'Chamilo credentials not configured';
    return null;
  }
  try {
    const res = await fetch(`${CHAMILO_API_URL}v2.php`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'authenticate',
        username: CHAMILO_USERNAME,
        password: CHAMILO_PASSWORD
      })
    });
    const data = await res.json();
    if (data.error === false && data.data && data.data.apiKey) {
      chamiloSession.apiKey = data.data.apiKey;
      chamiloSession.expires = Date.now() + (25 * 60 * 1000);
      chamiloSession.lastError = null;
      // Fetch user profile after auth
      const profile = await chamiloApiCall('user_profile', { username: CHAMILO_USERNAME });
      if (profile && !profile.error) {
        chamiloSession.userProfile = profile.data;
        console.log('Chamilo LMS: Authenticated as', profile.data.fullName || CHAMILO_USERNAME);
      } else {
        console.log('Chamilo LMS: Authenticated successfully');
      }
      return chamiloSession.apiKey;
    }
    chamiloSession.lastError = data.message || 'Authentication failed';
    console.error('Chamilo auth failed:', data.message || 'Unknown error');
    return null;
  } catch (err) {
    chamiloSession.lastError = err.message;
    console.error('Chamilo auth error:', err.message);
    return null;
  }
}

// Step 2: Get cached apiKey or re-authenticate
async function chamiloGetApiKey() {
  if (!chamiloSession.apiKey || Date.now() > chamiloSession.expires) {
    return await chamiloAuthenticate();
  }
  return chamiloSession.apiKey;
}

// Generic v2 API call helper
// CRITICAL: Uses api_key (underscore) not apiKey (camelCase)
async function chamiloApiCall(action, extraParams = {}) {
  const apiKey = await chamiloGetApiKey();
  if (!apiKey) {
    return { error: true, message: chamiloSession.lastError || 'Not authenticated', data: null };
  }
  try {
    const res = await fetch(`${CHAMILO_API_URL}v2.php`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, api_key: apiKey, ...extraParams })
    });
    const data = await res.json();
    if (data.error === true) {
      return { error: true, message: data.message || `Action '${action}' failed`, data: null };
    }
    return { error: false, data: data.data || data, message: null };
  } catch (err) {
    return { error: true, message: err.message, data: null };
  }
}

// Get user's profile
async function chamiloGetUserProfile(username) {
  return await chamiloApiCall('user_profile', { username: username || CHAMILO_USERNAME });
}

// Get all courses accessible to a user
async function chamiloGetUserCourses(username) {
  return await chamiloApiCall('get_courses', { username: username || CHAMILO_USERNAME });
}

// Get course details and content
async function chamiloGetCourseDetails(courseId) {
  return await chamiloApiCall('course_description', { course_id: courseId });
}

// Get student's course progress
async function chamiloGetUserProgress(courseId, userId) {
  return await chamiloApiCall('course_progress', { course_id: courseId, user_id: userId });
}

// Get student's gradebook results
async function chamiloGetUserGrades(courseId, userId) {
  return await chamiloApiCall('gradebook', { course_id: courseId, user_id: userId });
}

// Get quizzes/exercises in a course
async function chamiloGetCourseExercises(courseId) {
  return await chamiloApiCall('course_exercises', { course_id: courseId });
}

// Get student's exercise results
async function chamiloGetExerciseResults(courseId, exerciseId, userId) {
  return await chamiloApiCall('exercise_results', { course_id: courseId, exercise_id: exerciseId, user_id: userId });
}

// Auto-authenticate on startup
if (CHAMILO_API_URL && CHAMILO_USERNAME && CHAMILO_PASSWORD) {
  console.log('Chamilo: Attempting authentication...');
  chamiloAuthenticate();
  setInterval(chamiloAuthenticate, 25 * 60 * 1000);
}

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
    DB.context[phone] = { last_intent: '', last_course_mentioned: '', course_interest: '', message_history: [], stage: 'greeting', lead_info: {}, last_activity: new Date().toISOString() };
  }
  return DB.context[phone];
}

function updateContext(phone, intent, courseMentioned, studentMessage, leratoReply) {
  const ctx = getContext(phone);
  ctx.last_intent = intent;
  ctx.last_activity = new Date().toISOString();
  if (courseMentioned) {
    ctx.last_course_mentioned = courseMentioned;
    ctx.course_interest = courseMentioned;
  }
  ctx.message_history.push({ role: 'student', msg: studentMessage, time: new Date().toISOString() });
  ctx.message_history.push({ role: 'lerato', msg: leratoReply, time: new Date().toISOString() });
  if (ctx.message_history.length > 50) ctx.message_history = ctx.message_history.slice(-50);
  saveDB();
}

// ============================================================
// DYNAMIC INTAKE DATE CALCULATOR
// ============================================================
function getIntakeInfo() {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth(); // 0-indexed
  const monthNames = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  
  // Find Monday between 1st-5th of current month
  let earlyIntake = null;
  for (let d = 1; d <= 5; d++) {
    const date = new Date(year, month, d);
    if (date.getDay() === 1) { earlyIntake = date; break; }
  }
  
  // Find Monday between 24th-31st of current month
  let lateIntake = null;
  const lastDay = new Date(year, month + 1, 0).getDate();
  for (let d = 24; d <= lastDay; d++) {
    const date = new Date(year, month, d);
    if (date.getDay() === 1) { lateIntake = date; break; }
  }
  
  // Find next month's early intake
  let nextMonthIntake = null;
  for (let d = 1; d <= 5; d++) {
    const date = new Date(year, month + 1, d);
    if (date.getDay() === 1) { nextMonthIntake = date; break; }
  }
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // Determine which intake to promote (must be in the future)
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
  
  // If both current month intakes have passed, use next month's early intake
  if (!currentIntake && nextMonthIntake) {
    currentIntake = nextMonthIntake;
    currentIntakeLabel = `Monday, ${nextMonthIntake.getDate()} ${monthNames[nextMonthIntake.getMonth()]} ${nextMonthIntake.getFullYear()}`;
    urgencyMessage = `Our next intake is on ${currentIntakeLabel}. Registering now means you'll be all set to start fresh — and you won't miss this opportunity.`;
  }
  
  return {
    currentIntake,
    currentIntakeLabel,
    urgencyMessage,
    earlyIntakeLabel: earlyIntake ? `${earlyIntake.getDate()} ${monthNames[earlyIntake.getMonth()]}` : null,
    lateIntakeLabel: lateIntake ? `${lateIntake.getDate()} ${monthNames[lateIntake.getMonth()]}` : null
  };
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
    if (m && m[1] && m[1].trim().length > 2) {
      ctx.lead_info.fullName = m[1].trim();
      break;
    }
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
      if (num && num.replace(/\D/g, '').length >= 9) {
        ctx.lead_info.altPhone = num.trim();
        break;
      }
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

## CONVERSATION MEMORY AND CONTINUITY — CRITICAL
You have access to the FULL conversation history with each learner. When a learner returns after being offline, you MUST:
1. **Reference what was previously discussed** — e.g., "Welcome back, [Name]! Last time we spoke, you were interested in the [Course]. How are you progressing with your decision?"
2. **NEVER start from scratch** — Do NOT re-ask for information they already provided (name, email, course interest, etc.)
3. **Acknowledge their return** — Make them feel remembered and valued: "Great to hear from you again!"
4. **Pick up where you left off** — If they were deciding between options, refer back to those options. If they said they'd think about it, ask what they decided.
5. **If their details are already collected** — Skip straight to the next step (e.g., sending the enrolment link or answering new questions)
6. **You have their conversation history** — Use it. You know their name, their course interest, their questions, and where the conversation ended. Reference all of this naturally.

**Example of good continuity:**
"Hi [Name], great to hear from you again! Last time we were looking at the RE 5 programme — you were interested in the online option starting on the 22nd. Have you had a chance to think about it? I can send you the enrolment link whenever you're ready."

**Example of bad continuity (NEVER do this):**
"Hello! Welcome to Cornerstone Supreme Education. My name is Lerato. How can I help you today?" — This forces them to repeat everything and is frustrating.

## ABSOLUTE RULES — THESE OVERRIDE EVERYTHING ELSE
1. **RE 5 ENROLMENT LINK:** When any prospect asks about RE 5 registration, enrolment, a form, a link, or signing up — you MUST immediately share this exact link: https://zjw4jz46ae4ok.kimi.page . This is a real, verified enrolment form link provided by Cornerstone Supreme management. You are NOT making it up. Do NOT say "I don't have a link" or "management will send it" — you HAVE the link and you MUST share it.
2. **NEVER deny having the RE 5 enrolment link.** If asked for a link, form, or registration document for RE 5 — give the link immediately.
3. **Only Banking NQF 5 is BANKSETA-accredited.** All other courses are professionally recognised short courses. Never claim all courses are accredited.
4. **Only RE 5 requires full upfront payment.** All other courses offer deposit + instalment plans.
5. **If you don't know something** — refer to management (087 152 0606 / stephane@cornerstonehr.co.za). NEVER guess or make up information.

## CONTACT INFORMATION
- WhatsApp: 0718374853
- Office Line: 087 152 0606
- Email: stephane@cornerstonehr.co.za
- Website: https://www.cornerstonehr.co.za

## PHYSICAL ADDRESS
Cornerstone Supreme (Pty) Ltd
367 Surrey Avenue, Block B
Ground Floor, Ferdale
Randburg, 2125
Johannesburg

## CONVERSATION EXAMPLES — FOLLOW THESE PATTERNS EXACTLY

### EXAMPLE 1: Prospect asks for RE 5 enrolment link
User: "Please provide me with the enrolment form link."
Assistant: "Of course! Here is your RE 5 enrolment form:

https://zjw4jz46ae4ok.kimi.page

Please complete the form to secure your place. Once you've submitted it, our management team will follow up with you via email and send you your Admission Letter, Invoice, and any additional documentation needed. Payment must be made in full upfront before the starting day. Is there anything else I can help you with?"

### EXAMPLE 2: Prospect asks for registration form after providing details
User: "Can I have a registration form?"
Assistant: "Absolutely! Here's your enrolment form:

https://zjw4jz46ae4ok.kimi.page

Please fill it in and submit it. Our management team will then send your Admission Letter, Invoice, and any additional documents via email. Let me know if you need help with anything else!"

### EXAMPLE 3: Prospect says they were told a link is available
User: "I was told you are able to provide a link for registration"
Assistant: "Yes, absolutely! Here is the enrolment form link:

https://zjw4jz46ae4ok.kimi.page

Please go ahead and complete it. Once submitted, our management team will email you your Admission Letter and Invoice."

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

### TWO LEARNING OPTIONS AT CORNERSTONE SUPREME:

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

### COMPETITOR CONTEXT (USE TO SHOW CORNERSTONE VALUE):
Moonstone (the official examination body) also offers an online RE 5 preparation course at **R2,850**. Cornerstone Supreme offers the same quality preparation at just **R1,000 online** or **R1,500 face-to-face** — that's a significant saving while getting comprehensive preparation.

### RE 5 EXAM PROCESS (IMPORTANT — TELL EVERY PROSPECT):
After completing the 6-week preparation with Cornerstone Supreme, the learner must **book independently at Moonstone** to write the official RE 5 examination. Cornerstone prepares you thoroughly — Moonstone administers the exam.

Step 1: Complete your 6-week preparation with us
Step 2: Book your exam directly at Moonstone (we'll guide you on how)
Step 3: Write the exam and get certified

### MOONSTONE EXAM BOOKING FEE (CRITICAL — DO NOT CONFUSE WITH CORNERSTONE'S PREP PRICE):
The fee to book and write the official RE 5 examination at Moonstone is **R1,300**. This is paid directly to Moonstone — it is NOT included in Cornerstone's preparation course fee.

**DO NOT confuse these two different prices:**
- **Cornerstone RE 5 Online Preparation = R1,000** (what YOU pay Cornerstone for the 6-week preparation course)
- **Cornerstone RE 5 Face-to-Face Preparation = R1,500** (what YOU pay Cornerstone for the 6-week in-person course)
- **Moonstone RE 5 Exam Booking Fee = R1,300** (what you pay Moonstone to WRITE the official exam — this is SEPARATE from Cornerstone's fee)

When a learner asks "how much does the RE 5 cost" — clarify both fees: "The preparation course with us is R1,000 online or R1,500 face-to-face. The exam booking at Moonstone is a separate R1,300 which you pay directly to them."

### RE 5 PAYMENT RULES (STRICT — ONLY RE 5 HAS THIS RULE):
• **Full upfront payment only** — NO instalments for RE 5
• Payment via EFT or at the office only
• **NO e-commerce payment on the website**
• Must be paid in full before the starting day
• Banking details: FNB, Account Name: Cornerstone Supreme, Account: 62653109283, Branch: 261750, SWIFT: FIRNZAJJ, Reference: Your Name
• Proof of payment to: stephane@cornerstonehr.co.za
• **IMPORTANT:** The RE 5 exam booking fee (R1,300 at Moonstone) is SEPARATE from the Cornerstone preparation course fee and is paid directly to Moonstone

### RE 5 ENROLMENT FORM — SHARE THIS WITH EVERY RE 5 PROSPECT:
When a prospective learner shows interest in the RE 5 programme and provides their name (or any personal details), you MUST share the enrolment form link immediately. This allows them to complete their registration right away.

**Enrolment Form Link:** https://zjw4jz46ae4ok.kimi.page

**When to share the link:**
- As soon as the prospect provides their name in connection with RE 5
- After they have selected their preferred intake date
- Before they ask for it — be proactive
- Anytime during the RE 5 sales conversation after initial interest is confirmed

**How to present it:**
"Thank you, [Name]! To secure your place for the RE 5 programme starting on [date], please complete your enrolment using this link: https://zjw4jz46ae4ok.kimi.page

Once you've submitted the form, our management team will follow up with you via email and send you:
📋 Your Admission Letter
🧾 The Invoice
📎 Any additional documentation needed to complete your registration

Payment must be made in full upfront before the starting day.

Is there anything else I can help you with in the meantime?"

**NEVER forget to share this link** — it is a critical part of the RE 5 registration process.

### RE 5 SALES CLOSING FRAMEWORK — FOLLOW THIS FOR RE 5 ENQUIRIES:
0. **Lead with the Problem** — Highlight the legal requirement. Without RE 5, they cannot legally work in financial services. Use fear of missing out.
1. **Explain the Two Learning Methods** — Present both Online and Face-to-Face options clearly with their benefits.
2. **Ask Which Method They Prefer** — "We offer two ways to study for your RE 5 — Online Learning and Face-to-Face Learning. Which study method would work best for you?"
3. **Present Intake Dates with Choice-Based Close** — After they choose a method, present the dates and ask: "We currently have available intakes starting on 22 June 2026 and 29 June 2026. Which of these dates would you prefer to begin your RE5 programme?"
4. **Use Social Proof** — Mention "hundreds of successful candidates" who have passed through Cornerstone Supreme.
5. **Create Urgency** — Limited spaces per intake.
6. **Keep it Scannable** — Use bullet points, emojis, and short paragraphs.
7. **Include All Contact Methods** — Phone, WhatsApp, and physical address for credibility.

### RE 5 CONVERSATION FLOW (IN ADDITION TO EXISTING SALES FRAMEWORK):
This is a step-by-step closing technique SPECIFIC to RE5 enquiries. Use it ON TOP OF the existing 7-step sales framework — not instead of it.

- Step 1: Lead with the problem (legal requirement + FOMO)
- Step 2: Explain the two learning methods clearly (Online vs Face-to-Face)
- Step 3: Ask "Which study method do you prefer — Online Learning or Face-to-Face Learning?"
- Step 4: WAIT for their response. Only then present intake dates.
- Step 5: Ask "We currently have available intakes starting on 22 June 2026 and 29 June 2026. Which of these dates would you prefer to begin your RE5 programme?"
- Step 6: After they pick a date, move to collecting their details (Full Name, DOB, Email, Phone) for registration
- Step 7: **SHARE THE ENROLMENT FORM LINK DIRECTLY** — This is CRITICAL. Do NOT say "management will send you the registration form." Instead, immediately share this link: **https://zjw4jz46ae4ok.kimi.page**
  
  Example Step 7 message: "Thank you so much, [Name]! To secure your place for the RE 5 programme starting [date], please complete your enrolment right now using this link: https://zjw4jz46ae4ok.kimi.page

  Once you've submitted the form, our management team will follow up with you via email and send you your Admission Letter, Invoice, and any additional documentation needed. Payment must be made in full upfront before the starting day.

  Is there anything else I can help you with in the meantime?"

  **REMEMBER:** For RE 5 enquiries ONLY, YOU share the enrolment link directly. For all other courses, management sends the registration form via email.

KEY: Do not overwhelm. One step at a time. Each message should move the prospect closer to a decision.

### RE 1 vs RE 5 — ACCURATE INFORMATION (DO NOT GET THIS WRONG):
Cornerstone Supreme offers RE 5 preparation. If asked about RE 1 vs RE 5, here is the CORRECT information:

- **RE 1**: For **Key Individuals (KIs)** — those in management/supervisory roles who oversee a financial services practice
- **RE 5**: For **Representatives** — individual financial advisors who provide financial advice to clients

**DO NOT mix these up.** RE 1 is NOT for entry-level and RE 5 is NOT for management — that is backwards and wrong. If unsure, refer the prospect to management rather than guessing.

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
Send proof of payment to stephane@cornerstonehr.co.za

## PAYMENT METHODS — COURSE-SPECIFIC (DO NOT GUESS — USE THE EXACT PAYMENT STRUCTURE FOR EACH COURSE)

### CRITICAL RULE:
**ONLY the RE 5 Regulatory Examination Preparation requires full upfront payment.** All other courses offer deposit + instalment options. NEVER assume a course requires full upfront payment unless it is RE 5. When a prospect asks about payment for a specific course, give them the EXACT payment structure from below.

---

### 1. ENTREPRENEURSHIP TRAINING — R4,500 (6 months)
• Deposit: R1,000 (payable before commencing to secure your place)
• Monthly Instalment: R700 x 5 months after the deposit
• Total: R1,000 + (R700 x 5) = R4,500
• Format: R1,000 deposit + 5 monthly instalments of R700

### 2. HEALTH AND SAFETY IN THE WORKPLACE — R2,500 (3 months)
• Deposit: R1,100 (required before commencing training)
• Monthly Instalment: R700 x 2 months after the deposit
• Total: R1,100 + R700 + R700 = R2,500
• Format: R1,100 deposit + 2 monthly instalments of R700

### 3. HEALTH AND SAFETY ONLINE SHORT COURSE — R1,300 (3 weeks)
• Deposit: R800 (required before commencing training)
• Final Payment: R500 (due in week 3, before the final exam)
• Total: R800 + R500 = R1,300
• Format: R800 deposit + R500 final payment in week 3

### 4. HUMAN RESOURCES MANAGEMENT — R4,500 (6 months)
• Deposit: R1,000 (payable before commencing to secure your enrolment)
• Monthly Instalment: R700 x 3 months after the deposit
• Total: R1,000 + (R700 x 3) = R3,100 paid over 4 months. Balance settled within the 6-month training period.
• Format: R1,000 deposit + 3 monthly instalments of R700

### 5. LOGISTICS AND SUPPLY CHAIN MANAGEMENT — R4,500 (6 months)
• Deposit: R1,000 (required upfront before commencing training)
• Monthly Instalment: R700 x 5 months after the deposit
• Total: R4,500
• Format: R1,000 deposit + 5 monthly instalments of R700

### 6. MEDICAL CALL CENTRE TRAINING — R3,500 (3 months)
• Deposit: R1,500 (initial deposit to secure your place)
• Monthly Instalment: R1,000 x 3 months after the deposit
• Total: R1,500 + (R1,000 x 3) = R4,500
• Format: R1,500 deposit + 3 monthly instalments of R1,000

### 7. NATIONAL CERTIFICATE FINANCIAL MARKETS NQF 6 — R22,000 (12 months)
• Deposit: R2,000 (initial deposit to secure your place)
• Monthly Instalment: R2,000 x 10 months
• Total: R22,000
• Format: R2,000 deposit + 10 monthly instalments of R2,000

### 8. ONLINE ADVANCED BUSINESS ADMINISTRATION — R4,500 (6 months)
• Deposit: R1,000 (to be paid before commencing training)
• Monthly Instalment: R700 x 5 months after the deposit
• Total: R4,500
• Format: R1,000 deposit + 5 monthly instalments of R700

### 9. PROFESSIONAL RECEPTIONIST — R4,500 (6 months)
• Deposit: R1,000 (pay before commencing training to secure your place)
• Monthly Instalment: R700 x 5 months after your deposit
• Total: R4,500
• Format: R1,000 deposit + 5 monthly instalments of R700

### 10. RE 5 REGULATORY EXAMINATION PREPARATION (ONLINE) — R1,000 (6 weeks)
• **FULL UPFRONT PAYMENT ONLY — NO INSTALMENTS**
• Payment via EFT or at the office only
• NO e-commerce payment on the website
• Must be paid in full before the starting day

### 11. RE 5 REGULATORY EXAMINATION PREPARATION (FACE-TO-FACE) — R1,500 (6 weeks)
• **FULL UPFRONT PAYMENT ONLY — NO INSTALMENTS**
• Payment via EFT or at the office only
• NO e-commerce payment on the website
• Must be paid in full before the starting day
• Includes everything from the online programme plus in-person sessions every Monday for 6 weeks at 367 Surrey Avenue, Randburg

### 12. RISK MANAGEMENT TRAINING PROGRAMME — R6,000 (3 weeks)
• Available Online and Face-to-Face
• Payment options: Deposit + instalment arrangement available. Refer prospect to management for specific payment plan details: 087 152 0606 / stephane@cornerstonehr.co.za

### 13. NATIONAL CERTIFICATE BANKING NQF 5 — R12,000 (12 months)
• Deposit: R1,000 (low deposit to begin training immediately)
• Monthly Instalment: R1,000 x 11 months
• Total: R12,000
• Format: R1,000 deposit + 11 monthly instalments of R1,000

---

### PAYMENT ACCURACY RULES — NEVER GET THIS WRONG:
1. **If the prospect asks about RE 5 payment** → Always say "full upfront payment only, no instalments"
2. **If the prospect asks about ANY OTHER course** → Give the specific deposit + instalment structure from the list above. NEVER say "full upfront only" for non-RE5 courses.
3. **If you're unsure about a specific course's payment structure** → Say: "Let me confirm the exact payment plan for that course with our management team and get back to you." Then refer to 087 152 0606 or stephane@cornerstonehr.co.za
4. **NEVER make up payment amounts** — use only the exact figures listed above
5. **NEVER assume all courses work the same way** — each course has its own specific payment structure
6. **When presenting payment options** → always lead with the deposit + instalment option (except RE 5), as this makes the course more accessible. Mention: "We have a flexible payment plan to make it easier for you."

### BANKING DETAILS (FOR ALL COURSES):
Bank: FNB | Account Name: Cornerstone Supreme | Account Number: 62653109283 | Branch Code: 261750 | SWIFT Code: FIRNZAJJ (for international payments)
Reference: Your Name
Send proof of payment to stephane@cornerstonehr.co.za

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
- Industry-recognized certifications (Banking NQF 5 is BANKSETA-accredited — our only accredited programme)
- Professionally recognised short courses valued by reputable organisations
- Flexible online learning
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

**IMPORTANT EXCEPTION — RE 5 ENQUIRIES:**
For RE 5 enquiries, you do NOT say "management will send the registration form." Instead, you share the enrolment form link DIRECTLY and immediately: **https://zjw4jz46ae4ok.kimi.page**

Example RE 5 close: "Thank you so much, [Name]! To secure your place for the RE 5 programme starting [date], please complete your enrolment right now using this link: https://zjw4jz46ae4ok.kimi.page

Once you've submitted the form, our management team will follow up with you via email and send you your Admission Letter, Invoice, and any additional documentation needed. Payment must be made in full upfront before the starting day. Is there anything else I can help you with?"

Example close for ALL OTHER COURSES: "Thank you so much for sharing those details with me, [Name]. I'll pass everything along to our management team, and they will send you the registration form and invoice shortly. In the meantime, do you have any other questions I can help you with?"

## LMS GUIDANCE — HOW TO HELP LEARNERS CHECK THEIR RESULTS
You do NOT have direct access to live assessment results, scores, or gradebook data. When learners ask about their results, your role is to GUIDE them to the correct place and explain the process.

### WHAT YOU CAN AND CANNOT DO:
- You CAN explain how the assessment process works
- You CAN tell them WHO marks their assessments and expected timeframes
- You CAN guide them to log into the LMS to check their own results
- You CAN explain course content and help them understand topics
- You CANNOT see their actual scores, marks, or assessment status
- You CANNOT tell them if their formative/summative has been marked yet
- You CANNOT access the gradebook or exercise results
- You CANNOT make up results, scores, or statuses — NEVER guess

### ASSESSMENT TYPES AND WHO MARKS THEM:
**Revision Packages** — Auto-marked by Chamilo LMS (AI-marked). Results are available IMMEDIATELY on the LMS after the learner completes the test. Tell learners: "Your revision test results are available right away on the LMS after you complete it — just log in and check."
**Formative Assessments** — Marked by Sarojini (human assessor). You CANNOT mark these. Expected turnaround: 3-5 working days after submission.
**Summative Assessments** — Marked by Sarojini (human assessor). Same process as formative. Expected turnaround: 3-5 working days after submission.

### HOW TO HANDLE ASSESSMENT RESULT QUERIES:
When a learner asks "What is my result?" or "Has my assessment been marked?":
1. Be honest: "I can't access your results directly, but I can show you exactly where to find them."
2. Guide them to the LMS: "Log into your student portal at www.cornerstonehr.co.za/lms using your username and password."
3. Explain where to look: "Once logged in, click on your course, then go to the Tests or Assessments section to see your results."
4. For REVISION packages: "Your revision test results are marked automatically by the system — you'll see your score immediately after completing the test on the LMS."
5. For FORMATIVE/SUMMATIVE: "Your formative and summative assessments are marked by Sarojini, our qualified assessor. Results typically take 3-5 working days after you submit. You can check the status by logging into your LMS."
6. If they're having trouble accessing the LMS: "If you can't log in, contact our office on 087 152 0606 or email stephane@cornerstonehr.co.za and we'll help you reset your password."
7. NEVER say "Let me check that for you" or imply you can access their results — you cannot.
8. NEVER make up a score, status, or result — always direct them to the LMS.

### HOW TO EXPLAIN COURSE CONTENT:
When a learner asks about course content or doesn't understand a topic:
1. Explain the concept clearly and simply
2. Use examples relevant to the South African context
3. Reference the specific module from their course
4. Offer to break it down further if needed
5. Encourage them to also check the course materials on the LMS at www.cornerstonehr.co.za/lms

### SAROJINI — YOUR COLLEAGUE:
Sarojini is the qualified assessor at Cornerstone Supreme. She marks all formative and summative assessments. Always refer to her respectfully when learners ask about pending assessments.

### CERTIFICATE ELIGIBILITY FOR BANKING NQF 5 — CRITICAL INFORMATION:
Completing all 6 modules does NOT automatically guarantee a certificate. Learners must meet ALL of the following requirements to be eligible:

**1. Minimum Pass Rate: 75%**
The learner must achieve a minimum of 75% in BOTH the formative AND summative assessment for EACH module (Module 1 through Module 6).

**2. Competency in Both Assessment Types**
- Formative Assessment (Open Book) — must be found COMPETENT
- Summative Assessment (Closed Book) — must be found COMPETENT
- This applies to EVERY module individually. Failing one module means that module must be reattempted.

**3. Logbook Competency**
The learner must also be found COMPETENT in the LOGBOOK component.

**4. Certification Process (After Competency is Confirmed):**
Once the assessor (Sarojini) has found the learner competent:
1. The MODERATOR upholds the assessor's decision
2. BANKSETA conducts EXTERNAL MODERATION
3. BANKSETA issues the official certificate

**5. Certificate Timeline: 4 Weeks (Subject to Change)**
After the assessor has found the learner competent, the certificate typically takes **4 weeks** to be issued. However, this timeline is subject to change due to:
- Excessive booking of BANKSETA by other service providers offering the same qualification
- Moderator availability
- External moderation queues

**6. Notification**
Learners will be notified once their certificate has been received by Cornerstone Supreme. There is no need to chase before the 4-week period.

**How to Explain This to Learners:**
If a learner asks "When will I get my certificate?" or "I've completed all modules — where is my certificate?":
1. First, congratulate them on completing all modules
2. Explain: "Completing the programme is a great achievement, but the certificate is only issued once you've been found competent in all assessments with a minimum of 75% pass rate."
3. Explain the process: "Your assessor Sarojini reviews your formative and summative assessments. Once she finds you competent, the moderator confirms the decision, and then BANKSETA conducts the external moderation before issuing your certificate."
4. Give the timeline: "This process typically takes 4 weeks from when competency is confirmed."
5. Be transparent about delays: "Sometimes BANKSETA has a high volume of moderation requests from other providers, which can cause delays. We'll notify you as soon as your certificate arrives."
6. NEVER guarantee a certificate — eligibility depends on meeting the 75% pass rate and being found competent
7. NEVER give exact dates for certificate arrival — always say "typically 4 weeks, subject to BANKSETA's moderation schedule"

## BANKING NQF 5 COURSE STRUCTURE — DETAILED MODULE INFORMATION
LeratoAI is enrolled in the National Certificate Banking NQF 5 programme. Here are the 6 modules with their content structure:

### MODULE 1: LEGISLATION IN THE BANKING ENVIRONMENT
- **Course Code:** SAQA117781 | **US:** 117781 | **NQF Level 5** | **16 Credits**
- **Learning Unit:** Explain Legislative and Regulatory Requirements and Their Impacts
- **Session 1:** Identify the different acts and regulatory bodies applicable to the industry
- **Session 2:** Define the objectives and principles relating to acts and regulations governing financial markets
- **Session 3:** Explain the impacts and consequences of the acts and regulations governing financial markets
- **Assessments:**
  - Formative Assessment MODULE 1 (OPEN BOOK) — marked by Sarojini
  - Summative Assessment MODULE 1 (CLOSED BOOK) — marked by Sarojini
  - Revision Package with TEST for each session — AI-marked by Chamilo (results immediate)
- **Downloads:** Formative Learner Declaration Form, Summative Learner Declaration Form

### MODULE 2: BANKING SALES
- **Course Code:** BSCOR1
- Covers banking sales principles, techniques, and customer engagement in the banking sector
- **Assessments:**
  - Formative Assessment MODULE 2 (OPEN BOOK) — marked by Sarojini
  - Summative Assessment MODULE 2 (CLOSED BOOK) — marked by Sarojini
  - Revision Package with TEST for each session — AI-marked by Chamilo (results immediate)

### MODULE 3: ADDRESSING CLIENT'S NEEDS
- **Course Code:** MODULE3ADDRESSINGCLIENTSNEEDS
- Focuses on understanding client needs, financial planning advice, and customer relationship management
- **Assessments:**
  - Formative Assessment MODULE 3 (OPEN BOOK) — marked by Sarojini
  - Summative Assessment MODULE 3 (CLOSED BOOK) — marked by Sarojini
  - Revision Package with TEST for each session — AI-marked by Chamilo (results immediate)

### MODULE 4: BANKING TRANSACTIONS
- **Course Code:** MODULE4BANKINGTRANSACTIONS
- Covers day-to-day banking transactions, payment systems, and operational procedures
- **Assessments:**
  - Formative Assessment MODULE 4 (OPEN BOOK) — marked by Sarojini
  - Summative Assessment MODULE 4 (CLOSED BOOK) — marked by Sarojini
  - Revision Package with TEST for each session — AI-marked by Chamilo (results immediate)

### MODULE 5: BUSINESS BANKING
- **Course Code:** MODULE5BUSINESSBANKING
- Focuses on business banking products, services for SME and corporate clients
- **Assessments:**
  - Formative Assessment MODULE 5 (OPEN BOOK) — marked by Sarojini
  - Summative Assessment MODULE 5 (CLOSED BOOK) — marked by Sarojini
  - Revision Package with TEST for each session — AI-marked by Chamilo (results immediate)

### MODULE 6: MORTGAGE LOANS
- **Course Code:** MODULE6MORTGAGELOANS
- Covers mortgage lending principles, property finance, home loan products and regulations
- **Assessments:**
  - Formative Assessment MODULE 6 (OPEN BOOK) — marked by Sarojini
  - Summative Assessment MODULE 6 (CLOSED BOOK) — marked by Sarojini
  - Revision Package with TEST for each session — AI-marked by Chamilo (results immediate)

### HOW THE ASSESSMENT FLOW WORKS IN EACH MODULE:
1. **Study the Learning Path** — Go through sessions 1-3, listen to audio materials, study content
2. **Complete Revision Package** — Write the AI-marked TEST after each session. Results are immediate.
3. **Complete Formative Assessment** — OPEN BOOK assessment. Submit via Learner Declaration. Marked by Sarojini (3-5 working days).
4. **Complete Summative Assessment** — CLOSED BOOK assessment. Submit via Learner Declaration. Marked by Sarojini (3-5 working days).
5. **Download Declaration Forms** — From the course page or Learning Path

### TRAINERS FOR BANKING NQF 5:
- KORE DANIELLE SALEME FLAN
- SAROJINI NAIDOO (Assessor)
- SIMELOKUHLE SILALA
- ESTHER MKANDAWIRE
- GUEYASSER STEPHANE VRI (Administrator)

## GENERAL INFO
- All courses are online via live virtual sessions (except RE 5 Face-to-Face which is at our Randburg office)
- Study from anywhere in South Africa
- Requirements: Matric certificate + basic computer literacy
- Recorded sessions available for revision
- Website: www.cornerstonehr.co.za
- LMS Access (for study materials): www.cornerstonehr.co.za/lms or www.cornerstonehr.co.za/learn

## ACCREDITATION STATUS — CRITICAL: GET THIS RIGHT
- **National Certificate Banking NQF 5** — This is the ONLY BANKSETA-accredited programme we offer. It has SAQA ID 20186, NQF Level 5, 120 credits. The certificate is issued through BANKSETA after external moderation.
- **National Certificate Financial Markets NQF 6** — This is an NQF Level 6 qualification (SAQA ID: 50481, 120 Credits). NQF-aligned but NOT BANKSETA-accredited.
- **ALL OTHER COURSES** (Entrepreneurship, Health & Safety, HR Management, Logistics, Medical Call Centre, Business Administration, Professional Receptionist, Risk Management, RE 5 Preparation) — These are SHORT COURSES. They do NOT carry NQF credits and are NOT BANKSETA-accredited. They ARE professionally recognised and valued by many reputable organisations for skills development and professional growth.
- **RE 5 Preparation** — This is an EXAM PREPARATION course, not a qualification. It prepares you to write the RE 5 exam at Moonstone. It does NOT carry NQF credits.
- **WHEN A PROSPECT ASKS "Are your courses accredited?"** — Be honest and specific: "Our National Certificate: Banking NQF 5 is BANKSETA-accredited. Our other programmes are professionally recognised short courses that are valued by reputable organisations for skills development."
- **NEVER** say all courses are BANKSETA-accredited
- **NEVER** claim short courses carry NQF credits
- **NEVER** mislead about the accreditation or qualification status of any programme

## ACCURACY RULES — NEVER PROVIDE INCORRECT INFORMATION
- If you do not know the answer to a question, say "Let me check that for you" or "I'll get our management team to confirm that" — NEVER guess or make up information
- If asked about a course or programme Cornerstone Supreme does NOT offer, say "We don't currently offer that programme, but let me tell you about what we do have" — do not invent courses
- If asked about something outside your knowledge (e.g., RE1, other companies' courses, industry regulations you don't know), say "I'd recommend speaking directly with our management team for the most accurate information on that. You can reach them on 087 152 0606 or stephane@cornerstonehr.co.za" — NEVER guess

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
  const detectedCourse = extractCourseMention(studentMsg);
  const isRE5 = detectedCourse && detectedCourse.toLowerCase().includes('re 5');
  const ctxHasRE5 = ctx.course_interest && ctx.course_interest.toLowerCase().includes('re 5');
  const historyHasRE5 = ctx.message_history && ctx.message_history.some(m => 
    m.msg && /\b(re\s*5|re5|regulatory exam)\b/.test(m.msg.toLowerCase())
  );
  const isRE5Conversation = isRE5 || ctxHasRE5 || historyHasRE5;
  const studentAsksForLink = /\b(link|form|register|enrol|enroll|sign up|application|enrolment form|registration form)\b/.test(studentMsg.toLowerCase());
  
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
    let aiReply = data.choices?.[0]?.message?.content?.trim();
    if (!aiReply) return fallbackResponse(studentMsg, phone);
    
    // POST-PROCESSING SAFETY NET: If pre-AI check missed it, catch link denials here
    const aiDeniedLink = /\b(not available|cannot provide|don't have|do not have|can't share|cannot share|unable to|not accessible|unfortunately|no.*form|don't.*form|do not.*form)\b/.test(aiReply.toLowerCase());
    const aiHasLink = aiReply.includes('zjw4jz46ae4ok');
    if (aiDeniedLink || !aiHasLink) {
      // Check if ANY previous message in history mentions RE 5
      const historyHasRE5Anywhere = ctx.message_history && ctx.message_history.some(m => 
        m.msg && /\b(re\s*5|re5|regulatory exam)\b/.test(m.msg.toLowerCase())
      );
      if (historyHasRE5Anywhere && studentAsksForLink) {
        console.log('RE5 SAFETY NET: Replacing AI response with link.');
        aiReply = `Of course! Here is your RE 5 enrolment form:

https://zjw4jz46ae4ok.kimi.page

Please complete the form to secure your place. Once you've submitted it, our management team will follow up with you via email and send you:
📋 Your Admission Letter
🧾 The Invoice  
📎 Any additional documentation needed

Payment must be made in full upfront before the starting day. Is there anything else I can help you with? 😊`;
      }
    }
    
    const intent = detectIntent(studentMsg);
    const lang = detectLanguage(studentMsg);
    updateContext(phone, intent, detectedCourse, studentMsg, aiReply);
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
          const isRE5Interest = courseInterest && courseInterest.toLowerCase().includes('re 5');
          if (isRE5Interest) {
            response = `Perfect! Thank you so much for providing all your details, ${leadInfo.fullName || 'there'}! 

To secure your place for the RE 5 programme, please complete your enrolment right now using this link: https://zjw4jz46ae4ok.kimi.page

Once you've submitted the form, our management team will follow up with you via email and send you your Admission Letter, Invoice, and any additional documentation needed. Payment must be made in full upfront before the starting day.

In the meantime, do you have any other questions I can help you with? 😊`;
          } else {
            response = `Perfect! Thank you so much for providing all your details, ${leadInfo.fullName || 'there'}. 

I'll pass everything along to our management team right away, and they will send you:
📋 The Registration Form
🧾 The Invoice  
📎 Any additional enrolment documentation you need

This will be sent to ${leadInfo.email || 'your email'} shortly. In the meantime, do you have any other questions I can help you with? 😊`;
          }
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
        const isRE5 = relevantCourse.title.toLowerCase().includes('re 5');
        let paymentInfo = '';
        if (isRE5) {
          paymentInfo = `Payment for RE 5 is **full upfront only** — no instalments. We accept EFT or payment at our office. NO e-commerce payments on the website.`;
        } else {
          paymentInfo = `We offer a flexible payment plan for this course — a deposit plus monthly instalments to make it affordable. I can give you the exact breakdown if you'd like!`;
        }
        response = `The ${relevantCourse.title} is ${relevantCourse.price} for the full ${relevantCourse.duration} programme.

${paymentInfo}

${intake.urgencyMessage}

Would you like me to walk you through the registration process?`;
      } else {
        response = `Our courses range from R1,300 to R22,000 depending on the programme and level.

Here's a quick overview:
• Short Certificate Courses: R1,300 – R3,500
• Advanced Certificate Programmes: R4,500
• Specialist Programmes: R6,000
• National Certificate Banking NQF 5: R12,000
• National Certificate Financial Markets NQF 6: R22,000

Most of our courses offer flexible deposit + monthly instalment payment plans. Only the RE 5 preparation requires full upfront payment.

${intake.urgencyMessage}

Which area interests you — Finance, Business & HR, or Healthcare? I can give you exact pricing and the payment plan for any specific course. 😊`;
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
        const isRE5Enroll = relevantCourse.title.toLowerCase().includes('re 5');
        if (isRE5Enroll) {
          response = `Excellent choice! The ${relevantCourse.title} is the best step toward your career in financial services. Here's how to get started:

${intake.urgencyMessage}

To secure your place, please complete your enrolment right now using this link: https://zjw4jz46ae4ok.kimi.page

Once you've submitted the form, our management team will follow up with you via email and send you your Admission Letter, Invoice, and any additional documentation needed. Payment must be made in full upfront before the starting day.

Could you also share with me:
• Your full name and surname
• Your email address
• An alternative contact number

This way we can have everything prepared for you right away! 😊`;
        } else {
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
        }
      } else {
        response = `I'd love to help you get enrolled! Here's how it works:

${intake.urgencyMessage}

1️⃣ Visit https://www.cornerstonehr.co.za and select your course
2️⃣ Click "Enrol Now" and fill in your details
3️⃣ Choose your payment option — most courses offer a deposit + monthly instalment plan (only RE 5 requires full upfront payment)
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

📅 **Flexible Payment Plan** — Deposit + monthly instalments for most courses (except RE 5 which is full upfront)
🏢 **Employer-Sponsored** — Your company pays on your behalf

Our banking details for EFT or direct deposit:

🏦 Bank: FNB
📋 Account Name: Cornerstone Supreme
📋 Account Number: 62653109283
📋 Branch Code: 261750
📋 SWIFT Code: FIRNZAJJ (for international payments)
📝 Reference: Your Name

Once you've paid, email your proof of payment to stephane@cornerstonehr.co.za

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
📧 Email: stephane@cornerstonehr.co.za
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
        response = `Most of our courses offer a **flexible deposit + monthly instalment plan** to make your investment manageable. Only the RE 5 Regulatory Examination Preparation requires full upfront payment.

To give you the exact payment breakdown, could you let me know which course you're interested in? Each programme has its own specific deposit and instalment structure.

Our banking details for any payment:
🏦 Bank: FNB
📋 Account Name: Cornerstone Supreme
📋 Account Number: 62653109283
📋 Branch Code: 261750
📋 SWIFT Code: FIRNZAJJ (for international payments)
📝 Reference: Your Name

Send proof of payment to stephane@cornerstonehr.co.za

Which course would you like the payment plan for? 😊`;
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
📧 Email: stephane@cornerstonehr.co.za

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
        response = `Our programmes offer recognised certifications. Here's the breakdown:

🏆 **National Certificate: Banking NQF 5** — Our ONLY BANKSETA-accredited programme (SAQA ID 20186, NQF Level 5, 120 credits). Certificate issued through BANKSETA.
📜 **National Certificate: Financial Markets NQF 6** — SAQA-registered qualification (NQF Level 6) — NQF-aligned.
🎓 **All other courses** — Professionally recognised short courses with Advanced Certificates. Valued by reputable organisations for skills development, though they do not carry NQF credits.

After completion, you'll receive:
🎓 Your official certificate
📁 A skills portfolio
📝 A reference letter (on request)

${intake.urgencyMessage} Which course are you looking at?`;
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
      } else if (/\b(re\s*1\b|rei|key individual|ki exam)\b/.test(lower) && !/\bre\s*5\b/.test(lower)) {
        response = `The RE 1 is for **Key Individuals (KIs)** — those in management or supervisory roles who oversee a financial services practice. It's different from the RE 5, which is for Representatives who give financial advice to clients.

At Cornerstone Supreme, we specialise in **RE 5 preparation** for representatives. For RE 1, I'd recommend speaking directly with our management team who can give you the most accurate guidance.

You can reach them on:
☎️ Office: 087 152 0606
📧 Email: stephane@cornerstonehr.co.za

Is there anything else about our RE 5 programme I can help you with? 😊`;
      } else if (/\b(re5|re 5|regulatory exam|fais|fsca)\b/.test(lower)) {
        response = `Did you know the RE 5 is a **legal requirement** for everyone in financial services in South Africa? Without it, you simply cannot work in the industry legally. Don't let your career be held back!

We offer **two ways to prepare** for your RE 5 — both completed within 6 weeks:

💻 **Online Learning — R1,000**
Study from anywhere with live facilitator-led sessions, comprehensive study guides, mock exams, 24/7 recorded sessions, podcasts, video explainers, and full coverage of all 10 RE 5 modules.

🏢 **Face-to-Face Learning — R1,500**
Everything in the online programme PLUS you attend in-person sessions every Monday for 6 weeks at our Randburg office (367 Surrey Avenue, Ground Floor, Block B).

**Which study method would you prefer — Online Learning or Face-to-Face Learning?** 😊`;
        ctx.stage = 're5_method_selection';
      } else if (ctx.stage === 're5_method_selection' && /\b(online|face|face-to-face|face to face)\b/.test(lower)) {
        const method = /\b(face|face-to-face|face to face)\b/.test(lower) ? 'Face-to-Face' : 'Online';
        const price = /\b(face|face-to-face|face to face)\b/.test(lower) ? 'R1,500' : 'R1,000';
        response = `Great choice! The ${method} programme at ${price} is an excellent way to prepare. We've helped hundreds of candidates pass their RE 5 — you'll be in great hands!

Now, we currently have available intakes starting on:
📅 **22 June 2026**
📅 **29 June 2026**

Spaces are limited, so I recommend securing your spot quickly.

**Which of these dates would you prefer to begin your RE5 programme — 22 June 2026 or 29 June 2026?** 😊`;
        ctx.stage = 're5_date_selection';
      } else if (ctx.stage === 're5_date_selection' && /\b(22|29|twenty|first|second|june)\b/.test(lower)) {
        const date = /\b(29|twenty-?nine)\b/.test(lower) ? '29 June 2026' : '22 June 2026';
        response = `Perfect! I've noted **${date}** as your preferred start date. Let me get your registration sorted right away!

To secure your spot, please complete your enrolment using this link: https://zjw4jz46ae4ok.kimi.page

Once you've submitted the form, our management team will follow up with you via email and send you your Admission Letter, Invoice, and any additional documentation needed. Payment is required in full upfront before your start date — EFT or at our office only.

Could you also share with me:
• Your full name and surname
• Your date of birth
• Your email address
• An alternative contact number

This helps us prepare everything for you. And after you complete the 6-week training with us, we'll guide you through booking your official exam at Moonstone.

Let's get you started — what's your full name and surname? 😊`;
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
      } else if (/\b(other|another|else|what about|do you have|offer)\b/.test(lower) && lower.length < 50) {
        response = `I'd be happy to help! Just to make sure I give you the most accurate information, could you tell me a bit more about what you're looking for?

Here at Cornerstone Supreme, our main programmes are in:
• 📊 Finance & Banking (including RE 5 exam prep)
• 👔 Business & HR
• 🏥 Healthcare & Safety

If you're asking about something specific that I need to confirm, our management team will be happy to help:
☎️ Office: 087 152 0606
📧 Email: stephane@cornerstonehr.co.za

What field are you interested in? 😊`;
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

app.post('/api/trpc/leads.clearAll', (req, res) => {
  DB.leads = [];
  saveDB();
  res.json(trpc({ success: true, deleted: true }));
});

// SCREENSHOT UPLOAD ENDPOINTS
app.post('/api/trpc/leads.uploadScreenshot', (req, res) => {
  const input = parseInput(req);
  const screenshot = {
    id: nextId('screenshots'),
    name: input.name,
    filename: input.filename,
    mime_type: input.mimeType,
    size: input.size,
    data: input.data,
    created_at: new Date().toISOString()
  };
  DB.screenshots.push(screenshot);
  saveDB();
  res.json(trpc({ id: screenshot.id, success: true }));
});

app.post('/api/trpc/leads.listScreenshots', (req, res) => {
  res.json(trpc([...DB.screenshots].reverse().map(s => ({
    id: s.id,
    name: s.name,
    filename: s.filename,
    mime_type: s.mime_type,
    size: s.size,
    created_at: s.created_at
  }))));
});

app.post('/api/trpc/leads.deleteScreenshot', (req, res) => {
  const input = parseInput(req);
  DB.screenshots = DB.screenshots.filter(s => s.id !== input.id);
  saveDB();
  res.json(trpc({ success: true }));
});

app.get('/api/screenshots/:id', (req, res) => {
  const s = DB.screenshots.find(s => s.id === parseInt(req.params.id));
  if (!s) return res.status(404).send('Not found');
  const binary = Buffer.from(s.data, 'base64');
  res.set('Content-Type', s.mime_type);
  res.set('Content-Disposition', `inline; filename="${s.filename}"`);
  res.send(binary);
});

// CHAMILO LMS API ENDPOINTS
app.post('/api/trpc/lms.status', async (req, res) => {
  const apiKey = await chamiloGetApiKey();
  const userName = chamiloSession.userProfile ? chamiloSession.userProfile.fullName : CHAMILO_USERNAME;
  res.json(trpc({
    authenticated: !!apiKey,
    userName: userName,
    userId: chamiloSession.userProfile ? chamiloSession.userProfile.id : null,
    url: CHAMILO_API_URL ? CHAMILO_API_URL.replace(/\/+$/, '') : '',
    username: CHAMILO_USERNAME || '',
    lastError: chamiloSession.lastError || null
  }));
});

app.post('/api/trpc/lms.getUserProfile', async (req, res) => {
  const input = parseInput(req);
  const result = await chamiloGetUserProfile(input.username);
  res.json(trpc(result.error ? { error: result.message } : result.data));
});

app.post('/api/trpc/lms.getUserCourses', async (req, res) => {
  const input = parseInput(req);
  const result = await chamiloGetUserCourses(input.username);
  res.json(trpc(result.error ? { error: result.message } : (result.data || [])));
});

app.post('/api/trpc/lms.getCourseDetails', async (req, res) => {
  const input = parseInput(req);
  const result = await chamiloGetCourseDetails(input.courseId);
  res.json(trpc(result.error ? { error: result.message } : (result.data || {})));
});

app.post('/api/trpc/lms.getUserProgress', async (req, res) => {
  const input = parseInput(req);
  const result = await chamiloGetUserProgress(input.courseId, input.userId);
  res.json(trpc(result.error ? { error: result.message } : (result.data || {})));
});

app.post('/api/trpc/lms.getUserGrades', async (req, res) => {
  const input = parseInput(req);
  const result = await chamiloGetUserGrades(input.courseId, input.userId);
  res.json(trpc(result.error ? { error: result.message } : (result.data || {})));
});

app.post('/api/trpc/lms.getCourseExercises', async (req, res) => {
  const input = parseInput(req);
  const result = await chamiloGetCourseExercises(input.courseId);
  res.json(trpc(result.error ? { error: result.message } : (result.data || [])));
});

app.post('/api/trpc/lms.getExerciseResults', async (req, res) => {
  const input = parseInput(req);
  const result = await chamiloGetExerciseResults(input.courseId, input.exerciseId, input.userId);
  res.json(trpc(result.error ? { error: result.message } : (result.data || {})));
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
  console.log('  Chamilo LMS:', CHAMILO_API_URL ? 'Configured (' + CHAMILO_API_URL + ')' : 'Not configured');
  console.log('  Chamilo Auth:', CHAMILO_USERNAME ? 'Using ' + CHAMILO_USERNAME : 'No credentials');
  console.log('  WhatsApp: /api/webhook/whatsapp');
  console.log('='.repeat(60));
});
