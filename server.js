const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
// PDF parsing is done via pure JS (no external dependency)

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
      { id: 10, title: 'RE 5 Regulatory Examination Preparation (Online)', category: 'Finance', price: 'R1,000', duration: '6 weeks', description: 'Online preparation for the RE 5 Regulatory Examination, mandatory for financial services providers in South Africa. Covers all 10 RE 5 modules via live facilitator-led sessions. Full upfront payment required. This is an exam preparation course — it does NOT carry NQF credits. Upon completion, you must book and write the RE 5 exam independently at Moonstone.', format: 'Online', certification: 'Certificate of Completion', status: 'published', modules: ['FAIS Act 3 Introduction — Overview of the Financial Advisory and Intermediary Services Act, its purpose, scope, and regulatory framework.', 'Duties & Powers of the FAIS Ombud — Role and authority of the FAIS Ombud in resolving disputes and handling complaints.', 'Rights of the FSCA — Regulatory powers, supervisory functions, and enforcement rights of the Financial Sector Conduct Authority.', 'License Requirements for FSPs — Licensing categories, application processes, conditions, and ongoing obligations under FAIS.', 'Fit and Proper Requirements — Competency standards, qualifications, experience, and personal character criteria for representatives.', 'Supervision Arrangements — Requirements for adequate supervision of representatives, including oversight structures and monitoring systems.', 'The Debarment Process — Procedures and grounds for debarment, appeal processes, and consequences of removal from the industry.', 'Key Individual Responsibilities — Role and obligations of Key Individuals in FSPs, including governance and compliance oversight.', 'General Code of Conduct — Ethical behaviour standards, disclosure requirements, conflict of interest management, and professional conduct.', 'Financial Intelligence Centre Act — Anti-money laundering obligations, client identification, record-keeping, and suspicious transaction reporting.'] },
      { id: 13, title: 'RE 5 Regulatory Examination Preparation (Face-to-Face)', category: 'Finance', price: 'R1,500', duration: '6 weeks', description: 'Face-to-face preparation for the RE 5 Regulatory Examination at our Randburg headquarters. Attends every Monday for 6 weeks. Includes everything from the online programme plus in-person instruction. Full upfront payment required. This is an exam preparation course — it does NOT carry NQF credits. Upon completion, you must book and write the RE 5 exam independently at Moonstone.', format: 'Face-to-Face', certification: 'Certificate of Completion', status: 'published', modules: ['FAIS Act 3 Introduction — Overview of the Financial Advisory and Intermediary Services Act, its purpose, scope, and regulatory framework.', 'Duties & Powers of the FAIS Ombud — Role and authority of the FAIS Ombud in resolving disputes and handling complaints.', 'Rights of the FSCA — Regulatory powers, supervisory functions, and enforcement rights of the Financial Sector Conduct Authority.', 'License Requirements for FSPs — Licensing categories, application processes, conditions, and ongoing obligations under FAIS.', 'Fit and Proper Requirements — Competency standards, qualifications, experience, and personal character criteria for representatives.', 'Supervision Arrangements — Requirements for adequate supervision of representatives, including oversight structures and monitoring systems.', 'The Debarment Process — Procedures and grounds for debarment, appeal processes, and consequences of removal from the industry.', 'Key Individual Responsibilities — Role and obligations of Key Individuals in FSPs, including governance and compliance oversight.', 'General Code of Conduct — Ethical behaviour standards, disclosure requirements, conflict of interest management, and professional conduct.', 'Financial Intelligence Centre Act — Anti-money laundering obligations, client identification, record-keeping, and suspicious transaction reporting.'] },
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
      officePhone: '087 152 0608',
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

// Initialize extracted_numbers array
if (!DB.extracted_numbers) DB.extracted_numbers = [];

// Run retroactive scan on startup to populate numbers from past conversations
console.log('[RETRO] Running retroactive number scan...');
const retroResult = retroactiveNumberScan();
console.log('[RETRO] Scan complete:', retroResult);

