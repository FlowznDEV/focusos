import React from 'react';
import { 
  ShieldCheck, Check, Lock, ExternalLink, 
  Crown, Sparkles, ArrowRight, 
  Zap, Flame, Award, BarChart3, Brain,
  Timer, BookOpen, Target, Volume2, Cloud
} from 'lucide-react';
import { playTypeSound } from '../lib/sound';

interface PaymentStatusTabProps {
  premium: boolean;
  planType: string | null;
  email: string;
  isTrialEnded?: boolean;
  onPaymentSuccess: (planType: string, buyerEmail?: string, token?: string) => void;
  onGoToTasks?: () => void;
}

const ALL_APP_FEATURES = [
  {
    icon: Timer,
    title: "Timer Focus & Pomodoro Adaptativo",
    category: "Foco",
    description: "Modos de foco customizáveis com controle de pausas, alertas sonoros e histórico."
  },
  {
    icon: Brain,
    title: "Coach Treinador IA (Gemini 3.6)",
    category: "Inteligência",
    description: "IA integrada que analisa seu ritmo diário, recomenda novos hábitos e cria planos."
  },
  {
    icon: Zap,
    title: "Modo Deep Work Imersivo",
    category: "Produtividade",
    description: "Interface zen sem distrações para foco profundo com temporizador imersivo."
  },
  {
    icon: BookOpen,
    title: "Diário de Reflexão & Mentalidade",
    category: "Diário",
    description: "Registro de autoavaliação noturna, gratidão e aprendizados diários."
  },
  {
    icon: Target,
    title: "Metas & Objetivos Estratégicos",
    category: "Planejamento",
    description: "Mapeamento de OKRs com acompanhamento em tempo real e marcos acionáveis."
  },
  {
    icon: Flame,
    title: "RPG de Produtividade & Níveis de XP",
    category: "Gamificação",
    description: "Ganhe XP por tarefas, suba de nível até o prestígio 15 e mantenha Streaks ativos."
  },
  {
    icon: Award,
    title: "15+ Conquistas & Medalhas Desbloqueáveis",
    category: "Gamificação",
    description: "Insígnias para incentivar disciplina e superação de limites."
  },
  {
    icon: Volume2,
    title: "Sons Ambientes Relaxantes HD",
    category: "Áudio",
    description: "Chuva, floresta, ruído branco, fogueira e rádio lofi contínua."
  },
  {
    icon: BarChart3,
    title: "Dashboard de Métricas & Relatórios",
    category: "Análise",
    description: "Estatísticas de minutos em foco, taxa de conclusão e produtividade acumulada."
  },
  {
    icon: Cloud,
    title: "Backup Nuvem Supabase & JSON Local 24h",
    category: "Segurança",
    description: "Sincronização remota automática e exportação de backups de segurança."
  }
];

