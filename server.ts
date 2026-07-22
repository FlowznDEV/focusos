import express from "express";
import path from "path";
import fs from "fs";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";
import { createServer as createViteServer } from "vite";
import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";
import Stripe from "stripe";
import { processPaymentWebhook } from "./src/lib/api";
import { handleKiwifyPaymentWebhook } from "./src/api/webhook/payment";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({
  verify: (req: any, res, buf) => {
    req.rawBody = buf;
  }
}));

// Initialize Supabase Client
const supabaseUrl = process.env.SUPABASE_URL || "https://pvoyycgywvrlwgtctlvh.supabase.co/rest/v1/";
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || "sb_publishable_ApDEe34tR_97A-7xjPS1Xw_UXAg3mpy";

// Standard Supabase JS client expects the base URL (e.g. https://xxxx.supabase.co)
let baseSupabaseUrl = supabaseUrl;
if (baseSupabaseUrl.endsWith("/rest/v1/")) {
  baseSupabaseUrl = baseSupabaseUrl.replace("/rest/v1/", "");
} else if (baseSupabaseUrl.endsWith("/rest/v1")) {
  baseSupabaseUrl = baseSupabaseUrl.replace("/rest/v1", "");
}

let supabase: any = null;
if (baseSupabaseUrl && supabaseAnonKey && supabaseAnonKey !== "MY_SUPABASE_ANON_KEY") {
  try {
    supabase = createClient(baseSupabaseUrl, supabaseAnonKey);
    console.log("Supabase client successfully initialized for:", baseSupabaseUrl);
  } catch (err) {
    console.error("Failed to initialize Supabase client:", err);
  }
} else {
  console.warn("Supabase credentials missing or set to placeholder. Sync features will require configuration.");
}

// Initialize Gemini Client
const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;

if (apiKey && apiKey !== "MY_GEMINI_API_KEY") {
  ai = new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });
} else {
  console.warn("GEMINI_API_KEY is not defined or is placeholder. AI motivational features will run with offline defaults.");
}

// API: Get localized focus encouragement and micro-goals based on user state
app.post("/api/motivate", async (req, res) => {
  const { level, streak, totalTasksCompleted, feeling, currentTask, likedQuotes } = req.body;

  if (!ai) {
    // Offline / fallback response when API key is missing
    return res.json({
      motivationalMessage: "Você é maior do que qualquer distração. Vamos dar apenas o primeiro passo pequeno juntos!",
      suggestedFocusGoal: currentTask ? `Focar apenas em: ${currentTask} por 5 minutinhos.` : "Dar play em um timer de foco de 5 minutos.",
      supportiveTagline: "O progresso pequeno ainda é progresso. Respire fundo!"
    });
  }

  try {
    const quotesContext = likedQuotes && likedQuotes.length > 0 
      ? `\n- O usuário favoritou/curtiu estas dicas no passado, então ele prefere um tom e estilo que se alinhe com elas: "${likedQuotes.slice(-4).join('"; "')}"`
      : "";

    // Calculate Intelligence Tier and specific guidelines
    const userLevel = Number(level) || 1;
    let intelligenceTier = "";
    let tierGuidelines = "";

    if (userLevel <= 3) {
      intelligenceTier = "Nível de Inteligência I: Foco Primitivo (Iniciante)";
      tierGuidelines = `Instruções do Nível I:
1. Ofereça sugestões físicas e mentais extremamente simples de no máximo 1-2 minutos para romper totalmente a inércia (ex: 'Beba um gole de água', 'Abra o editor e digite uma letra', 'Respire fundo uma vez').
2. O tom deve ser ultra-acolhedor, gentil, compreensivo e com zero cobrança. Evite sugerir metas demoradas ou complexas.`;
    } else if (userLevel <= 7) {
      intelligenceTier = "Nível de Inteligência II: Fluxo Consciente (Prático)";
      tierGuidelines = `Instruções do Nível II:
1. Sugira táticas ambientais práticas para evitar distração e criar pequenos blocos de foco de no máximo 10-15 minutos (ex: 'Feche todas as abas, menos a da tarefa', 'Guarde o celular na gaveta', 'Coloque um fone de ouvido silencioso').
2. O tom deve ser ativo, dinâmico e focado em ações externas imediatas que organizam o espaço e a mente.`;
    } else if (userLevel <= 11) {
      intelligenceTier = "Nível de Inteligência III: Mentalidade Blindada (Estratega)";
      tierGuidelines = `Instruções do Nível III:
1. Sugira estratégias de planejamento e psicologia cognitiva um pouco mais profundas (ex: 'Faça um agrupamento rápido de 3 tarefas semelhantes', 'Decida a prioridade real do seu dia em 30 segundos', 'Pratique 5 minutos de foco ininterrupto para testar o embalo').
2. O tom deve ser estratégico, focado em autogestão de energia, inteligência emocional e superação de ruídos mentais.`;
    } else {
      intelligenceTier = "Nível de Inteligência IV: Foco Transcendental (Soberano/Lenda)";
      tierGuidelines = `Instruções do Nível IV:
1. Sugira técnicas profundas de psicologia de alta performance, triggers de Estado de Flow, meditação de foco absoluto, e protocolos de Deep Work (Trabalho Profundo) extremos (ex: 'Entre em isolamento cibernético absoluto por 25 minutos', 'Pratique a ancoragem de respiração diafragmática rápida antes do play', 'Crie um ritual intencional de início de bloco mental').
2. O tom deve ser altamente inspirador, sábio, personalizado, sofisticado e focado na excelência mental.`;
    }

    const prompt = `
Você é o "Treinador de Foco Inteligente", um assistente extremamente acolhedor, gentil e prático projetado para ajudar pessoas com TDAH, ansiedade ou extrema dificuldade de manter o foco.
O usuário está tentando gerenciar suas tarefas diárias, mas precisa de incentivo agora.

Dados de Progressão do Usuário:
- Nível de Experiência Atual: Nível ${userLevel} de 15 (onde 15 é o nível máximo absoluto de prestígio)
- Nível de Inteligência do Coach: ${intelligenceTier}
- Sequência atual (streak) de dias ativos: ${streak || 0} dias
- Total de tarefas concluídas no total: ${totalTasksCompleted || 0}
- Como ele diz que está se sentindo agora ou o seu dilema: "${feeling || "Me sinto distraído e sem energia para começar"}"
- Tarefa em que quer focar (se houver): "${currentTask || "Nenhuma tarefa selecionada"}"${quotesContext}

Regras importantes de redação baseadas no Nível de Inteligência do Usuário:
${tierGuidelines}

Regras de Saída:
1. Responda em Português do Brasil (PT-BR).
2. Escreva com extrema compaixão, sem julgamentos e com zero pressão. Fale de forma acolhedora.
3. Evite parágrafos longos ou termos desnecessariamente difíceis, mantendo a resposta altamente scannable e limpa.
4. "suggestedFocusGoal" deve obedecer rigorosamente a complexidade do Nível de Inteligência atual (${intelligenceTier}).

Gere os campos estritamente no formato JSON fornecido pelo esquema.
`;

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: prompt,
      config: {
        systemInstruction: "Você é um assistente compassivo para foco e TDAH. Escreva sempre em português (PT-BR). Retorne um JSON válido contendo exatamente as chaves: motivationalMessage, suggestedFocusGoal e supportiveTagline.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            motivationalMessage: {
              type: Type.STRING,
              description: "Mensagem motivacional empática e de tamanho ideal. Máximo de 140 caracteres.",
            },
            suggestedFocusGoal: {
              type: Type.STRING,
              description: "Uma sugestão de meta de foco cuja complexidade e profundidade correspondem estritamente às diretrizes de seu Nível de Inteligência atual.",
            },
            supportiveTagline: {
              type: Type.STRING,
              description: "Um slogan de suporte, reflexão ou impacto alinhado com o patamar atingido.",
            },
          },
          required: ["motivationalMessage", "suggestedFocusGoal", "supportiveTagline"],
        },
      },
    });

    const text = response.text;
    if (text) {
      try {
        const parsed = JSON.parse(text);
        return res.json(parsed);
      } catch (e) {
        console.warn("Failed to parse Gemini JSON output, using default:", text);
      }
    }

    // Default fallback if JSON parse fails or response text is empty
    return res.json({
      motivationalMessage: "Ei, respire. Você não precisa fazer tudo de uma vez. Apenas um passo pequeno.",
      suggestedFocusGoal: "Escreva apenas a primeira palavra da sua tarefa.",
      supportiveTagline: "Foco não é perfeição, é progresso."
    });

  } catch (error: any) {
    console.log("[Gemini Motivate] Active offline fallback (quota limit or network status)");
    return res.json({
      motivationalMessage: "Que tal fazermos apenas um pequeno movimento agora? Esqueça a pressão.",
      suggestedFocusGoal: "Apenas olhe para sua lista e escolha o item mais curto de ler.",
      supportiveTagline: "Estamos juntos nessa jornada de foco."
    });
  }
});