// ============================================================
// NUMBER EXTRACTION FROM MESSAGES
// Extracts all phone numbers, ID numbers, payment references,
// amounts, and other numbers from every conversation
// ============================================================
function extractNumbersFromText(text) {
  const extracted = [];
  const seen = new Set();
  
  const add = (type, value, raw) => {
    const key = type + ':' + value;
    if (!seen.has(key)) {
      seen.add(key);
      extracted.push({ type, value, raw });
    }
  };
  
  // 1. Phone numbers (SA + international)
  // Format: 071 837 4853, 0718374853, +27718374853, +27 71 837 4853
  const phoneRegex = /(?:\+27|0)\s*[1-9]\s*\d\s*\d\s*\d\s*\d\s*\d\s*\d\s*\d\s*\d/g;
  const phones = text.match(phoneRegex);
  if (phones) {
    phones.forEach(p => {
      const clean = p.replace(/\s/g, '').replace(/^0/, '+27');
      add('phone', clean, p.trim());
    });
  }
  
  // 2. South African ID numbers (13 digits)
  const idRegex = /\b\d{2}((0[1-9])|(1[0-2]))((0[1-9])|([1-2]\d)|(3[0-1]))\d{4}[01]\d{1}[0-9]\d{1}\b/g;
  const ids = text.match(idRegex);
  if (ids) {
    ids.forEach(id => add('sa_id', id, id));
  }
  
  // 3. Rand amounts (R 500, R500, R5 000, R 5,000, etc.)
  const randRegex = /R\s*\d{1,3}(?:\s*,\s*\d{3})*(?:\s*\.\d{2})?/gi;
  const rands = text.match(randRegex);
  if (rands) {
    rands.forEach(r => add('amount', r, r));
  }
  
  // 4. Payment/reference numbers (4-20 digit sequences, often in context)
  const refRegex = /(?:reference|ref|payment|proof|pop|id)[\s#:]*\s*(\d{4,20})/gi;
  let refMatch;
  while ((refMatch = refRegex.exec(text)) !== null) {
    add('reference', refMatch[1], refMatch[0]);
  }
  
  // 5. Bank account numbers (8-16 digit sequences)
  const acctRegex = /(?:account|acc|acct)[\s#:]*\s*(\d{8,16})/gi;
  let acctMatch;
  while ((acctMatch = acctRegex.exec(text)) !== null) {
    add('bank_account', acctMatch[1], acctMatch[0]);
  }
  
  // 6. Years (e.g., 2024, 2025)
  const yearRegex = /\b(20\d{2})\b/g;
  const years = text.match(yearRegex);
  if (years) {
    years.forEach(y => add('year', y, y));
  }
  
  // 7. Standalone numbers (5+ digits, not part of other patterns)
  const numRegex = /\b(\d{5,})\b/g;
  let numMatch;
  while ((numMatch = numRegex.exec(text)) !== null) {
    const n = numMatch[1];
    // Skip if already captured as phone, ID, etc.
    if (!seen.has('phone:' + n) && !seen.has('sa_id:' + n) && 
        !seen.has('reference:' + n) && !seen.has('bank_account:' + n)) {
      add('number', n, n);
    }
  }
  
  return extracted;
}

// Store extracted numbers into the database
function storeExtractedNumbers(phone, text, timestamp) {
  try {
    const extracted = extractNumbersFromText(text);
    if (extracted.length === 0) return;
    
    if (!DB.extracted_numbers) DB.extracted_numbers = [];
    
    extracted.forEach(item => {
      DB.extracted_numbers.push({
        prospect_phone: phone,
        type: item.type,
        value: item.value,
        raw: item.raw,
        timestamp: timestamp || new Date().toISOString()
      });
    });
    
    saveDB();
    console.log('[EXTRACT] ' + phone + ': ' + extracted.length + ' numbers extracted (' + extracted.map(x => x.type).join(', ') + ')');
  } catch (err) {
    console.error('[EXTRACT] Error storing numbers:', err.message);
  }
}

// Build a CSV of all extracted numbers
function buildNumbersCSV() {
  const rows = DB.extracted_numbers || [];
  if (rows.length === 0) return 'No numbers extracted yet.';
  
  const headers = ['Timestamp', 'Prospect Phone', 'Type', 'Value', 'Raw Text'];
  const lines = [headers.join(',')];
  
  rows.forEach(row => {
    const line = [
      '"' + (row.timestamp || '').replace(/"/g, '""') + '"',
      '"' + (row.prospect_phone || '').replace(/"/g, '""') + '"',
      '"' + (row.type || '').replace(/"/g, '""') + '"',
      '"' + (row.value || '').replace(/"/g, '""') + '"',
      '"' + (row.raw || '').replace(/"/g, '""') + '"'
    ];
    lines.push(line.join(','));
  });
  
  return lines.join('\n');
}

// Retroactive scan: extract numbers from ALL past conversations in DB
function retroactiveNumberScan() {
  try {
    let totalExtracted = 0;
    let conversationsScanned = 0;
    
    // Scan all conversations
    (DB.conversations || []).forEach(conv => {
      conversationsScanned++;
      // Extract from student messages
      if (conv.studentMsg) {
        const extracted = extractNumbersFromText(conv.studentMsg);
        extracted.forEach(item => {
          DB.extracted_numbers.push({
            prospect_phone: conv.phone || 'unknown',
            type: item.type,
            value: item.value,
            raw: item.raw,
            timestamp: conv.timestamp || new Date().toISOString()
          });
          totalExtracted++;
        });
      }
      // Extract from bot responses too (banking details, prices, etc.)
      if (conv.botResponse) {
        const extracted = extractNumbersFromText(conv.botResponse);
        extracted.forEach(item => {
          DB.extracted_numbers.push({
            prospect_phone: conv.phone || 'unknown',
            type: item.type,
            value: item.value,
            raw: item.raw,
            timestamp: conv.timestamp || new Date().toISOString()
          });
          totalExtracted++;
        });
      }
    });
    
    // Also scan all messages
    (DB.messages || []).forEach(msg => {
      if (msg.text) {
        const extracted = extractNumbersFromText(msg.text);
        extracted.forEach(item => {
          DB.extracted_numbers.push({
            prospect_phone: msg.phone || 'unknown',
            type: item.type,
            value: item.value,
            raw: item.raw,
            timestamp: msg.timestamp || new Date().toISOString()
          });
          totalExtracted++;
        });
      }
    });
    
    saveDB();
    console.log('[RETRO] Scanned ' + conversationsScanned + ' conversations, extracted ' + totalExtracted + ' numbers');
    return { scanned: conversationsScanned, extracted: totalExtracted };
  } catch (err) {
    console.error('[RETRO] Scan error:', err.message);
    return { scanned: 0, extracted: 0, error: err.message };
  }
}

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
function getCourseByTitle(msg) {
  const lower = msg.toLowerCase();
  // First try exact title match
  for (const c of DB.courses) {
    if (c.status === 'published' && lower.includes(c.title.toLowerCase())) return c;
  }
  // Then try keyword matching (same as extractCourseMention but returns course object)
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
  for (const [kw, courseTitle] of Object.entries(keywords)) {
    if (lower.includes(kw)) {
      return DB.courses.find(c => c.status === 'published' && c.title === courseTitle);
    }
  }
  return null;
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
  // Extract and store method preference
  const lowerMsg = studentMessage.toLowerCase();
  if (/\b(face\s*to\s*face|face-to-face|in[-\s]?person|physical|classroom|attend|on[-\s]?site)\b/.test(lowerMsg)) {
    if (!ctx.lead_info) ctx.lead_info = {};
    ctx.lead_info.method = 'Face-to-Face';
  } else if (/\b(online|virtual|remote|distance|from home|e[-\s]?learning)\b/.test(lowerMsg)) {
    if (!ctx.lead_info) ctx.lead_info = {};
    ctx.lead_info.method = 'Online';
  }
  // Extract and store date preference
  const dateMatch = studentMessage.match(/\b(\d{1,2})\s+(January|February|March|April|May|June|July|August|September|October|November|December)\b/i);
  if (dateMatch) {
    if (!ctx.lead_info) ctx.lead_info = {};
    ctx.lead_info.preferredDate = `${dateMatch[1]} ${dateMatch[2]}`;
  }
  // Extract name if not already known
  if (!ctx.lead_info?.fullName) {
    const namePatterns = [
      /(?:my name is|i am|i'm|call me|this is)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/i,
      /\b([A-Z][a-z]+\s+[A-Z][a-z]+)\b/,
    ];
    for (const p of namePatterns) {
      const m = studentMessage.match(p);
      if (m && m[1] && m[1].length > 2 && !/^(hi|hey|hello|how|what|when|where|why|can|could|would|should|may|might|shall|will|do|does|did|have|has|had|am|is|are|was|were|be|been|being|the|this|that|these|those|my|your|his|her|its|our|their|a|an|and|but|or|nor|for|yet|so|at|by|from|in|into|of|off|on|onto|out|over|to|up|with|as|if|than|through|during|before|after|above|below|between|under|again|further|then|once|here|there|when|where|why|how|all|each|few|more|most|other|some|such|no|not|only|own|same|than|too|very|just|now)$/.test(m[1].toLowerCase())) {
        if (!ctx.lead_info) ctx.lead_info = {};
        ctx.lead_info.fullName = m[1];
        break;
      }
    }
  }
  // Extract email if not already known
  if (!ctx.lead_info?.email) {
    const emailMatch = studentMessage.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
    if (emailMatch) {
      if (!ctx.lead_info) ctx.lead_info = {};
      ctx.lead_info.email = emailMatch[0];
    }
  }
  // Extract phone if not already known
  if (!ctx.lead_info?.phone) {
    const phoneMatch = studentMessage.match(/\b(0\d{9})\b/);
    if (phoneMatch) {
      if (!ctx.lead_info) ctx.lead_info = {};
      ctx.lead_info.phone = phoneMatch[1];
    }
  }
  ctx.message_history.push({ role: 'student', msg: studentMessage, time: new Date().toISOString() });
  ctx.message_history.push({ role: 'lerato', msg: leratoReply, time: new Date().toISOString() });
  if (ctx.message_history.length > 50) ctx.message_history = ctx.message_history.slice(-50);
  saveDB();
}

// ============================================================
// DYNAMIC INTAKE DATE CALCULATOR
// ============================================================
function getNextMonday(fromDate) {
  const date = new Date(fromDate);
  date.setHours(0, 0, 0, 0);
  const day = date.getDay(); // 0=Sun, 1=Mon, ..., 6=Sat
  const daysUntilMonday = day === 1 ? 7 : (day === 0 ? 1 : 8 - day);
  date.setDate(date.getDate() + daysUntilMonday);
  return date;
}

function formatIntake(date) {
  const monthNames = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  return `Monday, ${date.getDate()} ${monthNames[date.getMonth()]} ${date.getFullYear()}`;
}

function getIntakeInfo() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Get the next available Monday (always in the future)
  const nextIntake = getNextMonday(today);
  // Get the Monday after that (for learners who want a later start)
  const followingIntake = new Date(nextIntake);
  followingIntake.setDate(followingIntake.getDate() + 7);

  const currentIntakeLabel = formatIntake(nextIntake);
  const followingIntakeLabel = formatIntake(followingIntake);

  const daysUntil = Math.ceil((nextIntake - today) / (1000 * 60 * 60 * 24));
  let urgencyMessage = '';
  if (daysUntil <= 3) {
    urgencyMessage = `Our next intake is coming up very soon — ${currentIntakeLabel}. Spaces are limited, so I'd recommend securing your spot today to avoid missing out.`;
  } else if (daysUntil <= 7) {
    urgencyMessage = `Our next intake is on ${currentIntakeLabel}. Spaces are filling up, so I'd recommend registering now to secure your place.`;
  } else {
    urgencyMessage = `Our next available intake is on ${currentIntakeLabel}. It's a great time to register and get your study materials ready.`;
  }

  return {
    currentIntake: nextIntake,
    currentIntakeLabel,
    followingIntake,
    followingIntakeLabel,
    urgencyMessage
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
function buildProspectProfile(phone) {
  const ctx = getContext(phone);
  const facts = [];
  
  if (ctx.course_interest) facts.push(`Course Interest: ${ctx.course_interest}`);
  if (ctx.lead_info?.fullName) facts.push(`Full Name: ${ctx.lead_info.fullName}`);
  if (ctx.lead_info?.email) facts.push(`Email: ${ctx.lead_info.email}`);
  if (ctx.lead_info?.phone) facts.push(`Phone: ${ctx.lead_info.phone}`);
  if (ctx.lead_info?.altPhone) facts.push(`Alt Phone: ${ctx.lead_info.altPhone}`);
  if (ctx.lead_info?.dob) facts.push(`Date of Birth: ${ctx.lead_info.dob}`);
  if (ctx.lead_info?.method) facts.push(`Preferred Method: ${ctx.lead_info.method}`);
  if (ctx.lead_info?.preferredDate) facts.push(`Preferred Intake Date: ${ctx.lead_info.preferredDate}`);
  if (ctx.lead_info?.location) facts.push(`Location: ${ctx.lead_info.location}`);
  if (ctx.lead_info?.company) facts.push(`Company: ${ctx.lead_info.company}`);
  if (ctx.last_intent) facts.push(`Last Topic: ${ctx.last_intent}`);
  
  return facts.length > 0 ? facts.join('\n') : 'No information collected yet — this is a new conversation.';
}

function buildSystemPrompt(phone) {
  const ctx = getContext(phone);
  const name = ctx.lead_info && ctx.lead_info.fullName ? ctx.lead_info.fullName : '';
  return `You are Lerato, a warm course advisor at Cornerstone Supreme Education. You are a real person texting on WhatsApp.
- Use contractions, emojis, friendly tone. Keep responses short (2-4 paragraphs).
- NEVER say "I'm an AI", "bot", or "virtual assistant".
- The prospect's name is ${name || 'not known yet'}. Use it if known.
- You ONLY handle greetings, thanks, goodbye, and general chat.
- If asked about courses, prices, or enrolment, say: "I'd love to help with that!" and stop.`;
}

async function generateAIResponse(studentMsg, phone) {
  const ctx = getContext(phone);
  const lower = studentMsg.toLowerCase().trim();

  // Extract lead info
  const leadInfo = extractLeadInfo(phone, studentMsg);
  const courseInterest = extractCourseMention(studentMsg);
  if (leadInfo.fullName && (leadInfo.email || leadInfo.altPhone)) {
    saveLead(phone, leadInfo, courseInterest);
  }

  // Stage-based routing: name/lead collection always uses deterministic code
  if (ctx.stage === 'name_collection' || ctx.stage === 'lead_collection' || ctx.stage === 'lead_qualification') {
    return fallbackResponse(studentMsg, phone);
  }

  // Detect if message is about any business topic
  const isAboutCourse = /\bre\s*5\b|\bre-5\b|regulatory exam|banking|financial markets|business admin|entrepreneurship|hr management|human resources|health and safety|logistics|supply chain|medical call|receptionist|risk management|course|programme|qualification|module|syllabus|study/.test(lower);
  const isAboutPricing = /\bprice|cost|how much|fee|r\d|rand\b/.test(lower);
  const isAboutIntake = /\bintake|start date|when.*start|next class|begin|commence|when.*next/.test(lower);
  const isAboutLink = /\blink|form|enrol|enroll|register|sign up|apply|registration\b/.test(lower);
  const isAboutPayment = /\bpayment|pay|installment|deposit|eft|transfer|banking details\b/.test(lower);
  const isAboutBrochure = /\bbrochure|catalog|pdf|download\b/.test(lower);

  // If ANY business question -> deterministic fallback (NEVER use AI for business logic)
  if (isAboutCourse || isAboutPricing || isAboutIntake || isAboutLink || isAboutPayment || isAboutBrochure) {
    return fallbackResponse(studentMsg, phone);
  }

  // NON-BUSINESS QUERIES ONLY: greetings, thanks, goodbye, general chat -> OpenAI
  if (!OPENAI_API_KEY) return fallbackResponse(studentMsg, phone);

  const messages = [{ role: 'system', content: buildSystemPrompt(phone) }];
  const recentHistory = ctx.message_history.slice(-6);
  for (const msg of recentHistory) {
    messages.push({ role: msg.role === 'student' ? 'user' : 'assistant', content: msg.msg });
  }
  messages.push({ role: 'user', content: studentMsg });

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${OPENAI_API_KEY}` },
      body: JSON.stringify({ model: 'gpt-4o-mini', messages, temperature: 0.3, max_tokens: 300 })
    });

    if (!response.ok) return fallbackResponse(studentMsg, phone);

    const data = await response.json();
    let aiReply = data.choices?.[0]?.message?.content?.trim();
    if (!aiReply) return fallbackResponse(studentMsg, phone);

    const intent = detectIntent(studentMsg);
    const lang = detectLanguage(studentMsg);
    updateContext(phone, intent, courseInterest, studentMsg, aiReply);
    return { response: aiReply, intent, lang };
  } catch (err) {
    return fallbackResponse(studentMsg, phone);
  }
}


function detectLanguage(msg) {
  const lower = msg.toLowerCase();
  if (/\b(hello|hi|hey|thank|please|good morning|good afternoon|good evening|how are you|what is|can you|could you|i want|i would like|i need|do you have|is there|are there|how much|what is the price|tell me about|give me|send me|i am interested|i am looking|help me|assist me|support me|i have a question|i would like to know|can i|may i|should i|will you|would you)\b/.test(lower)) return 'en';
  if (/\b(hallo|goeie|dankie|asseblief|hoe gaan dit|wat is|kan jy|ek wil|ek sou graag|ek het|het jy|is daar|hoeveel|wat is die prys|vertel my|gee my|stuur my|ek is geïnteresseer|ek soek|help my|ondersteun my|ek het 'n vraag)\b/.test(lower)) return 'af';
  if (/\b(sawubona|yebo|ngiyabonga|ngicela|unjani|yini|ungakwazi|ngifuna|ngingathanda|ngidinga|unayo|yikho|malini|yini intengo|ngitshele|nginike|ngithumele|ngiyathakazelela|ngiyadinga|ngisiza|nginika|nginale|ngiyabuza)\b/.test(lower)) return 'zu';
  return 'en';
}

function detectIntent(msg) {
  const lower = msg.toLowerCase();
  if (/\b(hi|hello|hey|sawubona|hallo|good morning|good afternoon|good evening)\b/.test(lower)) return 'greeting';
  // COURSE-SPECIFIC: Check course keywords FIRST (before lead_info "i am")
  if (/\b(re\s*5|re-5|regulatory exam|regulatory examination|fais|ombud|fsp|moonstone)\b/.test(lower)) return 'courses';
  if (/\b(banking\s*nqf\s*5|national certificate banking|bankseta)\b/.test(lower)) return 'courses';
  if (/\b(financial markets\s*nqf\s*6|nqf\s*6|national certificate financial markets|investment decisions|debt market)\b/.test(lower)) return 'courses';
  if (/\b(business admin|business administration)\b/.test(lower)) return 'courses';
  if (/\b(entrepreneurship|hr management|human resources|health and safety|logistics|supply chain|medical call|receptionist|risk management)\b/.test(lower)) return 'courses';
  if (/\b(price|cost|how much|fee|r\d|rand)\b/.test(lower)) return 'pricing';
  if (/\b(payment|pay|installment|deposit|eft|transfer|banking details|bank details)\b/.test(lower) && !/\b(enroll|register|sign up|apply)\b/.test(lower)) return 'payment_details';
  if (/\b(enroll|register|sign up|apply|registration|link|form)\b/.test(lower)) return 'enrollment';
  if (/\b(brochure|catalog|pdf|download)\b/.test(lower)) return 'brochure';
  if (/\b(course|learn|study|training|qualification|programme|module|syllabus|subject)\b/.test(lower)) return 'courses';
  if (/\b(thank|thanks)\b/.test(lower)) return 'thanks';
  if (/\b(bye|goodbye)\b/.test(lower)) return 'goodbye';
  // lead_info: "i am" alone should NOT match if followed by course-related words
  if (/\b(my name is|i'm|call me|full name|surname|date of birth|dob|email|alternative number|contact number|you can reach me)\b/.test(lower)) return 'lead_info';
  // Only match "i am" as lead_info if it's clearly about identity and NOT about courses
  if (/\b(i am)\b/.test(lower) && !/\b(interested|looking for|want to|would like|thinking about|considering|planning to)\b/.test(lower)) return 'lead_info';
  if (/\b(intake|start date|when does it start|next class|begin|commence)\b/.test(lower)) return 'intake_dates';
  if (/\b(contact|phone|number|call|reach|office)\b/.test(lower)) return 'contact';
  return 'general';
}

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

  // ============================================================
  // LINK REQUEST PRE-CHECK: If user asks for a link/form and we know the course,
  // send the correct enrolment link immediately — regardless of intent.
  // This overrides EVERYTHING because sending the link is the #1 sales goal.
  // ============================================================
  const asksForLink = /\b(link|form|enrol|enroll|register|sign up|apply|registration)\b/.test(lower);
  const saysYesToLink = /\b(yes|yeah|yep|sure|ok|okay|please do|go ahead|definitely|absolutely|send it|send the link|i want to register|i want to enrol)\b/.test(lower) && ctx.course_interest;
  
  if (asksForLink || saysYesToLink) {
    const linkCourse = relevantCourse || (ctx.course_interest ? DB.courses.find(c => c.title === ctx.course_interest) : null);
    if (linkCourse) {
      const isRE5Link = linkCourse.title.toLowerCase().includes('re 5');
      const isBankingLink = linkCourse.title.toLowerCase().includes('banking');
      const isNQF6Link = linkCourse.title.toLowerCase().includes('financial markets');
      const isBusinessAdminLink = linkCourse.title.toLowerCase().includes('business administration');
      
      if (isRE5Link) {
        response = `Of course! Here is your RE 5 enrolment form:

https://zjw4jz46ae4ok.kimi.page

Please complete the form to secure your place. Once you've submitted it, our management team will follow up with you via email and send you:
📋 Your Admission Letter
🧾 The Invoice
📎 Any additional documentation needed.

Is there anything else I can help you with? 😊`;
      } else if (isBankingLink) {
        response = `Of course! Here is your National Certificate Banking NQF 5 enrolment form:

https://cornerstoneenrolmentform.kimi.pro

Please complete the form to secure your place. Once you've submitted it, our management team will follow up with you via email and send you:
📋 Your Admission Letter
🧾 The Invoice
📎 Any additional documentation needed.

Is there anything else I can help you with? 😊`;
      } else if (isNQF6Link) {
        response = `Of course! Here is your National Certificate Financial Markets NQF 6 enrolment form:

https://cornerstone-enrol.kimi.pro

Please complete the form to secure your place. Once you've submitted it, our management team will follow up with you via email and send you:
📋 Your Admission Letter
🧾 The Invoice
📎 Any additional documentation needed.

Is there anything else I can help you with? 😊`;
      } else if (isBusinessAdminLink) {
        response = `Of course! Here is your Business Administration enrolment form:

https://cornerstonebusinessadmin.kimi.pro

Please complete the form to secure your place. Once you've submitted it, our management team will follow up with you via email and send you:
📋 Your Admission Letter
🧾 The Invoice
📎 Any additional documentation needed.

Is there anything else I can help you with? 😊`;
      } else {
        response = `I'd love to send you the enrolment link! Could you let me know which specific course you're interested in? I want to make sure I send you the correct one. 😊`;
      }
      updateContext(phone, 'enrollment', linkCourse.title, studentMsg, response);
      return { response, intent: 'enrollment', lang };
    }
  }

  // STAGE-FIRST HANDLING: Check conversation stage BEFORE intent
  // This ensures proper flow control regardless of what the intent detector says
  if (ctx.stage === 'name_collection') {
    // Match names after explicit introducers OR standalone words (accept lowercase too)
    const nameMatch = studentMsg.match(/(?:my name is|i am|i'm|call me|this is|im|name is)\s+([A-Za-z]+(?:\s+[A-Za-z]+)?)/i) || 
                      studentMsg.match(/^\s*([A-Za-z]+(?:\s+[A-Za-z]+)?)\s*$/);
    let gotName = false;
    if (nameMatch && nameMatch[1] && nameMatch[1].length > 1) {
      let detectedName = nameMatch[1].trim();
      // Capitalize first letter
      detectedName = detectedName.charAt(0).toUpperCase() + detectedName.slice(1).toLowerCase();
      const isCommonWord = /^(hi|hello|hey|yes|no|ok|okay|thanks|thank|please|sorry|what|when|where|why|how|who|which|the|and|but|or|for|with|from|about|into|through|during|before|after|above|below|between|under|again|further|then|once|here|there|all|each|few|more|most|other|some|such|only|own|same|than|too|very|just|now|can|will|would|could|should|may|might|shall|must|has|have|had|been|being|was|were|are|is|am|do|does|did|done|get|got|go|going|went|come|came|take|took|make|made|see|saw|know|knew|think|thought|say|said|tell|told|ask|asked|give|gave|find|found|feel|felt|try|tried|need|needed|want|wanted|use|used|work|worked|call|called|put|let|keep|kept|help|helped|show|showed|play|played|move|moved|live|lived|believe|believed|bring|brought|happen|happened|write|wrote|provide|provided|sit|sat|stand|stood|lose|lost|pay|paid|meet|met|include|included|continue|continued|set|learn|learned|change|changed|lead|led|understand|understood|watch|watched|follow|followed|stop|stopped|create|created|speak|spoke|read|allow|allowed|add|added|spend|spent|grow|grew|open|opened|walk|walked|win|won|offer|offered|remember|remembered|love|loved|consider|considered|appear|appeared|buy|bought|wait|waited|serve|served|send|sent|expect|expected|build|built|stay|stayed|fall|fell|cut|reach|reached|kill|killed|remain|remained|suggest|suggested|raise|raised|pass|passed|sell|sold|require|required|report|reported|decide|decided|pull|pulled|i|me|my|mine|you|your|yours|he|him|his|she|her|hers|it|its|we|us|our|ours|they|them|their|theirs|this|that|these|those|a|an|to|of|in|on|at|by|up|down|out|off|over|under)$/i.test(detectedName);
      if (!isCommonWord) {
        if (!ctx.lead_info) ctx.lead_info = {};
        ctx.lead_info.fullName = detectedName;
        saveDB();
        response = `Lovely to meet you, ${detectedName}! 🌟

Now, tell me — what brings you to Cornerstone Supreme Education today? Are you looking to upskill in your current field, start a new career, or perhaps explore professional qualifications? I'd love to help you find the right path. 😊`;
        ctx.stage = 'needs_discovery';
        gotName = true;
      }
    }
    if (!gotName) {
      response = `What may I call you? Just your first name is perfectly fine. 😊`;
    }
  } else {

  switch(intent) {
    case 'greeting':
      response = `Hello there! 👋 Welcome to Cornerstone Supreme Education.

My name is Lerato, and I'm a course advisor here. It's lovely to hear from you!

Before we dive in, may I ask your name? I'd love to address you properly throughout our conversation. 😊`;
      ctx.stage = 'name_collection';
      break;

    case 'thanks':
      response = `You're very welcome! It's been a pleasure chatting with you. 

If you think of any other questions, just send me a message — I'm always here to help. Have a wonderful day! 🌟`;
      break;

    case 'goodbye':
      response = `Goodbye for now! Thank you for considering Cornerstone Supreme Education. 

Feel free to reach out on WhatsApp (0718374853) or give our office a call on 087 152 0608 whenever you're ready. Take care! 👋`;
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
          // Use current message's course interest OR persistent memory
          const effectiveCourseInterest = courseInterest || ctx.course_interest || '';
          const isRE5Interest = effectiveCourseInterest && effectiveCourseInterest.toLowerCase().includes('re 5');
          const isBankingNQF5Interest = effectiveCourseInterest && (effectiveCourseInterest.toLowerCase().includes('banking nqf 5') || effectiveCourseInterest.toLowerCase().includes('banking') && effectiveCourseInterest.toLowerCase().includes('nqf'));
          const isNQF6Interest = effectiveCourseInterest && (effectiveCourseInterest.toLowerCase().includes('financial markets') || effectiveCourseInterest.toLowerCase().includes('nqf 6'));
          const isBusinessAdminInterest = effectiveCourseInterest && (effectiveCourseInterest.toLowerCase().includes('business administration') || effectiveCourseInterest.toLowerCase().includes('business admin'));
          if (isRE5Interest) {
            response = `Perfect! Thank you so much for providing all your details, ${leadInfo.fullName || 'there'}! 

To secure your place for the RE 5 programme, please complete your enrolment right now using this link: https://zjw4jz46ae4ok.kimi.page

Once you've submitted the form, our management team will follow up with you via email and send you your Admission Letter, Invoice, and any additional documentation needed. Payment must be made in full upfront before the starting day.

In the meantime, do you have any other questions I can help you with? 😊`;
          } else if (isBankingNQF5Interest) {
            response = `Perfect! Thank you so much for providing all your details, ${leadInfo.fullName || 'there'}! 

To secure your place for the National Certificate Banking NQF 5 programme, please complete your enrolment right now using this link: https://cornerstoneenrolmentform.kimi.pro

Once you've submitted the form, our management team will follow up with you via email and send you your Admission Letter, Invoice, and any additional documentation needed. This is our BANKSETA-accredited qualification — an excellent investment in your banking career!

In the meantime, do you have any other questions I can help you with? 😊`;
          } else if (isNQF6Interest) {
            response = `Perfect! Thank you so much for providing all your details, ${leadInfo.fullName || 'there'}! 

To secure your place for the National Certificate Financial Markets and Instruments NQF 6 programme, please complete your enrolment right now using this link: https://cornerstone-enrol.kimi.pro

Once you've submitted the form, our management team will follow up with you via email and send you your Admission Letter, Invoice, and any additional documentation needed. This is a comprehensive 12-month qualification that opens doors to the financial services industry!

In the meantime, do you have any other questions I can help you with? 😊`;
          } else if (isBusinessAdminInterest) {
            response = `Perfect! Thank you so much for providing all your details, ${leadInfo.fullName || 'there'}! 

To secure your place for the Online Advanced Business Administration programme, please complete your enrolment right now using this link: https://cornerstonebusinessadmin.kimi.pro

Once you've submitted the form, our management team will follow up with you via email and send you your Admission Letter, Invoice, and any additional documentation needed. This Advanced Certificate equips you with essential business and administrative skills valued by employers across all industries!

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
      // Use persistent course memory if no course detected in current message
      const pricingCourse = relevantCourse || (ctx.course_interest ? DB.courses.find(c => c.title === ctx.course_interest) : null);
      if (pricingCourse) {
        const isRE5 = pricingCourse.title.toLowerCase().includes('re 5');
        let paymentInfo = '';
        if (isRE5) {
          paymentInfo = `Payment for RE 5 is **full upfront only** — no instalments. We accept EFT or payment at our office. NO e-commerce payments on the website.`;
        } else {
          paymentInfo = `We offer a flexible payment plan for this course — a deposit plus monthly instalments to make it affordable. I can give you the exact breakdown if you'd like!`;
        }
        response = `The ${pricingCourse.title} is ${pricingCourse.price} for the full ${pricingCourse.duration} programme.

${paymentInfo}

${intake.urgencyMessage}

Would you like me to walk you through the registration process?`;
      } else {
        response = `I'd be happy to give you the exact pricing. Could you let me know which specific course you're interested in?

Our main programmes are:
• 📊 Finance & Banking (RE 5, Banking NQF 5, Financial Markets NQF 6)
• 👔 Business & HR (Business Administration, HR Management, Entrepreneurship)
• 🏥 Healthcare & Safety (Medical Call Centre, Health & Safety, Risk Management)

Just tell me the course name and I'll give you the exact price and payment plan! 😊`;
      }
      break;

    case 'courses':
      // If they mentioned a SPECIFIC course, give THAT course's details — NEVER dump the full catalog
      // Also check persistent memory for course interest from earlier in the conversation
      const activeCourse = relevantCourse || (ctx.course_interest ? DB.courses.find(c => c.title === ctx.course_interest) : null);
      if (activeCourse) {
        const isRE5Course = activeCourse.title.toLowerCase().includes('re 5');
        const isBankingCourse = activeCourse.title.toLowerCase().includes('banking nqf 5');
        const isNQF6Course = activeCourse.title.toLowerCase().includes('financial markets');
        const isBusinessAdminCourse = activeCourse.title.toLowerCase().includes('business administration');
        
        if (isRE5Course) {
          response = `Absolutely! The RE 5 is a **mandatory legal requirement** for everyone in financial services in South Africa — without it, you simply cannot work in the industry legally.

**What you get with our 6-week preparation:**
• Live facilitator-led online sessions
• All 10 RE 5 modules covered comprehensively
• Mock examinations under exam conditions
• 24/7 access to recorded sessions, podcasts, and video explainers
• Comprehensive study guides and practice questions

**Pricing:**
💻 Online Preparation — R1,000 (study from anywhere)
🏢 Face-to-Face Preparation — R1,500 (attend every Monday at our Randburg office)

**Important:** After completing our preparation course, you book and write the official RE 5 exam independently at Moonstone (exam fee: R1,300 paid directly to them).

${intake.urgencyMessage}

This programme is in high demand and spots fill quickly. Shall I send you the enrolment link right now to secure your place? 😊`;
        } else if (isBankingCourse) {
          response = `Excellent choice! The **National Certificate: Banking NQF 5** is our flagship BANKSETA-accredited qualification.

**Programme Overview:**
• 12-month online qualification (SAQA ID: 20186, 120 Credits, NQF Level 5)
• Gateway to commercial banks, lending institutions, and government regulatory departments
• Six comprehensive core modules
• Certificate issued through BANKSETA after external moderation

**Investment:** R12,000
**Payment Options:**
• Deposit: R3,000 + 9 monthly instalments of R1,000
• Deposit: R4,000 + 8 monthly instalments of R1,000
• Deposit: R6,000 + 6 monthly instalments of R1,000

${intake.urgencyMessage}

This is our most popular qualification. Shall I send you the enrolment link to get registered? 😊`;
        } else if (isNQF6Course) {
          response = `Fantastic choice! The **National Certificate: Financial Markets and Instruments NQF 6** is an advanced qualification for serious financial professionals.

**Programme Overview:**
• 12-month online qualification (SAQA ID: 50481, 120 Credits, NQF Level 6)
• Covers investment decisions, company analysis, debt market, market trends, cash flow analysis, and risk management
• Develops professionals who can analyse and make informed decisions in the financial landscape

**Investment:** R22,000
**Payment Options:**
• Deposit: R3,000 + 9 monthly instalments of R1,000
• Deposit: R4,000 + 8 monthly instalments of R1,000
• Deposit: R6,000 + 6 monthly instalments of R1,000

${intake.urgencyMessage}

Shall I send you the enrolment link to secure your place? 😊`;
        } else if (isBusinessAdminCourse) {
          response = `Great choice! The **Online Advanced Business Administration** equips you with essential administrative and business skills.

**Programme Overview:**
• 6 months, fully online
• 15 modules spanning leadership, finance, technology, and core business skills
• Advanced Certificate — professionally recognised

**Investment:** R4,500
**Payment Options:**
• Deposit: R3,000 + 9 monthly instalments of R1,000
• Deposit: R4,000 + 8 monthly instalments of R1,000
• Deposit: R6,000 + 6 monthly instalments of R1,000

${intake.urgencyMessage}

Shall I send you the enrolment link right now? 😊`;
        } else {
          response = `Great choice! The **${activeCourse.title}** is a fantastic programme.

• Price: ${activeCourse.price}
• Duration: ${activeCourse.duration}
• Format: ${activeCourse.format}
• Certification: ${activeCourse.certification}

${intake.urgencyMessage}

Does this sound like the right programme for you? I'd love to get you registered for our next intake! 😊`;
        }
      } else {
        response = `I'd love to help you with that! Could you tell me which specific course you're interested in?

Our main programmes are:
• 📊 Finance & Banking (RE 5, Banking NQF 5, Financial Markets NQF 6)
• 👔 Business & HR (Business Administration, HR Management, Entrepreneurship)
• 🏥 Healthcare & Safety (Medical Call Centre, Health & Safety, Risk Management)

Just tell me the course name and I'll give you the full details — pricing, duration, modules, certification, and the enrolment link! 😊`;
      }
      break;

    case 'enrollment':
      // Check persistent course interest first, then current message
      const enrollCourse = relevantCourse || (ctx.course_interest ? DB.courses.find(c => c.title === ctx.course_interest) : null);
      if (enrollCourse) {
        const isRE5Enroll = enrollCourse.title.toLowerCase().includes('re 5');
        const isBankingEnroll = enrollCourse.title.toLowerCase().includes('banking');
        const isNQF6Enroll = enrollCourse.title.toLowerCase().includes('financial markets');
        const isBusinessAdminEnroll = enrollCourse.title.toLowerCase().includes('business administration');
        
        if (isRE5Enroll) {
          response = `Excellent choice! The ${enrollCourse.title} is the best step toward your career in financial services. Here's how to get started:

${intake.urgencyMessage}

To secure your place, please complete your enrolment right now using this link: https://zjw4jz46ae4ok.kimi.page

Once you've submitted the form, our management team will follow up with you via email and send you your Admission Letter, Invoice, and any additional documentation needed. Payment must be made in full upfront before the starting day.

Could you also share with me:
• Your full name and surname
• Your email address
• An alternative contact number

This way we can have everything prepared for you right away! 😊`;
        } else if (isBankingEnroll) {
          response = `Excellent choice! The ${enrollCourse.title} is our flagship BANKSETA-accredited qualification. Here's how to get started:

${intake.urgencyMessage}

To secure your place, please complete your enrolment right now using this link: https://cornerstoneenrolmentform.kimi.pro

Once you've submitted the form, our management team will follow up with you via email and send you your Admission Letter, Invoice, and any additional documentation needed.

Could you also share with me:
• Your full name and surname
• Your email address
• An alternative contact number

This way we can have everything prepared for you right away! 😊`;
        } else if (isNQF6Enroll) {
          response = `Excellent choice! The ${enrollCourse.title} is an advanced qualification for serious financial professionals. Here's how to get started:

${intake.urgencyMessage}

To secure your place, please complete your enrolment right now using this link: https://cornerstone-enrol.kimi.pro

Once you've submitted the form, our management team will follow up with you via email and send you your Admission Letter, Invoice, and any additional documentation needed.

Could you also share with me:
• Your full name and surname
• Your email address
• An alternative contact number

This way we can have everything prepared for you right away! 😊`;
        } else if (isBusinessAdminEnroll) {
          response = `Excellent choice! The ${enrollCourse.title} equips you with essential business and administrative skills. Here's how to get started:

${intake.urgencyMessage}

To secure your place, please complete your enrolment right now using this link: https://cornerstonebusinessadmin.kimi.pro

Once you've submitted the form, our management team will follow up with you via email and send you your Admission Letter, Invoice, and any additional documentation needed.

Could you also share with me:
• Your full name and surname
• Your email address
• An alternative contact number

This way we can have everything prepared for you right away! 😊`;
        } else {
          response = `Excellent choice! The ${enrollCourse.title} is a fantastic programme.

${intake.urgencyMessage}

I can send you the enrolment link directly — just need a few quick details from you:
• Your full name and surname
• Your email address
• An alternative contact number

Once I have that, I'll send the link right away and our management team will follow up with your Admission Letter and Invoice. 😊`;
        }
      } else {
        response = `I'd love to help you get enrolled! Here's how it works:

${intake.urgencyMessage}

To make it easier, I can have our management team send the registration documents directly to you. Just share:
• Your full name and surname
• Which course you're interested in
• Your email address

Which course has caught your eye? I can send you the correct enrolment link right away!`;
      }
      ctx.stage = 'lead_collection';
      break;

    case 'brochure':
      response = `Absolutely! I can give you all the details right here — no need to browse anywhere.

We offer professional programmes in:
• 📊 Finance & Banking (RE 5, Banking NQF 5, Financial Markets NQF 6)
• 👔 Business & HR (Business Administration, HR Management, Entrepreneurship, Logistics, Professional Receptionist)
• 🏥 Healthcare & Safety (Medical Call Centre, Health & Safety, Risk Management)

Which course caught your eye? Just tell me the name and I'll give you the full details — pricing, duration, modules, certification, and the enrolment link. 😊

${intake.urgencyMessage}`;
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
☎️ Office Line: 087 152 0608
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
      // If user says yes/ok/sure and we know the course, send the link immediately
      if (/\b(yes|yeah|yep|sure|ok|okay|please|go ahead|definitely|absolutely|send it)\b/.test(lower) && ctx.course_interest) {
        const yesCourse = DB.courses.find(c => c.title === ctx.course_interest);
        if (yesCourse) {
          if (yesCourse.title.toLowerCase().includes('re 5')) {
            response = `Of course! Here is your RE 5 enrolment form:

https://zjw4jz46ae4ok.kimi.page

Please complete the form to secure your place. Once you've submitted it, our management team will follow up with you via email and send you:
📋 Your Admission Letter
🧾 The Invoice
📎 Any additional documentation needed.

Is there anything else I can help you with? 😊`;
          } else if (yesCourse.title.toLowerCase().includes('banking')) {
            response = `Of course! Here is your National Certificate Banking NQF 5 enrolment form:

https://cornerstoneenrolmentform.kimi.pro

Please complete the form to secure your place. Once you've submitted it, our management team will follow up with you via email and send you:
📋 Your Admission Letter
🧾 The Invoice
📎 Any additional documentation needed.

Is there anything else I can help you with? 😊`;
          } else if (yesCourse.title.toLowerCase().includes('financial markets')) {
            response = `Of course! Here is your National Certificate Financial Markets NQF 6 enrolment form:

https://cornerstone-enrol.kimi.pro

Please complete the form to secure your place. Once you've submitted it, our management team will follow up with you via email and send you:
📋 Your Admission Letter
🧾 The Invoice
📎 Any additional documentation needed.

Is there anything else I can help you with? 😊`;
          } else if (yesCourse.title.toLowerCase().includes('business administration')) {
            response = `Of course! Here is your Business Administration enrolment form:

https://cornerstonebusinessadmin.kimi.pro

Please complete the form to secure your place. Once you've submitted it, our management team will follow up with you via email and send you:
📋 Your Admission Letter
🧾 The Invoice
📎 Any additional documentation needed.

Is there anything else I can help you with? 😊`;
          }
          updateContext(phone, 'enrollment', yesCourse.title, studentMsg, response);
          return { response, intent: 'enrollment', lang };
        }
      }
      
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
☎️ Office: 087 152 0608
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
          response = `Our courses range from 3 weeks to 12 months depending on the programme. All are online with flexible scheduling — perfect if you're working while studying.

Could you tell me which specific course you're interested in? Then I can give you the exact duration and all the other details. 😊`;
        }
      } else if (/\b(cert|certificate|accredited|nqf|saqa|recognised|recognized)\b/.test(lower)) {
        response = `Great question! Our certification depends on the specific course:

🏆 **Banking NQF 5** — Our ONLY BANKSETA-accredited programme (SAQA ID 20186, 120 credits)
📜 **Financial Markets NQF 6** — SAQA-registered qualification (NQF Level 6)
🎓 **All other courses** — Professionally recognised Advanced Certificates

After completion, you'll receive your official certificate, a skills portfolio, and a reference letter on request.

Which course are you interested in? I can give you the exact certification details for that one. 😊`;
      } else if (/\b(job|work|career|employment|opportunity|salary|earn)\b/.test(lower)) {
        response = `Great question! Our programmes are designed to open doors in the job market. Each course prepares you for a specific career path — from banking and financial services to HR, healthcare administration, and business operations.

Many of our students study while working and use their qualification to advance in their current role or switch careers entirely.

Could you tell me which course you're interested in? Then I can explain exactly how it fits your career goals. 😊`;
      } else if (/\b(re\s*1\b|rei|key individual|ki exam)\b/.test(lower) && !/\bre\s*5\b/.test(lower)) {
        response = `The RE 1 is for **Key Individuals (KIs)** — those in management or supervisory roles who oversee a financial services practice. It's different from the RE 5, which is for Representatives who give financial advice to clients.

At Cornerstone Supreme, we specialise in **RE 5 preparation** for representatives. For RE 1, I'd recommend speaking directly with our management team who can give you the most accurate guidance.

You can reach them on:
☎️ Office: 087 152 0608
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
📅 **${intake.currentIntakeLabel}**
📅 **${intake.followingIntakeLabel}**

Spaces are limited, so I recommend securing your spot quickly.

**Which of these dates would you prefer to begin your RE5 programme — ${intake.currentIntakeLabel} or ${intake.followingIntakeLabel}?** 😊`;
        ctx.stage = 're5_date_selection';
      } else if (ctx.stage === 're5_date_selection' && /\b(first|current|earlier|sooner|next|later|following|1st|2nd|yes|ok|okay|sure|either|any|both)\b/.test(lower)) {
        const date = /\b(second|later|next|following)\b/.test(lower) ? intake.followingIntakeLabel : intake.currentIntakeLabel;
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
        response = `I'd be happy to help! Could you tell me what you're looking for? Our main programmes cover Finance & Banking, Business & HR, and Healthcare & Safety.

If you have a specific question, just let me know and I'll give you the exact details. Or if you need something I need to confirm, our management team can help:
☎️ Office: 087 152 0608
📧 Email: stephane@cornerstonehr.co.za`;
      } else {
        response = `Thank you for your message! I'm Lerato from Cornerstone Supreme Education.

I'd love to help you find the right course. Could you tell me which specific programme you're interested in?

Our main areas are:
• 📊 Finance & Banking (RE 5, Banking NQF 5, Financial Markets NQF 6)
• 👔 Business & HR (Business Administration, HR Management, Entrepreneurship)
• 🏥 Healthcare & Safety (Medical Call Centre, Health & Safety, Risk Management)

Just tell me the course name and I'll give you the exact details — pricing, duration, next intake, and the enrolment link! 😊`;
        ctx.stage = 'needs_discovery';
      }
  }
  } // Close the else block for stage-first handling

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

// CSV export of all extracted numbers
app.get('/api/export/numbers', (req, res) => {
  const csv = buildNumbersCSV();
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="lerato_extracted_numbers.csv"');
  res.send(csv);
});

// Stats for extracted numbers
app.get('/api/numbers/stats', (req, res) => {
  const rows = DB.extracted_numbers || [];
  const stats = {
    total: rows.length,
    byType: {},
    byProspect: {},
    recent: rows.slice(-50)
  };
  rows.forEach(r => {
    stats.byType[r.type] = (stats.byType[r.type] || 0) + 1;
    stats.byProspect[r.prospect_phone] = (stats.byProspect[r.prospect_phone] || 0) + 1;
  });
  res.json(stats);
});

// Trigger retroactive scan
app.post('/api/numbers/scan', (req, res) => {
  const result = retroactiveNumberScan();
  res.json({ ok: true, result });
});

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
    const name = msg.contacts?.[0]?.profile?.name || 'Student';

    // Check for media messages (images, documents/PDFs)
    const hasMedia = msg.image || msg.document;
    if (hasMedia) {
      const handled = await processMediaMessage(msg, from, name);
      if (handled) return;
    }

    // Process text messages
    const text = msg.text?.body || '';
    if (!text.trim()) return;
    console.log(`[IN] ${from}: ${text}`);
    
    // Extract and store all numbers from the incoming message
    storeExtractedNumbers(from, text, new Date().toISOString());
    
    const { response, intent, lang } = await generateAIResponse(text, from);
    saveConversation(from, name, text, response, intent, lang);
    await sendWhatsAppMessage(from, response);
    console.log(`[OUT] ${from}: ${response.substring(0, 80)}...`);
  } catch (err) {
    console.error('Webhook error:', err.message);
  }
});

// ============================================================
// MEDIA ANALYSIS - Images & PDFs
// ============================================================

async function downloadMedia(mediaId) {
  try {
    console.log(`[MEDIA] Step 1: Requesting media metadata for ID: ${mediaId.substring(0, 20)}...`);

    // 360dialog returns a 302 redirect with the actual file URL in the Location header
    // We MUST use redirect: 'manual' to capture the Location header
    const metaRes = await fetch(`${WHATSAPP_API}/media/${mediaId}`, {
      method: 'GET',
      headers: { 'D360-API-Key': API_KEY },
      redirect: 'manual'
    });

    console.log(`[MEDIA] Metadata response status: ${metaRes.status}`);

    let downloadUrl = null;
    let mimeType = 'application/octet-stream';

    // Check for redirect (302 or 301)
    if (metaRes.status === 302 || metaRes.status === 301) {
      downloadUrl = metaRes.headers.get('location') || metaRes.headers.get('Location');
      console.log(`[MEDIA] Got redirect URL: ${downloadUrl ? downloadUrl.substring(0, 80) + '...' : 'MISSING'}`);
    }
    // Fallback: some API versions return JSON with url field (status 200)
    else if (metaRes.ok) {
      const contentType = metaRes.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        const metaData = await metaRes.json();
        downloadUrl = metaData.url;
        mimeType = metaData.mime_type || mimeType;
        console.log(`[MEDIA] Got JSON metadata, URL: ${downloadUrl ? downloadUrl.substring(0, 80) : 'MISSING'}`);
      } else {
        // Direct binary response
        const buffer = Buffer.from(await metaRes.arrayBuffer());
        if (buffer.length > 100) {
          console.log(`[MEDIA] Got direct binary response: ${buffer.length} bytes`);
          return { buffer, contentType: contentType || mimeType };
        }
      }
    } else {
      console.error(`[MEDIA] Metadata request failed: HTTP ${metaRes.status}`);
      throw new Error(`Metadata request failed: ${metaRes.status}`);
    }

    if (!downloadUrl) {
      console.error('[MEDIA] No download URL found in response');
      throw new Error('No download URL found');
    }

    // Step 2: Download actual file from WhatsApp CDN (no auth needed)
    console.log(`[MEDIA] Step 2: Downloading from CDN...`);
    const fileRes = await fetch(downloadUrl, { method: 'GET' });
    if (!fileRes.ok) {
      throw new Error(`CDN download failed: ${fileRes.status}`);
    }

    const fileType = fileRes.headers.get('content-type') || mimeType;
    const buffer = Buffer.from(await fileRes.arrayBuffer());
    console.log(`[MEDIA] SUCCESS: Downloaded ${buffer.length} bytes, type: ${fileType}`);

    return { buffer, contentType: fileType };
  } catch (err) {
    console.error('[MEDIA] Download media FAILED:', err.message);
    return null;
  }
}

