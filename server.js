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
      { id: 1, title: 'Entrepreneurship Training Online Short Course', category: 'Business', price: 'R4,500', duration: '6 months', description: 'Whether you are starting a business, launching a new division, or seeking to invest in new ventures, entrepreneurship and business management skills are vital to your success. Our well-rounded programme integrates multiple core modules to prepare students for the real world of entrepreneurship. Advanced Certificate.', format: 'Online', certification: 'Advanced Certificate', status: 'published', created_at: new Date().toISOString() },
      { id: 2, title: 'Health and Safety in the Workplace', category: 'Health & Safety', price: 'R2,500', duration: '3 months', description: 'This course equips you with the skills to ensure legal compliance and create a safe, productive working environment. Covers Neuro-Linguistic Programming, Emotional Intelligence, Safety Procedure Manual, Workplace Safety & Ergonomics, and core OHS principles. Online Short Course Advanced Certificate.', format: 'Online', certification: 'Advanced Certificate', status: 'published', created_at: new Date().toISOString() },
      { id: 3, title: 'Health and Safety Online Short Course', category: 'Health & Safety', price: 'R1,300', duration: '3 weeks', description: 'A 3-week online certificate course that gives you the foundation to build a safety culture where safety is valued as an integral part of business operations. Covers defining safety culture, identifying hazards, writing a safety plan, incident management, and reviewing the programme.', format: 'Online', certification: 'Certificate', status: 'published', created_at: new Date().toISOString() },
      { id: 4, title: 'Human Resources Management', category: 'HR', price: 'R4,500', duration: '6 months', description: 'This online programme equips HR professionals to attract, hire, train, and retain top talent while managing performance, grievances, and workplace wellness. 17 comprehensive modules covering people & leadership, business & process, workplace & digital skills. Online Advanced Certificate.', format: 'Online', certification: 'Advanced Certificate', status: 'published', created_at: new Date().toISOString() },
      { id: 5, title: 'Logistics and Supply Chain Management', category: 'Business', price: 'R4,500', duration: '6 months', description: 'Master the core concepts of supply chain management including the flow, core models, supply chain drivers, key metrics, benchmarking techniques, and ideas for taking your supply chain to the next level. Covers Plan, Source, Deliver, and Return. Online Short Course Advanced Certificate.', format: 'Online', certification: 'Advanced Certificate', status: 'published', created_at: new Date().toISOString() },
      { id: 6, title: 'Medical Call Centre Training', category: 'Healthcare', price: 'R3,500', duration: '3 months', description: 'An online short course designed to equip individuals with the skills and knowledge to effectively handle calls and inquiries in a healthcare setting. Covers medical terminology, communication skills, confidentiality, emergency management, call management, and legal & ethical obligations.', format: 'Online', certification: 'Certificate', status: 'published', created_at: new Date().toISOString() },
      { id: 7, title: 'National Certificate Financial Markets and Instruments NQF 6', category: 'Finance', price: 'R22,000', duration: '12 months', description: 'A comprehensive one-year online qualification (SAQA ID: 50481, 120 Credits, NQF Level 6) designed to develop competent professionals who can analyse and make informed decisions in the ever-changing financial landscape. Covers investment decisions, company analysis, debt market, market trends, cash flow analysis, and risk management.', format: 'Online', certification: 'National Certificate NQF 6', status: 'published', created_at: new Date().toISOString() },
      { id: 8, title: 'Online Advanced Business Administration', category: 'Business', price: 'R4,500', duration: '6 months', description: 'This course teaches essential administrative duties, business operations, processes, and customer service basics needed to deliver a high-quality service. 15 modules spanning leadership, finance, technology, and core business skills. Online Advance Certificate Short Course.', format: 'Online', certification: 'Advanced Certificate', status: 'published', created_at: new Date().toISOString() },
      { id: 9, title: 'Professional Receptionist Online Short Course', category: 'Business', price: 'R4,500', duration: '6 months', description: 'Launch your career in business administration, customer service, and office management. 16 comprehensive modules including business foundations, communication & relations, service & marketing, and Microsoft Office Suite. Online Short Course Advanced Certificate.', format: 'Online', certification: 'Advanced Certificate', status: 'published', created_at: new Date().toISOString() },
      { id: 10, title: 'RE 5 Regulatory Examination Preparation', category: 'Finance', price: 'R1,500', duration: '6 weeks', description: 'A 6-week online preparation course for the RE 5 (Regulatory Examination), a mandatory competency exam for financial services providers in South Africa. Covers FAIS Act, duties & powers of the FAIS Ombud, FSCA rights, license requirements, fit and proper requirements, supervision arrangements, debarment process, key individual responsibilities, code of conduct, and FICA.', format: 'Online', certification: 'Certificate of Completion', status: 'published', created_at: new Date().toISOString() },
      { id: 11, title: 'Risk Management Training Programme', category: 'Business', price: 'R6,000', duration: '3 weeks', description: 'This comprehensive programme is aligned to SAQA ID 252025 and prepares you to identify, assess, and manage risk within your unit. Grounded in ISO 31000 and COSO internationally recognised standards. Four specific outcomes: Understand Risk, Identify & Assess, Develop Plans, Test & Revise. Certificate of Competence.', format: 'Online & Face-to-Face', certification: 'Certificate of Competence', status: 'published', created_at: new Date().toISOString() },
      { id: 12, title: 'National Certificate Banking NQF 5', category: 'Banking', price: 'R12,000', duration: '12 months', description: 'A comprehensive 120-credit qualification (SAQA ID: 20186, NQF Level 5) — your gateway to opportunities in commercial banks, consumer lending institutions, cooperative financial organizations, and government regulatory departments. Six core modules: Legislation in Banking, Addressing Client Needs, Business Banking, Banking Sales, Banking Transactions, and Mortgage Loans. BankSETA Accredited.', format: 'Online', certification: 'National Certificate NQF 5', status: 'published', created_at: new Date().toISOString() }
    ],
    students: [],
    conversations: [],
    messages: [],
    enrollments: [],
    brochures: [],
    settings: {
      companyName: 'Cornerstone Supreme',
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

console.log('Database loaded from:', DB_FILE);
console.log('Courses:', DB.courses.length);

function trpc(data) {
  return { result: { data: { json: data } } };
}

function parseInput(req) {
  return req.body?.json || req.body || {};
}

function getAllCourses() {
  return DB.courses.filter(c => c.status === 'published');
}

function getBrochureList() {
  const brochures = DB.brochures.filter(b => b.name);
  if (brochures.length === 0) return null;
  return brochures.map((b, i) => `${i + 1}. ${b.name.replace(/\.[^/.]+$/, '')}`).join('\n');
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
  else if (ctx.last_intent === 'course_specific' && /\b(price|cost|how much|fee|discount)\b/.test(lower)) intent = 'pricing';

  let response = '';
  const brochureList = getBrochureList();
  const hasCourses = courses.length > 0;
  const hasBrochures = DB.brochures.length > 0;

  switch(intent) {
    case 'greeting':
      response = lang === 'af' 
        ? `Hallo! Welkom by Cornerstone Supreme Education. Ek is Lerato, jou kursusadviseur.\n\nOns bied professionele kursusse aan met erkende sertifisering. Hoe kan ek jou help?`
        : lang === 'zu'
        ? `Sawubona! Siyakwamukela eCornerstone Supreme Education. NginguLerato, umeluleki wakho wezifundo.\n\nSinikeza izifundo ezinhle kakhulu ezineziqu zomsebenzi. Ngingakusiza kanjani?`
        : `Hello! Welcome to Cornerstone Supreme Education. I'm Lerato, your course advisor.\n\nWe offer a range of professional courses with industry-recognized certifications.\n\nHow can I help you today?`;
      break;

    case 'thanks':
      response = lang === 'af' ? `Dit is 'n plesier! As jy enige vrae het, laat weet my gerus.`
        : lang === 'zu' ? `Ngiyabonga! Uma unemibuzo, ngicela ungitshele.`
        : `It's my pleasure! If you have any more questions, just let me know.`;
      break;

    case 'goodbye':
      response = `Goodbye! Thank you for your interest in Cornerstone Supreme. Feel free to message us anytime. Have a great day!`;
      break;

    case 'pricing':
      if (relevantCourse) {
        response = `The ${relevantCourse.title} course is priced at ${relevantCourse.price} for the full ${relevantCourse.duration} program.\n\nPayment options available:\n- Full payment (5% discount)\n- Monthly installments\n- Employer-sponsored\n\nWould you like to enrol in ${relevantCourse.title}?`;
      } else if (hasBrochures && brochureList) {
        response = `I'd be happy to share pricing with you! Here are our course brochures:\n\n${brochureList}\n\nWhich course would you like pricing for? I can send you the brochure with full details!`;
      } else if (hasCourses) {
        response = `Our courses range from ${courses[0].price} to ${courses[courses.length-1].price} depending on the program.\n\nPayment options:\n- Full payment (5% discount)\n- Monthly installments\n- Employer-sponsored\n\nWhich course would you like pricing for?`;
      } else {
        response = `Our course pricing varies depending on the program.\n\nPayment options available:\n- Full payment (5% discount)\n- Monthly installments\n- Employer-sponsored\n\nWhich course are you interested in? I can get you the exact pricing!`;
      }
      break;

    case 'course_specific':
      if (relevantCourse) {
        response = `Great question about our ${relevantCourse.title} course!\n\nPrice: ${relevantCourse.price}\nDuration: ${relevantCourse.duration}\nFormat: ${relevantCourse.format}\nCertification: ${relevantCourse.certification}\n\n${relevantCourse.description}\n\nWould you like to enrol or do you have more questions?`;
      } else if (hasBrochures && brochureList) {
        response = `I'd be happy to tell you about that course! Here are our available brochures:\n\n${brochureList}\n\nWhich course interests you? I can send you the brochure with full details!`;
      } else if (hasCourses) {
        response = `I'd be happy to tell you about that course. Let me find the details for you.\n\nWhich course specifically interests you? Here are our options:\n${courses.map(c => `- ${c.title} (${c.category})`).join('\n')}`;
      } else {
        response = `I'd love to help you find the right course! Tell me which field you're interested in and I'll guide you.\n\nVisit our website for the full catalog: https://www.cornerstonehr.co.za`;
      }
      break;

    case 'courses':
      if (hasBrochures && brochureList) {
        response = `Thank you for your interest in our courses! Here are our available course brochures:\n\n${brochureList}\n\nYou can view and download any of these brochures on our website: https://www.cornerstonehr.co.za\n\nWhich course would you like to know more about? I can send you the brochure or answer any questions!`;
      } else if (hasCourses) {
        response = `We offer the following professional courses:\n\n${courses.map((c, i) => `${i+1}. ${c.title} (${c.category}) - ${c.price}`).join('\n')}\n\nVisit our website: https://www.cornerstonehr.co.za\n\nWhich course interests you? I can provide full details!`;
      } else {
        response = `Thank you for your interest in Cornerstone Supreme Education! We offer a variety of professional courses across different fields.\n\nVisit our website to view our full course catalog: https://www.cornerstonehr.co.za\n\nOr tell me which field you're interested in and I'll guide you!`;
      }
      break;

    case 'duration':
      if (relevantCourse) {
        response = `The ${relevantCourse.title} course runs for ${relevantCourse.duration}. This includes all modules, assessments and practical work.\n\nWould you like to know more about this course?`;
      } else if (hasBrochures && brochureList) {
        response = `Course durations vary depending on the program. Here are our course brochures:\n\n${brochureList}\n\nWhich course would you like duration details for? I can send you the brochure!`;
      } else if (hasCourses) {
        response = `Our course durations vary:\n${courses.map(c => `- ${c.title}: ${c.duration}`).join('\n')}\n\nWhich course would you like details on?`;
      } else {
        response = `Course durations vary depending on the program, typically ranging from 4 to 12 weeks.\n\nWhich course are you interested in? I can give you the exact duration!`;
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
      } else if (hasBrochures && brochureList) {
        response = `I'd love to help you enrol! Here's how:\n\n1. Visit: https://www.cornerstonehr.co.za\n2. Choose your course from our brochure catalog\n3. Click "Enrol Now" and fill in your details\n4. Choose payment option (full or installments)\n5. You'll receive confirmation within 24 hours\n\nHere are our course brochures:\n\n${brochureList}\n\nWhich course would you like to enrol in?`;
      } else {
        response = `Excellent choice! Here's how to enrol at Cornerstone Supreme:\n\n1. Visit: https://www.cornerstonehr.co.za\n2. Click "Enrol Now" on your chosen course\n3. Fill in your details\n4. Choose payment option (full or installments)\n5. You'll receive confirmation within 24 hours\n\nWhich course would you like to enrol in?`;
      }
      break;

    case 'brochure':
      if (hasBrochures && brochureList) {
        response = `I'd be happy to share our course brochures with you! Here are all available brochures:\n\n${brochureList}\n\nYou can also view them on our website:\nhttps://www.cornerstonehr.co.za\n\nWhich course brochure would you like me to send you?`;
      } else {
        response = `I'd be happy to share our course information with you!\n\nYou can view our full course catalog on our website:\nhttps://www.cornerstonehr.co.za\n\nTell me which field you're interested in and I can guide you to the right course!`;
      }
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
      response = `Thank you for your message! I'm Lerato from Cornerstone Supreme Education.\n\nHow can I help you today?\n- Browse our courses\n- Check pricing\n- Enrolment information\n- Request a brochure\n- Payment options`;
  }

  updateContext(phone, intent, relevantCourse ? relevantCourse.title : ctx.last_course_mentioned, studentMsg, response);
  return { response, intent, lang };
}

async function sendWhatsAppMessage(to, message) {
  if (!API_KEY) { console.log('No API key configured'); return; }
  try {
    const res = await fetch(`${WHATSAPP_API}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'D360-API-Key': API_KEY },
      body: JSON.stringify({ messaging_product: 'whatsapp', recipient_type: 'individual', to, type: 'text', text: { body: message } })
    });
    if (!res.ok) console.error('WhatsApp send failed:', res.status, await res.text());
    else console.log('Message sent to', to);
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

app.get('/api/ping', (req, res) => res.json(trpc({ ok: true, db: 'json-file' })));

app.post('/api/trpc/courses.list', (req, res) => {
  const input = parseInput(req);
  let result = DB.courses.filter(c => c.status === 'published');
  if (input.category) result = result.filter(c => c.category === input.category);
  if (input.search) result = result.filter(c => c.title.toLowerCase().includes(input.search.toLowerCase()));
  res.json(trpc(result.reverse()));
});

app.post('/api/trpc/courses.count', (req, res) => {
  res.json(trpc(DB.courses.filter(c => c.status === 'published').length));
});

app.post('/api/trpc/courses.create', (req, res) => {
  const input = parseInput(req);
  const course = { id: nextId('courses'), title: input.title, category: input.category, price: input.price, duration: input.duration, description: input.description, format: input.format || 'Online', certification: input.certification || 'Certificate of Completion', status: 'published', created_at: new Date().toISOString() };
  DB.courses.push(course);
  saveDB();
  res.json(trpc({ id: course.id }));
});

app.post('/api/trpc/courses.bulkImport', (req, res) => {
  const input = parseInput(req);
  let count = 0;
  for (const c of (input.courses || [])) {
    DB.courses.push({ id: nextId('courses'), title: c.title, category: c.category, price: c.price, duration: c.duration, description: c.description || '', format: 'Online', certification: 'Certificate of Completion', status: 'published', created_at: new Date().toISOString() });
    count++;
  }
  saveDB();
  res.json(trpc({ inserted: count }));
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
  DB.students.push(student);
  saveDB();
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

app.post('/api/trpc/conversations.update', (req, res) => {
  const input = parseInput(req);
  const conv = DB.conversations.find(c => c.id === input.id);
  if (conv) { conv.status = input.status; saveDB(); }
  res.json(trpc({ success: true }));
});

app.post('/api/trpc/messages.list', (req, res) => {
  const input = parseInput(req);
  res.json(trpc(DB.messages.filter(m => m.conversation_id === input.conversationId)));
});

app.post('/api/trpc/enrollments.list', (req, res) => {
  res.json(trpc([...DB.enrollments].reverse()));
});

app.post('/api/trpc/enrollments.create', (req, res) => {
  const input = parseInput(req);
  const enroll = { id: nextId('enrollments'), student_name: input.studentName, student_phone: input.studentPhone, course_name: input.courseName, amount: input.amount || '', status: input.status || 'pending', created_at: new Date().toISOString() };
  DB.enrollments.push(enroll);
  saveDB();
  res.json(trpc({ id: enroll.id }));
});

app.post('/api/trpc/brochures.list', (req, res) => {
  res.json(trpc([...DB.brochures].reverse().map(b => ({ id: b.id, name: b.name, filename: b.filename, mime_type: b.mime_type, size: b.size, category: b.category, is_default: b.is_default, created_at: b.created_at }))));
});

app.post('/api/trpc/brochures.count', (req, res) => {
  res.json(trpc(DB.brochures.length));
});

app.post('/api/trpc/brochures.upload', (req, res) => {
  const input = parseInput(req);
  const isDefault = DB.brochures.length === 0 ? 1 : 0;
  const brochure = { id: nextId('brochures'), name: input.name, filename: input.filename, mime_type: input.mimeType, size: input.size, data: input.data, category: input.category || 'General', is_default: isDefault, created_at: new Date().toISOString() };
  DB.brochures.push(brochure);
  saveDB();
  res.json(trpc({ id: brochure.id, isDefault: isDefault === 1 }));
});

app.post('/api/trpc/brochures.setDefault', (req, res) => {
  const input = parseInput(req);
  DB.brochures.forEach(b => b.is_default = 0);
  const b = DB.brochures.find(b => b.id === input.id);
  if (b) b.is_default = 1;
  saveDB();
  res.json(trpc({ success: true }));
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

app.post('/api/trpc/company.getSettings', (req, res) => {
  res.json(trpc(DB.settings));
});

app.post('/api/trpc/company.update', (req, res) => {
  const input = parseInput(req);
  for (const [key, value] of Object.entries(input)) {
    if (value !== undefined) DB.settings[key] = value;
  }
  saveDB();
  res.json(trpc({ success: true }));
});

app.post('/api/trpc/settings.getBrochure', (req, res) => {
  res.json(trpc(DB.settings.brochureUrl || 'https://www.cornerstonehr.co.za'));
});

app.post('/api/trpc/agents.list', (req, res) => {
  res.json(trpc([
    { agentId: 'intent_detector', name: 'Intent Detector', type: 'intent_detector', description: 'Understands what students need', isActive: true, response_count: '0' },
    { agentId: 'context_analyzer', name: 'Context Analyzer', type: 'context_analyzer', description: 'Remembers conversation context', isActive: true, response_count: '0' },
    { agentId: 'sales_responder', name: 'Sales Advisor', type: 'sales_responder', description: 'Course recommendations by Lerato', isActive: true, response_count: '0' },
    { agentId: 'objection_handler', name: 'Objection Handler', type: 'objection_handler', description: 'Handles pricing and time concerns', isActive: true, response_count: '0' },
    { agentId: 'follow_up', name: 'Follow-up Agent', type: 'follow_up', description: 'Schedules follow-up messages', isActive: true, response_count: '0' },
    { agentId: 'language_adapter', name: 'Language Adapter', type: 'language_adapter', description: 'Speaks student language', isActive: true, response_count: '0' },
    { agentId: 'post_enrollment', name: 'Student Success', type: 'post_enrollment_support', description: 'Supports enrolled students', isActive: true, response_count: '0' },
    { agentId: 'prospector', name: 'Outbound Sales', type: 'prospector', description: 'Social media lead generation', isActive: true, response_count: '0' },
  ]));
});

app.post('/api/trpc/analytics.getStats', (req, res) => {
  res.json(trpc({
    totalConversations: DB.conversations.length,
    activeConversations: DB.conversations.filter(c => c.status === 'active').length,
    enrolledCount: DB.conversations.filter(c => c.status === 'enrolled').length,
    avgResponseTime: '2.3s',
    conversionRate: DB.conversations.length > 0 ? ((DB.conversations.filter(c => c.status === 'enrolled').length / DB.conversations.length) * 100).toFixed(1) + '%' : '0%',
    agentUtilization: '85%',
  }));
});

app.post('/api/trpc/analytics.getDailyConversations', (req, res) => {
  res.json(trpc({ labels: ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'], data: [0,0,0,0,0,0,0] }));
});

app.post('/api/trpc/analytics.getSalesFunnel', (req, res) => {
  res.json(trpc({ labels: ['Enquiry','Interested','Enrolled'], data: [100, 60, 25] }));
});

app.get('/api/webhook/whatsapp', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];
  if (mode === 'subscribe' && token === WEBHOOK_VERIFY_TOKEN) {
    console.log('Webhook verified!');
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

    console.log(`[${new Date().toISOString()}] IN from ${from}: ${text}`);

    const { response, intent, lang } = generateAIResponse(text, from);
    saveConversation(from, name, text, response, intent, lang);
    await sendWhatsAppMessage(from, response);

    console.log(`[${new Date().toISOString()}] Lerato to ${from}: ${response.substring(0, 80)}...`);
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
  console.log('  Port:', PORT);
  console.log('  Database: JSON file (' + DB_FILE + ')');
  console.log('  Courses:', DB.courses.length);
  console.log('  API: /api/ping, /api/trpc/*');
  console.log('  WhatsApp: /api/webhook/whatsapp');
  console.log('  Web: / (dashboard)');
  console.log('='.repeat(60));
});