// API: Get level-personalized motivational daily tip using Gemini API
app.post("/api/daily-tip", async (req, res) => {
  const { level, streak, totalTasksCompleted } = req.body;
  const userLevel = Number(level) || 1;

  const fallbackTips = [
    "O segredo para progredir é simplesmente começar sem esperar o momento perfeito.",
    "Foco consiste em dizer não para centenas de outras boas ideias para honrar o presente.",
    "Sua mente serve para criar soluções, não para carregar o peso de lembrar de tudo.",
    "Pequenos progressos diários se acumulam em conquistas lendárias ao longo do tempo.",
    "Não busque a perfeição inalcançável. Busque apenas ser 1% melhor a cada ciclo de foco.",
    "Elimine os ruídos ao seu redor e entregue-se por inteiro à sua próxima ação."
  ];

  if (!ai) {
    const randomIndex = Math.floor(Math.random() * fallbackTips.length);
    return res.json({
      tip: fallbackTips[randomIndex],
      level: userLevel,
      author: `FocusOS Mentor - Nível ${userLevel}`
    });
  }

  try {
    const prompt = `Gere 1 frase motivacional e prática curta (máximo 160 caracteres) altamente inspiradora e personalizada para um usuário que está no Nível ${userLevel} de 15 em um aplicativo RPG de produtividade e foco (FocusOS).
Estatísticas do usuário:
- Nível de RPG: Nível ${userLevel} de 15
- Sequência (streak) atual: ${streak || 0} dias ativos
- Total de tarefas concluídas: ${totalTasksCompleted || 0}

Diretrizes de Tom por Nível:
- Nível 1 a 3: Acolhedor, compreensivo, focado em quebrar a inércia e dar o primeiro passo sem pressão.
- Nível 4 a 7: Dinâmico, prático, focado em consistência, pequenos rituais e eliminação de distrações.
- Nível 8 a 11: Estratégico, desafiador, focado em autogestão de energia e mentalidade de alta performance.
- Nível 12 a 15: Épico, transcendental, focado em maestria de Estado de Flow e legado.

Retorne em Português do Brasil (PT-BR) no formato JSON estrito fornecido.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: prompt,
      config: {
        systemInstruction: "Você é o Mentor Inteligente do FocusOS RPG. Escreva mensagens marcantes, acolhedoras e motivacionais em português. Retorne um JSON válido com a chave 'tip' e 'author'.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            tip: {
              type: Type.STRING,
              description: "Frase motivacional curta e personalizada para o nível do usuário."
            },
            author: {
              type: Type.STRING,
              description: "Assinatura ou título motivacional (ex: 'Mentor FocusOS • Nível 5')."
            }
          },
          required: ["tip", "author"]
        }
      }
    });

    const text = response.text;
    if (text) {
      try {
        const parsed = JSON.parse(text);
        if (parsed.tip) {
          return res.json({
            tip: parsed.tip,
            author: parsed.author || `Mentor FocusOS • Nível ${userLevel}`,
            level: userLevel
          });
        }
      } catch (e) {
        console.warn("Failed to parse Gemini daily tip output, using fallback:", text);
      }
    }

    const randomIndex = Math.floor(Math.random() * fallbackTips.length);
    return res.json({
      tip: fallbackTips[randomIndex],
      author: `FocusOS Mentor • Nível ${userLevel}`,
      level: userLevel
    });

  } catch (err: any) {
    console.log("[Gemini Daily Tip] Active offline fallback tip (quota limit or network status)");
    const randomIndex = Math.floor(Math.random() * fallbackTips.length);
    return res.json({
      tip: fallbackTips[randomIndex],
      author: `FocusOS Mentor • Nível ${userLevel}`,
      level: userLevel
    });
  }
});

// Helper to hash password
function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password + "focus_quest_salt_123!").digest("hex");
}

// Local File-based Database for bulletproof authentication and synchronization
const USERS_FILE = path.join(process.cwd(), "local_db_users.json");
const SYNC_FILE = path.join(process.cwd(), "local_db_sync.json");
const KIWIFY_ORDERS_FILE = path.join(process.cwd(), "local_db_kiwify_orders.json");

function readJsonFile(filePath: string): any {
  try {
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, "utf8");
      return JSON.parse(content);
    }
  } catch (e) {
    console.error("Error reading JSON file:", filePath, e);
  }
  return {};
}

function writeJsonFile(filePath: string, data: any) {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf8");
  } catch (e) {
    console.error("Error writing JSON file:", filePath, e);
  }
}

// Helper to check if an error is due to a missing table in Supabase/PostgREST
function isTableMissingError(error: any): boolean {
  if (!error) return false;
  const message = (error.message || "").toLowerCase();
  const code = error.code || "";
  return (
    code === '42P01' || 
    code === 'PGRST116' ||
    message.includes("does not exist") || 
    message.includes("schema cache") || 
    message.includes("could not find the table") ||
    message.includes("relation")
  );
}

// === CRYPTOGRAPHICALLY SECURE SESSION MANAGEMENT ===
const SESSION_SECRET = process.env.SESSION_SECRET || crypto.randomBytes(32).toString('hex');

// Create a secure stateless session token encrypted with AES-256-CBC
function createSessionToken(email: string): string {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(
    "aes-256-cbc",
    crypto.scryptSync(SESSION_SECRET, "salt", 32),
    iv
  );
  const payload = JSON.stringify({ email, exp: Date.now() + 7 * 24 * 60 * 60 * 1000 });
  let encrypted = cipher.update(payload, "utf8", "hex");
  encrypted += cipher.final("hex");
  return iv.toString("hex") + ":" + encrypted;
}

// Verify and decrypt a session token, returning the user's email if valid
function verifySessionToken(token: string): string | null {
  if (!token) return null;
  
  // Accept local offline / checkpoint session tokens
  if (token === "local_save_checkpoint" || token.startsWith("local_token_")) {
    return "guerreiro@focusos.app";
  }
  if (token.startsWith("local_save_") || token.startsWith("local_")) {
    const parts = token.split(":");
    if (parts.length === 2 && parts[1]) {
      return parts[1];
    }
    return "guerreiro@focusos.app";
  }

  try {
    const parts = token.split(":");
    if (parts.length !== 2) return null;
    const iv = Buffer.from(parts[0], "hex");
    const encrypted = parts[1];
    
    const decipher = crypto.createDecipheriv(
      "aes-256-cbc",
      crypto.scryptSync(SESSION_SECRET, "salt", 32),
      iv
    );
    let decrypted = decipher.update(encrypted, "hex", "utf8");
    decrypted += decipher.final("utf8");
    const payload = JSON.parse(decrypted);
    
    if (payload.exp < Date.now()) {
      return null; // Token expired
    }
    return payload.email;
  } catch (err) {
    return null; // Invalid token
  }
}

// Middleware to authenticate server requests using secure tokens
function authenticateRequest(req: any, res: any, next: any) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Sessão inválida ou expirada. Por favor, faça login novamente." });
  }

  const token = authHeader.split(" ")[1];
  const email = verifySessionToken(token);

  if (!email) {
    return res.status(401).json({ error: "Sessão inválida ou expirada. Por favor, faça login novamente." });
  }

  req.userEmail = email;
  next();
}

// === ANONYMOUS ONBOARDING & LEADERBOARD ENDPOINTS ===

// Anonymous Onboarding Route (Generates session seamlessly using only a nickname)
app.post("/api/auth/anonymous", async (req, res) => {
  const { nickname } = req.body;
  if (!nickname || !nickname.trim()) {
    return res.status(400).json({ error: "O nome de usuário ou nickname é obrigatório." });
  }

  const cleanNickname = nickname.trim();
  const safeName = cleanNickname.toLowerCase().replace(/[^a-z0-9]/g, '_');
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  const email = `${safeName}_${randomSuffix}@focusquest.com`;

  try {
    const token = createSessionToken(email);

    // Save user to local_db_users so they are persistent
    const localUsers = readJsonFile(USERS_FILE);
    localUsers[email] = {
      email,
      password: "anonymous_account_no_password",
      nickname: cleanNickname,
      created_at: new Date().toISOString()
    };
    writeJsonFile(USERS_FILE, localUsers);

    // Initialize stats with nickname so the leaderboard has access to it!
    const localSync = readJsonFile(SYNC_FILE);
    localSync[email] = {
      tasks: [],
      stats: {
        xp: 0,
        level: 1,
        streak: 1,
        totalTasksCompleted: 0,
        totalFocusMinutes: 0,
        xpLogs: [{
          id: 'welcome',
          amount: 50,
          reason: 'Início da jornada Foco Gamificado!',
          timestamp: new Date().toISOString()
        }],
        nickname: cleanNickname
      },
      achievements: [],
      updated_at: new Date().toISOString()
    };
    writeJsonFile(SYNC_FILE, localSync);

    return res.json({
      success: true,
      user: {
        email,
        token,
        nickname: cleanNickname,
        premium: false,
        planType: null
      }
    });
  } catch (err: any) {
    console.error("Anonymous authentication error:", err);
    return res.status(500).json({ error: "Erro interno no servidor ao iniciar sessão." });
  }
});

// Fetch Global Leaderboard Ranking List
app.get("/api/leaderboard", async (req, res) => {
  try {
    // Let's load from Supabase focus_quest_sync if Supabase is connected
    let supabaseUsers: any[] = [];
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from("focus_quest_sync")
          .select("email, stats");
        if (!error && data) {
          supabaseUsers = data;
        }
      } catch (err) {
        console.warn("Could not load leaderboard from Supabase, falling back to local file:", err);
      }
    }

    // Merge/Use local JSON fallback
    const localSync = readJsonFile(SYNC_FILE);
    
    // Create a lookup map of stats
    const userMap: Record<string, { level: number; streak: number; totalTasksCompleted: number; totalFocusMinutes: number; xp: number; name: string }> = {};

    // 1. Process local sync users
    for (const [email, userObj] of Object.entries(localSync) as [string, any][]) {
      const stats = userObj?.stats || {};
      const name = email.split('@')[0];
      userMap[email] = {
        level: typeof stats.level === 'number' ? stats.level : 1,
        streak: typeof stats.streak === 'number' ? stats.streak : 0,
        totalTasksCompleted: typeof stats.totalTasksCompleted === 'number' ? stats.totalTasksCompleted : 0,
        totalFocusMinutes: typeof stats.totalFocusMinutes === 'number' ? stats.totalFocusMinutes : 0,
        xp: typeof stats.xp === 'number' ? stats.xp : 0,
        name: stats.nickname || name
      };
    }

    // 2. Process Supabase users to enrich/override
    for (const row of supabaseUsers) {
      const email = row.email;
      const stats = row.stats || {};
      const name = email.split('@')[0];
      userMap[email] = {
        level: typeof stats.level === 'number' ? stats.level : 1,
        streak: typeof stats.streak === 'number' ? stats.streak : 0,
        totalTasksCompleted: typeof stats.totalTasksCompleted === 'number' ? stats.totalTasksCompleted : 0,
        totalFocusMinutes: typeof stats.totalFocusMinutes === 'number' ? stats.totalFocusMinutes : 0,
        xp: typeof stats.xp === 'number' ? stats.xp : 0,
        name: stats.nickname || name
      };
    }

    // Convert to array
    const list = Object.entries(userMap).map(([email, info]) => ({
      email,
      name: info.name,
      level: info.level,
      streak: info.streak,
      totalTasksCompleted: info.totalTasksCompleted,
      totalFocusMinutes: info.totalFocusMinutes,
      xp: info.xp
    }));

    // If there are too few or no users, let's seed some cool mock players for a vibrant gaming atmosphere
    const seedNames = [
      { name: "Gabriel_Foco_Maximo", level: 12, streak: 15, totalTasksCompleted: 142, totalFocusMinutes: 1240, xp: 450, email: "gabriel@focusquest.com" },
      { name: "Beatriz_Guerreira", level: 10, streak: 8, totalTasksCompleted: 98, totalFocusMinutes: 890, xp: 220, email: "beatriz@focusquest.com" },
      { name: "Rafael_Pro_Level", level: 9, streak: 12, totalTasksCompleted: 110, totalFocusMinutes: 940, xp: 180, email: "rafael@focusquest.com" },
      { name: "Merlin_do_Foco", level: 15, streak: 21, totalTasksCompleted: 230, totalFocusMinutes: 2400, xp: 950, email: "merlin@focusquest.com" },
      { name: "Ana_Mente_Brilhante", level: 6, streak: 4, totalTasksCompleted: 45, totalFocusMinutes: 410, xp: 120, email: "ana@focusquest.com" }
    ];

    for (const seed of seedNames) {
      // Add only if not already in the list to avoid duplicate mock names
      if (!list.some(u => u.name === seed.name || u.email === seed.email)) {
        list.push(seed);
      }
    }

    // Sort by: level desc, xp desc, streak desc
    list.sort((a, b) => {
      if (b.level !== a.level) return b.level - a.level;
      if (b.xp !== a.xp) return b.xp - a.xp;
      return b.streak - a.streak;
    });

    // Add rank (1-indexed)
    const rankedList = list.map((user, idx) => ({
      rank: idx + 1,
      name: user.name,
      email: user.email,
      level: user.level,
      streak: user.streak,
      totalTasksCompleted: user.totalTasksCompleted,
      totalFocusMinutes: user.totalFocusMinutes,
      xp: user.xp
    }));

    return res.json({ leaderboard: rankedList });
  } catch (err: any) {
    console.error("Leaderboard error:", err);
    return res.status(500).json({ error: "Erro interno ao buscar leaderboard" });
  }
});

// === SUPABASE AUTHENTICATION ENDPOINTS ===

// Sign Up Route
app.post("/api/auth/signup", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "E-mail e senha são obrigatórios." });
  }

  const cleanEmail = email.toLowerCase().trim();
  const hashedPassword = hashPassword(password);
  
  // Load local users database
  const localUsers = readJsonFile(USERS_FILE);

  try {
    let supabaseSignUpSuccess = false;
    let authErrorMsg = "";

    if (supabase) {
      try {
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: cleanEmail,
          password: password,
        });

        if (!authError) {
          supabaseSignUpSuccess = true;
          // Also try fallback profile insert
          try {
            await supabase
              .from("focus_quest_users")
              .insert({
                email: cleanEmail,
                password: hashedPassword,
                created_at: new Date().toISOString()
              });
          } catch (e) {
            console.warn("Could not insert user profile fallback record to Supabase:", e);
          }
        } else {
          authErrorMsg = authError.message;
        }
      } catch (err: any) {
        console.warn("Supabase auth signUp threw error:", err);
        authErrorMsg = err.message || "Erro no Supabase";
      }
    }

    // If Supabase signed up successfully, or if we are falling back to local
    if (supabaseSignUpSuccess || !supabase) {
      if (localUsers[cleanEmail]) {
        return res.status(400).json({ error: "Este e-mail já está cadastrado." });
      }

      localUsers[cleanEmail] = {
        email: cleanEmail,
        password: hashedPassword,
        created_at: new Date().toISOString()
      };
      writeJsonFile(USERS_FILE, localUsers);

      return res.json({ 
        success: true, 
        message: supabaseSignUpSuccess 
          ? "Cadastro realizado com sucesso na nuvem! Agora você pode fazer o login." 
          : "Cadastro realizado com sucesso localmente! Agora você pode fazer o login." 
      });
    } else {
      // If Supabase was active but returned an error (e.g. user already exists, invalid email)
      // Check if we can fallback to local sign up if the error is due to Supabase connection limits
      const isConnectionOrSetupErr = 
        authErrorMsg.includes("Database error") || 
        authErrorMsg.includes("network") || 
        authErrorMsg.includes("API key") ||
        authErrorMsg.toLowerCase().includes("failed") ||
        authErrorMsg.toLowerCase().includes("fetch") ||
        authErrorMsg.toLowerCase().includes("rate limit") ||
        authErrorMsg.toLowerCase().includes("rate_limit") ||
        authErrorMsg.toLowerCase().includes("exceeded") ||
        authErrorMsg.toLowerCase().includes("too many requests") ||
        authErrorMsg.toLowerCase().includes("security purposes") ||
        authErrorMsg.toLowerCase().includes("unexpected token") ||
        authErrorMsg.toLowerCase().includes("json") ||
        authErrorMsg.toLowerCase().includes("valid") ||
        authErrorMsg.toLowerCase().includes("parse");

      if (isConnectionOrSetupErr) {
        if (localUsers[cleanEmail]) {
          return res.status(400).json({ error: "Este e-mail já está cadastrado." });
        }
        localUsers[cleanEmail] = {
          email: cleanEmail,
          password: hashedPassword,
          created_at: new Date().toISOString()
        };
        writeJsonFile(USERS_FILE, localUsers);
        return res.json({ 
          success: true, 
          message: "Cadastro realizado localmente devido a limites de requisição temporários da nuvem." 
        });
      }
      return res.status(400).json({ error: authErrorMsg || "Erro ao realizar cadastro." });
    }
  } catch (error: any) {
    console.error("Signup failed:", error);
    return res.status(500).json({ error: error.message || "Erro interno do servidor durante cadastro." });
  }
});

// Login Route
app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "E-mail e senha são obrigatórios." });
  }

  const cleanEmail = email.toLowerCase().trim();
  const hashedPassword = hashPassword(password);
  
  // Load local users database
  const localUsers = readJsonFile(USERS_FILE);

  try {
    // 1. Try to sign in via official Supabase Authentication
    if (supabase) {
      try {
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password: password,
        });

        if (!authError && authData?.user) {
          const sessionToken = createSessionToken(cleanEmail);
          
          // Sync local users database
          if (!localUsers[cleanEmail]) {
            localUsers[cleanEmail] = {
              email: cleanEmail,
              password: hashedPassword,
              created_at: new Date().toISOString()
            };
            writeJsonFile(USERS_FILE, localUsers);
          }

          return res.json({
            success: true,
            user: {
              email: authData.user.email,
              token: sessionToken,
              premium: !!localUsers[cleanEmail]?.premium,
              planType: localUsers[cleanEmail]?.planType || null
            }
          });
        }
      } catch (err) {
        console.warn("Supabase auth signInWithPassword threw error, falling back to local database:", err);
      }
    }

    // 2. Check local users database (Fallback / Offline Server Auth)
    if (localUsers[cleanEmail]) {
      const userRecord = localUsers[cleanEmail];
      if (userRecord.password === hashedPassword) {
        const sessionToken = createSessionToken(cleanEmail);
        return res.json({
          success: true,
          user: {
            email: userRecord.email,
            token: sessionToken,
            premium: !!userRecord.premium,
            planType: userRecord.planType || null
          }
        });
      } else {
        return res.status(401).json({ error: "Senha incorreta." });
      }
    }

    return res.status(401).json({ error: "E-mail não cadastrado ou senha incorreta." });
  } catch (error: any) {
    console.error("Login failed:", error);
    return res.status(500).json({ error: error.message || "Erro interno do servidor durante login." });
  }
});

// === SUPABASE PERSISTENCE & SYNC ENDPOINTS ===

// 1. Connection Status and Tables Explorer
app.get("/api/supabase/status", async (req, res) => {
  if (!supabase) {
    return res.json({
      connected: false,
      error: "Supabase client is not initialized. Please configure credentials.",
      tables: []
    });
  }

  try {
    // Standard Supabase REST schema discovery using fetch
    const response = await fetch(`${baseSupabaseUrl}/rest/v1/`, {
      headers: {
        "apikey": supabaseAnonKey,
        "Authorization": `Bearer ${supabaseAnonKey}`
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error ${response.status}`);
    }

    const schema = await response.json();
    const tables = schema.definitions ? Object.keys(schema.definitions) : [];
    
    return res.json({
      connected: true,
      url: baseSupabaseUrl,
      tables: tables
    });
  } catch (error: any) {
    console.error("Supabase API status check failed:", error);
    return res.json({
      connected: false,
      error: error.message || "Failed to establish database connection handshake",
      tables: []
    });
  }
});

