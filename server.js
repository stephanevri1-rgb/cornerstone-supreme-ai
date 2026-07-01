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

    conversations: [],
    messages: [],
    enrollments: [],
    brochures: [],
    leads: [],
    screenshots: [],
    settings: {
      companyName: 'Cornerstone Supreme Education',
  
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
  
  const phonePatterns = [
    /(?:alternative|other|contact|cell|phone|number|reach me).*?(?:is|:)?\s*(\d[\d\s]{8,})/i,
    /(?:\+?27|0)[\s\d]{9,}/
  ];
  for (const p of phonePatterns) {
    const m = message.match(p);
    if (m) {
      const num = m[1] || m[0];
      if (num && num.replace(/\D/g, '').length >= 9) {
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
We offer **two ways to prepare** for your RE 5 — both completed within 6 weeks:

💻 **Online Learning — R1,000**
Example Step 7 message: "Thank you so much, [Name]! To secure your place for the RE 5 programme starting [date], please complete your enrolment right now using this link: https://zjw4jz46ae4ok.kimi.page

  Once you've submitted the form, our management team will follow up with you via email and send you your Admission Letter, Invoice, and any additional documentation needed. Payment must be made in full upfront before the starting day.
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