export default function PaymentStatusTab({
  premium,
  planType,
  isTrialEnded = false,
  onGoToTasks
}: PaymentStatusTabProps) {

  const handleOpenKiwifyCheckout = (plan: 'monthly' | 'lifetime') => {
    playTypeSound();
    const url = plan === 'monthly'
      ? 'https://pay.kiwify.com.br/aao4SNu'
      : 'https://pay.kiwify.com.br/MP92hV1';
    try {
      window.open(url, '_blank', 'noopener,noreferrer');
    } catch (e) {
      console.error("Failed to open checkout link:", e);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6 animate-fade-in">
      
      {/* STATUS BANNER TOP */}
      <div className={`p-6 sm:p-8 rounded-3xl border shadow-2xl relative overflow-hidden transition-all ${
        premium 
          ? 'bg-gradient-to-r from-emerald-950/80 via-zinc-900 to-emerald-950/80 border-emerald-500/50 shadow-emerald-500/10' 
          : !isTrialEnded
          ? 'bg-gradient-to-r from-amber-950/50 via-zinc-900 to-orange-950/50 border-orange-500/40 shadow-orange-500/10'
          : 'bg-gradient-to-r from-orange-950/80 via-zinc-950 to-orange-950/80 border-orange-500/50 shadow-orange-500/15'
      }`}>
        <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${
          premium 
            ? 'from-emerald-500 via-teal-400 to-emerald-500' 
            : 'from-orange-500 via-amber-400 to-orange-500'
        }`} />

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-start space-x-4">
            <div className={`p-4 rounded-2xl border shrink-0 ${
              premium 
                ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400' 
                : 'bg-orange-500/20 border-orange-500/40 text-orange-400'
            }`}>
              {premium ? (
                <ShieldCheck className="w-8 h-8 text-emerald-400" />
              ) : !isTrialEnded ? (
                <Sparkles className="w-8 h-8 animate-pulse text-amber-400" />
              ) : (
                <Lock className="w-8 h-8 animate-bounce text-orange-400" />
              )}
            </div>

            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase tracking-widest border ${
                  premium 
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' 
                    : !isTrialEnded
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                    : 'bg-orange-500/20 text-orange-300 border-orange-500/40'
                }`}>
                  {premium 
                    ? 'STATUS: PAGO & ATIVO' 
                    : !isTrialEnded 
                    ? 'STATUS: TESTE GRÁTIS ATIVO (1 DIA)' 
                    : 'STATUS: PERÍODO DE TESTE EXPIRADO'}
                </span>
                {planType && (
                  <span className="bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[9px] font-mono font-bold px-2 py-0.5 rounded-full uppercase">
                    Plano {planType === 'monthly' ? 'Mensal' : 'Anual'}
                  </span>
                )}
              </div>

              <h2 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight font-sans">
                {premium 
                  ? 'Acesso Premium Ativo no FocusOS' 
                  : !isTrialEnded
                  ? 'Aproveite seu Teste Grátis de 1 Dia'
                  : 'Seu Período de Teste Expirou - Assine no Kiwify'}
              </h2>

              <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed max-w-2xl">
                {premium ? (
                  'Todas as 10+ funcionalidades do FocusOS estão totalmente liberadas para você. Seu progresso, RPG, IA Mentor e sincronização em nuvem estão ativos.'
                ) : !isTrialEnded ? (
                  'Você está no seu período de testes de 1 dia grátis! Teste todas as funcionalidades livremente. Escolha um plano abaixo se desejar garantir acesso contínuo.'
                ) : (
                  'Seu período de teste grátis de 1 dia terminou. Escolha o plano mensal ou anual abaixo na Kiwify para continuar usando todas as funções do FocusOS.'
                )}
              </p>
            </div>
          </div>

          {(premium || !isTrialEnded) && onGoToTasks && (
            <button
              onClick={() => { playTypeSound(); onGoToTasks(); }}
              className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-zinc-950 font-black px-6 py-3.5 rounded-2xl text-xs uppercase tracking-wider transition-all shadow-lg shadow-orange-500/20 flex items-center space-x-2 shrink-0 cursor-pointer active:scale-95"
            >
              <span>Acessar Painel de Foco</span>
              <ArrowRight className="w-4 h-4 stroke-[3]" />
            </button>
          )}
        </div>
      </div>

      {/* PLANOS DE ASSINATURA KIWIFY */}
      <div className="bg-zinc-950 border border-zinc-900 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
        <div className="flex items-center justify-between border-b border-zinc-900 pb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-orange-500/10 border border-orange-500/30 text-orange-400">
              <Crown className="w-6 h-6 text-amber-400 animate-pulse" />
            </div>
            <div>
              <span className="text-[9px] font-mono font-bold text-orange-400 uppercase tracking-widest block">
                // PLANOS OFICIAIS
              </span>
              <h3 className="text-lg font-black text-white uppercase tracking-tight">
                Escolha o Seu Plano de Acesso no Kiwify
              </h3>
            </div>
          </div>
          <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full font-bold">
            Checkout Seguro Kiwify
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* PLAN 1: MENSAL */}
          <div className="bg-zinc-900/60 border border-zinc-800 hover:border-zinc-700 p-6 rounded-3xl space-y-4 transition-all flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[10px] font-mono text-zinc-400 uppercase font-bold block">Plano Flexível</span>
                  <h4 className="text-lg font-black text-white">FocusOS Mensal</h4>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-black text-white font-mono">R$ 27,90</span>
                  <span className="text-[10px] text-zinc-400 font-normal block">/mês</span>
                </div>
              </div>
              <p className="text-xs text-zinc-300 leading-relaxed font-sans">
                Cobrança recorrente mensal sem fidelidade. Cancele quando quiser com 1 clique diretamente na Kiwify.
              </p>
              <ul className="space-y-2 text-xs text-zinc-300 font-sans pt-2">
                <li className="flex items-center space-x-2">
                  <Check className="w-4 h-4 text-orange-400 shrink-0" />
                  <span>Acesso completo a todas as funções</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Check className="w-4 h-4 text-orange-400 shrink-0" />
                  <span>Treinador IA Gemini sem limites</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Check className="w-4 h-4 text-orange-400 shrink-0" />
                  <span>Sincronização em nuvem e backup local</span>
                </li>
              </ul>
            </div>

            <button
              type="button"
              onClick={() => handleOpenKiwifyCheckout('monthly')}
              className="w-full bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-white font-bold py-3.5 px-4 rounded-2xl text-xs uppercase tracking-wider transition-all flex items-center justify-center space-x-2 cursor-pointer shadow-md active:scale-95"
            >
              <ExternalLink className="w-4 h-4 text-orange-400" />
              <span>Pagar R$ 27,90 no Kiwify</span>
            </button>
          </div>

          {/* PLAN 2: ANUAL (BEST VALUE) */}
          <div className="bg-gradient-to-b from-orange-950/40 via-zinc-900/90 to-zinc-950 border-2 border-orange-500/80 p-6 rounded-3xl space-y-4 shadow-[0_0_25px_rgba(249,115,22,0.2)] relative overflow-hidden flex flex-col justify-between">
            <div className="absolute top-0 right-0 bg-gradient-to-l from-orange-500 to-amber-500 text-zinc-950 text-[9px] font-black px-3 py-1 uppercase rounded-bl-2xl font-mono shadow-md">
              🔥 60% OFF - Recomendado
            </div>

            <div className="space-y-3 pt-2">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[10px] font-mono text-orange-400 uppercase font-bold block">Melhor Oferta VIP</span>
                  <h4 className="text-lg font-black text-white">FocusOS Anual</h4>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-black text-white font-mono block">R$ 107,00<span className="text-xs text-orange-400 font-bold">/ano</span></span>
                  <span className="text-[10px] text-emerald-400 font-mono font-bold">Equivale a R$ 8,91/mês</span>
                </div>
              </div>

              <p className="text-xs text-zinc-200 leading-relaxed font-sans">
                Acesso garantido de 1 ano inteiro com desconto máximo e economia de R$ 227,80 no ano.
              </p>

              <ul className="space-y-2 text-xs text-zinc-200 font-sans pt-2">
                <li className="flex items-center space-x-2">
                  <Check className="w-4 h-4 text-orange-400 shrink-0" />
                  <span>Acesso ilimitado de 12 meses consecutivos</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Check className="w-4 h-4 text-orange-400 shrink-0" />
                  <span>Atualizações prioritárias e suporte VIP</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Check className="w-4 h-4 text-orange-400 shrink-0" />
                  <span>Economia de 60% no valor acumulado</span>
                </li>
              </ul>
            </div>

            <button
              type="button"
              onClick={() => handleOpenKiwifyCheckout('lifetime')}
              className="w-full bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-500 hover:to-amber-400 text-white font-black py-4 px-6 rounded-2xl text-xs uppercase tracking-wider transition-all flex items-center justify-center space-x-2 cursor-pointer shadow-lg shadow-orange-500/30 active:scale-95"
            >
              <Sparkles className="w-4 h-4 text-white animate-pulse" />
              <span>Garantir Plano Anual no Kiwify</span>
            </button>
          </div>
        </div>

        {/* TRUST BADGE */}
        <div className="bg-zinc-900/50 border border-zinc-800 p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between text-xs font-mono text-zinc-400 gap-3">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-5 h-5 text-orange-400 shrink-0" />
            <span>Garantia Incondicional de 7 Dias: Se não gostar, receba 100% do valor de volta.</span>
          </div>
          <span className="text-orange-400 font-bold shrink-0">Kiwify Verified</span>
        </div>
      </div>

      {/* HOW IT WORKS / PASSO A PASSO DE PAGAMENTO E LIBERAÇÃO */}
      <div className="bg-zinc-950 border border-orange-500/30 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-2 h-full bg-gradient-to-b from-orange-500 via-amber-500 to-orange-600" />
        
        <div>
          <span className="text-[9px] font-mono font-bold text-orange-400 uppercase tracking-widest block">
            // GUIA PASSO A PASSO
          </span>
          <h3 className="text-lg font-black text-white uppercase tracking-tight">
            Como Realizar o Pagamento e Acessar o FocusOS:
          </h3>
          <p className="text-xs text-zinc-300 mt-1 font-sans">
            Siga o procedimento simples abaixo para adquirir sua assinatura e liberar todos os módulos de produtividade.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* PASSO 1 */}
          <div className="bg-zinc-900/60 border border-zinc-800 p-4 rounded-2xl space-y-2 relative">
            <div className="flex items-center space-x-2">
              <span className="w-6 h-6 rounded-lg bg-orange-500/20 border border-orange-500/40 text-orange-400 font-mono text-xs font-black flex items-center justify-center shrink-0">
                1
              </span>
              <h4 className="font-extrabold text-white text-xs uppercase">Escolha o Plano no Kiwify</h4>
            </div>
            <p className="text-[11px] text-zinc-400 leading-relaxed font-sans">
              Clique no botão do plano desejado (<strong className="text-zinc-200">Mensal R$ 27,90</strong> ou <strong className="text-orange-400">Anual R$ 107,00</strong>). Você será redirecionado para a página segura de checkout da <strong className="text-white">Kiwify</strong>.
            </p>
          </div>

          {/* PASSO 2 */}
          <div className="bg-zinc-900/60 border border-zinc-800 p-4 rounded-2xl space-y-2 relative">
            <div className="flex items-center space-x-2">
              <span className="w-6 h-6 rounded-lg bg-orange-500/20 border border-orange-500/40 text-orange-400 font-mono text-xs font-black flex items-center justify-center shrink-0">
                2
              </span>
              <h4 className="font-extrabold text-white text-xs uppercase">Pague por Pix ou Cartão</h4>
            </div>
            <p className="text-[11px] text-zinc-400 leading-relaxed font-sans">
              No checkout da Kiwify, informe seus dados e conclua o pagamento. Pagamentos por <strong className="text-emerald-400">Pix</strong> ou <strong className="text-emerald-400">Cartão de Crédito</strong> são aprovados na hora!
            </p>
          </div>

          {/* PASSO 3 */}
          <div className="bg-zinc-900/60 border border-zinc-800 p-4 rounded-2xl space-y-2 relative">
            <div className="flex items-center space-x-2">
              <span className="w-6 h-6 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 font-mono text-xs font-black flex items-center justify-center shrink-0">
                3
              </span>
              <h4 className="font-extrabold text-white text-xs uppercase">Acesso Imediato Liberado</h4>
            </div>
            <p className="text-[11px] text-zinc-400 leading-relaxed font-sans">
              Assim que aprovado, o Kiwify envia a confirmação automática (Webhook) para a plataforma e seu acesso é liberado no aplicativo.
            </p>
          </div>
        </div>
      </div>

      {/* LOWER SECTION: FEATURES UNLOCKED LIST */}
      <div className="bg-zinc-950 border border-zinc-900 rounded-3xl p-6 sm:p-8 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[9px] font-mono font-bold text-orange-400 uppercase tracking-widest block">
              // RECURSOS DA ASSINATURA
            </span>
            <h3 className="text-base font-black text-white uppercase tracking-tight">
              O que você libera ao assinar o FocusOS:
            </h3>
          </div>
          <span className="px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/30 text-orange-400 font-mono text-[10px] font-bold">
            10 Módulos Completos
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
          {ALL_APP_FEATURES.map((feat, idx) => {
            const IconComp = feat.icon;
            return (
              <div 
                key={idx}
                className="bg-zinc-900/40 border border-zinc-800/80 p-3.5 rounded-2xl flex items-start space-x-3 hover:border-orange-500/30 transition-all"
              >
                <div className="p-2 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-400 shrink-0">
                  <IconComp className="w-4 h-4" />
                </div>
                <div className="space-y-0.5">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-white text-xs">{feat.title}</span>
                    <span className="text-[8px] font-mono text-zinc-500 uppercase px-1.5 py-0.2 bg-zinc-800 rounded">
                      {feat.category}
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-400 leading-snug">
                    {feat.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