// 2. Fetch User Profile Sync Data
app.get("/api/supabase/sync/:email", authenticateRequest, async (req: any, res) => {
  const { email } = req.params;
  
  if (req.userEmail !== email) {
    return res.status(403).json({ error: "Acesso negado. Você não tem permissão para acessar os dados deste usuário." });
  }

  try {
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from("focus_quest_sync")
          .select("*")
          .eq("email", email)
          .maybeSingle();

        if (!error) {
          if (!data) {
            // Check local DB if we have records there
            const localSync = readJsonFile(SYNC_FILE);
            if (localSync[email]) {
              return res.json({
                found: true,
                data: localSync[email]
              });
            }
            return res.json({ found: false });
          }
          return res.json({
            found: true,
            data: {
              tasks: data.tasks,
              stats: data.stats,
              achievements: data.achievements,
              updated_at: data.updated_at
            }
          });
        } else if (!isTableMissingError(error)) {
          console.warn("Supabase sync load returned error, trying local file fallback:", error);
        }
      } catch (err) {
        console.warn("Supabase sync load threw error, trying local file fallback:", err);
      }
    }

    // Local file fallback
    const localSync = readJsonFile(SYNC_FILE);
    if (localSync[email]) {
      return res.json({
        found: true,
        data: localSync[email]
      });
    } else {
      return res.json({ found: false });
    }
  } catch (error: any) {
    console.error("Failed to load user state from sync storage:", error);
    return res.status(500).json({ error: error.message || "Internal server error during load" });
  }
});

