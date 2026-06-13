const express = require('express');
const Database = require('better-sqlite3');
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
const WHATSAPP_API = 'https://waba-v2.360dialog.io';

// ============================================================
// SQLITE DATABASE - Built-in, no external DB needed
// ============================================================
const dbPath = process.env.DATABASE_PATH || path.join(__dirname, 'data.db');
const db = new Database(dbPath);
db.pragma('journal_mode = WAL');

// Create all tables
db.exec(`
  CREATE TABLE IF NOT EXISTS courses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    category TEXT,
    description TEXT,
    price TEXT,
    duration TEXT,
    format TEXT DEFAULT 'Online',
    certification TEXT DEFAULT 'Certificate of Completion',
    status TEXT DEFAULT 'published',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS students (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT,
    language TEXT DEFAULT 'en',
    status TEXT DEFAULT 'new',
    source TEXT DEFAULT 'whatsapp',
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS conversations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_phone TEXT NOT NULL UNIQUE,
    student_name TEXT DEFAULT 'Student',
    language TEXT DEFAULT 'en',
    status TEXT DEFAULT 'active',
    intent TEXT,
    last_message TEXT,
    message_count INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    conversation_id INTEGER NOT NULL,
    sender TEXT NOT NULL,
    content TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS enrollments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_name TEXT,
    student_phone TEXT,
    course_name TEXT,
    amount TEXT,
    status TEXT DEFAULT 'pending',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS brochures (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    filename TEXT,
    mime_type TEXT,
    size TEXT,
    data TEXT,
    category TEXT DEFAULT 'General',
    is_default INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS conversation_context (
    phone TEXT PRIMARY KEY,
    last_intent TEXT DEFAULT '',
    last_course_mentioned TEXT DEFAULT '',
    message_history TEXT DEFAULT '[]',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

// Seed default courses if empty
const courseCount = db.prepare('SELECT COUNT(*) as count FROM courses').get();
if (courseCount.count === 0) {
  const insertCourse = db.prepare('INSERT INTO courses (title, category, price, duration, description) VALUES (?,?,?,?,?)');
  const courses = [
    ['Business Management', 'Business', 'R8,500', '12 weeks', 'Comprehensive business management certification covering leadership, strategy, operations and organisational development. Includes practical case studies and real-world application.'],
    ['HR Management', 'HR', 'R7,200', '10 weeks', 'Professional HR management course covering recruitment, labour law, employee relations, performance management and organisational development.'],
    ['Project Management', 'Business', 'R9,500', '8 weeks', 'PMP-aligned project management course covering project planning, execution, monitoring and closure. Includes Agile and Waterfall methodologies.'],
    ['Digital Marketing', 'Marketing', 'R6,500', '6 weeks', 'Complete digital marketing training covering social media marketing, SEO, Google Ads, email marketing, content strategy and analytics.'],
    ['Leadership Development', 'Business', 'R8,000', '8 weeks', 'Executive leadership program focusing on strategic leadership, team building, change management and decision-making skills.'],
    ['Financial Management', 'Finance', 'R9,000', '10 weeks', 'Corporate finance and accounting course covering financial statements, budgeting, investment analysis, risk management and tax compliance.'],
    ['Occupational Health & Safety', 'Health & Safety', 'R5,500', '4 weeks', 'OHSA-compliant safety training covering workplace hazard identification, risk assessment, incident investigation and safety management systems.'],
    ['Customer Service Excellence', 'Business', 'R4,500', '4 weeks', 'World-class customer service training covering communication skills, complaint handling, customer retention and service quality standards.']
  ];
  for (const c of courses) insertCourse.run(c);
  console.log('8 default courses seeded');
}

// Seed default settings
const defaultSettings = [
  ['companyName', 'Cornerstone Supreme'],
  ['companyPhone', '0718374853'],
  ['companyWebsite', 'https://www.cornerstonehr.co.za'],
  ['companyEmail', 'info@cornerstonehr.co.za'],
  ['brochureUrl', 'https://www.cornerstonehr.co.za'],
  ['bankName', 'FNB'],
  ['accountNumber', '62774520099'],
  ['accountType', 'Business Account'],
  ['branchCode', '250655']
];
const insertSetting = db.prepare('INSERT OR IGNORE INTO settings (key, value) VALUES (?,?)');
for (const [k, v] of defaultSettings) insertSetting.run(k, v);

console.log('Database ready at:', dbPath);

// ============================================================
// tRPC RESPONSE HELPER
// ============================================================
function trpc(data) {
  return { result: { data: { json: data } } };
}

function parseInput(req) {
  return req.body?.json || req.body || {};
}

// ============================================================
// COURSE DATA
// ============================================================
function getAllCourses() {
  return db.prepare('SELECT * FROM courses WHERE status = "published" ORDER BY id').all();
}

function getCourseByTitle(title) {
  return db.prepare('SELECT * FROM courses WHERE title LIKE ?').get(`%${title}%`);
}

function getCoursesByCategory(cat) {
  return db.prepare('SELECT * FROM courses WHERE category = ? AND status = "published"').all(cat);
}

// ============================================================
// CONVERSATION CONTEXT / MEMORY
// ============================================================
function getContext(phone) {
  let ctx = db.prepare('SELECT * FROM conversation_context WHERE phone = ?').get(phone);
  if (!ctx) {
    db.prepare('INSERT OR IGNORE INTO conversation_context (phone, message_history) VALUES (?, "[]")').run(phone);
    ctx = { phone, last_intent: '', last_course_mentioned: '', message_history: '[]' };
  }
  return ctx;
}

function updateContext(phone, intent, courseMentioned, studentMessage, leratoReply) {
  const ctx = getContext(phone);
  let history = [];
  try { history = JSON.parse(ctx.message_history); } catch(e) {}
  history.push({ role: 'student', msg: studentMessage, time: new Date().toISOString() });
  history.push({ role: 'lerato', msg: leratoReply, time: new Date().toISOString() });
  if (history.length > 20) history = history.slice(-20);

  db.prepare(`INSERT OR REPLACE INTO conversation_context (phone, last_intent, last_course_mentioned, message_history, updated_at)
    VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)`).run(phone, intent, courseMentioned, JSON.stringify(history));
}

// ============================================================
// SMART AI - LERATO
// ============================================================
function findRelevantCourse(msg) {
  const lower = msg.toLowerCase();
  const courses = getAllCourses();
  for (const c of courses) {
    if (lower.includes(c.title.toLowerCase()) || lower.includes(c.category.toLowerCase())) return c;
  }
  for (const c of courses) {
    const words = c.title.toLowerCase().split(' ');
    for (const word of words) {
      if (word.length > 3 && lower.includes(word)) return c;
    }
  }
  return null;
}

function detectLanguage(msg) {
  const lower = msg.toLowerCase();
  if (/\b(dankie|hoeveel|kursus|leer|goed|ja|nee|baie|jou|ons|wat|waar|wanneer|hoekom|hoe|dis|daar|hier|almal)\b/.test(lower)) return 'af';
  if (/\b(ngiyabonga|kanjani|isifundo|funda|yebo|cha|unjani|sawubona|ukuthi|wena|mina|lapha|khona|bona|yonke)\b/.test(lower)) return 'zu';
  if (/\b(merci|combien|cours|apprendre|oui|non|comment|ou|quand|pourquoi|tout|ici|la|tous)\b/.test(lower)) return 'fr';
  return 'en';
}

function generateAIResponse(studentMsg, phone) {
  const lower = studentMsg.toLowerCase().trim();
  const lang = detectLanguage(studentMsg);
  const ctx = getContext(phone);
  const courses = getAllCourses();
  const relevantCourse = findRelevantCourse(studentMsg);

  let intent = 'general';
  if (/\b(hi|hello|hey|sawubona|hallo|molo|dumela|sanibonani)\b/.test(lower)) intent = 'greeting';
  else if (/\b(thank|thanks|dankie|ngiyabonga|ke a leboga)\b/.test(lower)) intent = 'thanks';
  else if (/\b(bye|goodbye|cheers|sharp|hamba kahle|totsiens)\b/.test(lower)) intent = 'goodbye';
  else if (/\b(price|cost|how much|fee|r\d|rand|expensive|cheap|pricing|payment|pay|installment|discount)\b/.test(lower)) intent = 'pricing';
  else if (/\b(enroll|register|sign up|apply|join|how do i start|how to apply|where do i|sign|registration|admission)\b/.test(lower)) intent = 'enrollment';
  else if (/\b(brochure|catalog|pdf|send me|download|more info|document|flyer)\b/.test(lower)) intent = 'brochure';
  else if (relevantCourse) intent = 'course_specific';
  else if (/\b(course|learn|study|training|qualification|program|diploma|certificate|which|what do you offer|list|all courses|available)\b/.test(lower)) intent = 'courses';
  else if (/\b(duration|how long|period|time|weeks|months|when does it end)\b/.test(lower)) intent = 'duration';
  else if (/\b(location|where|venue|class|online|virtual|in person|physical|campus)\b/.test(lower)) intent = 'location';
  else if (/\b(requirement|qualification needed|grade|matric|prerequisite|who can|eligible)\b/.test(lower)) intent = 'requirements';
  else if (/\b(cert|certificate|accredited|nqf|saqa|recognised|recognized|registered)\b/.test(lower)) intent = 'certification';
  else if (/\b(contact|call|email|reach|speak to|manager|consultant|advisor|lerato)\b/.test(lower)) intent = 'contact';
  else if (/\b(bank|account|eft|transfer|deposit|payment detail|how do i pay)\b/.test(lower)) intent = 'payment_details';
  else if (ctx.last_intent === 'course_specific' && /\b(price|cost|how much|fee|discount)\b/.test(lower)) {
    intent = 'pricing';
  }

  let response = '';

  switch(intent) {
    case 'greeting':
      response = lang === 'af' 
        ? `Hallo! Welkom by Cornerstone Supreme Education. Ek is Lerato, jou kursusadviseur.\n\nOns bied 8 professionele kursusse aan met erkende sertifisering. Hoe kan ek jou help?`
        : lang === 'zu'
        ? `Sawubona! Siyakwamukela eCornerstone Supreme Education. NginguLerato, umeluleki wakho wezifundo.\n\nSinikeza izifundo eziyisishiyagalombili. Ngingakusiza kanjani?`
        : `Hello! Welcome to Cornerstone Supreme Education. I'm Lerato, your course advisor.\n\nWe offer 8 professional courses with industry-recognized certifications.\n\nHow can I help you today?`;
      break;

    case 'thanks':
      response = lang === 'af' 
        ? `Dit is 'n plesier! As jy enige vrae het, laat weet my gerus.`
        : lang === 'zu'
        ? `Ngiyabonga! Uma unemibuzo, ngicela ungitshele.`
        : `It's my pleasure! If you have any more questions, just let me know.`;
      break;

    case 'goodbye':
      response = `Goodbye! Thank you for your interest in Cornerstone Supreme. Feel free to message us anytime. Have a great day!`;
      break;

    case 'pricing':
      if (relevantCourse) {
        response = `The ${relevantCourse.title} course is priced at ${relevantCourse.price} for the full ${relevantCourse.duration} program.\n\nPayment options available:\n- Full payment (5% discount)\n- Monthly installments\n- Employer-sponsored\n\nWould you like to enrol in ${relevantCourse.title}?`;
      } else {
        response = `Our courses range from R4,500 to R9,500 depending on the program.\n\nMost popular:\n${courses.slice(0, 4).map(c => `- ${c.title}: ${c.price}`).join('\n')}\n\nPayment options:\n- Full payment (5% discount)\n- Monthly installments\n- Employer-sponsored\n\nWhich course would you like pricing for?`;
      }
      break;

    case 'course_specific':
      if (relevantCourse) {
        response = `Great question about our ${relevantCourse.title} course!\n\nPrice: ${relevantCourse.price}\nDuration: ${relevantCourse.duration}\nFormat: ${relevantCourse.format}\nCertification: ${relevantCourse.certification}\n\n${relevantCourse.description}\n\nWould you like to enrol or do you have more questions?`;
      } else {
        response = `I'd be happy to tell you about that course. Let me find the details for you.\n\nWhich course specifically interests you? Here are our options:\n${courses.map(c => `- ${c.title} (${c.category})`).join('\n')}`;
      }
      break;

    case 'courses':
      response = `We offer 8 professional courses at Cornerstone Supreme:\n\n${courses.map((c, i) => `${i+1}. ${c.title} (${c.category}) - ${c.price}`).join('\n')}\n\nVisit our website: https://www.cornerstonehr.co.za\n\nWhich course interests you? I can provide full details!`;
      break;

    case 'duration':
      if (relevantCourse) {
        response = `The ${relevantCourse.title} course runs for ${relevantCourse.duration}. This includes all modules, assessments and practical work.\n\nWould you like to know more about this course?`;
      } else {
        response = `Our course durations vary:\n${courses.map(c => `- ${c.title}: ${c.duration}`).join('\n')}\n\nWhich course would you like details on?`;
      }
      break;

    case 'certification':
      response = `All our courses come with a Certificate of Completion that is industry-recognized. Our certifications are aligned with NQF standards where applicable.\n\nAfter completing your course, you will receive:\n- Official Cornerstone Supreme certificate\n- Skills portfolio\n- Reference letter (on request)\n\nWould you like to know about a specific course?`;
      break;

    case 'requirements':
      response = `Our courses are open to anyone with a Grade 12 / Matric certificate. No prior experience is required for most courses.\n\nWhat you need:\n- Matric certificate (or equivalent)\n- Basic computer literacy\n- Commitment to attend all sessions\n\nSome advanced courses may require relevant work experience. Which course are you interested in?`;
      break;

    case 'location':
      response = `Our courses are delivered online via live virtual sessions, so you can study from anywhere in South Africa.\n\nBenefits of online learning:\n- Study from home or office\n- Flexible scheduling\n- Recorded sessions for revision\n- No travel required\n\nWould you like to see our course list?`;
      break;

    case 'enrollment':
      if (relevantCourse) {
        response = `I'd love to help you enrol in ${relevantCourse.title}! Here's what to do:\n\n1. Visit: https://www.cornerstonehr.co.za\n2. Click "Enrol Now" on ${relevantCourse.title}\n3. Fill in your details\n4. Choose payment option\n5. You'll receive confirmation within 24 hours\n\nThe course fee is ${relevantCourse.price} for ${relevantCourse.duration}.`;
      } else {
        response = `Excellent choice! Here's how to enrol at Cornerstone Supreme:\n\n1. Visit: https://www.cornerstonehr.co.za\n2. Click "Enrol Now" on your chosen course\n3. Fill in your details\n4. Choose payment option (full or installments)\n5. You'll receive confirmation within 24 hours\n\nWhich course would you like to enrol in?`;
      }
      break;

    case 'brochure':
      response = `I'd be happy to share more information with you!\n\nYou can view our full course catalog here:\nhttps://www.cornerstonehr.co.za\n\nOur courses cover:\n- Business Management (R8,500)\n- HR Management (R7,200)\n- Project Management (R9,500)\n- Digital Marketing (R6,500)\n- Leadership Development (R8,000)\n- Financial Management (R9,000)\n- Health & Safety (R5,500)\n- Customer Service (R4,500)\n\nWhich course interests you?`;
      break;

    case 'payment_details':
      response = `Our banking details for payment:\n\nBank: FNB\nAccount: 62774520099\nAccount Type: Business Account\nBranch Code: 250655\nReference: Your Name + Course\n\nPayment options:\n- Full payment (5% discount)\n- Monthly installments\n- EFT or direct deposit\n\nSend proof of payment to info@cornerstonehr.co.za`;
      break;

    case 'contact':
      response = `You can reach us through:\n\nPhone: 0718374853\nEmail: info@cornerstonehr.co.za\nWebsite: https://www.cornerstonehr.co.za\n\nI'm Lerato and I'm always here on WhatsApp to help you too! What would you like to know?`;
      break;

    default:
      if (ctx.last_course_mentioned) {
        const lastCourse = getCourseByTitle(ctx.last_course_mentioned);
        if (lastCourse) {
          response = `Regarding ${lastCourse.title} (${lastCourse.price}, ${lastCourse.duration}) - that's a great choice!\n\n${lastCourse.description}\n\nWould you like to enrol or do you have more questions?`;
          break;
        }
      }
      response = `Thank you for your message! I'm Lerato from Cornerstone Supreme Education.\n\nHow can I help you today?\n- Browse our 8 courses\n- Check pricing\n- Enrolment information\n- Request a brochure\n- Payment options`;
  }

  updateContext(phone, intent, relevantCourse ? relevantCourse.title : ctx.last_course_mentioned, studentMsg, response);

  return { response, intent, lang };
}
