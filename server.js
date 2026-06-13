     1	const express = require('express');
     2	const cors = require('cors');
     3	const path = require('path');
     4	const fs = require('fs');
     5	
     6	const app = express();
     7	app.use(cors());
     8	app.use(express.json({ limit: '50mb' }));
     9	
    10	// ENVIRONMENT VARIABLES
    11	const API_KEY = process.env.API_KEY || '';
    12	const PHONE_NUMBER_ID = process.env.PHONE_NUMBER_ID || '';
    13	const WEBHOOK_VERIFY_TOKEN = process.env.WEBHOOK_VERIFY_TOKEN || 'cornerstone2024';
    14	const WHATSAPP_API = 'https://waba-v2.360dialog.io';
    15	
    16	// ============================================================
    17	// JSON FILE DATABASE - Pure JavaScript, zero compilation
    18	// ============================================================
    19	const DB_FILE = path.join(__dirname, 'database.json');
    20	
    21	function loadDB() {
    22	  if (fs.existsSync(DB_FILE)) {
    23	    try { return JSON.parse(fs.readFileSync(DB_FILE, 'utf8')); } catch(e) {}
    24	  }
    25	  return createDefaultDB();
    26	}
    27	
    28	function saveDB() {
    29	  fs.writeFileSync(DB_FILE, JSON.stringify(DB, null, 2));
    30	}
    31	
    32	function createDefaultDB() {
    33	  return {
    34	    courses: [
    35	      { id: 1, title: 'Entrepreneurship Training Online Short Course', category: 'Business', price: 'R4,500', duration: '6 months', description: 'Whether you are starting a business, launching a new division, or seeking to invest in new ventures, entrepreneurship and business management skills are vital to your success. Our well-rounded programme integrates multiple core modules to prepare students for the real world of entrepreneurship. Advanced Certificate.', format: 'Online', certification: 'Advanced Certificate', status: 'published', created_at: new Date().toISOString() },
    36	      { id: 2, title: 'Health and Safety in the Workplace', category: 'Health & Safety', price: 'R2,500', duration: '3 months', description: 'This course equips you with the skills to ensure legal compliance and create a safe, productive working environment. Covers Neuro-Linguistic Programming, Emotional Intelligence, Safety Procedure Manual, Workplace Safety & Ergonomics, and core OHS principles. Online Short Course Advanced Certificate.', format: 'Online', certification: 'Advanced Certificate', status: 'published', created_at: new Date().toISOString() },
    37	      { id: 3, title: 'Health and Safety Online Short Course', category: 'Health & Safety', price: 'R1,300', duration: '3 weeks', description: 'A 3-week online certificate course that gives you the foundation to build a safety culture where safety is valued as an integral part of business operations. Covers defining safety culture, identifying hazards, writing a safety plan, incident management, and reviewing the programme.', format: 'Online', certification: 'Certificate', status: 'published', created_at: new Date().toISOString() },
    38	      { id: 4, title: 'Human Resources Management', category: 'HR', price: 'R4,500', duration: '6 months', description: 'This online programme equips HR professionals to attract, hire, train, and retain top talent while managing performance, grievances, and workplace wellness. 17 comprehensive modules covering people & leadership, business & process, workplace & digital skills. Online Advanced Certificate.', format: 'Online', certification: 'Advanced Certificate', status: 'published', created_at: new Date().toISOString() },
    39	      { id: 5, title: 'Logistics and Supply Chain Management', category: 'Business', price: 'R4,500', duration: '6 months', description: 'Master the core concepts of supply chain management including the flow, core models, supply chain drivers, key metrics, benchmarking techniques, and ideas for taking your supply chain to the next level. Covers Plan, Source, Deliver, and Return. Online Short Course Advanced Certificate.', format: 'Online', certification: 'Advanced Certificate', status: 'published', created_at: new Date().toISOString() },
    40	      { id: 6, title: 'Medical Call Centre Training', category: 'Healthcare', price: 'R3,500', duration: '3 months', description: 'An online short course designed to equip individuals with the skills and knowledge to effectively handle calls and inquiries in a healthcare setting. Covers medical terminology, communication skills, confidentiality, emergency management, call management, and legal & ethical obligations.', format: 'Online', certification: 'Certificate', status: 'published', created_at: new Date().toISOString() },
    41	      { id: 7, title: 'National Certificate Financial Markets and Instruments NQF 6', category: 'Finance', price: 'R22,000', duration: '12 months', description: 'A comprehensive one-year online qualification (SAQA ID: 50481, 120 Credits, NQF Level 6) designed to develop competent professionals who can analyse and make informed decisions in the ever-changing financial landscape. Covers investment decisions, company analysis, debt market, market trends, cash flow analysis, and risk management.', format: 'Online', certification: 'National Certificate NQF 6', status: 'published', created_at: new Date().toISOString() },
    42	      { id: 8, title: 'Online Advanced Business Administration', category: 'Business', price: 'R4,500', duration: '6 months', description: 'This course teaches essential administrative duties, business operations, processes, and customer service basics needed to deliver a high-quality service. 15 modules spanning leadership, finance, technology, and core business skills. Online Advance Certificate Short Course.', format: 'Online', certification: 'Advanced Certificate', status: 'published', created_at: new Date().toISOString() },
    43	      { id: 9, title: 'Professional Receptionist Online Short Course', category: 'Business', price: 'R4,500', duration: '6 months', description: 'Launch your career in business administration, customer service, and office management. 16 comprehensive modules including business foundations, communication & relations, service & marketing, and Microsoft Office Suite. Online Short Course Advanced Certificate.', format: 'Online', certification: 'Advanced Certificate', status: 'published', created_at: new Date().toISOString() },
    44	      { id: 10, title: 'RE 5 Regulatory Examination Preparation', category: 'Finance', price: 'R1,500', duration: '6 weeks', description: 'A 6-week online preparation course for the RE 5 (Regulatory Examination), a mandatory competency exam for financial services providers in South Africa. Covers FAIS Act, duties & powers of the FAIS Ombud, FSCA rights, license requirements, fit and proper requirements, supervision arrangements, debarment process, key individual responsibilities, code of conduct, and FICA.', format: 'Online', certification: 'Certificate of Completion', status: 'published', created_at: new Date().toISOString() },
    45	      { id: 11, title: 'Risk Management Training Programme', category: 'Business', price: 'R6,000', duration: '3 weeks', description: 'This comprehensive programme is aligned to SAQA ID 252025 and prepares you to identify, assess, and manage risk within your unit. Grounded in ISO 31000 and COSO internationally recognised standards. Four specific outcomes: Understand Risk, Identify & Assess, Develop Plans, Test & Revise. Certificate of Competence.', format: 'Online & Face-to-Face', certification: 'Certificate of Competence', status: 'published', created_at: new Date().toISOString() },
    46	      { id: 12, title: 'National Certificate Banking NQF 5', category: 'Banking', price: 'R12,000', duration: '12 months', description: 'A comprehensive 120-credit qualification (SAQA ID: 20186, NQF Level 5) — your gateway to opportunities in commercial banks, consumer lending institutions, cooperative financial organizations, and government regulatory departments. Six core modules: Legislation in Banking, Addressing Client Needs, Business Banking, Banking Sales, Banking Transactions, and Mortgage Loans. BankSETA Accredited.', format: 'Online', certification: 'National Certificate NQF 5', status: 'published', created_at: new Date().toISOString() }
    47	    ],
    48	    students: [],
    49	    conversations: [],
    50	    messages: [],
    51	    enrollments: [],
    52	    brochures: [],
    53	    settings: {
    54	      companyName: 'Cornerstone Supreme',
    55	      companyPhone: '0718374853',
    56	      companyWebsite: 'https://www.cornerstonehr.co.za',
    57	      companyEmail: 'info@cornerstonehr.co.za',
    58	      brochureUrl: 'https://www.cornerstonehr.co.za',
    59	      bankName: 'FNB',
    60	      accountNumber: '62774520099',
    61	      accountType: 'Business Account',
    62	      branchCode: '250655'
    63	    },
    64	    context: {},
    65	    _nextId: { courses: 13, students: 1, conversations: 1, messages: 1, enrollments: 1, brochures: 1 }
    66	  };
    67	}
    68	
    69	const DB = loadDB();
    70	
    71	function nextId(table) {
    72	  if (!DB._nextId[table]) DB._nextId[table] = 1;
    73	  return DB._nextId[table]++;
    74	}
    75	
    76	// Auto-save on exit
    77	process.on('exit', () => saveDB());
    78	process.on('SIGINT', () => { saveDB(); process.exit(0); });
    79	process.on('SIGTERM', () => { saveDB(); process.exit(0); });
    80	
    81	// Periodic save every 30 seconds
    82	setInterval(saveDB, 30000);
    83	
    84	console.log('Database loaded from:', DB_FILE);
    85	console.log('Courses:', DB.courses.length);
    86	
    87	// ============================================================
    88	// tRPC RESPONSE HELPER
    89	// ============================================================
    90	function trpc(data) {
    91	  return { result: { data: { json: data } } };
    92	}
    93	
    94	function parseInput(req) {
    95	  return req.body?.json || req.body || {};
    96	}
    97	
    98	// ============================================================
    99	// COURSE HELPERS
   100	// ============================================================
   101	function getAllCourses() {
   102	  return DB.courses.filter(c => c.status === 'published');
   103	}
   104	
   105	function getBrochureList() {
   106	  const brochures = DB.brochures.filter(b => b.name);
   107	  if (brochures.length === 0) return null;
   108	  return brochures.map((b, i) => `${i + 1}. ${b.name.replace(/\.[^/.]+$/, '')}`).join('\n');
   109	}
   110	
   111	function getCourseByTitle(title) {
   112	  const lower = title.toLowerCase();
   113	  return DB.courses.find(c => c.status === 'published' && c.title.toLowerCase().includes(lower));
   114	}
   115	
   116	// ============================================================
   117	// CONVERSATION CONTEXT / MEMORY
   118	// ============================================================
   119	function getContext(phone) {
   120	  if (!DB.context[phone]) {
   121	    DB.context[phone] = { last_intent: '', last_course_mentioned: '', message_history: [] };
   122	  }
   123	  return DB.context[phone];
   124	}
   125	
   126	function updateContext(phone, intent, courseMentioned, studentMessage, leratoReply) {
   127	  const ctx = getContext(phone);
   128	  ctx.last_intent = intent;
   129	  if (courseMentioned) ctx.last_course_mentioned = courseMentioned;
   130	  ctx.message_history.push({ role: 'student', msg: studentMessage, time: new Date().toISOString() });
   131	  ctx.message_history.push({ role: 'lerato', msg: leratoReply, time: new Date().toISOString() });
   132	  if (ctx.message_history.length > 20) ctx.message_history = ctx.message_history.slice(-20);
   133	  saveDB();
   134	}
   135	
   136	// ============================================================
   137	// SMART AI - LERATO
   138	// ============================================================
   139	function findRelevantCourse(msg) {
   140	  const lower = msg.toLowerCase();
   141	  const courses = getAllCourses();
   142	  for (const c of courses) {
   143	    if (lower.includes(c.title.toLowerCase()) || lower.includes(c.category.toLowerCase())) return c;
   144	  }
   145	  for (const c of courses) {
   146	    const words = c.title.toLowerCase().split(' ');
   147	    for (const word of words) {
   148	      if (word.length > 3 && lower.includes(word)) return c;
   149	    }
   150	  }
   151	  return null;
   152	}
   153	
   154	function detectLanguage(msg) {
   155	  const lower = msg.toLowerCase();
   156	  if (/\b(dankie|hoeveel|kursus|leer|goed|ja|nee|baie|jou|ons|wat|waar|wanneer|hoekom|hoe|dis|daar|hier|almal)\b/.test(lower)) return 'af';
   157	  if (/\b(ngiyabonga|kanjani|isifundo|funda|yebo|cha|unjani|sawubona|ukuthi|wena|mina|lapha|khona|bona|yonke)\b/.test(lower)) return 'zu';
   158	  return 'en';
   159	}
   160	
   161	function generateAIResponse(studentMsg, phone) {
   162	  const lower = studentMsg.toLowerCase().trim();
   163	  const lang = detectLanguage(studentMsg);
   164	  const ctx = getContext(phone);
   165	  const courses = getAllCourses();
   166	  const relevantCourse = findRelevantCourse(studentMsg);
   167	
   168	  let intent = 'general';
   169	  if (/\b(hi|hello|hey|sawubona|hallo|molo|dumela|sanibonani)\b/.test(lower)) intent = 'greeting';
   170	  else if (/\b(thank|thanks|dankie|ngiyabonga|ke a leboga)\b/.test(lower)) intent = 'thanks';
   171	  else if (/\b(bye|goodbye|cheers|sharp|hamba kahle|totsiens)\b/.test(lower)) intent = 'goodbye';
   172	  else if (/\b(price|cost|how much|fee|r\d|rand|expensive|cheap|pricing|payment|pay|installment|discount)\b/.test(lower)) intent = 'pricing';
   173	  else if (/\b(enroll|register|sign up|apply|join|how do i start|how to apply|where do i|sign|registration|admission)\b/.test(lower)) intent = 'enrollment';
   174	  else if (/\b(brochure|catalog|pdf|send me|download|more info|document|flyer)\b/.test(lower)) intent = 'brochure';
   175	  else if (relevantCourse) intent = 'course_specific';
   176	  else if (/\b(course|learn|study|training|qualification|program|diploma|certificate|which|what do you offer|list|all courses|available)\b/.test(lower)) intent = 'courses';
   177	  else if (/\b(duration|how long|period|time|weeks|months|when does it end)\b/.test(lower)) intent = 'duration';
   178	  else if (/\b(location|where|venue|class|online|virtual|in person|physical|campus)\b/.test(lower)) intent = 'location';
   179	  else if (/\b(requirement|qualification needed|grade|matric|prerequisite|who can|eligible)\b/.test(lower)) intent = 'requirements';
   180	  else if (/\b(cert|certificate|accredited|nqf|saqa|recognised|recognized|registered)\b/.test(lower)) intent = 'certification';
   181	  else if (/\b(contact|call|email|reach|speak to|manager|consultant|advisor|lerato)\b/.test(lower)) intent = 'contact';
   182	  else if (/\b(bank|account|eft|transfer|deposit|payment detail|how do i pay)\b/.test(lower)) intent = 'payment_details';
   183	  else if (ctx.last_intent === 'course_specific' && /\b(price|cost|how much|fee|discount)\b/.test(lower)) intent = 'pricing';
   184	
   185	  let response = '';
   186	
   187	  const brochureList = getBrochureList();
   188	  const hasCourses = courses.length > 0;
   189	  const hasBrochures = DB.brochures.length > 0;
   190	
   191	  switch(intent) {
   192	    case 'greeting':
   193	      response = lang === 'af' 
   194	        ? `Hallo! Welkom by Cornerstone Supreme Education. Ek is Lerato, jou kursusadviseur.\n\nOns bied professionele kursusse aan met erkende sertifisering. Hoe kan ek jou help?`
   195	        : lang === 'zu'
   196	        ? `Sawubona! Siyakwamukela eCornerstone Supreme Education. NginguLerato, umeluleki wakho wezifundo.\n\nSinikeza izifundo ezinhle kakhulu ezineziqu zomsebenzi. Ngingakusiza kanjani?`
   197	        : `Hello! Welcome to Cornerstone Supreme Education. I'm Lerato, your course advisor.\n\nWe offer a range of professional courses with industry-recognized certifications.\n\nHow can I help you today?`;
   198	      break;
   199	
   200	    case 'thanks':
   201	      response = lang === 'af' ? `Dit is 'n plesier! As jy enige vrae het, laat weet my gerus.`
   202	        : lang === 'zu' ? `Ngiyabonga! Uma unemibuzo, ngicela ungitshele.`
   203	        : `It's my pleasure! If you have any more questions, just let me know.`;
   204	      break;
   205	
   206	    case 'goodbye':
   207	      response = `Goodbye! Thank you for your interest in Cornerstone Supreme. Feel free to message us anytime. Have a great day!`;
   208	      break;
   209	
   210	    case 'pricing':
   211	      if (relevantCourse) {
   212	        response = `The ${relevantCourse.title} course is priced at ${relevantCourse.price} for the full ${relevantCourse.duration} program.\n\nPayment options available:\n- Full payment (5% discount)\n- Monthly installments\n- Employer-sponsored\n\nWould you like to enrol in ${relevantCourse.title}?`;
   213	      } else if (hasBrochures && brochureList) {
   214	        response = `I'd be happy to share pricing with you! Here are our course brochures:\n\n${brochureList}\n\nWhich course would you like pricing for? I can send you the brochure with full details!`;
   215	      } else if (hasCourses) {
   216	        response = `Our courses range from ${courses[0].price} to ${courses[courses.length-1].price} depending on the program.\n\nPayment options:\n- Full payment (5% discount)\n- Monthly installments\n- Employer-sponsored\n\nWhich course would you like pricing for?`;
   217	      } else {
   218	        response = `Our course pricing varies depending on the program.\n\nPayment options available:\n- Full payment (5% discount)\n- Monthly installments\n- Employer-sponsored\n\nWhich course are you interested in? I can get you the exact pricing!`;
   219	      }
   220	      break;
         221	
   222	    case 'course_specific':
   223	      if (relevantCourse) {
   224	        response = `Great question about our ${relevantCourse.title} course!\n\nPrice: ${relevantCourse.price}\nDuration: ${relevantCourse.duration}\nFormat: ${relevantCourse.format}\nCertification: ${relevantCourse.certification}\n\n${relevantCourse.description}\n\nWould you like to enrol or do you have more questions?`;
   225	      } else if (hasBrochures && brochureList) {
   226	        response = `I'd be happy to tell you about that course! Here are our available brochures:\n\n${brochureList}\n\nWhich course interests you? I can send you the brochure with full details!`;
   227	      } else if (hasCourses) {
   228	        response = `I'd be happy to tell you about that course. Let me find the details for you.\n\nWhich course specifically interests you? Here are our options:\n${courses.map(c => `- ${c.title} (${c.category})`).join('\n')}`;
   229	      } else {
   230	        response = `I'd love to help you find the right course! Tell me which field you're interested in and I'll guide you.\n\nVisit our website for the full catalog: https://www.cornerstonehr.co.za`;
   231	      }
   232	      break;
   233	
   234	    case 'courses':
   235	      if (hasBrochures && brochureList) {
   236	        response = `Thank you for your interest in our courses! Here are our available course brochures:\n\n${brochureList}\n\nYou can view and download any of these brochures on our website: https://www.cornerstonehr.co.za\n\nWhich course would you like to know more about? I can send you the brochure or answer any questions!`;
   237	      } else if (hasCourses) {
   238	        response = `We offer the following professional courses:\n\n${courses.map((c, i) => `${i+1}. ${c.title} (${c.category}) - ${c.price}`).join('\n')}\n\nVisit our website: https://www.cornerstonehr.co.za\n\nWhich course interests you? I can provide full details!`;
   239	      } else {
   240	        response = `Thank you for your interest in Cornerstone Supreme Education! We offer a variety of professional courses across different fields.\n\nVisit our website to view our full course catalog: https://www.cornerstonehr.co.za\n\nOr tell me which field you're interested in and I'll guide you!`;
   241	      }
   242	      break;
   243	
   244	    case 'duration':
   245	      if (relevantCourse) {
   246	        response = `The ${relevantCourse.title} course runs for ${relevantCourse.duration}. This includes all modules, assessments and practical work.\n\nWould you like to know more about this course?`;
   247	      } else if (hasBrochures && brochureList) {
   248	        response = `Course durations vary depending on the program. Here are our course brochures:\n\n${brochureList}\n\nWhich course would you like duration details for? I can send you the brochure!`;
   249	      } else if (hasCourses) {
   250	        response = `Our course durations vary:\n${courses.map(c => `- ${c.title}: ${c.duration}`).join('\n')}\n\nWhich course would you like details on?`;
   251	      } else {
   252	        response = `Course durations vary depending on the program, typically ranging from 4 to 12 weeks.\n\nWhich course are you interested in? I can give you the exact duration!`;
   253	      }
   254	      break;
   255	
   256	    case 'certification':
   257	      response = `All our courses come with a Certificate of Completion that is industry-recognized. Our certifications are aligned with NQF standards where applicable.\n\nAfter completing your course, you will receive:\n- Official Cornerstone Supreme certificate\n- Skills portfolio\n- Reference letter (on request)\n\nWould you like to know about a specific course?`;
   258	      break;
   259	
   260	    case 'requirements':
   261	      response = `Our courses are open to anyone with a Grade 12 / Matric certificate. No prior experience is required for most courses.\n\nWhat you need:\n- Matric certificate (or equivalent)\n- Basic computer literacy\n- Commitment to attend all sessions\n\nSome advanced courses may require relevant work experience. Which course are you interested in?`;
   262	      break;
   263	
   264	    case 'location':
   265	      response = `Our courses are delivered online via live virtual sessions, so you can study from anywhere in South Africa.\n\nBenefits of online learning:\n- Study from home or office\n- Flexible scheduling\n- Recorded sessions for revision\n- No travel required\n\nWould you like to see our course list?`;
   266	      break;
   267	
   268	    case 'enrollment':
   269	      if (relevantCourse) {
   270	        response = `I'd love to help you enrol in ${relevantCourse.title}! Here's what to do:\n\n1. Visit: https://www.cornerstonehr.co.za\n2. Click "Enrol Now" on ${relevantCourse.title}\n3. Fill in your details\n4. Choose payment option\n5. You'll receive confirmation within 24 hours\n\nThe course fee is ${relevantCourse.price} for ${relevantCourse.duration}.`;
   271	      } else if (hasBrochures && brochureList) {
   272	        response = `I'd love to help you enrol! Here's how:\n\n1. Visit: https://www.cornerstonehr.co.za\n2. Choose your course from our brochure catalog\n3. Click "Enrol Now" and fill in your details\n4. Choose payment option (full or installments)\n5. You'll receive confirmation within 24 hours\n\nHere are our course brochures:\n\n${brochureList}\n\nWhich course would you like to enrol in?`;
   273	      } else {
   274	        response = `Excellent choice! Here's how to enrol at Cornerstone Supreme:\n\n1. Visit: https://www.cornerstonehr.co.za\n2. Click "Enrol Now" on your chosen course\n3. Fill in your details\n4. Choose payment option (full or installments)\n5. You'll receive confirmation within 24 hours\n\nWhich course would you like to enrol in?`;
   275	      }
   276	      break;
   277	
   278	    case 'brochure':
   279	      if (hasBrochures && brochureList) {
   280	        response = `I'd be happy to share our course brochures with you! Here are all available brochures:\n\n${brochureList}\n\nYou can also view them on our website:\nhttps://www.cornerstonehr.co.za\n\nWhich course brochure would you like me to send you?`;
   281	      } else {
   282	        response = `I'd be happy to share our course information with you!\n\nYou can view our full course catalog on our website:\nhttps://www.cornerstonehr.co.za\n\nTell me which field you're interested in and I can guide you to the right course!`;
   283	      }
   284	      break;
   285	
   286	    case 'payment_details':
   287	      response = `Our banking details for payment:\n\nBank: FNB\nAccount: 62774520099\nAccount Type: Business Account\nBranch Code: 250655\nReference: Your Name + Course\n\nPayment options:\n- Full payment (5% discount)\n- Monthly installments\n- EFT or direct deposit\n\nSend proof of payment to info@cornerstonehr.co.za`;
   288	      break;
   289	
   290	    case 'contact':
   291	      response = `You can reach us through:\n\nPhone: 0718374853\nEmail: info@cornerstonehr.co.za\nWebsite: https://www.cornerstonehr.co.za\n\nI'm Lerato and I'm always here on WhatsApp to help you too! What would you like to know?`;
   292	      break;
   293	
   294	    default:
   295	      if (ctx.last_course_mentioned) {
   296	        const lastCourse = getCourseByTitle(ctx.last_course_mentioned);
   297	        if (lastCourse) {
   298	          response = `Regarding ${lastCourse.title} (${lastCourse.price}, ${lastCourse.duration}) - that's a great choice!\n\n${lastCourse.description}\n\nWould you like to enrol or do you have more questions?`;
   299	          break;
   300	        }
   301	      }
   302	      response = `Thank you for your message! I'm Lerato from Cornerstone Supreme Education.\n\nHow can I help you today?\n- Browse our courses\n- Check pricing\n- Enrolment information\n- Request a brochure\n- Payment options`;
   303	  }
   304	
   305	  updateContext(phone, intent, relevantCourse ? relevantCourse.title : ctx.last_course_mentioned, studentMsg, response);
   306	  return { response, intent, lang };
   307	}
   308	
   309	// ============================================================
   310	// WHATSAPP API
   311	// ============================================================
   312	async function sendWhatsAppMessage(to, message) {
   313	  if (!API_KEY) { console.log('No API key configured'); return; }
   314	  try {
   315	    const res = await fetch(`${WHATSAPP_API}/messages`, {
   316	      method: 'POST',
   317	      headers: { 'Content-Type': 'application/json', 'D360-API-Key': API_KEY },
   318	      body: JSON.stringify({ messaging_product: 'whatsapp', recipient_type: 'individual', to, type: 'text', text: { body: message } })
   319	    });
   320	    if (!res.ok) console.error('WhatsApp send failed:', res.status, await res.text());
   321	    else console.log('Message sent to', to);
   322	  } catch (err) {
   323	    console.error('Send error:', err.message);
   324	  }
   325	}
   326	
   327	function saveConversation(phone, name, studentMsg, leratoReply, intent, lang) {
   328	  let conv = DB.conversations.find(c => c.student_phone === phone);
   329	  if (!conv) {
   330	    conv = { id: nextId('conversations'), student_phone: phone, student_name: name, language: lang, status: 'active', intent, last_message: studentMsg.substring(0, 200), message_count: 1, created_at: new Date().toISOString(), updated_at: new Date().toISOString() };
   331	    DB.conversations.push(conv);
   332	  } else {
   333	    conv.last_message = studentMsg.substring(0, 200);
   334	    conv.intent = intent;
   335	    conv.message_count = (conv.message_count || 0) + 1;
   336	    conv.updated_at = new Date().toISOString();
   337	  }
   338	  DB.messages.push({ id: nextId('messages'), conversation_id: conv.id, sender: 'student', content: studentMsg, created_at: new Date().toISOString() });
   339	  DB.messages.push({ id: nextId('messages'), conversation_id: conv.id, sender: 'lerato', content: leratoReply, created_at: new Date().toISOString() });
   340	  saveDB();
   341	}
   342	
   343	// ============================================================
   344	// API ROUTES
   345	// ============================================================
   346	app.get('/api/ping', (req, res) => res.json(trpc({ ok: true, db: 'json-file' })));
   347	
   348	// ---- COURSES ----
   349	app.post('/api/trpc/courses.list', (req, res) => {
   350	  const input = parseInput(req);
   351	  let result = DB.courses.filter(c => c.status === 'published');
   352	  if (input.category) result = result.filter(c => c.category === input.category);
   353	  if (input.search) result = result.filter(c => c.title.toLowerCase().includes(input.search.toLowerCase()));
   354	  res.json(trpc(result.reverse()));
   355	});
   356	
   357	app.post('/api/trpc/courses.count', (req, res) => {
   358	  res.json(trpc(DB.courses.filter(c => c.status === 'published').length));
   359	});
   360	
   361	app.post('/api/trpc/courses.create', (req, res) => {
   362	  const input = parseInput(req);
   363	  const course = { id: nextId('courses'), title: input.title, category: input.category, price: input.price, duration: input.duration, description: input.description, format: input.format || 'Online', certification: input.certification || 'Certificate of Completion', status: 'published', created_at: new Date().toISOString() };
   364	  DB.courses.push(course);
   365	  saveDB();
   366	  res.json(trpc({ id: course.id }));
   367	});
   368	
   369	app.post('/api/trpc/courses.bulkImport', (req, res) => {
   370	  const input = parseInput(req);
   371	  let count = 0;
   372	  for (const c of (input.courses || [])) {
   373	    DB.courses.push({ id: nextId('courses'), title: c.title, category: c.category, price: c.price, duration: c.duration, description: c.description || '', format: 'Online', certification: 'Certificate of Completion', status: 'published', created_at: new Date().toISOString() });
   374	    count++;
   375	  }
   376	  saveDB();
   377	  res.json(trpc({ inserted: count }));
   378	});
   379	
   380	// ---- STUDENTS ----
   381	app.post('/api/trpc/students.list', (req, res) => {
   382	  const input = parseInput(req);
   383	  let result = [...DB.students];
   384	  if (input.status) result = result.filter(s => s.status === input.status);
   385	  res.json(trpc(result.reverse()));
   386	});
   387	
   388	app.post('/api/trpc/students.create', (req, res) => {
   389	  const input = parseInput(req);
   390	  const student = { id: nextId('students'), name: input.name, phone: input.phone, email: input.email || null, status: input.status || 'new', source: input.source || 'whatsapp', created_at: new Date().toISOString() };
   391	  DB.students.push(student);
   392	  saveDB();
   393	  res.json(trpc({ id: student.id }));
   394	});
   395	
   396	app.post('/api/trpc/students.bulkImport', (req, res) => {
   397	  const input = parseInput(req);
   398	  let count = 0;
   399	  for (const s of (input.leads || [])) {
   400	    DB.students.push({ id: nextId('students'), name: s.name, phone: s.phone, email: s.email || null, status: s.status || 'interested', source: 'bulk_import', created_at: new Date().toISOString() });
   401	    count++;
   402	  }
   403	  saveDB();
   404	  res.json(trpc({ inserted: count, total: input.leads?.length || 0 }));
   405	});
   406	
   407	// ---- CONVERSATIONS ----
   408	app.post('/api/trpc/conversations.list', (req, res) => {
   409	  res.json(trpc([...DB.conversations].sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at)).slice(0, 50)));
   410	});
   411	
   412	app.post('/api/trpc/conversations.update', (req, res) => {
   413	  const input = parseInput(req);
   414	  const conv = DB.conversations.find(c => c.id === input.id);
   415	  if (conv) { conv.status = input.status; saveDB(); }
   416	  res.json(trpc({ success: true }));
   417	});
   418	
   419	// ---- MESSAGES ----
   420	app.post('/api/trpc/messages.list', (req, res) => {
        421	  const input = parseInput(req);
   422	  res.json(trpc(DB.messages.filter(m => m.conversation_id === input.conversationId)));
   423	});
   424	
   425	// ---- ENROLLMENTS ----
   426	app.post('/api/trpc/enrollments.list', (req, res) => {
   427	  res.json(trpc([...DB.enrollments].reverse()));
   428	});
   429	
   430	app.post('/api/trpc/enrollments.create', (req, res) => {
   431	  const input = parseInput(req);
   432	  const enroll = { id: nextId('enrollments'), student_name: input.studentName, student_phone: input.studentPhone, course_name: input.courseName, amount: input.amount || '', status: input.status || 'pending', created_at: new Date().toISOString() };
   433	  DB.enrollments.push(enroll);
   434	  saveDB();
   435	  res.json(trpc({ id: enroll.id }));
   436	});
   437	
   438	// ---- BROCHURES ----
   439	app.post('/api/trpc/brochures.list', (req, res) => {
   440	  res.json(trpc([...DB.brochures].reverse().map(b => ({ id: b.id, name: b.name, filename: b.filename, mime_type: b.mime_type, size: b.size, category: b.category, is_default: b.is_default, created_at: b.created_at }))));
   441	});
   442	
   443	app.post('/api/trpc/brochures.count', (req, res) => {
   444	  res.json(trpc(DB.brochures.length));
   445	});
   446	
   447	app.post('/api/trpc/brochures.upload', (req, res) => {
   448	  const input = parseInput(req);
   449	  const isDefault = DB.brochures.length === 0 ? 1 : 0;
   450	  const brochure = { id: nextId('brochures'), name: input.name, filename: input.filename, mime_type: input.mimeType, size: input.size, data: input.data, category: input.category || 'General', is_default: isDefault, created_at: new Date().toISOString() };
   451	  DB.brochures.push(brochure);
   452	  saveDB();
   453	  res.json(trpc({ id: brochure.id, isDefault: isDefault === 1 }));
   454	});
   455	
   456	app.post('/api/trpc/brochures.setDefault', (req, res) => {
   457	  const input = parseInput(req);
   458	  DB.brochures.forEach(b => b.is_default = 0);
   459	  const b = DB.brochures.find(b => b.id === input.id);
   460	  if (b) b.is_default = 1;
   461	  saveDB();
   462	  res.json(trpc({ success: true }));
   463	});
   464	
   465	app.post('/api/trpc/brochures.delete', (req, res) => {
   466	  const input = parseInput(req);
   467	  DB.brochures = DB.brochures.filter(b => b.id !== input.id);
   468	  saveDB();
   469	  res.json(trpc({ success: true }));
   470	});
   471	
   472	// Serve brochure files
   473	app.get('/api/brochures/:id', (req, res) => {
   474	  const b = DB.brochures.find(b => b.id === parseInt(req.params.id));
   475	  if (!b) return res.status(404).send('Not found');
   476	  const binary = Buffer.from(b.data, 'base64');
   477	  res.set('Content-Type', b.mime_type);
   478	  res.set('Content-Disposition', `inline; filename="${b.filename}"`);
   479	  res.send(binary);
   480	});
   481	
   482	// ---- SETTINGS ----
   483	app.post('/api/trpc/company.getSettings', (req, res) => {
   484	  res.json(trpc(DB.settings));
   485	});
   486	
   487	app.post('/api/trpc/company.update', (req, res) => {
   488	  const input = parseInput(req);
   489	  for (const [key, value] of Object.entries(input)) {
   490	    if (value !== undefined) DB.settings[key] = value;
   491	  }
   492	  saveDB();
   493	  res.json(trpc({ success: true }));
   494	});
   495	
   496	app.post('/api/trpc/settings.getBrochure', (req, res) => {
   497	  res.json(trpc(DB.settings.brochureUrl || 'https://www.cornerstonehr.co.za'));
   498	});
   499	
   500	// ---- AGENTS ----
   501	app.post('/api/trpc/agents.list', (req, res) => {
   502	  res.json(trpc([
   503	    { agentId: 'intent_detector', name: 'Intent Detector', type: 'intent_detector', description: 'Understands what students need', isActive: true, response_count: '0' },
   504	    { agentId: 'context_analyzer', name: 'Context Analyzer', type: 'context_analyzer', description: 'Remembers conversation context', isActive: true, response_count: '0' },
   505	    { agentId: 'sales_responder', name: 'Sales Advisor', type: 'sales_responder', description: 'Course recommendations by Lerato', isActive: true, response_count: '0' },
   506	    { agentId: 'objection_handler', name: 'Objection Handler', type: 'objection_handler', description: 'Handles pricing and time concerns', isActive: true, response_count: '0' },
   507	    { agentId: 'follow_up', name: 'Follow-up Agent', type: 'follow_up', description: 'Schedules follow-up messages', isActive: true, response_count: '0' },
   508	    { agentId: 'language_adapter', name: 'Language Adapter', type: 'language_adapter', description: 'Speaks student language', isActive: true, response_count: '0' },
   509	    { agentId: 'post_enrollment', name: 'Student Success', type: 'post_enrollment_support', description: 'Supports enrolled students', isActive: true, response_count: '0' },
   510	    { agentId: 'prospector', name: 'Outbound Sales', type: 'prospector', description: 'Social media lead generation', isActive: true, response_count: '0' },
   511	  ]));
   512	});
   513	
   514	// ---- ANALYTICS ----
   515	app.post('/api/trpc/analytics.getStats', (req, res) => {
   516	  res.json(trpc({
   517	    totalConversations: DB.conversations.length,
   518	    activeConversations: DB.conversations.filter(c => c.status === 'active').length,
   519	    enrolledCount: DB.conversations.filter(c => c.status === 'enrolled').length,
   520	    avgResponseTime: '2.3s',
   521	    conversionRate: DB.conversations.length > 0 ? ((DB.conversations.filter(c => c.status === 'enrolled').length / DB.conversations.length) * 100).toFixed(1) + '%' : '0%',
   522	    agentUtilization: '85%',
   523	  }));
   524	});
   525	
   526	app.post('/api/trpc/analytics.getDailyConversations', (req, res) => {
   527	  res.json(trpc({ labels: ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'], data: [0,0,0,0,0,0,0] }));
   528	});
   529	
   530	app.post('/api/trpc/analytics.getSalesFunnel', (req, res) => {
   531	  res.json(trpc({ labels: ['Enquiry','Interested','Enrolled'], data: [100, 60, 25] }));
   532	});
   533	
   534	// ---- WHATSAPP WEBHOOK ----
   535	app.get('/api/webhook/whatsapp', (req, res) => {
   536	  const mode = req.query['hub.mode'];
   537	  const token = req.query['hub.verify_token'];
   538	  const challenge = req.query['hub.challenge'];
   539	  if (mode === 'subscribe' && token === WEBHOOK_VERIFY_TOKEN) {
   540	    console.log('Webhook verified!');
   541	    res.status(200).send(challenge);
   542	  } else {
   543	    res.sendStatus(403);
   544	  }
   545	});
   546	
   547	app.post('/api/webhook/whatsapp', async (req, res) => {
   548	  res.sendStatus(200);
   549	  try {
   550	    const messages = req.body?.entry?.[0]?.changes?.[0]?.value?.messages;
   551	    if (!messages || messages.length === 0) return;
   552	
   553	    const msg = messages[0];
   554	    const from = msg.from;
   555	    const text = msg.text?.body || '';
   556	    const name = msg.contacts?.[0]?.profile?.name || 'Student';
   557	
   558	    console.log(`[${new Date().toISOString()}] IN from ${from}: ${text}`);
   559	
   560	    const { response, intent, lang } = generateAIResponse(text, from);
   561	    saveConversation(from, name, text, response, intent, lang);
   562	    await sendWhatsAppMessage(from, response);
   563	
   564	    console.log(`[${new Date().toISOString()}] Lerato to ${from}: ${response.substring(0, 80)}...`);
   565	  } catch (err) {
   566	    console.error('Webhook error:', err.message);
   567	  }
   568	});
   569	
   570	// ============================================================
   571	// STATIC FILES
   572	// ============================================================
   573	const publicPath = path.join(__dirname, 'public');
   574	app.use(express.static(publicPath));
   575	app.get('*', (req, res) => res.sendFile(path.join(publicPath, 'index.html')));
   576	
   577	// ============================================================
   578	// START
   579	// ============================================================
   580	const PORT = process.env.PORT || 3000;
   581	app.listen(PORT, () => {
   582	  console.log('='.repeat(60));
   583	  console.log('  Cornerstone Supreme AI - Lerato is LIVE');
   584	  console.log('  Port:', PORT);
   585	  console.log('  Database: JSON file (' + DB_FILE + ')');
   586	  console.log('  Courses:', DB.courses.length);
   587	  console.log('  API: /api/ping, /api/trpc/*');
   588	  console.log('  WhatsApp: /api/webhook/whatsapp');
   589	  console.log('  Web: / (dashboard)');
   590	  console.log('='.repeat(60));
   591	});
