const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Environment
const API_KEY = process.env.D360_API_KEY || '';
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || '';
const WHATSAPP_API = 'https://waba-v2.360dialog.io';
const WEBHOOK_VERIFY_TOKEN = process.env.WHATSAPP_WEBHOOK_TOKEN || 'cornerstone_webhook_2024';
const DB_FILE = path.join(__dirname, 'contexts.json');

// ============================================================
// PERSISTENT CONTEXT STORAGE
// ============================================================
function loadContexts() {
  try {
    if (fs.existsSync(DB_FILE)) {
      return JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
    }
  } catch (e) {}
  return {};
}

function saveContexts(data) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
  } catch (e) {}
}

const contexts = loadContexts();

function getContext(phone) {
  if (!contexts[phone]) {
    contexts[phone] = { stage: 'greeting', course: '', name: '', lastReply: '' };
  }
  return contexts[phone];
}

function updateContext(phone, updates) {
  const ctx = getContext(phone);
  Object.assign(ctx, updates);
  saveContexts(contexts);
}

// ============================================================
// DATE HELPERS — Called per message, not at startup
// ============================================================
function getNextMonday() {
  const d = new Date();
  d.setDate(d.getDate() + ((1 + 7 - d.getDay()) % 7 || 7));
  return d.toLocaleDateString('en-ZA', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
}

// ============================================================
// COURSE DATABASE — 13 courses, exact facts
// ============================================================
function getCourses() {
  return [
    {
      title: 'RE 5 Regulatory Examination Preparation',
      keywords: ['re 5', 're5', 're-5', 'regulatory exam', 'regulatory examination', 'fais', 'ombud', 'fsp', 'moonstone'],
      price: 'R1,000 (Online) or R1,500 (Face-to-Face)',
      duration: '6 weeks',
      format: 'Online live sessions + recorded materials',
      certification: 'Preparation course — exam written separately at Moonstone (R1,300 exam fee)',
      intake: getNextMonday(),
      modules: ['FAIS Act Introduction', 'Duties & Powers of the FAIS Ombud', 'Rights of the FSCA', 'License Requirements for FSPs', 'Fit and Proper Requirements', 'Supervision Arrangements', 'The Debarment Process', 'Key Individual Responsibilities', 'General Code of Conduct', 'Financial Intelligence Centre Act'],
      link: 'https://zjw4jz46ae4ok.kimi.page'
    },
    {
      title: 'National Certificate Banking NQF 5',
      keywords: ['banking nqf 5', 'national certificate banking', 'bankseta', 'banking qualification'],
      price: 'R12,000',
      duration: '12 months',
      format: 'Online',
      certification: 'BANKSETA Accredited — SAQA ID 20186, NQF Level 5, 120 Credits',
      intake: getNextMonday(),
      modules: ['Banking Principles', 'Credit & Debt Management', 'Collections & Recovery', 'Wealth Management', 'Financial Planning', 'Financial Advice'],
      link: 'https://cornerstoneenrolmentform.kimi.pro'
    },
    {
      title: 'National Certificate Financial Markets NQF 6',
      keywords: ['financial markets nqf 6', 'nqf 6', 'financial markets', 'investment decisions', 'debt market'],
      price: 'R22,000',
      duration: '12 months',
      format: 'Online',
      certification: 'SAQA-registered — NQF Level 6',
      intake: getNextMonday(),
      modules: ['Investment Decisions', 'Company Analysis', 'Debt Market', 'Market Trends', 'Cash Flow Analysis', 'Risk Management'],
      link: 'https://cornerstone-enrol.kimi.pro'
    },
    {
      title: 'Online Advanced Business Administration',
      keywords: ['business administration', 'business admin'],
      price: 'R4,500',
      duration: '6 months',
      format: 'Online',
      certification: 'Advanced Certificate',
      intake: getNextMonday(),
      modules: ['Leadership & Management', 'Business Communication', 'Financial Management', 'Technology & Digital Skills', 'Project Management', 'Operations Management'],
      link: 'https://cornerstonebusinessadmin.kimi.pro'
    },
    {
      title: 'Entrepreneurship Training',
      keywords: ['entrepreneurship', 'entrepreneur', 'start a business'],
      price: 'R4,500',
      duration: '6 months',
      format: 'Online',
      certification: 'Advanced Certificate',
      intake: getNextMonday(),
      modules: ['Business Planning', 'Marketing Strategy', 'Financial Management for SMEs', 'Operations & Logistics', 'Legal Compliance', 'Growth Strategy'],
      link: 'https://cornerstonehr.co.za'
    },
    {
      title: 'Human Resources Management',
      keywords: ['hr management', 'human resources', 'hr'],
      price: 'R4,500',
      duration: '6 months',
      format: 'Online',
      certification: 'Advanced Certificate',
      intake: getNextMonday(),
      modules: ['HR Planning', 'Recruitment & Selection', 'Performance Management', 'Labour Relations', 'Compensation & Benefits', 'Training & Development'],
      link: 'https://cornerstonehr.co.za'
    },
    {
      title: 'Health and Safety in the Workplace',
      keywords: ['health and safety', 'safety'],
      price: 'R2,500',
      duration: '3 months',
      format: 'Online',
      certification: 'Advanced Certificate',
      intake: getNextMonday(),
      modules: ['OHS Act', 'Risk Assessment', 'Incident Investigation', 'Emergency Preparedness', 'Hazard Identification', 'Safety Audits'],
      link: 'https://cornerstonehr.co.za'
    },
    {
      title: 'Logistics and Supply Chain Management',
      keywords: ['logistics', 'supply chain'],
      price: 'R4,500',
      duration: '6 months',
      format: 'Online',
      certification: 'Advanced Certificate',
      intake: getNextMonday(),
      modules: ['Supply Chain Principles', 'Inventory Management', 'Transport & Distribution', 'Procurement', 'Warehousing', 'Global Trade'],
      link: 'https://cornerstonehr.co.za'
    },
    {
      title: 'Medical Call Centre Training',
      keywords: ['medical call', 'call centre', 'call center'],
      price: 'R3,500',
      duration: '3 months',
      format: 'Online',
      certification: 'Advanced Certificate',
      intake: getNextMonday(),
      modules: ['Medical Terminology', 'Patient Communication', 'Emergency Triage', 'Data Capture', 'Medical Ethics', 'Customer Service Excellence'],
      link: 'https://cornerstonehr.co.za'
    },
    {
      title: 'Professional Receptionist',
      keywords: ['receptionist', 'reception'],
      price: 'R4,500',
      duration: '6 months',
      format: 'Online',
      certification: 'Advanced Certificate',
      intake: getNextMonday(),
      modules: ['Front Office Management', 'Communication Skills', 'Telephone Etiquette', 'Visitor Management', 'Administration', 'Customer Service'],
      link: 'https://cornerstonehr.co.za'
    },
    {
      title: 'Risk Management Training',
      keywords: ['risk management', 'risk'],
      price: 'R6,000',
      duration: '3 weeks',
      format: 'Online',
      certification: 'Advanced Certificate',
      intake: getNextMonday(),
      modules: ['Risk Identification', 'Risk Assessment', 'Risk Mitigation', 'Compliance', 'Business Continuity', 'Crisis Management'],
      link: 'https://cornerstonehr.co.za'
    }
  ];
}

// ============================================================
// COURSE DETECTION
// ============================================================
function findCourse(msg, courses) {
  const lower = msg.toLowerCase();
  for (const c of courses) {
    for (const kw of c.keywords) {
      if (lower.includes(kw)) return c;
    }
  }
  return null;
}

// ============================================================
// RESPONSE BUILDER — Deterministic, warm, human
// ============================================================
function buildResponse(msg, phone) {
  const lower = msg.toLowerCase().trim();
  const ctx = getContext(phone);
  const courses = getCourses();

  // --- NAME COLLECTION ---
  if (ctx.stage === 'name_collection') {
    const nameMatch = lower.match(/^(?:my name is |i am |i\'m |call me |this is |im )?([a-z]+(?:\s+[a-z]+)?)$/i);
    if (nameMatch && nameMatch[1]) {
      const name = nameMatch[1].trim().split(' ')[0];
      if (name.length > 1 && !/^(hi|hello|hey|yes|no|ok|thanks)$/.test(name.toLowerCase())) {
        const niceName = name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
        updateContext(phone, { name: niceName, stage: 'active' });
        return `Lovely to meet you, ${niceName}! 🌟\n\nWhat course are you interested in? We offer RE 5, Banking NQF 5, Financial Markets NQF 6, Business Administration, and more. Just tell me the name! 😊`;
      }
    }
    return `What may I call you? Just your first name is perfectly fine. 😊`;
  }

  // Detect course from message OR use remembered course
  let course = findCourse(msg, courses);
  if (course) updateContext(phone, { course: course.title });
  else if (ctx.course) course = courses.find(c => c.title === ctx.course);

  // --- GREETING ---
  if (/\b(hi|hello|hey|sawubona|hallo|good morning|good afternoon|good evening)\b/.test(lower)) {
    if (!ctx.name) {
      updateContext(phone, { stage: 'name_collection' });
      return `Hello there! 👋 Welcome to Cornerstone Supreme Education.\n\nI'm Lerato, your course advisor. Before we dive in, may I ask your name?`;
    }
    return `Hello again, ${ctx.name}! 👋 Great to hear from you. How can I help you today?`;
  }

  // --- THANKS ---
  if (/\b(thank|thanks)\b/.test(lower)) {
    return ctx.name ? `You're very welcome, ${ctx.name}! 😊` : `You're very welcome! 😊`;
  }

  // --- GOODBYE ---
  if (/\b(bye|goodbye|see you)\b/.test(lower)) {
    return ctx.name ? `Take care, ${ctx.name}! Feel free to reach out anytime. 🌟` : `Take care! Feel free to reach out anytime. 🌟`;
  }

  // --- COURSE INQUIRY ---
  if (course && (/\b(course|tell me|what is|how|info|detail|about|module|syllabus|learn|study|qualification)\b/.test(lower) || findCourse(msg, courses))) {
    const modText = course.modules.map(m => `• ${m}`).join('\n');
    return `Absolutely, ${ctx.name || 'there'}! Here is everything about the **${course.title}**:\n\n**Price:** ${course.price}\n**Duration:** ${course.duration}\n**Format:** ${course.format}\n**Certification:** ${course.certification}\n**Next Intake:** ${course.intake}\n\n**Modules:**\n${modText}\n\nShall I send you the enrolment link? Just say **yes**! 😊`;
  }

  // --- PRICING ---
  if (/\b(price|cost|how much|fee|r\d|rand|pricelist)\b/.test(lower)) {
    if (course) {
      return `The **${course.title}** is ${course.price}.\n\nWould you like me to send you the enrolment link?`;
    }
    return `I can give you exact pricing, ${ctx.name || 'there'}! Which course are you interested in?\n\n• RE 5 — R1,000 (Online) / R1,500 (Face-to-Face)\n• Banking NQF 5 — R12,000\n• Financial Markets NQF 6 — R22,000\n• Business Administration — R4,500\n• Entrepreneurship — R4,500\n• HR Management — R4,500\n• Health & Safety — R2,500\n• Logistics — R4,500\n• Medical Call Centre — R3,500\n• Professional Receptionist — R4,500\n• Risk Management — R6,000\n\nJust tell me the course name! 😊`;
  }

  // --- INTAKE DATES ---
  if (/\b(intake|start date|when.*start|next class|begin|commence)\b/.test(lower)) {
    if (course) {
      return `The next intake for **${course.title}** is on **${course.intake}**.\n\nShall I send you the enrolment link to secure your place?`;
    }
    return `Our next intake is on **${getNextMonday()}**.\n\nWhich course are you interested in, ${ctx.name || 'there'}? I can give you the exact intake date and all the details. 😊`;
  }

  // --- LINK / ENROLMENT ---
  if (/\b(link|form|enrol|enroll|register|sign up|apply|registration)\b/.test(lower) || /\b(yes|yeah|sure|ok|okay|please|definitely|absolutely|send it)\b/.test(lower)) {
    if (course) {
      return `Of course, ${ctx.name || 'there'}! Here is your enrolment form for **${course.title}**:\n\n${course.link}\n\nPlease complete the form to secure your place. Once submitted, our management team will follow up with your Admission Letter and Invoice.\n\nIs there anything else I can help you with? 😊`;
    }
    return `I'd love to send you the link! Which course are you interested in?\n\n• RE 5\n• Banking NQF 5\n• Financial Markets NQF 6\n• Business Administration\n• Entrepreneurship\n• HR Management\n\nJust tell me the name and I'll send the correct link right away!`;
  }

  // --- CONTACT ---
  if (/\b(contact|phone|number|call|reach|office|email)\b/.test(lower)) {
    return `You can reach us at:\n📞 Office: 087 152 0608\n📱 WhatsApp: 071 837 4853\n📧 Email: stephane@cornerstonehr.co.za\n📍 367 Surrey Avenue, Block B, Ground Floor, Randburg, 2125`;
  }

  // --- DEFAULT ---
  if (!ctx.name) {
    updateContext(phone, { stage: 'name_collection' });
    return `Hello! Welcome to Cornerstone Supreme Education. I'm Lerato, your course advisor.\n\nMay I ask your name? I'd love to help you find the right course. 😊`;
  }

  return `Hi ${ctx.name}! I'm happy to help. Could you tell me a bit more about what you're looking for? For example:\n• Which course interests you?\n• Are you looking for pricing?\n• Do you want the enrolment link?\n\nJust let me know! 😊`;
}

// ============================================================
// WHATSAPP MESSAGE SENDER
// ============================================================
async function sendWhatsAppMessage(to, message) {
  if (!API_KEY) return;
  try {
    const resp = await fetch(`${WHATSAPP_API}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'D360-API-Key': API_KEY },
      body: JSON.stringify({ messaging_product: 'whatsapp', recipient_type: 'individual', to, type: 'text', text: { body: message } })
    });
    if (!resp.ok) console.error('WhatsApp API error:', resp.status);
  } catch (err) {
    console.error('Send error:', err.message);
  }
}

// ============================================================
// WEBHOOK ENDPOINTS
// ============================================================
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
    if (!text.trim()) return;

    console.log(`[IN] ${from}: ${text}`);
    const reply = buildResponse(text, from);
    await sendWhatsAppMessage(from, reply);
    console.log(`[OUT] ${from}: ${reply.substring(0, 80)}...`);
  } catch (err) {
    console.error('Webhook error:', err.message, err.stack);
  }
});

// ============================================================
// HEALTH & TEST ENDPOINTS
// ============================================================
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', version: '5.19.1', courses: getCourses().length, contexts: Object.keys(contexts).length });
});

app.get('/api/test/:msg', (req, res) => {
  const reply = buildResponse(req.params.msg, 'test-phone');
  res.json({ input: req.params.msg, response: reply });
});

app.get('/api/conversations', (req, res) => {
  res.json(contexts);
});

// ============================================================
// STATIC FILES
// ============================================================
const publicPath = path.join(__dirname, 'public');
if (fs.existsSync(publicPath)) {
  app.use(express.static(publicPath));
}

// ============================================================
// START SERVER
// ============================================================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log('='.repeat(60));
  console.log('  Cornerstone Supreme AI - Lerato v5.19.1 is LIVE');
  console.log('  Port:', PORT);
  console.log('  Courses loaded:', getCourses().length);
  console.log('  Test URL: /api/test/Hi');
  console.log('  Health: /api/health');
  console.log('='.repeat(60));
});
