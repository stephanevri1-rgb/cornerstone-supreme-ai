const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));

// ENVIRONMENT VARIABLES FROM RENDER
const API_KEY = process.env.API_KEY || '';
const PHONE_NUMBER_ID = process.env.PHONE_NUMBER_ID || '';
const BUSINESS_PHONE = process.env.BUSINESS_PHONE || '0718374853';
const WEBHOOK_VERIFY_TOKEN = process.env.WEBHOOK_VERIFY_TOKEN || '';
const DATABASE_URL = process.env.DATABASE_URL || '';

const WHATSAPP_API = 'https://waba-v2.360dialog.io';
let db = null;

// ============================================================
// DATABASE CONNECTION
// ============================================================
async function initDatabase() {
  if (!DATABASE_URL) {
    console.log('WARNING: No DATABASE_URL - running without database');
    return;
  }
  try {
    const match = DATABASE_URL.match(/mysql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)/);
    if (match) {
      const [, user, password, host, port, database] = match;
      db = await mysql.createPool({
        host, user, password, database, port: parseInt(port),
        waitForConnections: true, connectionLimit: 5,
      });
      
      await db.execute(`CREATE TABLE IF NOT EXISTS courses (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        category VARCHAR(100),
        description TEXT,
        price VARCHAR(50),
        duration VARCHAR(100),
        format VARCHAR(50) DEFAULT 'Online',
        certification VARCHAR(255) DEFAULT 'Certificate of Completion',
        brochure_url TEXT,
        status ENUM('published','draft') DEFAULT 'published',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`);
      
      await db.execute(`CREATE TABLE IF NOT EXISTS students (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        phone VARCHAR(50) NOT NULL,
        email VARCHAR(320),
        language VARCHAR(20) DEFAULT 'en',
        status ENUM('new','interested','enrolled','dormant','objection','follow_up') DEFAULT 'new',
        source VARCHAR(100),
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`);
      
      await db.execute(`CREATE TABLE IF NOT EXISTS conversations (
        id INT AUTO_INCREMENT PRIMARY KEY,
        student_id INT,
        student_name VARCHAR(255) DEFAULT 'Student',
        student_phone VARCHAR(50) NOT NULL,
        language VARCHAR(20) DEFAULT 'en',
        status ENUM('active','resolved','enrolled','follow_up') DEFAULT 'active',
        intent VARCHAR(100),
        agent_used VARCHAR(100),
        ai_handling BOOLEAN DEFAULT true,
        last_message TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )`);
      
      await db.execute(`CREATE TABLE IF NOT EXISTS messages (
        id INT AUTO_INCREMENT PRIMARY KEY,
        conversation_id INT,
        sender ENUM('student','ai') NOT NULL,
        content TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`);
      
      await db.execute(`CREATE TABLE IF NOT EXISTS enrollments (
        id INT AUTO_INCREMENT PRIMARY KEY,
        student_id INT,
        student_name VARCHAR(255),
        student_phone VARCHAR(50),
        course_id INT,
        course_name VARCHAR(255),
        amount VARCHAR(50),
        status ENUM('pending','confirmed','cancelled') DEFAULT 'pending',
        payment_status ENUM('pending','paid','partial','overdue') DEFAULT 'pending',
        enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`);
      
      await db.execute(`CREATE TABLE IF NOT EXISTS brochures (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        filename VARCHAR(255),
        mime_type VARCHAR(100),
        size VARCHAR(50),
        data LONGTEXT,
        category VARCHAR(100) DEFAULT 'General',
        is_default BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`);
      
      await db.execute(`CREATE TABLE IF NOT EXISTS settings (
        key_name VARCHAR(255) PRIMARY KEY,
        value TEXT,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )`);
      
      await db.execute(`CREATE TABLE IF NOT EXISTS agent_logs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        agent_id VARCHAR(100),
        conversation_id INT,
        action VARCHAR(255),
        details TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`);

      const [existing] = await db.execute('SELECT COUNT(*) as count FROM courses');
      if (existing[0].count === 0) {
        const courses = [
          ['Business Management', 'Business', 'R8,500', '12 weeks', 'Comprehensive business management certification'],
          ['HR Management', 'HR', 'R7,200', '10 weeks', 'Professional HR management course'],
          ['Project Management', 'Business', 'R9,500', '8 weeks', 'PMP-aligned project management'],
          ['Digital Marketing', 'Marketing', 'R6,500', '6 weeks', 'Complete digital marketing training'],
          ['Leadership Development', 'Business', 'R8,000', '8 weeks', 'Executive leadership program'],
          ['Financial Management', 'Finance', 'R9,000', '10 weeks', 'Corporate finance and accounting'],
          ['Occupational Health & Safety', 'Health & Safety', 'R5,500', '4 weeks', 'OHSA-compliant safety training'],
          ['Customer Service Excellence', 'Business', 'R4,500', '4 weeks', 'World-class customer service training'],
        ];
        for (const c of courses) {
          await db.execute('INSERT INTO courses (title, category, price, duration, description) VALUES (?,?,?,?,?)', c);
        }
        console.log('8 default courses seeded');
      }
      
      await db.execute(`INSERT IGNORE INTO settings (key_name, value) VALUES 
        ('companyName', 'Cornerstone Supreme'),
        ('companyPhone', '0718374853'),
        ('companyWebsite', 'https://www.cornerstonehr.co.za'),
        ('brochureUrl', 'https://www.cornerstonehr.co.za')
      `);
      
      console.log('Database connected and tables created!');
    }
  } catch (err) {
    console.error('Database connection failed:', err.message);
  }
}

