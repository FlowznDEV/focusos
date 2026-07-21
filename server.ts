import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";
import { createServer as createViteServer } from "vite";
import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

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
      model: "gemini-3.5-flash",
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
        console.error("Failed to parse Gemini JSON output:", text);
      }
    }

    // Default fallback if JSON parse fails or response text is empty
    return res.json({
      motivationalMessage: "Ei, respire. Você não precisa fazer tudo de uma vez. Apenas um passo pequeno.",
      suggestedFocusGoal: "Escreva apenas a primeira palavra da sua tarefa.",
      supportiveTagline: "Foco não é perfeição, é progresso."
    });

  } catch (error: any) {
    console.error("Gemini API call failed:", error);
    return res.json({
      motivationalMessage: "Que tal fazermos apenas um pequeno movimento agora? Esqueça a pressão.",
      suggestedFocusGoal: "Apenas olhe para sua lista e escolha o item mais curto de ler.",
      supportiveTagline: "Estamos juntos nessa jornada de foco."
    });
  }
});

// Helper to hash password
function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password + "focus_quest_salt_123!").digest("hex");
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

// === SUPABASE AUTHENTICATION ENDPOINTS ===

// Sign Up Route
app.post("/api/auth/signup", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "E-mail e senha são obrigatórios." });
  }

  if (!supabase) {
    return res.status(503).json({ error: "O cliente Supabase não está configurado no servidor. Configure as credenciais no .env" });
  }

  const cleanEmail = email.toLowerCase().trim();

  try {
    // 1. Create the user in official Supabase Authentication (auth.users)
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: cleanEmail,
      password: password,
    });

    if (authError) {
      return res.status(400).json({ error: authError.message });
    }

    // 2. Also register in local custom table for backward compatibility/reporting
    const hashedPassword = hashPassword(password);
    const { error: insertError } = await supabase
      .from("focus_quest_users")
      .insert({
        email: cleanEmail,
        password: hashedPassword,
        created_at: new Date().toISOString()
      });

    if (insertError && !isTableMissingError(insertError)) {
      console.warn("Could not insert user profile fallback record:", insertError);
    }

    return res.json({ 
      success: true, 
      message: "Cadastro realizado com sucesso na plataforma oficial do seu Supabase! Agora você pode fazer o login." 
    });
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

  if (!supabase) {
    return res.status(503).json({ error: "O cliente Supabase não está configurado no servidor." });
  }

  const cleanEmail = email.toLowerCase().trim();

  try {
    // 1. Try to sign in via official Supabase Authentication
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: cleanEmail,
      password: password,
    });

    if (!authError && authData?.user) {
      const sessionToken = createSessionToken(cleanEmail);
      return res.json({
        success: true,
        user: {
          email: authData.user.email,
          token: sessionToken
        }
      });
    }

    // 2. Fallback to legacy custom table check (backward compatibility)
    const { data: legacyUser, error: queryError } = await supabase
      .from("focus_quest_users")
      .select("*")
      .eq("email", cleanEmail)
      .maybeSingle();

    if (queryError && !isTableMissingError(queryError)) {
      throw queryError;
    }

    if (legacyUser) {
      const hashedPassword = hashPassword(password);
      if (legacyUser.password === hashedPassword) {
        // Auto-migrate legacy user to official Supabase Auth in background
        try {
          await supabase.auth.signUp({
            email: cleanEmail,
            password: password,
          });
          console.log(`Successfully auto-migrated legacy user ${cleanEmail} to official auth`);
        } catch (migErr) {
          console.warn(`Background migration to official auth failed for ${cleanEmail}:`, migErr);
        }

        const sessionToken = createSessionToken(cleanEmail);
        return res.json({
          success: true,
          user: {
            email: legacyUser.email,
            token: sessionToken
          }
        });
      }
    }

    const errorMessage = authError ? authError.message : "E-mail ou senha incorretos.";
    return res.status(401).json({ error: errorMessage });
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

  if (!supabase) {
    return res.status(503).json({ error: "Supabase is not configured on the server" });
  }

  try {
    const { data, error } = await supabase
      .from("focus_quest_sync")
      .select("*")
      .eq("email", email)
      .maybeSingle();

    if (error) {
      // Check if table does not exist or schema cache is stale
      if (isTableMissingError(error)) {
        return res.status(404).json({
          error: "table_missing",
          message: "A tabela 'focus_quest_sync' não foi encontrada no Supabase.",
          sql: `CREATE TABLE focus_quest_sync (
  email TEXT PRIMARY KEY,
  tasks JSONB DEFAULT '[]'::jsonb,
  stats JSONB DEFAULT '{}'::jsonb,
  achievements JSONB DEFAULT '[]'::jsonb,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Ativar Row Level Security (RLS) para máxima segurança contra vulnerabilidades
ALTER TABLE focus_quest_sync ENABLE ROW LEVEL SECURITY;

-- Política RLS segura: impede leituras e escritas públicas anônimas, 
-- permitindo que cada usuário acesse apenas o seu próprio registro via Supabase Auth
CREATE POLICY "Permitir acesso apenas ao próprio usuário autenticado" ON focus_quest_sync 
  FOR ALL TO authenticated USING (auth.jwt() ->> 'email' = email) WITH CHECK (auth.jwt() ->> 'email' = email);`
        });
      }
      throw error;
    }

    if (!data) {
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
  } catch (error: any) {
    console.error("Failed to load user state from Supabase:", error);
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

  if (!supabase) {
    return res.status(503).json({ error: "Supabase is not configured on the server" });
  }

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

    if (error) {
      if (isTableMissingError(error)) {
        return res.status(404).json({
          error: "table_missing",
          message: "A tabela 'focus_quest_sync' não foi encontrada no Supabase.",
          sql: `CREATE TABLE focus_quest_sync (
  email TEXT PRIMARY KEY,
  tasks JSONB DEFAULT '[]'::jsonb,
  stats JSONB DEFAULT '{}'::jsonb,
  achievements JSONB DEFAULT '[]'::jsonb,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Ativar Row Level Security (RLS) para máxima segurança contra vulnerabilidades
ALTER TABLE focus_quest_sync ENABLE ROW LEVEL SECURITY;

-- Política RLS segura: impede leituras e escritas públicas anônimas, 
-- permitindo que cada usuário acesse apenas o seu próprio registro via Supabase Auth
CREATE POLICY "Permitir acesso apenas ao próprio usuário autenticado" ON focus_quest_sync 
  FOR ALL TO authenticated USING (auth.jwt() ->> 'email' = email) WITH CHECK (auth.jwt() ->> 'email' = email);`
        });
      }
      throw error;
    }

    return res.json({ success: true, data });
  } catch (error: any) {
    console.error("Failed to upsert user state to Supabase:", error);
    return res.status(500).json({ error: error.message || "Internal server error during save" });
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
