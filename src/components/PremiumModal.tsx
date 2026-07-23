import React, { useState } from 'react';
import { 
  Sparkles, X, Check, Brain, BarChart3, Volume2, 
  Cloud, ExternalLink, ShieldCheck, Mail, ArrowLeft, Lock, Loader2, User, Eye, EyeOff, AlertTriangle,
  Timer, BookOpen, Target, Award, Zap, Flame, Star, Crown, Clock, CheckCircle2, SlidersHorizontal
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

export interface AppFeature {
  icon: React.ElementType;
  title: string;
  category: string;
  description: string;
  badge?: string;
}

const ALL_APP_FEATURES: AppFeature[] = [
  {
    icon: Timer,
    title: "Timer Focus & Pomodoro Adaptativo",
    category: "Foco",
    description: "Modos de foco customizáveis (25min, 50min e tempo livre) com controle de pausas, alertas sonoros e histórico de sessões.",
    badge: "Essencial"
  },
  {
    icon: Brain,
    title: "Coach Treinador IA (Gemini)",
    category: "Inteligência",
    description: "IA integrada que analisa seu ritmo diário, recomenda novos hábitos, oferece suporte de foco e cria planos estratégicos.",
    badge: "IA Integrada"
  },
  {
    icon: SlidersHorizontal,
    title: "Modo Deep Work Imersivo",
    category: "Produtividade",
    description: "Interface zen limpa e sem distrações visuais para foco profundo, com overlays interativos e temporizador gigante.",
    badge: "Foco Total"
  },
  {
    icon: BookOpen,
    title: "Diário de Reflexão & Mentalidade",
    category: "Diário",
    description: "Espaço para autoavaliação noturna, registro de aprendizados diários, gratidão e planejamento do dia seguinte.",
    badge: "Diário"
  },
  {
    icon: Target,
    title: "Metas & Objetivos de Longo Prazo",
    category: "Planejamento",
    description: "Mapeamento de OKRs estratégicos com acompanhamento em tempo real de porcentagem de conclusão e marcos acionáveis.",
    badge: "Estratégia"
  },
  {
    icon: Flame,
    title: "RPG de Produtividade & Níveis de XP",
    category: "Gamificação",
    description: "Sistema completo de gamificação: ganhe XP por tarefas concluídas, suba de nível, mantenha Streaks ativos e evolua seu título.",
    badge: "Gamificado"
  },
  {
    icon: Award,
    title: "Conquistas & Medalhas Desbloqueáveis",
    category: "Gamificação",
    description: "Mais de 15 insígnias gamificadas desbloqueáveis para incentivar a disciplina, constância e superação de metas.",
    badge: "15+ Medalhas"
  },
  {
    icon: Volume2,
    title: "Sons Ambientes & Rádio Lofi",
    category: "Áudio",
    description: "Sons relaxantes da natureza (chuva, floresta, ruído branco, fogueira) e transmissão contínua da Rádio Lofi ao vivo.",
    badge: "Som HD"
  },
  {
    icon: BarChart3,
    title: "Dashboard de Métricas & Relatórios",
    category: "Análise",
    description: "Gráficos estatísticos de minutos em foco, taxa de conclusão semanal, distribuição de hábitos e produtividade acumulada.",
    badge: "Gráficos VIP"
  },
  {
    icon: Cloud,
    title: "Backup Automático 24h & Nuvem Supabase",
    category: "Segurança",
    description: "Exportação automática a cada 24 horas em arquivo JSON local e sincronização remota instantânea com banco Supabase.",
    badge: "Novem / JSON"
  }
];

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
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'lifetime'>('lifetime');

  const tasksDone = stats?.totalTasksCompleted ?? completedTasksCount;
  const isTrialExpired = daysOfUse >= 1 || tasksDone >= 5;

  if (!isOpen) return null;

  const handleOpenKiwifyLink = () => {
    playTypeSound();
    const checkoutUrl = selectedPlan === 'monthly'
      ? 'https://pay.kiwify.com.br/aao4SNu'
      : 'https://pay.kiwify.com.br/MP92hV1';

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
    <div className="fixed inset-0 bg-zinc-950/95 backdrop-blur-md z-50 flex items-start justify-center p-3 sm:p-4 overflow-y-auto pt-3 sm:pt-6">
      <div className="bg-zinc-950 border border-orange-500/50 rounded-3xl max-w-2xl w-full shadow-[0_0_80px_rgba(249,115,22,0.25)] relative flex flex-col mx-auto my-0 overflow-hidden animate-pop-in max-h-[94vh]">
        
        {/* ORANGE TOP GLOW BAR */}
        <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-orange-600 via-amber-400 to-orange-600" />

        {/* HEADER */}
        <div className="p-4 sm:p-5 border-b border-zinc-900/90 flex justify-between items-center shrink-0 bg-zinc-950/90">
          <div className="flex items-center space-x-3">
            {step === 'email_confirmation' && (
              <button
                type="button"
                onClick={() => { playTypeSound(); setError(null); setStep('plans'); }}
                className="bg-zinc-900 hover:bg-zinc-800 text-orange-400 p-1.5 rounded-xl border border-zinc-800 hover:border-orange-500/40 transition-colors cursor-pointer"
                title="Voltar"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
            )}

            <div className="bg-orange-500/10 border border-orange-500/30 p-2.5 rounded-2xl text-orange-400 shrink-0">
              {step === 'plans' ? (
                <Crown className="w-5 h-5 animate-pulse text-orange-400" />
              ) : (
                <Lock className="w-5 h-5 text-orange-400" />
              )}
            </div>
            <div>
              <span className="text-[9.5px] font-mono font-bold text-orange-400 uppercase tracking-widest block">
                {step === 'plans' ? '// PLANOS & RECURSOS PREMIUM' : '// LIBERAÇÃO DE ACESSO'}
              </span>
              <h4 className="text-base font-black text-white uppercase tracking-tight">
                {step === 'plans' ? 'Desbloqueie o FocusOS Ilimitado' : 'Confirmação de Compra Kiwify'}
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
          <div className="p-4 sm:p-5 space-y-5 text-xs text-zinc-400 overflow-y-auto">
            
            {/* FREE TRIAL EXPIRED BANNER NOTICE */}
            {isTrialExpired && (
              <div className="bg-gradient-to-r from-orange-950/90 via-amber-950/90 to-orange-950/90 border border-orange-500/60 p-4 rounded-2xl text-white flex items-start space-x-3.5 shadow-xl shadow-orange-500/10 animate-fade-in">
                <div className="bg-orange-500/20 border border-orange-500/40 p-2.5 rounded-2xl text-orange-400 shrink-0 mt-0.5">
                  <AlertTriangle className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] font-mono font-black text-orange-400 uppercase tracking-widest block">
                      ⚠️ PERÍODO DE TESTE GRÁTIS CONCLUÍDO (1 DIA DE USO)
                    </span>
                  </div>
                  <p className="text-xs text-zinc-200 mt-1 leading-relaxed font-medium">
                    Seu período de teste grátis de <strong>1 dia de uso</strong> expirou. Para continuar acompanhando seu progresso, nível RPG e usar o Coach IA, selecione um dos planos abaixo e ative seu acesso ilimitado no Kiwify!
                  </p>
                </div>
              </div>
            )}

            {/* SEÇÃO 1: DETALHES DOS 2 PLANOS DISPONÍVEIS */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <h5 className="text-[10.5px] font-bold text-white uppercase tracking-wider font-mono flex items-center space-x-2">
                  <Crown className="w-4 h-4 text-orange-400" />
                  <span>Nossos 2 Planos de Assinatura</span>
                </h5>
                <span className="text-[10px] text-orange-400 font-mono">Ativação Instantânea</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                
                {/* PLANO 1: MENSAL */}
                <div 
                  onClick={() => { playTypeSound(); setSelectedPlan('monthly'); }}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer relative flex flex-col justify-between ${
                    selectedPlan === 'monthly'
                      ? 'bg-orange-950/25 border-orange-500/80 shadow-[0_0_25px_rgba(249,115,22,0.18)] ring-1 ring-orange-500/50'
                      : 'bg-zinc-900/40 border-zinc-800 hover:border-zinc-700'
                  }`}
                >
                  <div>
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300 text-[8.5px] font-mono uppercase font-bold tracking-wider inline-block mb-1">
                          Flexível
                        </span>
                        <h6 className="font-black text-white text-sm">Plano Mensal</h6>
                      </div>
                      <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 transition-colors ${
                        selectedPlan === 'monthly' ? 'border-orange-400 bg-orange-400 text-zinc-950' : 'border-zinc-700'
                      }`}>
                        {selectedPlan === 'monthly' && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </div>
                    </div>

                    <div className="mt-3 mb-2">
                      <div className="flex items-baseline space-x-1">
                        <span className="text-2xl font-black text-white font-mono">R$ 27,90</span>
                        <span className="text-zinc-400 text-xs font-mono">/mês</span>
                      </div>
                      <span className="text-[10px] text-zinc-400 font-mono block mt-0.5">
                        Cobrança recorrente mensal. Sem fidelidade.
                      </span>
                    </div>

                    <ul className="space-y-1.5 pt-2 border-t border-zinc-800/80 text-[11px] text-zinc-300">
                      <li className="flex items-center space-x-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-orange-400 shrink-0" />
                        <span>Acesso ilimitado às 10+ funções</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-orange-400 shrink-0" />
                        <span>Coach IA Gemini sem limites</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-orange-400 shrink-0" />
                        <span>RPG completo & XP acumulativo</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-orange-400 shrink-0" />
                        <span>Cancele quando quiser</span>
                      </li>
                    </ul>
                  </div>

                  <div className="mt-4 pt-2.5 border-t border-zinc-800/60">
                    <span className="text-[10px] text-zinc-400 font-mono block text-center">
                      Para quem prefere testar mês a mês
                    </span>
                  </div>
                </div>

                {/* PLANO 2: ANUAL (MELHOR VALOR) */}
                <div 
                  onClick={() => { playTypeSound(); setSelectedPlan('lifetime'); }}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer relative flex flex-col justify-between overflow-hidden ${
                    selectedPlan === 'lifetime'
                      ? 'bg-gradient-to-b from-orange-950/40 via-zinc-900/80 to-zinc-950 border-orange-500/90 shadow-[0_0_30px_rgba(249,115,22,0.25)] ring-1 ring-orange-500'
                      : 'bg-zinc-900/40 border-zinc-800 hover:border-zinc-700'
                  }`}
                >
                  <div className="absolute top-0 right-0 bg-gradient-to-l from-orange-500 to-amber-500 text-zinc-950 text-[8px] font-black px-2.5 py-1 uppercase rounded-bl-xl tracking-wider font-mono shadow-md">
                    🔥 Economize 60%
                  </div>

                  <div>
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="px-2 py-0.5 rounded-full bg-orange-500/20 border border-orange-500/40 text-orange-300 text-[8.5px] font-mono uppercase font-bold tracking-wider inline-block mb-1">
                          Recomendado VIP
                        </span>
                        <h6 className="font-black text-white text-sm">Plano Anual</h6>
                      </div>
                      <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 transition-colors ${
                        selectedPlan === 'lifetime' ? 'border-orange-400 bg-orange-400 text-zinc-950' : 'border-zinc-700'
                      }`}>
                        {selectedPlan === 'lifetime' && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </div>
                    </div>

                    <div className="mt-3 mb-2">
                      <div className="flex items-baseline space-x-1.5">
                        <span className="text-2xl font-black text-white font-mono">R$ 107,00</span>
                        <span className="text-orange-400 text-xs font-mono font-bold">/ano</span>
                      </div>
                      <span className="text-[10px] text-emerald-400 font-mono font-semibold block mt-0.5">
                        Equivale a apenas R$ 8,91/mês! (Economia de R$ 227,80)
                      </span>
                    </div>

                    <ul className="space-y-1.5 pt-2 border-t border-zinc-800/80 text-[11px] text-zinc-200">
                      <li className="flex items-center space-x-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-orange-400 shrink-0" />
                        <span className="font-bold text-white">Todas as 10+ funções do app inclusas</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-orange-400 shrink-0" />
                        <span>Prioridade máxima de resposta no Coach IA</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-orange-400 shrink-0" />
                        <span>Sincronização na nuvem & Backup local 24h</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-orange-400 shrink-0" />
                        <span>Garantia total incondicional de 7 dias</span>
                      </li>
                    </ul>
                  </div>

                  <div className="mt-4 pt-2.5 border-t border-zinc-800/60">
                    <span className="text-[10px] text-orange-300 font-mono block text-center font-bold">
                      ⭐ A escolha favorita de 89% dos nossos membros
                    </span>
                  </div>
                </div>

              </div>
            </div>

            {/* SEÇÃO 2: DESCRIÇÃO COMPLETA DE TODAS AS FUNCIONALIDADES DO APP */}
            <div className="space-y-3 pt-2 border-t border-zinc-900">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[9px] font-mono font-bold text-orange-400 uppercase tracking-widest block">
                    // TUDO O QUE O FOCUSOS OFERECE
                  </span>
                  <h5 className="text-xs font-black text-white uppercase tracking-tight">
                    Descrição das 10 Funcionalidades do App
                  </h5>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-[9.5px] font-mono text-zinc-300">
                  10 Módulos Ativos
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[280px] overflow-y-auto pr-1">
                {ALL_APP_FEATURES.map((feat, idx) => {
                  const IconComp = feat.icon;
                  return (
                    <div 
                      key={idx}
                      className="bg-zinc-900/50 hover:bg-zinc-900/80 border border-zinc-800/80 hover:border-orange-500/30 p-3 rounded-2xl transition-all flex items-start space-x-3 group"
                    >
                      <div className="p-2 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-400 shrink-0 group-hover:scale-105 transition-transform">
                        <IconComp className="w-4 h-4" />
                      </div>
                      <div className="space-y-0.5">
                        <div className="flex items-center space-x-1.5">
                          <span className="font-bold text-white text-[11px]">{feat.title}</span>
                          {feat.badge && (
                            <span className="text-[8px] font-mono font-bold text-orange-400 bg-orange-500/10 border border-orange-500/20 px-1.5 py-0.2 rounded">
                              {feat.badge}
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-zinc-400 leading-snug font-sans">
                          {feat.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* SEGURANÇA & ATIVAÇÃO */}
            <div className="bg-orange-950/20 border border-orange-500/30 p-3 rounded-2xl text-[11px] text-zinc-200 font-mono flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <ShieldCheck className="w-5 h-5 text-orange-400 shrink-0" />
                <div>
                  <span className="text-white font-bold block text-[11px]">Pagamento 100% Seguro via Kiwify</span>
                  <span className="text-zinc-400 text-[10px]">Acesso liberado automaticamente após a confirmação.</span>
                </div>
              </div>
              <span className="text-[10px] text-orange-400 font-bold bg-orange-500/10 px-2 py-1 rounded-lg border border-orange-500/20">
                SSL 256-bit
              </span>
            </div>

            {error && (
              <div className="bg-red-950/60 border border-red-900 p-3 rounded-2xl text-red-200 font-semibold text-xs">
                ❌ {error}
              </div>
            )}

          </div>
        ) : (
          /* STEP 2: FORMULARIO DE CONFIRMAÇÃO DE EMAIL DO COMPRADOR KIWIFY */
          <div className="p-4 sm:p-5 space-y-4 text-xs text-zinc-400 overflow-y-auto max-h-[calc(92vh-140px)]">
            
            <div className="bg-orange-950/30 border border-orange-500/30 p-3.5 rounded-2xl space-y-2">
              <div className="flex items-center space-x-2 text-orange-400">
                <ShieldCheck className="w-4 h-4 shrink-0" />
                <span className="font-mono font-bold text-[10.5px] uppercase tracking-wider">
                  VALIDAÇÃO AUTOMÁTICA DE COMPRA
                </span>
              </div>
              <p className="text-[11.5px] text-zinc-200 leading-relaxed">
                Insira o <strong>mesmo e-mail que você utilizou na compra pelo Kiwify</strong>. Nosso sistema consultará o webhook do Kiwify e ativará seu perfil como <strong>PREMIUM</strong> imediatamente.
              </p>
            </div>

            <div className="bg-zinc-900/80 border border-zinc-800 p-3 rounded-2xl flex items-center justify-between font-mono">
              <span className="text-[10px] text-zinc-400 uppercase">PLANO ESCOLHIDO:</span>
              <span className="text-xs font-bold text-orange-400">
                {selectedPlan === 'monthly' ? 'Plano Mensal (R$ 27,90/mês)' : 'Plano Anual (R$ 107,00/ano)'}
              </span>
            </div>

            <div className="space-y-3.5">
              {/* NOME DO COMPRADOR */}
              <div className="space-y-1.5">
                <label htmlFor="buyer-name-field" className="block text-[10px] font-bold text-zinc-300 uppercase tracking-wider font-mono">
                  NOME COMPLETO DO COMPRADOR
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-orange-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    id="buyer-name-field"
                    type="text"
                    value={buyerName}
                    onChange={(e) => setBuyerName(e.target.value)}
                    placeholder="Seu nome"
                    className="w-full bg-zinc-900 border border-orange-500/50 rounded-xl py-2.5 pl-10 pr-3 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400 font-mono transition-all"
                    autoFocus
                  />
                </div>
              </div>

              {/* E-MAIL DO COMPRADOR */}
              <div className="space-y-1.5">
                <label htmlFor="buyer-email-field" className="block text-[10px] font-bold text-zinc-300 uppercase tracking-wider font-mono">
                  E-MAIL CADASTRADO NO KIWIFY <span className="text-orange-400">*</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-orange-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    id="buyer-email-field"
                    type="email"
                    value={buyerEmail}
                    onChange={(e) => setBuyerEmail(e.target.value)}
                    placeholder="seu@email.com (mesmo e-mail do Kiwify)"
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
                    placeholder="Defina sua senha de acesso"
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
                  className="w-full bg-orange-600 hover:bg-orange-500 text-white font-bold py-2.5 px-3 rounded-xl text-[11px] transition-all flex items-center justify-center space-x-1.5 cursor-pointer mt-1"
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
        <div className="p-4 border-t border-zinc-900/90 bg-zinc-950 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          {step === 'plans' ? (
            <>
              <button
                type="button"
                onClick={handleOpenKiwifyLink}
                className="w-full sm:w-1/2 bg-orange-600 hover:bg-orange-500 text-white font-black py-3 px-4 rounded-xl text-xs transition-all flex items-center justify-center space-x-2 cursor-pointer shadow-[0_0_20px_rgba(249,115,22,0.3)] active:scale-95 uppercase tracking-wider"
              >
                <ExternalLink className="w-4 h-4 text-white" />
                <span>Pagar {selectedPlan === 'monthly' ? 'R$ 27,90' : 'R$ 107,00'} no Kiwify</span>
              </button>

              <button
                type="button"
                onClick={handleGoToEmailStep}
                className="w-full sm:w-1/2 bg-zinc-900 hover:bg-zinc-850 border border-orange-500/40 hover:border-orange-500 text-orange-400 font-bold py-3 px-4 rounded-xl text-xs uppercase tracking-wider transition-all flex items-center justify-center space-x-2 cursor-pointer active:scale-95"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Já Paguei / Confirmar Dados</span>
              </button>
            </>
          ) : (
            <div className="w-full flex items-center justify-between gap-2.5">
              <button
                type="button"
                onClick={() => { playTypeSound(); setError(null); setStep('plans'); }}
                disabled={loading}
                className="bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-zinc-400 hover:text-white font-bold py-2.5 px-4 rounded-xl text-xs transition-all flex items-center justify-center space-x-1.5 cursor-pointer disabled:opacity-40"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Voltar aos Planos</span>
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
                    <span>Verificando...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
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
