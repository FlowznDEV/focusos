import React, { useState } from 'react';
import { 
  Sparkles, X, Check, Brain, BarChart3, Volume2, 
  Cloud, ExternalLink, ShieldCheck, Mail, ArrowLeft, Lock, Loader2, User, Eye, EyeOff, AlertTriangle
} from 'lucide-react';
import { playTypeSound } from '../lib/sound';

interface PremiumModalProps {
  isOpen: boolean;
  onClose: () => void;
  email: string;
  stats: {
    totalTasksCompleted: number;
    level: number;
    streak: number;
  };
  usedFunctionsCount: number;
  totalFunctionsCount: number;
  daysOfUse: number;
  completedTasksCount?: number;
  onPaymentSuccess: (planType: string, buyerEmail?: string, token?: string) => void;
  onSimulateTasks?: () => void;
  onSimulateFunctions?: () => void;
  onSimulateDays?: () => void;
  canClose?: boolean;
}

export default function PremiumModal({
  isOpen,
  onClose,
  email,
  stats,
  daysOfUse = 0,
  completedTasksCount = 0,
  onPaymentSuccess,
  canClose = true
}: PremiumModalProps) {
  const [step, setStep] = useState<'plans' | 'email_confirmation'>('plans');
  const [buyerName, setBuyerName] = useState('');
  const [buyerEmail, setBuyerEmail] = useState('');
  const [buyerPassword, setBuyerPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [simulatingWebhook, setSimulatingWebhook] = useState(false);
  const [simulationSuccess, setSimulationSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'lifetime'>('monthly');

  const tasksDone = stats?.totalTasksCompleted ?? completedTasksCount;
  const isTrialExpired = daysOfUse >= 1 || tasksDone >= 5;

  if (!isOpen) return null;

  const handleOpenKiwifyLink = () => {
    playTypeSound();
    const checkoutUrl = selectedPlan === 'monthly'
      ? 'https://pay.kiwify.com.br/aao4SNu'
      : 'https://pay.kiwify.com.br/1X7beze';

    try {
      window.open(checkoutUrl, '_blank', 'noopener,noreferrer');
    } catch (err) {
      console.error("Failed to open Kiwify link", err);
    }
  };

  const handleGoToEmailStep = () => {
    playTypeSound();
    setError(null);
    setSimulationSuccess(null);
    setStep('email_confirmation');
  };

  const handleSimulateKiwifyWebhook = async () => {
    playTypeSound();
    setError(null);
    setSimulationSuccess(null);

    const cleanEmail = buyerEmail.trim() || email || 'comprador@kiwify.com';
    setSimulatingWebhook(true);

    try {
      const res = await fetch('/api/kiwify/simulate-webhook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: cleanEmail,
          name: buyerName.trim() || 'Comprador Kiwify Teste',
          planType: selectedPlan
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSimulationSuccess(`Webhook do Kiwify simulado com sucesso para ${cleanEmail}! O e-mail foi registrado como PAGO.`);
      } else {
        throw new Error(data.error || 'Erro ao simular webhook do Kiwify.');
      }
    } catch (err: any) {
      setError(err.message || 'Erro ao comunicar com o webhook.');
    } finally {
      setSimulatingWebhook(false);
    }
  };

  const handleConfirmAccess = async () => {
    playTypeSound();
    setError(null);
    setSimulationSuccess(null);

    const cleanEmail = buyerEmail.trim();
    if (!cleanEmail || !cleanEmail.includes('@') || cleanEmail.length < 5) {
      setError('Por favor, informe o e-mail cadastrado no ato da compra para validar sua assinatura.');
      return;
    }

    if (!buyerPassword || buyerPassword.trim().length < 4) {
      setError('Por favor, defina uma senha para sua conta (mínimo 4 caracteres).');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/kiwify/verify-purchase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: cleanEmail,
          password: buyerPassword.trim(),
          name: buyerName.trim(),
          planType: selectedPlan
        })
      });

      let data: any = null;
      try {
        data = await response.json();
      } catch (parseErr) {
        console.error("Failed to parse verification response:", parseErr);
      }

      if (response.ok && data?.success) {
        onPaymentSuccess(selectedPlan, cleanEmail, data.user?.token);
      } else {
        const errorMsg = data?.error || 'Nenhum pagamento aprovado foi encontrado no Kiwify para este e-mail. Por favor, conclua o pagamento para liberar seu acesso.';
        setError(errorMsg);
      }
    } catch (err: any) {
      setError(err.message || 'Erro ao verificar pagamento no Kiwify.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-zinc-950/95 backdrop-blur-md z-50 flex items-start justify-center p-3 sm:p-4 overflow-y-auto pt-4 sm:pt-8">
      <div className="bg-zinc-950 border border-orange-500/40 rounded-3xl max-w-lg w-full shadow-[0_0_60px_rgba(249,115,22,0.2)] relative flex flex-col mx-auto my-0 overflow-hidden animate-pop-in max-h-[92vh]">
        
        {/* ORANGE TOP GLOW BAR */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-orange-600 via-orange-400 to-orange-600" />

        {/* HEADER */}
        <div className="p-4 border-b border-zinc-900/90 flex justify-between items-center shrink-0">
          <div className="flex items-center space-x-2.5">
            {step === 'email_confirmation' && (
              <button
                type="button"
                onClick={() => { playTypeSound(); setError(null); setStep('plans'); }}
                className="bg-zinc-900 hover:bg-zinc-800 text-orange-400 p-1.5 rounded-xl border border-zinc-800 hover:border-orange-500/40 transition-colors cursor-pointer mr-1"
                title="Voltar"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
            )}

            <div className="bg-orange-500/10 border border-orange-500/30 p-2 rounded-xl text-orange-400">
              {step === 'plans' ? (
                <Sparkles className="w-5 h-5 animate-pulse text-orange-400" />
              ) : (
                <Lock className="w-5 h-5 text-orange-400" />
              )}
            </div>
            <div>
              <span className="text-[9px] font-mono font-bold text-orange-400 uppercase tracking-widest block">
                {step === 'plans' ? '// ASSINATURA PREMIUM' : '// CONFIRMAÇÃO DE COMPRA'}
              </span>
              <h4 className="text-sm font-black text-white uppercase tracking-tight">
                {step === 'plans' ? 'FocusOS Premium RPG' : 'Dados do Comprador'}
              </h4>
            </div>
          </div>
          {canClose && (
            <button
              onClick={onClose}
              className="text-zinc-500 hover:text-white p-1.5 rounded-lg transition-colors cursor-pointer"
              title="Fechar"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* BODY */}
        {step === 'plans' ? (
          <div className="p-4 space-y-3.5 text-xs text-zinc-400 overflow-y-auto">
            
            {/* FREE TRIAL EXPIRED BANNER NOTICE */}
            {isTrialExpired && (
              <div className="bg-gradient-to-r from-orange-950/80 via-amber-950/90 to-orange-950/80 border border-orange-500/50 p-3.5 rounded-2xl text-white flex items-center space-x-3 shadow-lg shadow-orange-500/10 animate-fade-in">
                <div className="bg-orange-500/20 border border-orange-500/30 p-2 rounded-xl text-orange-400 shrink-0">
                  <Sparkles className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <span className="text-[9.5px] font-mono font-black text-orange-400 uppercase tracking-widest block">
                    ⚠️ O SEU PERÍODO DE TESTE GRÁTIS ACABOU!
                  </span>
                  <p className="text-[11px] text-zinc-200 mt-0.5 leading-snug font-medium">
                    Seu período de teste grátis expirou (1 dia de uso ou 5 tarefas concluídas). Escolha um plano abaixo para liberar acesso ilimitado!
                  </p>
                </div>
              </div>
            )}

            {/* PLAN SELECTOR */}
            <div className="space-y-1.5">
              <h5 className="text-[10px] font-bold text-white uppercase tracking-wider font-mono">// PLANOS DISPONÍVEIS</h5>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {/* Plan A: Monthly */}
                <button
                  type="button"
                  onClick={() => { playTypeSound(); setSelectedPlan('monthly'); }}
                  className={`p-3 rounded-2xl border text-left flex flex-col justify-between cursor-pointer transition-all ${selectedPlan === 'monthly' ? 'bg-orange-950/30 border-orange-500/70 shadow-[0_0_15px_rgba(249,115,22,0.15)]' : 'bg-zinc-900/50 border-zinc-900 hover:border-zinc-800'}`}
                >
                  <div className="flex justify-between items-start w-full">
                    <div>
                      <span className="text-[8.5px] font-mono font-bold text-orange-400 uppercase tracking-wider block">Assinatura Mensal</span>
                      <h6 className="font-black text-white text-xs mt-0.5">Plano Mensal</h6>
                    </div>
                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${selectedPlan === 'monthly' ? 'border-orange-400 bg-orange-400' : 'border-zinc-750'}`}>
                      {selectedPlan === 'monthly' && <Check className="w-3 h-3 text-zinc-950 stroke-[3]" />}
                    </div>
                  </div>
                  <div className="mt-2.5">
                    <span className="text-lg font-black text-white font-mono">R$ 27,90</span>
                    <span className="text-zinc-500 text-[10px] ml-1">/ mês</span>
                  </div>
                </button>

                {/* Plan B: Anual */}
                <button
                  type="button"
                  onClick={() => { playTypeSound(); setSelectedPlan('lifetime'); }}
                  className={`p-3 rounded-2xl border text-left flex flex-col justify-between cursor-pointer transition-all relative overflow-hidden ${selectedPlan === 'lifetime' ? 'bg-orange-950/30 border-orange-500/70 shadow-[0_0_15px_rgba(249,115,22,0.15)]' : 'bg-zinc-900/50 border-zinc-900 hover:border-zinc-800'}`}
                >
                  <div className="absolute top-0 right-0 bg-gradient-to-l from-orange-600 to-orange-500 text-zinc-950 text-[7.5px] font-black px-2 py-0.5 uppercase rounded-bl-lg tracking-wider font-mono">
                    Recomendado ⭐
                  </div>
                  <div className="flex justify-between items-start w-full">
                    <div>
                      <span className="text-[8.5px] font-mono font-bold text-orange-400 uppercase tracking-wider block">Assinatura Anual</span>
                      <h6 className="font-black text-white text-xs mt-0.5">Plano Anual</h6>
                    </div>
                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${selectedPlan === 'lifetime' ? 'border-orange-400 bg-orange-400' : 'border-zinc-750'}`}>
                      {selectedPlan === 'lifetime' && <Check className="w-3 h-3 text-zinc-950 stroke-[3]" />}
                    </div>
                  </div>
                  <div className="mt-2.5">
                    <span className="text-lg font-black text-white font-mono">R$ 107,00</span>
                    <span className="text-zinc-500 text-[10px] ml-1">/ ano</span>
                  </div>
                </button>
              </div>
            </div>

            {/* VANTAGENS HIGHLIGHTS */}
            <div className="bg-zinc-900/40 border border-zinc-900 p-3 rounded-2xl space-y-2">
              <h5 className="text-[9px] font-bold text-orange-400 uppercase tracking-wider font-mono">// O QUE VOCÊ DESBLOQUEIA</h5>
              <div className="grid grid-cols-2 gap-2 text-[10.5px]">
                <div className="flex items-center gap-1.5 text-zinc-300">
                  <Brain className="w-3.5 h-3.5 text-orange-400 shrink-0" />
                  <span>Coach Treinador IA</span>
                </div>
                <div className="flex items-center gap-1.5 text-zinc-300">
                  <BarChart3 className="w-3.5 h-3.5 text-orange-400 shrink-0" />
                  <span>Métricas & Gráficos VIP</span>
                </div>
                <div className="flex items-center gap-1.5 text-zinc-300">
                  <Volume2 className="w-3.5 h-3.5 text-orange-400 shrink-0" />
                  <span>Sons & Rádios Lofi Épicas</span>
                </div>
                <div className="flex items-center gap-1.5 text-zinc-300">
                  <Cloud className="w-3.5 h-3.5 text-orange-400 shrink-0" />
                  <span>Backup Automático em Nuvem</span>
                </div>
              </div>
            </div>

            <div className="bg-orange-950/20 border border-orange-500/20 p-2.5 rounded-xl text-[10.5px] text-zinc-300 font-mono flex items-center space-x-2">
              <Lock className="w-4 h-4 text-orange-400 shrink-0" />
              <span>Ativação instantânea ao confirmar seus dados.</span>
            </div>

            {error && (
              <div className="bg-red-950/40 border border-red-900/60 p-2.5 rounded-xl text-red-300 font-semibold text-[10.5px]">
                ❌ {error}
              </div>
            )}

          </div>
        ) : (
          /* STEP 2: NAME, EMAIL & PASSWORD CONFIRMATION FORM */
          <div className="p-4 space-y-3.5 text-xs text-zinc-400 overflow-y-auto max-h-[calc(92vh-140px)]">
            
            <div className="bg-orange-950/30 border border-orange-500/30 p-3 rounded-2xl space-y-1.5">
              <div className="flex items-center space-x-2 text-orange-400">
                <ShieldCheck className="w-4 h-4 shrink-0" />
                <span className="font-mono font-bold text-[10px] uppercase tracking-wider">
                  VERIFICAÇÃO DE E-MAIL KIWIFY
                </span>
              </div>
              <p className="text-[11px] text-zinc-200 leading-relaxed">
                Informe o <strong>mesmo e-mail cadastrado no checkout do Kiwify</strong>. O webhook do Kiwify verificará se há um pagamento aprovado associado a este e-mail para liberar o seu acesso automaticamente.
              </p>
            </div>

            <div className="bg-zinc-900/80 border border-zinc-800 p-2.5 rounded-xl flex items-center justify-between font-mono">
              <span className="text-[10px] text-zinc-400 uppercase">PLANO SELECIONADO:</span>
              <span className="text-[11px] font-bold text-orange-400">
                {selectedPlan === 'monthly' ? 'Plano Mensal (R$ 27,90/mês)' : 'Plano Anual (R$ 107,00/ano)'}
              </span>
            </div>

            <div className="space-y-3">
              {/* NOME DO COMPRADOR */}
              <div className="space-y-1.5">
                <label htmlFor="buyer-name-field" className="block text-[10px] font-bold text-zinc-300 uppercase tracking-wider font-mono">
                  NOME DO COMPRADOR
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-orange-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    id="buyer-name-field"
                    type="text"
                    value={buyerName}
                    onChange={(e) => setBuyerName(e.target.value)}
                    placeholder="Seu nome completo"
                    className="w-full bg-zinc-900 border border-orange-500/50 rounded-xl py-2.5 pl-10 pr-3 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400 font-mono transition-all"
                    autoFocus
                  />
                </div>
              </div>

              {/* E-MAIL DO COMPRADOR */}
              <div className="space-y-1.5">
                <label htmlFor="buyer-email-field" className="block text-[10px] font-bold text-zinc-300 uppercase tracking-wider font-mono">
                  E-MAIL DO CHECKOUT KIWIFY <span className="text-orange-400">*</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-orange-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    id="buyer-email-field"
                    type="email"
                    value={buyerEmail}
                    onChange={(e) => setBuyerEmail(e.target.value)}
                    placeholder="seu@email.com (o mesmo do Kiwify)"
                    className="w-full bg-zinc-900 border border-orange-500/50 rounded-xl py-2.5 pl-10 pr-3 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400 font-mono transition-all"
                    required
                  />
                </div>
              </div>

              {/* SENHA PARA LOGIN */}
              <div className="space-y-1.5">
                <label htmlFor="buyer-password-field" className="block text-[10px] font-bold text-zinc-300 uppercase tracking-wider font-mono">
                  SENHA DE ACESSO AO APP <span className="text-orange-400">*</span>
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-orange-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    id="buyer-password-field"
                    type={showPassword ? "text" : "password"}
                    value={buyerPassword}
                    onChange={(e) => setBuyerPassword(e.target.value)}
                    placeholder="Crie uma senha de acesso"
                    className="w-full bg-zinc-900 border border-orange-500/50 rounded-xl py-2.5 pl-10 pr-10 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400 font-mono transition-all"
                    required
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleConfirmAccess();
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            {/* ERROR NOTIFICATION WITH DIRECT CHECKOUT CTA */}
            {error && (
              <div className="bg-red-950/70 border border-red-800 p-3 rounded-2xl space-y-2 text-red-200 animate-fadeIn">
                <div className="flex items-start space-x-2">
                  <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                  <p className="text-[11px] leading-relaxed font-semibold">
                    {error}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleOpenKiwifyLink}
                  className="w-full bg-orange-600 hover:bg-orange-500 text-white font-bold py-2 px-3 rounded-xl text-[11px] transition-all flex items-center justify-center space-x-1.5 cursor-pointer mt-1"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-white" />
                  <span>Realizar Pagamento Agora no Kiwify</span>
                </button>
              </div>
            )}

            {/* SIMULATION SUCCESS */}
            {simulationSuccess && (
              <div className="bg-emerald-950/60 border border-emerald-800 p-3 rounded-2xl text-emerald-300 font-mono text-[11px] flex items-start space-x-2">
                <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>{simulationSuccess}</span>
              </div>
            )}

            {/* TESTER WEBHOOK SIMULATOR HELPER */}
            <div className="pt-1 border-t border-zinc-900">
              <button
                type="button"
                onClick={handleSimulateKiwifyWebhook}
                disabled={simulatingWebhook}
                className="text-[10px] font-mono text-zinc-500 hover:text-orange-400 underline flex items-center space-x-1 transition-colors cursor-pointer disabled:opacity-50"
              >
                {simulatingWebhook ? (
                  <>
                    <Loader2 className="w-3 h-3 animate-spin" />
                    <span>Simulando webhook Kiwify...</span>
                  </>
                ) : (
                  <span>⚡ [Modo Teste] Simular Webhook Kiwify para este e-mail</span>
                )}
              </button>
            </div>

          </div>
        )}

        {/* FOOTER ACTIONS */}
        <div className="p-4 border-t border-zinc-900/90 bg-zinc-950 flex flex-col sm:flex-row items-center justify-between gap-2.5 shrink-0">
          {step === 'plans' ? (
            <>
              <button
                type="button"
                onClick={handleOpenKiwifyLink}
                className="w-full sm:w-1/2 bg-orange-600 hover:bg-orange-500 text-white font-bold py-2.5 px-3.5 rounded-xl text-xs transition-all flex items-center justify-center space-x-2 cursor-pointer shadow-[0_0_15px_rgba(249,115,22,0.25)] active:scale-95"
              >
                <ExternalLink className="w-3.5 h-3.5 text-white" />
                <span>Pagar Agora no Kiwify</span>
              </button>

              <button
                type="button"
                onClick={handleGoToEmailStep}
                className="w-full sm:w-1/2 bg-zinc-900 hover:bg-zinc-850 border border-orange-500/40 hover:border-orange-500 text-orange-400 font-bold py-2.5 px-3.5 rounded-xl text-xs uppercase tracking-wider transition-all flex items-center justify-center space-x-2 cursor-pointer active:scale-95"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Já Paguei / Confirmar Dados</span>
              </button>
            </>
          ) : (
            <div className="w-full flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => { playTypeSound(); setError(null); setStep('plans'); }}
                disabled={loading}
                className="bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-zinc-400 hover:text-white font-bold py-2.5 px-4 rounded-xl text-xs transition-all flex items-center justify-center space-x-1.5 cursor-pointer disabled:opacity-40"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Voltar</span>
              </button>

              <button
                type="button"
                onClick={handleConfirmAccess}
                disabled={loading}
                className="flex-1 bg-orange-600 hover:bg-orange-500 text-white font-black py-2.5 px-5 rounded-xl text-xs uppercase tracking-wider transition-all flex items-center justify-center space-x-2 shadow-[0_4px_20px_rgba(249,115,22,0.3)] cursor-pointer disabled:opacity-40 active:scale-95"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    <span>Liberando...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Confirmar e Ativar Acesso</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