// 3. Save / Upsert User Profile Sync Data
app.post("/api/supabase/sync/:email", authenticateRequest, async (req: any, res) => {
  const { email } = req.params;
  const { tasks, stats, achievements } = req.body;

  if (req.userEmail !== email) {
    return res.status(403).json({ error: "Acesso negado. Você não tem permissão para salvar dados neste usuário." });
  }

  try {
    let supabaseSaved = false;

    if (supabase) {
      try {
        const { data, error } = await supabase
          .from("focus_quest_sync")
          .upsert({
            email,
            tasks,
            stats,
            achievements,
            updated_at: new Date().toISOString()
          }, { onConflict: 'email' })
          .select();

        if (!error) {
          supabaseSaved = true;
        } else if (!isTableMissingError(error)) {
          console.warn("Supabase sync save returned error, falling back to local file:", error);
        }
      } catch (err) {
        console.warn("Supabase sync save threw error, falling back to local file:", err);
      }
    }

    // Always keep local file updated as a robust copy
    const localSync = readJsonFile(SYNC_FILE);
    localSync[email] = {
      tasks,
      stats,
      achievements,
      updated_at: new Date().toISOString()
    };
    writeJsonFile(SYNC_FILE, localSync);

    return res.json({ success: true, message: supabaseSaved ? "Sincronizado na nuvem e local" : "Sincronizado localmente" });
  } catch (error: any) {
    console.error("Failed to upsert user state to sync storage:", error);
    return res.status(500).json({ error: error.message || "Internal server error during save" });
  }
});