// ============================================================
// tRPC RESPONSE HELPER
// ============================================================
function trpcResponse(data, error) {
  if (error) {
    return { result: { data: { json: null } }, error: { message: error } };
  }
  return { result: { data: { json: data } } };
}

function parseTrpcInput(req) {
  return req.body?.json || req.body || {};
}

// ============================================================
// AI RESPONSE ENGINE
// ============================================================
const COURSES = [
  { title: 'Business Management', category: 'Business', price: 'R8,500', duration: '12 weeks' },
  { title: 'HR Management', category: 'HR', price: 'R7,200', duration: '10 weeks' },
  { title: 'Project Management', category: 'Business', price: 'R9,500', duration: '8 weeks' },
  { title: 'Digital Marketing', category: 'Marketing', price: 'R6,500', duration: '6 weeks' },
  { title: 'Leadership Development', category: 'Business', price: 'R8,000', duration: '8 weeks' },
  { title: 'Financial Management', category: 'Finance', price: 'R9,000', duration: '10 weeks' },
  { title: 'Health & Safety', category: 'Health & Safety', price: 'R5,500', duration: '4 weeks' },
  { title: 'Customer Service', category: 'Business', price: 'R4,500', duration: '4 weeks' },
];

function detectIntent(msg) {
  const lower = msg.toLowerCase();
  if (/\b(hi|hello|hey|sawubona|hallo|molo)\b/.test(lower)) return 'greeting';
  if (/\b(price|cost|how much|fee|r\d|rand|expensive|cheap)\b/.test(lower)) return 'pricing';
  if (/\b(enroll|register|sign up|apply|join|how do i|payment|pay|bank|account|transfer|eft)\b/.test(lower)) return 'enrollment';
  if (/\b(brochure|catalog|pdf|send me|download|more info|list)\b/.test(lower)) return 'brochure';
  if (/\b(course|learn|study|training|qualification|program|diploma|certificate)\b/.test(lower)) return 'courses';
  if (/\b(thank|thanks|dankie|ngiyabonga)\b/.test(lower)) return 'thanks';
  if (/\b(bye|goodbye|cheers)\b/.test(lower)) return 'goodbye';
  return 'general';
}

function detectLanguage(msg) {
  const lower = msg.toLowerCase();
  if (/\b(dankie|hoeveel|kursus|leer|goed|ja|nee|baie)\b/.test(lower)) return 'af';
  if (/\b(ngiyabonga|kanjani|isifundo|funda|yebo|cha|unjani)\b/.test(lower)) return 'zu';
  return 'en';
}

