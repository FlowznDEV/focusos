import { createClient } from "@supabase/supabase-js";

// Helper to instantiate Supabase client with environment variables
export function getSupabaseClient() {
  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const supabaseKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    process.env.VITE_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.warn("[KIWIFY WEBHOOK WARNING] Variáveis de ambiente do Supabase não encontradas.");
    return null;
  }

  try {
    return createClient(supabaseUrl, supabaseKey);
  } catch (error: any) {
    console.error("[SUPABASE CLIENT ERROR] Falha ao inicializar o cliente Supabase:", error?.message || error);
    return null;
  }
}

export interface KiwifyWebhookBody {
  order_id?: string;
  id?: string;
  order_status?: string;
  status?: string;
  event?: string;
  webhook_event_type?: string;
  token?: string;
  signature?: string;
  secret?: string;
  Customer?: {
    email?: string;
    full_name?: string;
    first_name?: string;
  };
  customer?: {
    email?: string;
    name?: string;
  };
  email?: string;
  customer_email?: string;
  Comprador?: {
    email?: string;
    nome?: string;
  };
  [key: string]: any;
}

/**
 * Validates the Kiwify webhook security token against KIWIFY_WEBHOOK_SECRET environment variable.
 */
export function validateWebhookSecret(providedToken?: string): { isValid: boolean; error?: string } {
  const secretEnv = process.env.KIWIFY_WEBHOOK_SECRET || process.env.WEBHOOK_SECRET;

  if (!secretEnv) {
    // Secret not configured on server, allow processing with warning
    console.warn("[KIWIFY WEBHOOK NOTICE] KIWIFY_WEBHOOK_SECRET não configurado no ambiente. Ignorando checagem estrita de token.");
    return { isValid: true };
  }

  if (!providedToken) {
    console.error("[KIWIFY WEBHOOK ERROR] Token de segurança ausente na requisição do webhook.");
    return {
      isValid: false,
      error: "Token de segurança do webhook não fornecido."
    };
  }

  if (providedToken.trim() !== secretEnv.trim()) {
    console.error(`[KIWIFY WEBHOOK ERROR] Token de segurança inválido. Recebido: '${providedToken}' | Esperado: '${secretEnv}'`);
    return {
      isValid: false,
      error: "Token de segurança do webhook inválido."
    };
  }

  return { isValid: true };
}

/**
 * Processes incoming Kiwify Payment Webhook and updates Supabase user's premium status.
 */
export async function handleKiwifyPaymentWebhook(req: any, res: any) {
  try {
    const body: KiwifyWebhookBody = req.body || {};

    // 1. Extract security token from query, headers, or body
    const queryToken = req.query?.token || req.query?.signature || req.query?.secret;
    const headerToken =
      req.headers?.["x-kiwify-signature"] ||
      req.headers?.["x-kiwify-token"] ||
      req.headers?.["authorization"] ||
      req.headers?.["x-webhook-secret"];
    const bodyToken = body.token || body.signature || body.secret || body.webhook_token;

    const providedToken = queryToken || headerToken || bodyToken;

    // 2. Validate KIWIFY_WEBHOOK_SECRET
    const validation = validateWebhookSecret(providedToken);
    if (!validation.isValid) {
      return res.status(401).json({
        success: false,
        error: validation.error || "Token de segurança do webhook inválido."
      });
    }

    // 3. Extract buyer email
    const rawEmail =
      body.Customer?.email ||
      body.customer?.email ||
      body.email ||
      body.customer_email ||
      body.Comprador?.email;

    if (!rawEmail) {
      console.error("[KIWIFY WEBHOOK ERROR] E-mail do comprador não encontrado no payload do webhook:", body);
      return res.status(400).json({
        success: false,
        error: "E-mail do comprador não localizado no payload do webhook."
      });
    }

    const email = rawEmail.toLowerCase().trim();

    // 4. Check payment status
    const rawStatus = (
      body.order_status ||
      body.status ||
      body.event ||
      body.webhook_event_type ||
      "paid"
    ).toString().toLowerCase();

    const isApproved = ["paid", "approved", "aprovado", "order_approved", "completed", "active", "paid_out"].some(
      (s) => rawStatus.includes(s)
    );

    console.log(`[KIWIFY WEBHOOK PROCESSING] Email: ${email} | Status: '${rawStatus}' | Aprovado: ${isApproved}`);

    if (!isApproved) {
      console.log(`[KIWIFY WEBHOOK NOTICE] Pagamento com status '${rawStatus}' para ${email}. Status 'premium' não alterado.`);
      return res.status(200).json({
        success: true,
        message: `Webhook recebido com status: ${rawStatus}`,
        email: email,
        status: rawStatus,
        premiumUpdated: false
      });
    }

    // 5. Update premium = true in Supabase 'users' table
    const supabase = getSupabaseClient();
    let supabaseUpdated = false;

    if (supabase) {
      // Update 'users' table as requested: supabase.from('users').update({ premium: true }).eq('email', email)
      const { data, error } = await supabase
        .from("users")
        .update({ premium: true })
        .eq("email", email);

      if (error) {
        console.error(`[SUPABASE ERROR] Erro ao atualizar tabela 'users' para o e-mail ${email}:`, error.message);
      } else {
        console.log(`[SUPABASE SUCCESS] Tabela 'users' atualizada com premium: true para ${email}`);
        supabaseUpdated = true;
      }

      // Also attempt update in 'focus_quest_users' if used by the app
      const { error: fqError } = await supabase
        .from("focus_quest_users")
        .update({ premium: true, plan_type: "annual" })
        .eq("email", email);

      if (fqError) {
        console.warn(`[SUPABASE NOTICE] Erro ao atualizar 'focus_quest_users' para ${email}:`, fqError.message);
      }
    } else {
      console.warn(`[SUPABASE NOTICE] Cliente Supabase indisponível. Verifique as variáveis de ambiente.`);
    }

    return res.status(200).json({
      success: true,
      message: "Confirmação de pagamento da Kiwify processada com sucesso!",
      email: email,
      status: "aprovado",
      premium: true,
      supabaseUpdated
    });
  } catch (error: any) {
    console.error("[KIWIFY WEBHOOK EXCEPTION] Erro inesperado ao processar webhook de pagamento:", error?.message || error);
    return res.status(500).json({
      success: false,
      error: error?.message || "Erro interno ao processar confirmação de pagamento."
    });
  }
}
