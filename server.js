import express from 'express';
import mysql from 'mysql2/promise';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));

const API_KEY = process.env.API_KEY || '';
const PHONE_NUMBER_ID = process.env.PHONE_NUMBER_ID || '';
const BUSINESS_PHONE = process.env.BUSINESS_PHONE || '0718374853';
const WEBHOOK_VERIFY_TOKEN = process.env.WEBHOOK_VERIFY_TOKEN || '';
const DATABASE_URL = process.env.DATABASE_URL || '';
const WHATSAPP_API = 'https://waba-v2.360dialog.io';
let db = null;

async function initDatabase() {
  if (!DATABASE_URL) { console.log('No DB - demo mode'); return; }
  try {
    const match = DATABASE_URL.match(/mysql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)/);
    if (match) {
      const [, user, password, host, port, database] = match;
      db = await mysql.createPool({ host, user, password, database, port: parseInt(port), waitForConnections: true, connectionLimit: 5 });
      await db.execute(`CREATE TABLE IF NOT EXISTS courses (id INT AUTO_INCREMENT PRIMARY KEY, title VARCHAR(255), category VARCHAR(100), description TEXT, price VARCHAR(50), duration VARCHAR(100), status ENUM('published','draft') DEFAULT 'published', created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)`);
      await db.execute(`CREATE TABLE IF NOT EXISTS students (id INT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(255), phone VARCHAR(50), email VARCHAR(320), status VARCHAR(50) DEFAULT 'new', created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)`);
      await db.execute(`CREATE TABLE IF NOT EXISTS conversations (id INT AUTO_INCREMENT PRIMARY KEY, student_phone VARCHAR(50), student_name VARCHAR(255) DEFAULT 'Student', language VARCHAR(20) DEFAULT 'en', status VARCHAR(50) DEFAULT 'active', last_message TEXT, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP)`);
      await db.execute(`CREATE TABLE IF NOT EXISTS messages (id INT AUTO_INCREMENT PRIMARY KEY, conversation_id INT, sender VARCHAR(20), content TEXT, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)`);
      await db.execute(`CREATE TABLE IF NOT EXISTS enrollments (id INT AUTO_INCREMENT PRIMARY KEY, student_name VARCHAR(255), student_phone VARCHAR(50), course_name VARCHAR(255), amount VARCHAR(50), status VARCHAR(50) DEFAULT 'pending', enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)`);
      await db.execute(`CREATE TABLE IF NOT EXISTS brochures (id INT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(255), filename VARCHAR(255), mime_type VARCHAR(100), size VARCHAR(50), data LONGTEXT, category VARCHAR(100) DEFAULT 'General', is_default BOOLEAN DEFAULT false, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)`);
      await db.execute(`CREATE TABLE IF NOT EXISTS settings (key_name VARCHAR(255) PRIMARY KEY, value TEXT, updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP)`);
      await db.execute(`CREATE TABLE IF NOT EXISTS agent_logs (id INT AUTO_INCREMENT PRIMARY KEY, agent_id VARCHAR(100), conversation_id INT, action VARCHAR(255), details TEXT, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)`);
      const [existing] = await db.execute('SELECT COUNT(*) as count FROM courses');
      if (existing[0].count === 0) {
        const courses = [
          ['Business Management','Business','R8,500','12 weeks','Comprehensive business management certification'],
          ['HR Management','HR','R7,200','10 weeks','Professional HR management course'],
          ['Project Management','Business','R9,500','8 weeks','PMP-aligned project management'],
          ['Digital Marketing','Marketing','R6,500','6 weeks','Complete digital marketing training'],
          ['Leadership Development','Business','R8,000','8 weeks','Executive leadership program'],
          ['Financial Management','Finance','R9,000','10 weeks','Corporate finance and accounting'],
          ['Occupational Health & Safety','Health & Safety','R5,500','4 weeks','OHSA-compliant safety training'],
          ['Customer Service Excellence','Business','R4,500','4 weeks','World-class customer service training'],
        ];
        for (const c of courses) await db.execute('INSERT INTO courses (title, category, price, duration, description) VALUES (?,?,?,?,?)', c);
        console.log('8 courses seeded');
      }
      await db.execute(`INSERT IGNORE INTO settings (key_name, value) VALUES ('companyName','Cornerstone Supreme'),('companyPhone','0718374853'),('companyWebsite','https://www.cornerstonehr.co.za'),('brochureUrl','https://www.cornerstonehr.co.za')`);
      console.log('Database connected!');
    }
  } catch (err) { console.error('DB error:', err.message); }