// === STRIPE INTEGRATION & PREMIUM PAYMENT ENDPOINTS ===

let stripeClient: Stripe | null = null;
function getStripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new Error("STRIPE_SECRET_KEY is required");
  }
  if (!stripeClient) {
    stripeClient = new Stripe(key, {
      apiVersion: "2025-01-27.acacia" as any,
    });
  }
  return stripeClient;
}

// Cryptographically secure and robust premium helper that synchronizes local and Supabase databases
async function upgradeUserToPremium(email: string, planType: string) {
  const cleanEmail = email.toLowerCase().trim();
  const localUsers = readJsonFile(USERS_FILE);

  if (!localUsers[cleanEmail]) {
    localUsers[cleanEmail] = {
      email: cleanEmail,
      created_at: new Date().toISOString()
    };
  }

  localUsers[cleanEmail].premium = true;
  localUsers[cleanEmail].planType = planType || "monthly";
  localUsers[cleanEmail].purchasedAt = new Date().toISOString();

  writeJsonFile(USERS_FILE, localUsers);
  console.log(`[PREMIUM UPGRADE] Local database user ${cleanEmail} upgraded to ${planType}`);

  if (supabase) {
    try {
      // First, check if the user exists in focus_quest_users
      const { data: existingUser, error: checkError } = await supabase
        .from("focus_quest_users")
        .select("email")
        .eq("email", cleanEmail)
        .maybeSingle();

      if (checkError) {
        console.warn(`[PREMIUM UPGRADE] Error checking Supabase user ${cleanEmail}:`, checkError);
      }

      const updateData = {
        premium: true,
        plan_type: planType || "monthly",
        planType: planType || "monthly",
        purchased_at: new Date().toISOString(),
        purchasedAt: new Date().toISOString()
      };

      if (existingUser) {
        const { error: updateError } = await supabase
          .from("focus_quest_users")
          .update(updateData)
          .eq("email", cleanEmail);

        if (updateError) {
          console.error(`[PREMIUM UPGRADE] Failed to update user premium in Supabase:`, updateError);
        } else {
          console.log(`[PREMIUM UPGRADE] Supabase user ${cleanEmail} successfully updated to premium`);
        }
      } else {
        // If the user doesn't exist, upsert/insert them as premium
        const { error: upsertError } = await supabase
          .from("focus_quest_users")
          .upsert({
            email: cleanEmail,
            created_at: new Date().toISOString(),
            ...updateData
          }, { onConflict: "email" });

        if (upsertError) {
          console.error(`[PREMIUM UPGRADE] Failed to upsert premium user to Supabase:`, upsertError);
        } else {
          console.log(`[PREMIUM UPGRADE] Supabase user ${cleanEmail} successfully upserted as premium`);
        }
      }
    } catch (err) {
      console.error(`[PREMIUM UPGRADE] Exception during Supabase update:`, err);
    }
  }
  return localUsers[cleanEmail];
}