async function analyzeImageWithAI(base64Image, mimeType, userCaption) {
  if (!OPENAI_API_KEY) return "I can see you've sent an image, but my AI vision is not configured right now. Please describe what you'd like me to look at, or contact support.";
  try {
    const prompt = userCaption
      ? `The user sent an image with the caption: "${userCaption}". Please analyze the image in detail and respond to their request.`
      : `A user has sent you an image via WhatsApp. Please analyze the image in detail. Describe what you see, identify any text, charts, diagrams, or important information. If it's a document, certificate, form, or academic material, provide a thorough analysis and explain what it contains.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${OPENAI_API_KEY}` },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You are Lerato, an AI assistant for Cornerstone Supreme Education. You are analyzing an image sent by a learner. Be thorough, helpful, and professional. If the image contains academic material, forms, certificates, or course-related content, provide detailed analysis relevant to their education journey.' },
          { role: 'user', content: [
            { type: 'text', text: prompt },
            { type: 'image_url', image_url: { url: `data:${mimeType};base64,${base64Image}`, detail: 'high' } }
          ]}
        ],
        max_tokens: 1500
      })
    });
    const data = await response.json();
    return data.choices?.[0]?.message?.content || "I've analyzed the image but couldn't generate a detailed response. Could you tell me more about what you're looking for?";
  } catch (err) {
    console.error('Image analysis error:', err.message);
    return "I had trouble analyzing this image. Could you try sending it again, or describe what you'd like me to help with?";
  }
}

