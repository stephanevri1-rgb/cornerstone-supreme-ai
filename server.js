const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));

const API_KEY = process.env.API_KEY || '';
const PHONE_NUMBER_ID = process.env.PHONE_NUMBER_ID || '';
const WEBHOOK_VERIFY_TOKEN = process.env.WEBHOOK_VERIFY_TOKEN || 'cornerstone2024';
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || '';
const WHATSAPP_API = 'https://waba-v2.360dialog.io';

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
      { id: 10, title: 'RE 5 Regulatory Examination Preparation', category: 'Finance', price: 'R1,500', duration: '6 weeks', description: '6-week preparation for the RE 5 Regulatory Examination, mandatory for financial services providers in South Africa. Covers FAIS Act, duties of the FAIS Ombud, FSCA rights, license requirements, fit and proper requirements, code of conduct, and FICA.', format: 'Online', certification: 'Certificate of Completion', status: 'published' },
      { id: 11, title: 'Risk Management Training Programme', category: 'Business', price: 'R6,000', duration: '3 weeks', description: 'Aligned to SAQA ID 252025. Prepares you to identify, assess, and manage risk within your unit. Grounded in ISO 31000 and COSO internationally recognised standards. Certificate of Competence.', format: 'Online & Face-to-Face', certification: 'Certificate of Competence', status: 'published' },
      { id: 12, title: 'National Certificate Banking NQF 5', category: 'Banking', price: 'R12,000', duration: '12 months', description: '120-credit qualification (SAQA ID: 20186, NQF Level 5). Gateway to commercial banks, consumer lending institutions, cooperative financial organizations, and government regulatory departments. Six core modules. BankSETA Accredited.', format: 'Online', certification: 'National Certificate NQF 5', status: 'published' }
    ],
    students: [],
    conversations: [],
    messages: [],
    enrollments: [],
    brochures: [],
    settings: {
      companyName: 'Cornerstone Supreme Education',
      companyPhone: '0718374853',
      companyWebsite: 'https://www.cornerstonehr.co.za',
      companyEmail: 'info@cornerstonehr.co.za',
      brochureUrl: 'https://www.cornerstonehr.co.za',
      bankName: 'FNB',
      accountNumber: '62774520099',
      accountType: 'Business Account',
      branchCode: '250655'
    },
    context: {},
    _nextId: { courses: 13, students: 1, conversations: 1, messages: 1, enrollments: 1, brochures: 1 }
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

function trpc(data) {
  return { result: { data: { json: data } } };
}

function parseInput(req) {
  return req.body?.json || req.body || {};
}

function getCourseByTitle(title) {
  const lower = title.toLowerCase();
  return DB.courses.find(c => c.status === 'published' && c.title.toLowerCase().includes(lower));
}