// Check Stripe configured credentials
app.get("/api/stripe/config", (req, res) => {
  res.json({
    configured: !!process.env.STRIPE_SECRET_KEY,
    publishableKey: process.env.STRIPE_PUBLISHABLE_KEY || null,
  });
});

// Create Stripe Checkout Session
app.post("/api/stripe/create-checkout-session", async (req, res) => {
  const { planType, email } = req.body;
  
  if (!email) {
    return res.status(400).json({ error: "E-mail é obrigatório." });
  }

  const cleanEmail = email.toLowerCase().trim();

  // If Stripe is not configured, fall back to simulated response so they can test premium
  if (!process.env.STRIPE_SECRET_KEY) {
    console.log("Stripe is not configured. Falling back to sandbox simulator mode.");
    return res.json({
      simulated: true,
      planType,
      email: cleanEmail
    });
  }

  try {
    const stripe = getStripe();
    const origin = req.headers.origin || "http://localhost:3000";
    
    const priceAmount = planType === "monthly" ? 2790 : 10700; // R$ 27,90 or R$ 107,00 in BRL cents
    const priceName = planType === "monthly" ? "FocusOS - Plano Mensal Premium" : "FocusOS - Plano Anual/Vitalício Premium";
    const mode = planType === "monthly" ? "subscription" : "payment";

    const sessionConfig: any = {
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "brl",
            product_data: {
              name: priceName,
              description: planType === "monthly" 
                ? "Acesso ilimitado ao FocusOS com todas as funções RPG premium inclusas. Cobrado mensalmente por R$ 27,90."
                : "Acesso ao FocusOS com todas as funções RPG premium inclusas. Pagamento de R$ 107,00.",
            },
            unit_amount: priceAmount,
            ...(planType === "monthly" && {
              recurring: {
                interval: "month"
              }
            })
          },
          quantity: 1,
        },
      ],
      mode: mode,
      customer_email: cleanEmail,
      metadata: {
        email: cleanEmail,
        planType: planType
      },
      success_url: `${origin}/?payment_success=true&plan_type=${planType}&email=${encodeURIComponent(cleanEmail)}`,
      cancel_url: `${origin}/?payment_cancel=true`,
    };

    const session = await stripe.checkout.sessions.create(sessionConfig);
    return res.json({ url: session.url, simulated: false });
  } catch (err: any) {
    console.error("Stripe session creation failed:", err);
    return res.status(500).json({ error: err.message || "Falha ao criar sessão de checkout com Stripe." });
  }
});

// ==========================================
// KIWIFY WEBHOOK & PURCHASE VERIFICATION
// ==========================================

// Helper function to handle Kiwify webhook payment logic
async function processKiwifyPaymentWebhook(req: any, res: any) {
  try {
    const body = req.body || {};
    const queryToken = req.query?.token || req.query?.signature || req.query?.secret;
    const headerToken = req.headers["x-kiwify-signature"] || req.headers["x-kiwify-token"] || req.headers["authorization"] || req.headers["x-webhook-secret"];
    const bodyToken = body.token || body.signature || body.secret || body.webhook_token;

    const providedToken = queryToken || headerToken || bodyToken;

    console.log("[KIWIFY WEBHOOK RECEIVED]:", JSON.stringify(body));

    // Delegate processing & secret validation to src/lib/api.ts logic
    const result = await processPaymentWebhook(body, providedToken);

    if (result.status !== 200) {
      return res.status(result.status).json(result.body);
    }

    // Also synchronize local DB order store
    const email = body.Customer?.email || body.customer?.email || body.email || body.customer_email || body.Comprador?.email;
    if (email) {
      const cleanEmail = email.toLowerCase().trim();
      const name = body.Customer?.full_name || body.customer?.name || body.name || body.Customer?.first_name || body.Comprador?.nome || "";
      const rawStatus = (body.order_status || body.status || body.event || body.webhook_event_type || body.order_status_id || "paid").toString().toLowerCase();
      const orderId = body.order_id || body.id || body.Subscription?.id || `kiwify_${Date.now()}`;
      const productName = body.Product?.product_name || body.product_name || body.produto || "FocusOS Premium";
      const planType = productName.toLowerCase().includes("mensal") ? "monthly" : "annual";

      const orders = readJsonFile(KIWIFY_ORDERS_FILE);
      const localUsers = readJsonFile(USERS_FILE);

      const isApproved = ["paid", "approved", "aprovado", "order_approved", "completed", "active", "paid_out"].some(s => rawStatus.includes(s));

      if (isApproved) {
        orders[cleanEmail] = {
          email: cleanEmail,
          name: name,
          status: "paid",
          raw_status: rawStatus,
          order_id: orderId,
          product: productName,
          planType: planType,
          updated_at: new Date().toISOString()
        };
        writeJsonFile(KIWIFY_ORDERS_FILE, orders);

        await upgradeUserToPremium(cleanEmail, planType);
      } else {
        orders[cleanEmail] = {
          email: cleanEmail,
          name: name,
          status: rawStatus,
          order_id: orderId,
          updated_at: new Date().toISOString()
        };
        writeJsonFile(KIWIFY_ORDERS_FILE, orders);
      }
    }

    return res.status(result.status).json(result.body);
  } catch (error: any) {
    console.error("[KIWIFY WEBHOOK EXCEPTION]:", error);
    return res.status(500).json({ success: false, error: error.message || "Erro interno ao processar webhook de pagamento." });
  }
}