function extractPDFText(pdfBuffer) {
  try {
    const pdfStr = pdfBuffer.toString('binary');
    let text = '';
    let pageCount = 0;

    // Count pages by counting /Type /Page (not /Pages)
    const pageMatches = pdfStr.match(/\/Type\s*\/Page(?![s])/g);
    pageCount = pageMatches ? pageMatches.length : 1;

    // Extract text from content streams - look for (text) Tj and [text] TJ patterns
    // Method 1: Direct string extraction from Tj operators
    const tjMatches = pdfStr.matchAll(/\(([^)]*)\)\s*Tj/g);
    for (const match of tjMatches) {
      const decoded = match[1].replace(/\\n/g, '\n').replace(/\\r/g, '\r').replace(/\\t/g, '\t').replace(/\\\\/g, '\\').replace(/\\\(/g, '(').replace(/\\\)/g, ')');
      if (decoded.trim()) text += decoded + ' ';
    }

    // Method 2: Extract from TJ arrays [ (text) (text) ] TJ
    const tjArrayMatches = pdfStr.matchAll(/\[\s*((?:\([^)]*\)\s*)+)\]\s*TJ/g);
    for (const match of tjArrayMatches) {
      const innerMatches = match[1].matchAll(/\(([^)]*)\)/g);
      for (const im of innerMatches) {
        const decoded = im[1].replace(/\\n/g, '\n').replace(/\\r/g, '\r').replace(/\\t/g, '\t').replace(/\\\\/g, '\\').replace(/\\\(/g, '(').replace(/\\\)/g, ')');
        if (decoded.trim()) text += decoded;
      }
      text += ' ';
    }

    // Method 3: Try to decompress streams and extract
    try {
      const zlib = require('zlib');
      const streamRegex = /stream\r?\n([\s\S]*?)\r?\nendstream/g;
      let sm;
      while ((sm = streamRegex.exec(pdfStr)) !== null) {
        try {
          const streamData = Buffer.from(sm[1], 'binary');
          const decompressed = zlib.inflateSync(streamData);
          const decompStr = decompressed.toString('latin1');

          const dm1 = decompStr.matchAll(/\(([^)]*)\)\s*Tj/g);
          for (const m of dm1) {
            const decoded = m[1].replace(/\\n/g, '\n').replace(/\\r/g, '\r').replace(/\\t/g, '\t').replace(/\\\\/g, '\\').replace(/\\\(/g, '(').replace(/\\\)/g, ')');
            if (decoded.trim()) text += decoded + ' ';
          }

          const dm2 = decompStr.matchAll(/\[\s*((?:\([^)]*\)\s*)+)\]\s*TJ/g);
          for (const m of dm2) {
            const im = m[1].matchAll(/\(([^)]*)\)/g);
            for (const i of im) {
              const decoded = i[1].replace(/\\n/g, '\n').replace(/\\r/g, '\r').replace(/\\t/g, '\t').replace(/\\\\/g, '\\').replace(/\\\(/g, '(').replace(/\\\)/g, ')');
              if (decoded.trim()) text += decoded;
            }
            text += ' ';
          }
        } catch (e) {}
      }
    } catch (e) {}

    // Method 4: Extract from literal text that might be in the PDF
    if (!text.trim()) {
      // Try to find any readable text between BT and ET markers
      const btMatches = pdfStr.matchAll(/BT[\s\S]*?ET/g);
      for (const match of btMatches) {
        const innerText = match[0].replace(/\\n/g, '\n').replace(/\\r/g, '\r');
        const stringMatches = innerText.matchAll(/\(([^)]{2,})\)/g);
        for (const sm of stringMatches) {
          if (sm[1].trim() && !sm[1].match(/^\d+(\.\d+)?$/)) {
            text += sm[1] + ' ';
          }
        }
      }
    }

    // Clean up extracted text
    text = text.replace(/\s+/g, ' ').trim();

    return { text, pageCount };
  } catch (err) {
    console.error('PDF extraction error:', err.message);
    return { text: '', pageCount: 0 };
  }
}

