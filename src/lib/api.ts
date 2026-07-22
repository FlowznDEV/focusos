import { createClient } from "@supabase/supabase-js";

// Helper to initialize Supabase client dynamically if environment variables exist
export function getSupabaseClient() {
  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

  if (supabaseUrl && supabaseKey) {
    try {
      return createClient(supabaseUrl, supabaseKey);
    } catch (err) {
      console.warn("[SUPABASE] Aviso ao inicializar cliente Supabase:", err);
    }
  }
  return null;
}

export interface KiwifyWebhookPayload {
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
  Product?: {
    product_name?: string;
  };
  product_name?: string;
  produto?: string;
  [key: string]: any;
}

export interface WebhookValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * Validates the incoming webhook signature/token against the KIWIFY_WEBHOOK_SECRET environment variable.
 */
export function validateKiwifyToken(
  providedToken?: string,
  secretEnvKey: string = process.env.KIWIFY_WEBHOOK_SECRET || process.env.WEBHOOK_SECRET || ""
): WebhookValidationResult {
  // If no secret is configured in environment, allow processing while logging a notice
  if (!secretEnvKey) {
    return { isValid: true };
  }

  if (!providedToken) {
    return {
      isValid: false,
      error: "Token de segurança do webhook não fornecido."
    };
  }

  if (providedToken.trim() !== secretEnvKey.trim()) {
    return {
      isValid: false,
      error: "Token de segurança do webhook inválido."
    };
  }

  return { isValid: true };
}

/**
 * Updates user premium status directly in Supabase table `focus_quest_users`
 */
export async function updateSupabaseUserPremium(email: string, planType: string = "annual") {
  const cleanEmail = email.toLowerCase().trim();
  const supabase = getSupabaseClient();

  if (!supabase) {
    console.warn(`[SUPABASE] Cliente Supabase não configurado. Sincronização remota ignorada para ${cleanEmail}`);
    return { success: false, reason: "SUPABASE_NOT_CONFIGURED" };
  }

  try {
    const updateData = {
      premium: true,
      plan_type: planType,
      planType: planType,
      purchased_at: new Date().toISOString(),
      purchasedAt: new Date().toISOString()
    };

    // Check if user exists in focus_quest_users table
    const { data: existingUser, error: checkError } = await supabase
      .from("focus_quest_users")
      .select("email")
      .eq("email", cleanEmail)
      .maybeSingle();

    if (checkError) {
      console.warn(`[SUPABASE] Erro ao consultar usuário ${cleanEmail}:`, checkError.message);
    }

    if (existingUser) {
      const { error: updateError } = await supabase
        .from("focus_quest_users")
        .update(updateData)
        .eq("email", cleanEmail);

      if (updateError) {
        console.error(`[SUPABASE] Erro ao atualizar status premium de ${cleanEmail}:`, updateError.message);
        return { success: false, error: updateError.message };
      }
    } else {
      const { error: upsertError } = await supabase
        .from("focus_quest_users")
        .upsert({
          email: cleanEmail,
          created_at: new Date().toISOString(),
          ...updateData
        });

      if (upsertError) {
        console.error(`[SUPABASE] Erro ao inserir usuário premium ${cleanEmail}:`, upsertError.message);
        return { success: false, error: upsertError.message };
      }
    }

    console.log(`[SUPABASE] Status 'premium' atualizado com sucesso no Supabase para ${cleanEmail}`);
    return { success: true, email: cleanEmail, planType };
  } catch (err: any) {
    console.error(`[SUPABASE] Exceção ao atualizar Supabase para ${cleanEmail}:`, err.message);
    return { success: false, error: err.message };
  }
}

/**
 * Main logic function to process /api/webhook/payment payload
 */
export async function processPaymentWebhook(
  payload: KiwifyWebhookPayload,
  providedToken?: string
) {
  // 1. Validate Secret Token from environment variable KIWIFY_WEBHOOK_SECRET
  const validation = validateKiwifyToken(providedToken);
  if (!validation.isValid) {
    return {
      status: 401,
      body: {
        success: false,
        error: validation.error || "Token de segurança do webhook inválido."
      }
    };
  }

  // 2. Extract Customer Email
  const email = payload.Customer?.email || payload.customer?.email || payload.email || payload.customer_email || payload.Comprador?.email;
  if (!email) {
    return {
      status: 400,
      body: {
        success: false,
        error: "E-mail do comprador ausente no payload do webhook."
      }
    };
  }

  const cleanEmail = email.toLowerCase().trim();
  const rawStatus = (payload.order_status || payload.status || payload.event || payload.webhook_event_type || payload.order_status_id || "paid").toString().toLowerCase();
  const isApproved = ["paid", "approved", "aprovado", "order_approved", "completed", "active", "paid_out"].some(s => rawStatus.includes(s));
  const productName = payload.Product?.product_name || payload.product_name || payload.produto || "FocusOS Premium";
  const planType = productName.toLowerCase().includes("mensal") ? "monthly" : "annual";

  if (isApproved) {
    // 3. Update status 'premium' in Supabase
    const supabaseResult = await updateSupabaseUserPremium(cleanEmail, planType);

    return {
      status: 200,
      body: {
        success: true,
        message: "Webhook do Kiwify processado e status 'premium' ativado no Supabase!",
        email: cleanEmail,
        status: "aprovado",
        planType,
        supabaseResult
      }
    };
  }

  return {
    status: 200,
    body: {
      status: rawStatus,
      success: true,
      message: `Webhook recebido com status: ${rawStatus}`,
      email: cleanEmail
    }
  };
}