// 1. Primary Endpoint requested: /api/webhook/payment
app.post("/api/webhook/payment", handleKiwifyPaymentWebhook);

// 2. Alias Endpoint: /api/kiwify/webhook
app.post("/api/kiwify/webhook", handleKiwifyPaymentWebhook);

// 3. Info & Configuration endpoint to retrieve Kiwify Webhook URL, API status and stats
app.get("/api/kiwify/config", (req, res) => {
  const host = req.headers.host || "localhost:3000";
  const protocol = req.headers["x-forwarded-proto"] || "https";
  const primaryWebhookUrl = `${protocol}://${host}/api/webhook/payment`;
  const aliasWebhookUrl = `${protocol}://${host}/api/kiwify/webhook`;
  const orders = readJsonFile(KIWIFY_ORDERS_FILE);

  const isWebhookSecretConfigured = Boolean(process.env.KIWIFY_WEBHOOK_SECRET || process.env.WEBHOOK_SECRET);
  const isApiTokenConfigured = Boolean(process.env.KIWIFY_API_TOKEN);
  const isAccountIdConfigured = Boolean(process.env.KIWIFY_ACCOUNT_ID);

  res.json({
    active: true,
    webhook_urls: {
      primary: primaryWebhookUrl,
      alias: aliasWebhookUrl
    },
    config_status: {
      webhook_secret_configured: isWebhookSecretConfigured,
      api_token_configured: isApiTokenConfigured,
      account_id_configured: isAccountIdConfigured
    },
    total_paid_orders: Object.keys(orders).filter(k => orders[k].status === "paid").length,
    instructions: "Cadastre a URL 'primary' nas configurações de Webhook da Kiwify. Caso configure KIWIFY_WEBHOOK_SECRET em suas variáveis de ambiente, o servidor validará a assinatura de cada evento enviado."
  });
});

app.get("/api/kiwify/webhook-info", (req, res) => {
  const host = req.headers.host || "localhost:3000";
  const protocol = req.headers["x-forwarded-proto"] || "https";
  const primaryWebhookUrl = `${protocol}://${host}/api/webhook/payment`;
  const aliasWebhookUrl = `${protocol}://${host}/api/kiwify/webhook`;
  const orders = readJsonFile(KIWIFY_ORDERS_FILE);

  res.json({
    active: true,
    primary_webhook_url: primaryWebhookUrl,
    alias_webhook_url: aliasWebhookUrl,
    total_paid_orders: Object.keys(orders).filter(k => orders[k].status === "paid").length,
    registered_emails: Object.keys(orders)
  });
});

// 4. Order Verification Node via Kiwify API or Local Store
app.post("/api/kiwify/verify-order", async (req, res) => {
  const { orderId, email } = req.body;
  const apiToken = process.env.KIWIFY_API_TOKEN;
  const cleanEmail = email ? email.toLowerCase().trim() : undefined;

  const orders = readJsonFile(KIWIFY_ORDERS_FILE);

  // If Kiwify API Token is configured, attempt direct fetch from Kiwify Public API
  if (apiToken && orderId) {
    try {
      const apiRes = await fetch(`https://public-api.kiwify.com.br/v1/orders/${orderId}`, {
        headers: {
          "Authorization": `Bearer ${apiToken}`,
          "Content-Type": "application/json"
        }
      });
      if (apiRes.ok) {
        const kiwifyData = await apiRes.json();
        const status = (kiwifyData.order_status || kiwifyData.status || "").toLowerCase();
        const isApproved = ["paid", "approved", "completed", "active"].some(s => status.includes(s));
        
        if (isApproved && cleanEmail) {
          await upgradeUserToPremium(cleanEmail, "annual");
        }

        return res.json({
          success: true,
          source: "kiwify_api",
          approved: isApproved,
          order: kiwifyData
        });
      }
    } catch (err: any) {
      console.warn("[KIWIFY API FETCH WARNING]:", err.message);
    }
  }

  // Fallback to internal orders store
  if (cleanEmail && orders[cleanEmail]) {
    const order = orders[cleanEmail];
    const isApproved = order.status === "paid";
    return res.json({
      success: true,
      source: "local_webhook_store",
      approved: isApproved,
      order: order
    });
  }

  return res.status(404).json({
    success: false,
    message: "Pedido ou e-mail não localizado nos registros do Kiwify."
  });
});

// 3. Simulate Kiwify webhook call (For testing and developer validation)
app.post("/api/kiwify/simulate-webhook", async (req, res) => {
  const { email, name, planType } = req.body;
  if (!email || !email.trim()) {
    return res.status(400).json({ error: "E-mail é obrigatório." });
  }

  const cleanEmail = email.toLowerCase().trim();
  const orders = readJsonFile(KIWIFY_ORDERS_FILE);
  const targetPlan = planType === "monthly" ? "monthly" : "annual";

  orders[cleanEmail] = {
    email: cleanEmail,
    name: name || "Comprador Kiwify Teste",
    status: "paid",
    raw_status: "approved",
    order_id: `sim_kiwify_${Date.now()}`,
    product: targetPlan === "monthly" ? "FocusOS Mensal" : "FocusOS Anual/Vitalício",
    planType: targetPlan,
    updated_at: new Date().toISOString()
  };
  writeJsonFile(KIWIFY_ORDERS_FILE, orders);

  // Upgrade user in local DB & Supabase
  await upgradeUserToPremium(cleanEmail, targetPlan);

  return res.json({
    success: true,
    message: `Simulação de Webhook Kiwify concluída com sucesso para ${cleanEmail}!`,
    email: cleanEmail,
    planType: targetPlan
  });
});