async function analyzePDFWithAI(pdfBuffer, userCaption) {
  if (!OPENAI_API_KEY) return "You've sent a PDF document, but my AI analysis is not configured right now. Please tell me what you'd like to know about it.";
  try {
    const { text: extractedText, pageCount } = extractPDFText(pdfBuffer);

    if (!extractedText.trim()) {
      return `I've received your PDF (${pageCount} page${pageCount !== 1 ? 's' : ''}), but I couldn't extract readable text from it. It may be a scanned/image-based PDF. Could you share the key points you'd like me to help with?`;
    }

    const truncated = extractedText.length > 12000 ? extractedText.substring(0, 12000) + '\n\n[Document truncated due to length...]' : extractedText;

    const prompt = userCaption
      ? `The user sent a PDF with the message: "${userCaption}"\n\nHere is the extracted text from the PDF (${pageCount} pages):\n\n${truncated}\n\nPlease analyze this document thoroughly and respond to the user's request.`
      : `A learner has sent a PDF document via WhatsApp. Here is the extracted text (${pageCount} pages):\n\n${truncated}\n\nPlease provide a comprehensive analysis. Summarize the key points, identify any action items, important dates, requirements, or relevant information. If this is academic or course-related material, explain how it relates to their studies at Cornerstone Supreme Education.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${OPENAI_API_KEY}` },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You are Lerato, an AI assistant for Cornerstone Supreme Education. You are analyzing a PDF document sent by a learner. Be thorough, helpful, and professional. Summarize key information, highlight important details, and provide actionable insights.' },
          { role: 'user', content: prompt }
        ],
        max_tokens: 1500
      })
    });
    const data = await response.json();
    return data.choices?.[0]?.message?.content || "I've read the PDF but couldn't generate a detailed analysis. Could you tell me what specific information you're looking for?";
  } catch (err) {
    console.error('PDF analysis error:', err.message);
    return "I had trouble reading this PDF. It might be password-protected, corrupted, or in a format I can't process. Could you describe what you'd like help with, or try sending it as an image instead?";
  }
}