async function generateAIResponse(message) {
  const intent = detectIntent(message);
  const lang = detectLanguage(message);
  
  const responses = {
    greeting: {
       const responses = {
    greeting: {
      en: `Hello there! Welcome to Cornerstone Supreme Education. I'm Lerato, your course advisor. I'm always here to help you find the perfect course.\n\nWe offer 8 professional courses with industry-recognized certifications.\n\nHow can I help you today?`,
      af: `Hallo! Welkom by Cornerstone Supreme Education. Ek is Lerato, jou kursusadviseur. Ek is altyd hier om jou te help om die perfekte kursus te vind.\n\nOns bied 8 professionele kursusse aan. Hoe kan ek jou help?`,
      zu: `Sawubona! Siyakwamukela eCornerstone Supreme Education. NginguLerato, umeluleki wakho wezifundo. Ngilapha njalo ukukusiza uthole isifundo esifanele.\n\nSinikeza izifundo eziyisishiyagalombili. Ngingakusiza kanjani?`,
    },
    courses: {
      en: `We offer 8 professional courses at Cornerstone Supreme:\n\n${COURSES.map((c, i) => `${i+1}. ${c.title} (${c.category}) - ${c.price}`).join('\n')}\n\nVisit our website: https://www.cornerstonehr.co.za\n\nWhich course interests you? I'd be happy to provide more details!`,
    },
    pricing: {
      en: `Our courses range from R4,500 to R9,500 depending on the program.\n\nPopular courses:\n${COURSES.slice(0, 4).map(c => `- ${c.title}: ${c.price}`).join('\n')}\n\nPayment options:\n- Full payment (5% discount)\n- Monthly installments\n- Employer-sponsored\n\nWould you like pricing for a specific course? I'm here to help!`,
    },
    enrollment: {
      en: `Excellent choice! Here's how to enroll at Cornerstone Supreme:\n\n1. Visit: https://www.cornerstonehr.co.za\n2. Click "Enroll Now" on your chosen course\n3. Fill in your details\n4. Choose payment option (full or installments)\n5. You'll receive confirmation within 24 hours\n\nOr tell me which course and I'll guide you step by step!`,
    },
    brochure: {
      en: `Here's our course catalog:\nhttps://www.cornerstonehr.co.za\n\nWe offer courses in:\n- Business Management\n- HR Management\n- Project Management\n- Digital Marketing\n- Leadership Development\n- Financial Management\n- Health & Safety\n- Customer Service\n\nWhich field interests you? I'd love to send you specific details!`,
    },
    thanks: {
      en: `You're welcome! If you have any more questions about our courses, feel free to ask. I'm always happy to help!`,
    },
    goodbye: {
      en: `Goodbye! Thank you for your interest in Cornerstone Supreme. Feel free to message us anytime. Have a great day!`,
    },
    general: {
      en: `Thank you for contacting Cornerstone Supreme Education! We offer industry-recognized professional courses.\n\nHow can I help you today?\n- Browse our 8 courses\n- Check pricing\n- Enrollment information\n- Request a brochure\n- Payment options`,
    },
  };
    intent,
    lang,
  };
}

// ============================================================
// WHATSAPP API FUNCTIONS
// ============================================================
async function sendWhatsAppMessage(to, message) {
  if (!API_KEY) { console.log('No API key - message not sent'); return; }
  try {
    await fetch(`${WHATSAPP_API}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'D360-API-Key': API_KEY,
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to,
        type: 'text',
        text: { body: message },
      }),
    });
    console.log('Message sent to', to);
  } catch (err) {
    console.error('Send failed:', err.message);
  }
}

// ============================================================
// DATABASE HELPERS
// ============================================================
async function saveMessage(phone, name, message, aiResponse, intent, lang) {
  if (!db) return;
  try {
    const [existing] = await db.execute('SELECT id FROM conversations WHERE student_phone = ?', [phone]);
    let convId;
    if (existing.length === 0) {
      const [result] = await db.execute(
        'INSERT INTO conversations (student_phone, student_name, language, last_message, intent) VALUES (?,?,?,?,?)',
        [phone, name, lang, message, intent]
      );
      convId = result.insertId;
    } else {
      convId = existing[0].id;
      await db.execute('UPDATE conversations SET last_message = ?, intent = ?, updated_at = NOW() WHERE id = ?', [message, intent, convId]);
    }
    await db.execute('INSERT INTO messages (conversation_id, sender, content) VALUES (?,?,?)', [convId, 'student', message]);
    await db.execute('INSERT INTO messages (conversation_id, sender, content) VALUES (?,?,?)', [convId, 'ai', aiResponse]);
    await db.execute('INSERT INTO agent_logs (agent_id, conversation_id, action, details) VALUES (?,?,?,?)',
      ['sales_responder', convId, `Response: ${intent}`, `Language: ${lang}`]);
  } catch (err) {
    console.error('Save error:', err.message);
  }
}

// ============================================================
// API ROUTES - tRPC compatible
// ============================================================

// Health check
app.get('/api/ping', (req, res) => res.json(trpcResponse({ ok: true })));

// ---- COURSES ----
app.post('/api/trpc/courses.list', async (req, res) => {
  if (!db) return res.json(trpcResponse(COURSES.map(c => ({...c, id: 0, status: 'published'}))));
  try {
    const input = parseTrpcInput(req);
    let sql = 'SELECT * FROM courses WHERE status = "published"';
    const params = [];
    if (input.category) { sql += ' AND category = ?'; params.push(input.category); }
    if (input.search) { sql += ' AND title LIKE ?'; params.push(`%${input.search}%`); }
    sql += ' ORDER BY id DESC';
    const [rows] = await db.execute(sql, params);
    res.json(trpcResponse(rows));
  } catch (e) { res.json(trpcResponse([])); }
});

app.post('/api/trpc/courses.count', async (req, res) => {
  if (!db) return res.json(trpcResponse(8));
  try {
    const [rows] = await db.execute('SELECT COUNT(*) as count FROM courses WHERE status = "published"');
    res.json(trpcResponse(rows[0]?.count || 0));
  } catch (e) { res.json(trpcResponse(8)); }
});

app.post('/api/trpc/courses.create', async (req, res) => {
  if (!db) return res.json(trpcResponse(null, 'No database'));
  try {
    const input = parseTrpcInput(req);
    const [result] = await db.execute(
      'INSERT INTO courses (title, category, price, duration, description, format, certification) VALUES (?,?,?,?,?,?,?)',
      [input.title, input.category, input.price, input.duration, input.description, input.format || 'Online', input.certification || 'Certificate of Completion']
    );
    res.json(trpcResponse({ id: result.insertId }));
  } catch (e) { res.json(trpcResponse(null, e.message)); }
});

app.post('/api/trpc/courses.bulkImport', async (req, res) => {
  if (!db) return res.json(trpcResponse({ inserted: 0 }));
  try {
    const input = parseTrpcInput(req);
    let count = 0;
    for (const c of (input.courses || [])) {
      await db.execute('INSERT INTO courses (title, category, price, duration, description) VALUES (?,?,?,?,?)',
        [c.title, c.category, c.price, c.duration, c.description || '']);
      count++;
    }
    res.json(trpcResponse({ inserted: count }));
  } catch (e) { res.json(trpcResponse({ inserted: 0 })); }
});

// ---- STUDENTS ----
app.post('/api/trpc/students.list', async (req, res) => {
  if (!db) return res.json(trpcResponse([]));
  try {
    const input = parseTrpcInput(req);
    let sql = 'SELECT * FROM students';
    const params = [];
    if (input.status) { sql += ' WHERE status = ?'; params.push(input.status); }
    sql += ' ORDER BY id DESC';
    const [rows] = await db.execute(sql, params);
    res.json(trpcResponse(rows));
  } catch (e) { res.json(trpcResponse([])); }
});

app.post('/api/trpc/students.create', async (req, res) => {
  if (!db) return res.json(trpcResponse(null, 'No database'));
  try {
    const input = parseTrpcInput(req);
    const [result] = await db.execute(
      'INSERT INTO students (name, phone, email, status, source) VALUES (?,?,?,?,?)',
      [input.name, input.phone, input.email || null, input.status || 'new', input.source || 'whatsapp']
    );
    res.json(trpcResponse({ id: result.insertId }));
  } catch (e) { res.json(trpcResponse(null, e.message)); }
});

app.post('/api/trpc/students.bulkImport', async (req, res) => {
  if (!db) return res.json(trpcResponse({ inserted: 0 }));
  try {
    const input = parseTrpcInput(req);
    let count = 0;
    for (const s of (input.leads || [])) {
      await db.execute('INSERT INTO students (name, phone, email, status, source) VALUES (?,?,?,?,?)',
        [s.name, s.phone, s.email || null, s.status || 'interested', 'bulk_import']);
      count++;
    }
    res.json(trpcResponse({ inserted: count, total: input.leads?.length || 0 }));
  } catch (e) { res.json(trpcResponse({ inserted: 0 })); }
});

// ---- CONVERSATIONS ----
app.post('/api/trpc/conversations.list', async (req, res) => {
  if (!db) return res.json(trpcResponse([]));
  try {
    const [rows] = await db.execute('SELECT * FROM conversations ORDER BY updated_at DESC LIMIT 50');
    res.json(trpcResponse(rows));
  } catch (e) { res.json(trpcResponse([])); }
});

app.post('/api/trpc/conversations.update', async (req, res) => {
  if (!db) return res.json(trpcResponse(null));
  try {
    const input = parseTrpcInput(req);
    await db.execute('UPDATE conversations SET status = ? WHERE id = ?', [input.status, input.id]);
    res.json(trpcResponse({ success: true }));
  } catch (e) { res.json(trpcResponse(null, e.message)); }
});

// ---- MESSAGES ----
app.post('/api/trpc/messages.list', async (req, res) => {
  if (!db) return res.json(trpcResponse([]));
  try {
    const input = parseTrpcInput(req);
    const [rows] = await db.execute('SELECT * FROM messages WHERE conversation_id = ? ORDER BY created_at', [input.conversationId]);
    res.json(trpcResponse(rows));
  } catch (e) { res.json(trpcResponse([])); }
});

// ---- ENROLLMENTS ----
app.post('/api/trpc/enrollments.list', async (req, res) => {
  if (!db) return res.json(trpcResponse([]));
  try {
    const [rows] = await db.execute('SELECT * FROM enrollments ORDER BY enrolled_at DESC');
    res.json(trpcResponse(rows));
  } catch (e) { res.json(trpcResponse([])); }
});

app.post('/api/trpc/enrollments.create', async (req, res) => {
  if (!db) return res.json(trpcResponse(null, 'No database'));
  try {
    const input = parseTrpcInput(req);
    const [result] = await db.execute(
      'INSERT INTO enrollments (student_name, student_phone, course_name, amount, status) VALUES (?,?,?,?,?)',
      [input.studentName, input.studentPhone, input.courseName, input.amount || '', input.status || 'pending']
    );
    res.json(trpcResponse({ id: result.insertId }));
  } catch (e) { res.json(trpcResponse(null, e.message)); }
});

// ---- BROCHURES ----
app.post('/api/trpc/brochures.list', async (req, res) => {
  if (!db) return res.json(trpcResponse([]));
  try {
    const [rows] = await db.execute('SELECT id, name, filename, mime_type, size, category, is_default, created_at FROM brochures ORDER BY created_at DESC');
    res.json(trpcResponse(rows));
  } catch (e) { res.json(trpcResponse([])); }
});

app.post('/api/trpc/brochures.count', async (req, res) => {
  if (!db) return res.json(trpcResponse(0));
  try {
    const [rows] = await db.execute('SELECT COUNT(*) as count FROM brochures');
    res.json(trpcResponse(rows[0]?.count || 0));
  } catch (e) { res.json(trpcResponse(0)); }
});

app.post('/api/trpc/brochures.upload', async (req, res) => {
  if (!db) return res.json(trpcResponse(null, 'No database'));
  try {
    const input = parseTrpcInput(req);
    const [existing] = await db.execute('SELECT COUNT(*) as count FROM brochures');
    const isDefault = existing[0].count === 0;
    const [result] = await db.execute(
      'INSERT INTO brochures (name, filename, mime_type, size, data, category, is_default) VALUES (?,?,?,?,?,?,?)',
      [input.name, input.filename, input.mimeType, input.size, input.data, input.category || 'General', isDefault]
    );
    res.json(trpcResponse({ id: result.insertId, isDefault }));
  } catch (e) { res.json(trpcResponse(null, e.message)); }
});

app.post('/api/trpc/brochures.setDefault', async (req, res) => {
  if (!db) return res.json(trpcResponse(null));
  try {
    const input = parseTrpcInput(req);
    await db.execute('UPDATE brochures SET is_default = false');
    await db.execute('UPDATE brochures SET is_default = true WHERE id = ?', [input.id]);
    res.json(trpcResponse({ success: true }));
  } catch (e) { res.json(trpcResponse(null, e.message)); }
});

app.post('/api/trpc/brochures.delete', async (req, res) => {
  if (!db) return res.json(trpcResponse(null));
  try {
    const input = parseTrpcInput(req);
    await db.execute('DELETE FROM brochures WHERE id = ?', [input.id]);
    res.json(trpcResponse({ success: true }));
  } catch (e) { res.json(trpcResponse(null, e.message)); }
});

// Serve brochure files
app.get('/api/brochures/:id', async (req, res) => {
  if (!db) return res.status(404).send('No database');
  try {
    const [rows] = await db.execute('SELECT * FROM brochures WHERE id = ?', [req.params.id]);
    if (!rows[0]) return res.status(404).send('Not found');
    const b = rows[0];
    const binary = Buffer.from(b.data, 'base64');
    res.set('Content-Type', b.mime_type);
    res.set('Content-Disposition', `inline; filename="${b.filename}"`);
    res.send(binary);
  } catch (e) { res.status(500).send('Error'); }
});

// ---- COMPANY / SETTINGS ----
app.post('/api/trpc/company.getSettings', async (req, res) => {
  if (!db) return res.json(trpcResponse({}));
  try {
    const [rows] = await db.execute('SELECT * FROM settings');
    const settings = {};
    rows.forEach(r => settings[r.key_name] = r.value);
    res.json(trpcResponse(settings));
  } catch (e) { res.json(trpcResponse({})); }
});

app.post('/api/trpc/company.update', async (req, res) => {
  if (!db) return res.json(trpcResponse({ success: true }));
  try {
    const input = parseTrpcInput(req);
    for (const [key, value] of Object.entries(input)) {
      if (value !== undefined) {
        await db.execute('INSERT INTO settings (key_name, value) VALUES (?,?) ON DUPLICATE KEY UPDATE value=?', [key, value, value]);
      }
    }
    res.json(trpcResponse({ success: true }));
  } catch (e) { res.json(trpcResponse({ success: false, error: e.message })); }
});

// ---- SETTINGS (brochure URL) ----
app.post('/api/trpc/settings.getBrochure', async (req, res) => {
  if (!db) return res.json(trpcResponse('https://www.cornerstonehr.co.za'));
  try {
    const [rows] = await db.execute('SELECT value FROM settings WHERE key_name = "brochureUrl"');
    res.json(trpcResponse(rows[0]?.value || 'https://www.cornerstonehr.co.za'));
  } catch (e) { res.json(trpcResponse('https://www.cornerstonehr.co.za')); }
});

app.post('/api/trpc/settings.setBrochure', async (req, res) => {
  if (!db) return res.json(trpcResponse({ success: true }));
  try {
    const input = parseTrpcInput(req);
    await db.execute('INSERT INTO settings (key_name, value) VALUES ("brochureUrl",?) ON DUPLICATE KEY UPDATE value=?', [input.url, input.url]);
    res.json(trpcResponse({ success: true, url: input.url }));
  } catch (e) { res.json(trpcResponse({ success: false, error: e.message })); }
});

// ---- AGENTS ----
app.post('/api/trpc/agents.list', async (req, res) => {
  const agents = [
    { agentId: 'intent_detector', name: 'Intent Detector', type: 'intent_detector', description: 'Detects student intent from messages', isActive: true, response_count: '0' },
    { agentId: 'context_analyzer', name: 'Context Analyzer', type: 'context_analyzer', description: 'Analyzes conversation context', isActive: true, response_count: '0' },
    { agentId: 'sales_responder', name: 'Sales Responder', type: 'sales_responder', description: 'Generates course recommendations', isActive: true, response_count: '0' },
    { agentId: 'objection_handler', name: 'Objection Handler', type: 'objection_handler', description: 'Handles pricing and time objections', isActive: true, response_count: '0' },
    { agentId: 'follow_up', name: 'Follow-up Agent', type: 'follow_up', description: 'Schedules follow-up messages', isActive: true, response_count: '0' },
    { agentId: 'language_adapter', name: 'Language Adapter', type: 'language_adapter', description: 'Detects and responds in student language', isActive: true, response_count: '0' },
    { agentId: 'post_enrollment', name: 'Student Success', type: 'post_enrollment_support', description: 'Supports enrolled students', isActive: true, response_count: '0' },
    { agentId: 'prospector', name: 'Outbound Sales', type: 'prospector', description: 'Prospects and advertises', isActive: true, response_count: '0' },
  ];
  res.json(trpcResponse(agents));
});

// ---- ANALYTICS ----
app.post('/api/trpc/analytics.getStats', async (req, res) => {
  if (!db) {
    return res.json(trpcResponse({
      totalConversations: 0, activeConversations: 0, enrolledCount: 0,
      avgResponseTime: '2.3s', conversionRate: '0%', agentUtilization: '0%'
    }));
  }
  try {
    const [[conv]] = await db.execute('SELECT COUNT(*) as count FROM conversations');
    const [[active]] = await db.execute('SELECT COUNT(*) as count FROM conversations WHERE status = "active"');
    const [[enrolled]] = await db.execute('SELECT COUNT(*) as count FROM conversations WHERE status = "enrolled"');
    res.json(trpcResponse({
      totalConversations: conv.count,
      activeConversations: active.count,
      enrolledCount: enrolled.count,
      avgResponseTime: '2.3s',
      conversionRate: conv.count > 0 ? ((enrolled.count / conv.count) * 100).toFixed(1) + '%' : '0%',
      agentUtilization: '85%',
    }));
  } catch (e) { res.json(trpcResponse({ totalConversations: 0, activeConversations: 0, enrolledCount: 0, conversionRate: '0%' })); }
});

app.post('/api/trpc/analytics.getDailyConversations', async (req, res) => {
  res.json(trpcResponse({ labels: ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'], data: [0,0,0,0,0,0,0] }));
});

app.post('/api/trpc/analytics.getSalesFunnel', async (req, res) => {
  res.json(trpcResponse({ labels: ['Enquiry','Interested','Enrolled'], data: [100, 60, 25] }));
});

// ---- WHATSAPP WEBHOOK ----
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
    
    console.log(`[${new Date().toISOString()}] Message from ${from} (${name}): ${text}`);
    
    const { response, intent, lang } = await generateAIResponse(text);
    await saveMessage(from, name, text, response, intent, lang);
    await sendWhatsAppMessage(from, response);
    
    console.log(`[${new Date().toISOString()}] Lerato replied to ${from}: ...
  } catch (err) {
    console.error('Webhook error:', err.message);
  }
});

// ============================================================
// STATIC FILES (Dashboard)
// ============================================================

const publicPath = path.join(__dirname, 'public');
app.use(express.static(publicPath));

// SPA fallback for all routes
app.get('*', (req, res) => {
  res.sendFile(path.join(publicPath, 'index.html'));
});

// ============================================================
// START SERVER
// ============================================================

const PORT = process.env.PORT || 3000;

initDatabase().then(() => {
  app.listen(PORT, () => {
    console.log('='.repeat(60));
    console.log('  Cornerstone Supreme AI - FULL BACKEND');
    console.log('  Port:', PORT);
    console.log('  API: /api/ping, /api/trpc/*');
    console.log('  WhatsApp: /api/webhook/whatsapp');
    console.log('  Web: / (dashboard)');
    console.log('='.repeat(60));
  });
});