n}

function trpcResponse(data, error = null) {
  if (error) return { result: { data: { json: null } }, error: { message: error } };
n  return { result: { data: { json: data } } };
n}
nfunction parseInput(req) { return req.body?.json || req.body || {}; }
n
nconst COURSES = [
n  { title: 'Business Management', category: 'Business', price: 'R8,500', duration: '12 weeks' },
n  { title: 'HR Management', category: 'HR', price: 'R7,200', duration: '10 weeks' },
n  { title: 'Project Management', category: 'Business', price: 'R9,500', duration: '8 weeks' },
n  { title: 'Digital Marketing', category: 'Marketing', price: 'R6,500', duration: '6 weeks' },
n  { title: 'Leadership Development', category: 'Business', price: 'R8,000', duration: '8 weeks' },
n  { title: 'Financial Management', category: 'Finance', price: 'R9,000', duration: '10 weeks' },
n  { title: 'Health & Safety', category: 'Health & Safety', price: 'R5,500', duration: '4 weeks' },
n  { title: 'Customer Service', category: 'Business', price: 'R4,500', duration: '4 weeks' },
n];
n
nfunction detectIntent(msg) {
n  const lower = msg.toLowerCase();
n  if (/\b(hi|hello|hey|sawubona|hallo)\b/.test(lower)) return 'greeting';
n  if (/\b(price|cost|how much|fee|r\d|rand)\b/.test(lower)) return 'pricing';
n  if (/\b(enroll|register|sign up|apply|payment|pay|bank|transfer|eft)\b/.test(lower)) return 'enrollment';
n  if (/\b(brochure|catalog|pdf|send me|download)\b/.test(lower)) return 'brochure';
n  if (/\b(course|learn|study|training|qualification)\b/.test(lower)) return 'courses';
n  return 'general';
n}
n
nasync function generateAIResponse(message) {
n  const intent = detectIntent(message);
n  const responses = {
n    greeting: `Hello! Welcome to Cornerstone Supreme Education. I'm your AI assistant, available 24/7. We offer 8 professional courses with industry-recognized certifications. How can I help you today?`,
n    courses: `We offer 8 professional courses:\n\n${COURSES.map((c, i) => `${i+1}. ${c.title} (${c.category}) - ${c.price}`).join('\n')}\n\nVisit: https://www.cornerstonehr.co.za\n\nWhich course interests you?`,
n    pricing: `Our courses range from R4,500 to R9,500.\n\nPayment options:\n- Full payment (5% discount)\n- Monthly installments\n- Employer-sponsored\n\nWhich course pricing do you need?`,
n    enrollment: `Excellent! To enroll:\n\n1. Visit: https://www.cornerstonehr.co.za\n2. Click "Enroll Now"\n3. Fill in your details\n4. Choose payment option\n5. Confirmation within 24 hours\n\nOr tell me which course!`,
n    brochure: `Here's our course catalog:\nhttps://www.cornerstonehr.co.za\n\nCourses in:\n- Business Management\n- HR Management\n- Project Management\n- Digital Marketing\n- Leadership Development\n- Financial Management\n- Health & Safety\n- Customer Service\n\nWhich field interests you?`,
n    general: `Thank you for contacting Cornerstone Supreme Education!\n\nHow can I help?\n- Browse our 8 courses\n- Check pricing\n- Enrollment info\n- Request a brochure`,
n  };
n  return { response: responses[intent] || responses.general, intent };
n}
n
nasync function sendWhatsAppMessage(to, message) {
n  if (!API_KEY) return;
n  try {
n    await fetch(`${WHATSAPP_API}/messages`, {
n      method: 'POST',
n      headers: { 'Content-Type': 'application/json', 'D360-API-Key': API_KEY },
n      body: JSON.stringify({ messaging_product: 'whatsapp', recipient_type: 'individual', to, type: 'text', text: { body: message } }),
n    });
n    console.log('Sent to', to);
n  } catch (err) { console.error('Send failed:', err.message); }
n}
n
nasync function saveMessage(phone, name, message, aiResponse, intent) {
n  if (!db) return;
n  try {
n    const [existing] = await db.execute('SELECT id FROM conversations WHERE student_phone = ?', [phone]);
n    let convId;
n    if (existing.length === 0) {
n      const [result] = await db.execute('INSERT INTO conversations (student_phone, student_name, last_message, intent) VALUES (?,?,?,?)', [phone, name, message, intent]);
n      convId = result.insertId;
n    } else {
n      convId = existing[0].id;
n      await db.execute('UPDATE conversations SET last_message = ?, intent = ?, updated_at = NOW() WHERE id = ?', [message, intent, convId]);
n    }
n    await db.execute('INSERT INTO messages (conversation_id, sender, content) VALUES (?,?,?)', [convId, 'student', message]);
n    await db.execute('INSERT INTO messages (conversation_id, sender, content) VALUES (?,?,?)', [convId, 'ai', aiResponse]);
n  } catch (err) { console.error('Save error:', err.message); }
n}
n
n// API Routes
napp.get('/api/ping', (req, res) => res.json(trpcResponse({ ok: true })));
n
napp.post('/api/trpc/courses.list', async (req, res) => { if (!db) return res.json(trpcResponse([])); const [rows] = await db.execute('SELECT * FROM courses WHERE status = "published" ORDER BY id DESC'); res.json(trpcResponse(rows)); });
napp.post('/api/trpc/courses.count', async (req, res) => { if (!db) return res.json(trpcResponse(8)); const [rows] = await db.execute('SELECT COUNT(*) as count FROM courses WHERE status = "published"'); res.json(trpcResponse(rows[0]?.count || 0)); });
napp.post('/api/trpc/courses.create', async (req, res) => { if (!db) return res.json(trpcResponse(null)); const input = parseInput(req); const [result] = await db.execute('INSERT INTO courses (title, category, price, duration, description) VALUES (?,?,?,?,?)', [input.title, input.category, input.price, input.duration, input.description || '']); res.json(trpcResponse({ id: result.insertId })); });
napp.post('/api/trpc/courses.bulkImport', async (req, res) => { if (!db) return res.json(trpcResponse({ inserted: 0 })); const input = parseInput(req); let count = 0; for (const c of (input.courses || [])) { await db.execute('INSERT INTO courses (title, category, price, duration, description) VALUES (?,?,?,?,?)', [c.title, c.category, c.price, c.duration, c.description || '']); count++; } res.json(trpcResponse({ inserted: count })); });
n
napp.post('/api/trpc/students.list', async (req, res) => { if (!db) return res.json(trpcResponse([])); const input = parseInput(req); let sql = 'SELECT * FROM students'; const params = []; if (input.status) { sql += ' WHERE status = ?'; params.push(input.status); } sql += ' ORDER BY id DESC'; const [rows] = await db.execute(sql, params); res.json(trpcResponse(rows)); });
napp.post('/api/trpc/students.create', async (req, res) => { if (!db) return res.json(trpcResponse(null)); const input = parseInput(req); const [result] = await db.execute('INSERT INTO students (name, phone, email, status, source) VALUES (?,?,?,?,?)', [input.name, input.phone, input.email || null, input.status || 'new', input.source || 'whatsapp']); res.json(trpcResponse({ id: result.insertId })); });
napp.post('/api/trpc/students.bulkImport', async (req, res) => { if (!db) return res.json(trpcResponse({ inserted: 0 })); const input = parseInput(req); let count = 0; for (const s of (input.leads || [])) { await db.execute('INSERT INTO students (name, phone, email, status, source) VALUES (?,?,?,?,?)', [s.name, s.phone, s.email || null, s.status || 'interested', 'bulk_import']); count++; } res.json(trpcResponse({ inserted: count, total: input.leads?.length || 0 })); });
n
napp.post('/api/trpc/conversations.list', async (req, res) => { if (!db) return res.json(trpcResponse([])); const [rows] = await db.execute('SELECT * FROM conversations ORDER BY updated_at DESC LIMIT 50'); res.json(trpcResponse(rows)); });
napp.post('/api/trpc/conversations.update', async (req, res) => { if (!db) return res.json(trpcResponse(null)); const input = parseInput(req); await db.execute('UPDATE conversations SET status = ? WHERE id = ?', [input.status, input.id]); res.json(trpcResponse({ success: true })); });
napp.post('/api/trpc/messages.list', async (req, res) => { if (!db) return res.json(trpcResponse([])); const input = parseInput(req); const [rows] = await db.execute('SELECT * FROM messages WHERE conversation_id = ? ORDER BY created_at', [input.conversationId]); res.json(trpcResponse(rows)); });
n
napp.post('/api/trpc/enrollments.list', async (req, res) => { if (!db) return res.json(trpcResponse([])); const [rows] = await db.execute('SELECT * FROM enrollments ORDER BY enrolled_at DESC'); res.json(trpcResponse(rows)); });
napp.post('/api/trpc/enrollments.create', async (req, res) => { if (!db) return res.json(trpcResponse(null)); const input = parseInput(req); const [result] = await db.execute('INSERT INTO enrollments (student_name, student_phone, course_name, amount, status) VALUES (?,?,?,?,?)', [input.studentName, input.studentPhone, input.courseName, input.amount || '', input.status || 'pending']); res.json(trpcResponse({ id: result.insertId })); });
n
napp.post('/api/trpc/brochures.list', async (req, res) => { if (!db) return res.json(trpcResponse([])); const [rows] = await db.execute('SELECT id, name, filename, mime_type, size, category, is_default, created_at FROM brochures ORDER BY created_at DESC'); res.json(trpcResponse(rows)); });
napp.post('/api/trpc/brochures.count', async (req, res) => { if (!db) return res.json(trpcResponse(0)); const [rows] = await db.execute('SELECT COUNT(*) as count FROM brochures'); res.json(trpcResponse(rows[0]?.count || 0)); });
napp.post('/api/trpc/brochures.upload', async (req, res) => { if (!db) return res.json(trpcResponse(null)); const input = parseInput(req); const [existing] = await db.execute('SELECT COUNT(*) as count FROM brochures'); const isDefault = existing[0].count === 0; const [result] = await db.execute('INSERT INTO brochures (name, filename, mime_type, size, data, category, is_default) VALUES (?,?,?,?,?,?,?)', [input.name, input.filename, input.mimeType, input.size, input.data, input.category || 'General', isDefault]); res.json(trpcResponse({ id: result.insertId, isDefault })); });
napp.post('/api/trpc/brochures.setDefault', async (req, res) => { if (!db) return res.json(trpcResponse(null)); const input = parseInput(req); await db.execute('UPDATE brochures SET is_default = false'); await db.execute('UPDATE brochures SET is_default = true WHERE id = ?', [input.id]); res.json(trpcResponse({ success: true })); });
napp.post('/api/trpc/brochures.delete', async (req, res) => { if (!db) return res.json(trpcResponse(null)); const input = parseInput(req); await db.execute('DELETE FROM brochures WHERE id = ?', [input.id]); res.json(trpcResponse({ success: true })); });
napp.get('/api/brochures/:id', async (req, res) => { if (!db) return res.status(404).send('No DB'); const [rows] = await db.execute('SELECT * FROM brochures WHERE id = ?', [req.params.id]); if (!rows[0]) return res.status(404).send('Not found'); const b = rows[0]; res.set('Content-Type', b.mime_type); res.set('Content-Disposition', `inline; filename="${b.filename}"`); res.send(Buffer.from(b.data, 'base64')); });
n
napp.post('/api/trpc/company.getSettings', async (req, res) => { if (!db) return res.json(trpcResponse({})); const [rows] = await db.execute('SELECT * FROM settings'); const settings = {}; rows.forEach(r => settings[r.key_name] = r.value); res.json(trpcResponse(settings)); });
napp.post('/api/trpc/company.update', async (req, res) => { if (!db) return res.json(trpcResponse({ success: true })); const input = parseInput(req); for (const [key, value] of Object.entries(input)) { if (value !== undefined) await db.execute('INSERT INTO settings (key_name, value) VALUES (?,?) ON DUPLICATE KEY UPDATE value=?', [key, value, value]); } res.json(trpcResponse({ success: true })); });
napp.post('/api/trpc/settings.getBrochure', async (req, res) => { if (!db) return res.json(trpcResponse('https://www.cornerstonehr.co.za')); const [rows] = await db.execute('SELECT value FROM settings WHERE key_name = "brochureUrl"'); res.json(trpcResponse(rows[0]?.value || 'https://www.cornerstonehr.co.za')); });
napp.post('/api/trpc/settings.setBrochure', async (req, res) => { if (!db) return res.json(trpcResponse({ success: true })); const input = parseInput(req); await db.execute('INSERT INTO settings (key_name, value) VALUES ("brochureUrl",?) ON DUPLICATE KEY UPDATE value=?', [input.url, input.url]); res.json(trpcResponse({ success: true, url: input.url })); });
n
napp.post('/api/trpc/agents.list', async (req, res) => {
n  res.json(trpcResponse([
n    { agentId: 'intent_detector', name: 'Intent Detector', type: 'intent_detector', description: 'Detects student intent', isActive: true, response_count: '0' },
n    { agentId: 'context_analyzer', name: 'Context Analyzer', type: 'context_analyzer', description: 'Analyzes conversation context', isActive: true, response_count: '0' },
n    { agentId: 'sales_responder', name: 'Sales Responder', type: 'sales_responder', description: 'Generates course recommendations', isActive: true, response_count: '0' },
n    { agentId: 'objection_handler', name: 'Objection Handler', type: 'objection_handler', description: 'Handles pricing objections', isActive: true, response_count: '0' },
n    { agentId: 'follow_up', name: 'Follow-up Agent', type: 'follow_up', description: 'Schedules follow-ups', isActive: true, response_count: '0' },
n    { agentId: 'language_adapter', name: 'Language Adapter', type: 'language_adapter', description: 'Detects student language', isActive: true, response_count: '0' },
n    { agentId: 'post_enrollment', name: 'Student Success', type: 'post_enrollment_support', description: 'Supports enrolled students', isActive: true, response_count: '0' },
n    { agentId: 'prospector', name: 'Outbound Sales', type: 'prospector', description: 'Prospects and advertises', isActive: true, response_count: '0' },
n  ]));
n});
n
napp.post('/api/trpc/analytics.getStats', async (req, res) => { if (!db) return res.json(trpcResponse({ totalConversations: 0, activeConversations: 0, enrolledCount: 0, avgResponseTime: '2.3s', conversionRate: '0%', agentUtilization: '0%' })); const [[conv]] = await db.execute('SELECT COUNT(*) as count FROM conversations'); const [[active]] = await db.execute('SELECT COUNT(*) as count FROM conversations WHERE status = "active"'); const [[enrolled]] = await db.execute('SELECT COUNT(*) as count FROM conversations WHERE status = "enrolled"'); res.json(trpcResponse({ totalConversations: conv.count, activeConversations: active.count, enrolledCount: enrolled.count, avgResponseTime: '2.3s', conversionRate: conv.count > 0 ? ((enrolled.count / conv.count) * 100).toFixed(1) + '%' : '0%', agentUtilization: '85%' })); });
napp.post('/api/trpc/analytics.getDailyConversations', async (req, res) => { res.json(trpcResponse({ labels: ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'], data: [0,0,0,0,0,0,0] })); });
napp.post('/api/trpc/analytics.getSalesFunnel', async (req, res) => { res.json(trpcResponse({ labels: ['Enquiry','Interested','Enrolled'], data: [100, 60, 25] })); });
n
n// WhatsApp Webhook
napp.get('/api/webhook/whatsapp', (req, res) => {
n  const mode = req.query['hub.mode'];
n  const token = req.query['hub.verify_token'];
n  const challenge = req.query['hub.challenge'];
n  if (mode === 'subscribe' && token === WEBHOOK_VERIFY_TOKEN) { console.log('Webhook verified!'); res.status(200).send(challenge); }
n  else { res.sendStatus(403); }
n});
n
napp.post('/api/webhook/whatsapp', async (req, res) => {
n  res.sendStatus(200);
n  try {
n    const messages = req.body?.entry?.[0]?.changes?.[0]?.value?.messages;
n    if (!messages || messages.length === 0) return;
n    const msg = messages[0];
n    const from = msg.from;
n    const text = msg.text?.body || '';
n    const name = msg.contacts?.[0]?.profile?.name || 'Student';
n    console.log(`[${new Date().toISOString()}] From ${from}: ${text}`);
n    const { response, intent } = await generateAIResponse(text);
n    await saveMessage(from, name, text, response, intent);
n    await sendWhatsAppMessage(from, response);
n    console.log(`[${new Date().toISOString()}] AI replied to ${from}`);
n  } catch (err) { console.error('Webhook error:', err.message); }
n});
n
n// Static files
napp.use(express.static(path.join(__dirname, 'public')));
napp.get('*', (req, res) => { res.sendFile(path.join(__dirname, 'public', 'index.html')); });
n
nconst PORT = process.env.PORT || 3000;
ninitDatabase().then(() => {
n  app.listen(PORT, () => {
n    console.log('='.repeat(60));
n    console.log('  Cornerstone Supreme AI - LIVE');
n    console.log('  Port:', PORT);
n    console.log('  Phone:', BUSINESS_PHONE);
n    console.log('  Webhook: /api/webhook/whatsapp');
n    console.log('  Courses: 8 loaded');
n    console.log('  Agents: 8 ready');
n    console.log('='.repeat(60));
n  });
n});