function getContext(phone) {
  if (!DB.context[phone]) {
    DB.context[phone] = { last_intent: '', last_course_mentioned: '', message_history: [] };
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

const SYSTEM_PROMPT = `You are Lerato, a warm, professional, and knowledgeable Course Advisor at Cornerstone Supreme Education in South Africa. You are speaking to a prospective student on WhatsApp. Your goal is to help them find the right course, answer their questions, and guide them toward enrollment.

## YOUR PERSONALITY
- Warm, friendly, and human — NOT robotic
- Conversational but professional
- You ask follow-up questions to keep the conversation flowing
- You guide students toward enrollment naturally, not pushy
- You speak the student's language (English, Afrikaans, or Zulu)
- Keep responses concise (WhatsApp-friendly, 2-4 short paragraphs max)
- NEVER say "I'm an AI" — you are Lerato, a real course advisor
- NEVER repeat the same information twice in one conversation
- If you don't know something specific (like exact next intake date), give a helpful estimate and offer to follow up

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
10. RE 5 Regulatory Examination Preparation — R1,500 — 6 weeks — Certificate of Completion
11. Risk Management Training Programme — R6,000 — 3 weeks — Certificate of Competence
12. National Certificate Banking NQF 5 — R12,000 — 12 months — National Certificate (BankSETA Accredited)

## ENROLLMENT PROCESS
1. Visit https://www.cornerstonehr.co.za
2. Click "Enrol Now" on chosen course
3. Fill in details
4. Choose payment option
5. Receive confirmation within 24 hours

## PAYMENT OPTIONS
- Full payment (5% discount)
- Monthly installments
- Employer-sponsored
- EFT or direct deposit

## BANKING DETAILS
Bank: FNB | Account: 62774520099 | Account Type: Business Account | Branch Code: 250655
Reference: Student Name + Course
Send proof of payment to info@cornerstonehr.co.za

## GENERAL INFO
- All courses are online via live virtual sessions
- Study from anywhere in South Africa
- Requirements: Matric certificate + basic computer literacy
- Certifications are industry-recognized, aligned with NQF standards
- Recorded sessions available for revision
- Intakes: Monthly (new cohorts start first Monday of each month)
- Contact: 0718374853 | info@cornerstonehr.co.za

## CONVERSATION RULES
- If the student asks about a specific course, give details and ask what they'd like to know next
- If they ask about pricing, give the price and mention payment options
- If they ask about duration, give it and mention the format (online)
- If they ask about next intake, say "Our next intake is the first Monday of next month. Would you like me to reserve a spot for you?"
- If they're interested, guide them to the enrollment steps
- Always ask a follow-up question to keep conversation going
- Don't overwhelm with info — answer what they asked, then ask what else they want to know`;

async function generateAIResponse(studentMsg, phone) {
  const ctx = getContext(phone);
  const messages = [{ role: 'system', content: SYSTEM_PROMPT }];
  const recentHistory = ctx.message_history.slice(-10);
  for (const msg of recentHistory) {
    messages.push({ role: msg.role === 'student' ? 'user' : 'assistant', content: msg.msg });
  }
  messages.push({ role: 'user', content: studentMsg });
  
  if (!OPENAI_API_KEY) {
    return fallbackResponse(studentMsg, phone);
  }
  
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${OPENAI_API_KEY}` },
      body: JSON.stringify({ model: 'gpt-4o-mini', messages: messages, temperature: 0.7, max_tokens: 500 })
    });
    
    if (!response.ok) {
      console.error('OpenAI error:', response.status);
      return fallbackResponse(studentMsg, phone);
    }
    
    const data = await response.json();
    const aiReply = data.choices?.[0]?.message?.content?.trim();
    
    if (!aiReply) {
      return fallbackResponse(studentMsg, phone);
    }
    
    const intent = detectIntent(studentMsg);
    const lang = detectLanguage(studentMsg);
    updateContext(phone, intent, extractCourseMention(studentMsg), studentMsg, aiReply);
    return { response: aiReply, intent, lang };
    
  } catch (err) {
    console.error('OpenAI error:', err.message);
    return fallbackResponse(studentMsg, phone);
  }
}

function detectIntent(msg) {
  const lower = msg.toLowerCase();
  if (/\b(hi|hello|hey|sawubona|hallo)\b/.test(lower)) return 'greeting';
  if (/\b(price|cost|how much|fee|r\d|rand)\b/.test(lower)) return 'pricing';
  if (/\b(enroll|register|sign up|apply|payment|pay|bank|transfer)\b/.test(lower)) return 'enrollment';
  if (/\b(brochure|catalog|pdf|send me|download)\b/.test(lower)) return 'brochure';
  if (/\b(course|learn|study|training|qualification)\b/.test(lower)) return 'courses';
  if (/\b(thank|thanks)\b/.test(lower)) return 'thanks';
  if (/\b(bye|goodbye)\b/.test(lower)) return 'goodbye';
  return 'general';
}

function detectLanguage(msg) {
  const lower = msg.toLowerCase();
  if (/\b(dankie|hoeveel|kursus|leer|ja|nee)\b/.test(lower)) return 'af';
  if (/\b(ngiyabonga|kanjani|isifundo|funda|yebo|cha)\b/.test(lower)) return 'zu';
  return 'en';
}

function extractCourseMention(msg) {
  const lower = msg.toLowerCase();
  for (const c of DB.courses) {
    if (lower.includes(c.title.toLowerCase())) return c.title;
  }
  return '';
}
function fallbackResponse(studentMsg, phone) {
  const lower = studentMsg.toLowerCase().trim();
  const lang = detectLanguage(studentMsg);
  const ctx = getContext(phone);
  const relevantCourse = getCourseByTitle(studentMsg);
  const intent = detectIntent(studentMsg);
  let response = '';

  switch(intent) {
    case 'greeting':
      response = `Hello! Welcome to Cornerstone Supreme Education. I'm Lerato, your course advisor. 😊\n\nWe have a variety of professional courses — from Entrepreneurship and HR Management to Banking and Finance qualifications.\n\nWhat field are you interested in? Or would you like me to tell you about our most popular courses?`;
      break;
    case 'thanks':
      response = `You're very welcome! Feel free to reach out anytime — I'm always here to help. Have a great day! 🌟`;
      break;
    case 'goodbye':
      response = `Goodbye! Thank you for considering Cornerstone Supreme. Don't hesitate to message me whenever you're ready. Take care! 👋`;
      break;
    case 'pricing':
      if (relevantCourse) {
        response = `The ${relevantCourse.title} is ${relevantCourse.price} for the full ${relevantCourse.duration} programme.\n\nWe also offer a 5% discount if you pay in full upfront, or you can spread it with monthly installments.\n\nWould you like me to walk you through the enrollment process?`;
      } else {
        response = `Our courses range from R1,300 to R22,000 depending on the programme and level. Short courses start from R1,300, while our National Certificates are R12,000 - R22,000.\n\nWhich course interests you? I can give you the exact price and payment options!`;
      }
      break;
    case 'courses':
      response = `Great question! Here's what we offer:\n\n📊 **Finance & Banking**\n• RE 5 Exam Prep — R1,500 (6 weeks)\n• National Certificate Banking NQF 5 — R12,000 (12 months)\n• Financial Markets NQF 6 — R22,000 (12 months)\n\n👔 **Business & HR**\n• Entrepreneurship — R4,500 (6 months)\n• HR Management — R4,500 (6 months)\n• Business Admin — R4,500 (6 months)\n• Receptionist — R4,500 (6 months)\n• Logistics — R4,500 (6 months)\n\n🏥 **Healthcare & Safety**\n• Medical Call Centre — R3,500 (3 months)\n• Health & Safety — R2,500 (3 months) / R1,300 (3 weeks)\n• Risk Management — R6,000 (3 weeks)\n\nWhich one catches your eye? 😊`;
      break;
    case 'enrollment':
      if (relevantCourse) {
        response = `Perfect! Here's how to enrol in ${relevantCourse.title}:\n\n1️⃣ Visit https://www.cornerstonehr.co.za\n2️⃣ Click "Enrol Now"\n3️⃣ Fill in your details\n4️⃣ Choose payment (full or installments)\n5️⃣ You'll get confirmation within 24 hours\n\nOur next intake is the first Monday of next month. Would you like me to help you with anything else before you enrol?`;
      } else {
        response = `Enrolling is easy! Here's how:\n\n1️⃣ Visit https://www.cornerstonehr.co.za\n2️⃣ Choose your course and click "Enrol Now"\n3️⃣ Fill in your details\n4️⃣ Choose payment (full = 5% discount, or monthly installments)\n5️⃣ Confirmation within 24 hours\n\nWhich course would you like to enrol in?`;
      }
      break;
    case 'brochure':
      response = `Absolutely! You can view all our course brochures here:\nhttps://www.cornerstonehr.co.za\n\nIf you tell me which course interests you, I can give you all the details right here — pricing, duration, certification, everything!\n\nWhat field are you looking at?`;
      break;
    default:
      if (/\b(intake|when|start|date|begin|next)\b/.test(lower)) {
        response = `Our next intake is the first Monday of next month. We run monthly intakes, so you won't have to wait long!\n\nWould you like me to help you get everything ready before then? I can tell you about the requirements and payment options. 😊`;
      } else if (/\b(requirement|need|matric|grade|qualification)\b/.test(lower)) {
        response = `Most of our courses require a Matric certificate and basic computer literacy. For the NQF 5 and NQF 6 qualifications, work experience in the field is a plus but not always required.\n\nWhich course are you interested in? I can tell you the specific requirements for that one.`;
      } else if (/\b(duration|how long|period|time)\b/.test(lower)) {
        if (relevantCourse) {
          response = `The ${relevantCourse.title} runs for ${relevantCourse.duration}. All sessions are online, so you can study from anywhere in South Africa with flexible scheduling.\n\nRecorded sessions are also available if you miss a live class.\n\nAny other questions about this course?`;
        } else {
          response = `Our courses range from 3 weeks to 12 months:\n• Short courses: 3 weeks - 3 months\n• Certificate programmes: 6 months\n• National Certificates: 12 months\n\nAll are online with flexible scheduling. Which course would you like to know about?`;
        }
      } else if (/\b(cert|certificate|accredited|nqf|saqa)\b/.test(lower)) {
        response = `All our courses come with industry-recognized certifications. Our National Certificates (NQF 5 and 6) are SAQA-registered and accredited by BankSETA.\n\nAfter completion, you'll get your certificate, a skills portfolio, and a reference letter on request.\n\nWhich course are you looking at?`;
      } else if (relevantCourse) {
        response = `${relevantCourse.title} is a fantastic choice! Here's what you need to know:\n\n💰 Price: ${relevantCourse.price}\n⏱️ Duration: ${relevantCourse.duration}\n🎓 Certification: ${relevantCourse.certification}\n📍 Format: ${relevantCourse.format}\n\n${relevantCourse.description}\n\nOur next intake is the first Monday of next month. Would you like to enrol or do you have more questions?`;
      } else {
        response = `Thank you for your message! I'm Lerato from Cornerstone Supreme Education.\n\nI'd love to help you find the right course. We offer programmes in:\n• 📊 Finance & Banking\n• 👔 Business & HR\n• 🏥 Healthcare & Safety\n\nWhat field interests you most? Or tell me about your career goals and I'll recommend the best course! 😊`;
      }
  }

  updateContext(phone, intent, relevantCourse ? relevantCourse.title : '', studentMsg, response);
  return { response, intent, lang };
}

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
    conversionRate: DB.conversations.length > 0 ? ((DB.conversations.filter(c => c.status === 'enrolled').length / DB.conversations.length) * 100).toFixed(1) + '%' : '0%',
  }));
});

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