async function processMediaMessage(msg, from, name) {
  try {
    const mediaTypes = [];
    let mediaObj = null;
    let caption = '';

    if (msg.image) {
      mediaObj = msg.image;
      caption = msg.image.caption || '';
      mediaTypes.push('image');
    } else if (msg.document) {
      mediaObj = msg.document;
      caption = msg.document.caption || '';
      mediaTypes.push('document');
    } else {
      return false;
    }

    const mediaId = mediaObj.id;
    const mimeType = mediaObj.mime_type || 'application/octet-stream';
    const filename = mediaObj.filename || 'file';
    console.log(`[MEDIA] ${from}: ${mediaTypes[0]} | ${mimeType} | ${filename} | caption: "${caption}"`);

    await sendWhatsAppMessage(from, "I've received your file. Let me analyze it for you \u2014 one moment please... \u{1F4CE}");

    const mediaData = await downloadMedia(mediaId);
    if (!mediaData) {
      await sendWhatsAppMessage(from, "I'm sorry, I couldn't download your file. Please try sending it again.");
      return true;
    }

    let analysis = '';
    const isPDF = mimeType === 'application/pdf' || filename.toLowerCase().endsWith('.pdf');
    const isImage = mimeType.startsWith('image/') || mediaTypes[0] === 'image';

    if (isImage) {
      const base64 = mediaData.buffer.toString('base64');
      analysis = await analyzeImageWithAI(base64, mimeType, caption);
    } else if (isPDF) {
      analysis = await analyzePDFWithAI(mediaData.buffer, caption);
    } else {
      await sendWhatsAppMessage(from, `I've received your file (${filename}), but I can only analyze images and PDF documents at the moment. If you have a specific question, feel free to ask!`);
      return true;
    }

    await sendWhatsAppMessage(from, analysis);

    const contextMsg = caption
      ? `[User sent ${isImage ? 'an image' : 'a PDF'}: "${caption}"]`
      : `[User sent ${isImage ? 'an image' : 'a PDF'}: ${filename}]`;
    updateContext(from, contextMsg, analysis);

    saveConversation(from, name, contextMsg, analysis, 'media_analysis', 'en');
    console.log(`[MEDIA OUT] ${from}: Analysis sent (${analysis.length} chars)`);
    return true;

  } catch (err) {
    console.error('Media processing error:', err.message);
    await sendWhatsAppMessage(from, "I had trouble processing your file. Please try again, or let me know what you need help with.");
    return true;
  }
}

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
  console.log('  Media Analysis: Images + PDFs (Enabled)');
  console.log('  WhatsApp: /api/webhook/whatsapp');
  console.log('='.repeat(60));
});