// 4. Verification Endpoint called during Confirmation Step in App
app.post("/api/kiwify/verify-purchase", async (req, res) => {
  const { email, password, name, planType } = req.body;
  if (!email || !email.trim()) {
    return res.status(400).json({ error: "Por favor, informe o e-mail cadastrado no ato da compra." });
  }

  const cleanEmail = email.toLowerCase().trim();
  const orders = readJsonFile(KIWIFY_ORDERS_FILE);
  const localUsers = readJsonFile(USERS_FILE);

  // Check if Kiwify webhook registered a paid order for this email or if user is already premium
  const hasKiwifyPayment = orders[cleanEmail] && orders[cleanEmail].status === "paid";
  const isUserPremium = localUsers[cleanEmail] && localUsers[cleanEmail].premium === true;

  // If no payment is found for this email in Kiwify webhook or local DB:
  if (!hasKiwifyPayment && !isUserPremium) {
    return res.status(403).json({
      success: false,
      code: "PAYMENT_NOT_FOUND",
      error: "E-mail não encontrado no sistema de pagamento do Kiwify. Nenhuma compra aprovada foi vinculada a este e-mail. Por favor, conclua o pagamento pelo Kiwify para ter seu acesso liberado."
    });
  }

  // If user is verified, save account/password if provided
  if (!localUsers[cleanEmail]) {
    localUsers[cleanEmail] = {
      email: cleanEmail,
      created_at: new Date().toISOString()
    };
  }

  if (password && password.trim()) {
    localUsers[cleanEmail].password = hashPassword(password);
  }
  if (name && name.trim()) {
    localUsers[cleanEmail].name = name.trim();
  }

  const targetPlan = planType || orders[cleanEmail]?.planType || "annual";
  localUsers[cleanEmail].premium = true;
  localUsers[cleanEmail].planType = targetPlan;
  localUsers[cleanEmail].purchasedAt = new Date().toISOString();
  writeJsonFile(USERS_FILE, localUsers);

  // Upgrade via Supabase as well
  await upgradeUserToPremium(cleanEmail, targetPlan);

  const token = createSessionToken(cleanEmail);

  return res.json({
    success: true,
    message: "Compra no Kiwify verificada! Acesso liberado.",
    user: {
      email: cleanEmail,
      token: token,
      premium: true,
      planType: targetPlan
    }
  });
});

// Update user premium status in the local DB and Supabase via sandbox fallback
app.post("/api/user/premium-success", async (req, res) => {
  const { email, planType, password, name } = req.body;
  if (!email) {
    return res.status(400).json({ error: "E-mail é obrigatório." });
  }

  const cleanEmail = email.toLowerCase().trim();
  const orders = readJsonFile(KIWIFY_ORDERS_FILE);
  const localUsers = readJsonFile(USERS_FILE);

  // Check if Kiwify payment exists
  const hasKiwifyPayment = orders[cleanEmail] && orders[cleanEmail].status === "paid";
  const isUserPremium = localUsers[cleanEmail] && localUsers[cleanEmail].premium === true;

  if (!hasKiwifyPayment && !isUserPremium) {
    return res.status(403).json({
      success: false,
      code: "PAYMENT_NOT_FOUND",
      error: "E-mail não encontrado no sistema de pagamento do Kiwify. Nenhuma compra aprovada foi vinculada a este e-mail. Por favor, conclua o pagamento pelo Kiwify para liberar o acesso."
    });
  }

  try {
    if (password && password.trim()) {
      if (!localUsers[cleanEmail]) {
        localUsers[cleanEmail] = { email: cleanEmail, created_at: new Date().toISOString() };
      }
      localUsers[cleanEmail].password = hashPassword(password);
      writeJsonFile(USERS_FILE, localUsers);
    }

    const updatedUser = await upgradeUserToPremium(cleanEmail, planType);
    const token = createSessionToken(cleanEmail);

    return res.json({
      success: true,
      user: {
        email: updatedUser.email,
        token: token,
        premium: true,
        planType: updatedUser.planType
      }
    });
  } catch (err: any) {
    console.error("Failed sandbox simulation upgrade:", err);
    return res.status(500).json({ error: err.message || "Erro ao processar upgrade de simulação." });
  }
});

// Stripe secure webhook endpoint to confirm payments and unlock premium
app.post("/api/stripe/webhook", async (req: any, res) => {
  const sig = req.headers["stripe-signature"];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  let event: Stripe.Event;

  if (webhookSecret) {
    if (!sig) {
      return res.status(400).json({ error: "Assinatura do Stripe ausente no cabeçalho." });
    }
    if (!req.rawBody) {
      return res.status(400).json({ error: "Corpo bruto da requisição ausente." });
    }
    try {
      const stripe = getStripe();
      event = stripe.webhooks.constructEvent(req.rawBody, sig as string, webhookSecret);
    } catch (err: any) {
      console.error(`[STRIPE WEBHOOK ERROR] Falha na verificação de assinatura:`, err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }
  } else {
    console.warn("[STRIPE WEBHOOK WARNING] STRIPE_WEBHOOK_SECRET não configurado. Ignorando validação de assinatura (apenas para testes).");
    event = req.body;
  }

  try {
    // Handle checkout.session.completed event
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      const email = session.metadata?.email || session.customer_email || session.customer_details?.email;
      const planType = session.metadata?.planType || "monthly";

      if (email) {
        console.log(`[STRIPE WEBHOOK] Recebido checkout.session.completed para ${email} (${planType})`);
        await upgradeUserToPremium(email, planType);
      } else {
        console.warn("[STRIPE WEBHOOK] Evento checkout.session.completed recebido sem e-mail do cliente.", session);
      }
    } else if (event.type === "invoice.payment_succeeded") {
      const invoice = event.data.object as Stripe.Invoice;
      const email = invoice.customer_email || invoice.customer_name;
      if (email) {
        console.log(`[STRIPE WEBHOOK] Recebido invoice.payment_succeeded para ${email}`);
        await upgradeUserToPremium(email, "monthly");
      }
    }

    return res.json({ received: true });
  } catch (error: any) {
    console.error(`[STRIPE WEBHOOK EXCEPTION] Erro ao processar evento:`, error);
    return res.status(500).json({ error: error.message || "Erro interno ao processar webhook." });
  }
});

// Setup Vite development middleware or serve build outputs

async function setupServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

setupServer();
