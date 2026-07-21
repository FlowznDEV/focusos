import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, X, Check, CreditCard, Flame, Award, 
  HelpCircle, Shield, Brain, BarChart3, Volume2, 
  BookOpen, Trophy, Cloud, Zap, ArrowRight, Play, RefreshCw
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
  onPaymentSuccess: (planType: string) => void;
  // Simulation helpers
  onSimulateTasks: () => void;
  onSimulateFunctions: () => void;
  onSimulateDays: () => void;
}

export default function PremiumModal({
  isOpen,
  onClose,
  email,
  stats,
  usedFunctionsCount,
  totalFunctionsCount,
  daysOfUse,
  onPaymentSuccess,
  onSimulateTasks,
  onSimulateFunctions,
  onSimulateDays
}: PremiumModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'lifetime'>('monthly');
  
  // Simulated sandbox checkout flow state
  const [showSandbox, setShowSandbox] = useState(false);
  const [sandboxCard, setSandboxCard] = useState('');
  const [sandboxExpiry, setSandboxExpiry] = useState('');
  const [sandboxCVC, setSandboxCVC] = useState('');

  if (!isOpen) return null;

  // Milestone check values
  const hasCompleted5Tasks = stats.totalTasksCompleted >= 5;
  const hasUsedAllFunctions = usedFunctionsCount >= totalFunctionsCount;
  const hasBeen1Day = daysOfUse >= 1;

  // Is eligible for premium upgrade (all conditions must be met!)
  const isEligible = hasCompleted5Tasks && hasUsedAllFunctions && hasBeen1Day;

  const handleCheckout = async () => {
    playTypeSound();
    if (!isEligible) return;

    const checkoutUrl = selectedPlan === 'monthly'
      ? 'https://buy.stripe.com/4gMbJ068f4zp7df1YT7Vm00'
      : 'https://buy.stripe.com/dRmbJ09kr4zpdBD0UP7Vm01';

    window.location.href = checkoutUrl;
  };

  const handleConfirmSandboxPayment = async () => {
    playTypeSound();
    setLoading(true);
    try {
      // Complete payment and mark user as premium in our backend database
      const response = await fetch('/api/user/premium-success', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email || 'usuario.teste@focusquest.com',
          planType: selectedPlan
        })
      });

      const data = await response.json();
      if (response.ok && data.success) {
        setShowSandbox(false);
        onPaymentSuccess(selectedPlan);
      } else {
        throw new Error(data.error || 'Falha ao confirmar transação.');
      }
    } catch (err: any) {
      setError(err.message || 'Ocorreu um erro na confirmação do pagamento.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-zinc-950/90 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-zinc-950 border border-zinc-900 rounded-3xl max-w-2xl w-full shadow-[0_0_50px_rgba(245,158,11,0.1)] relative flex flex-col max-h-[92vh] overflow-hidden my-4">
        
        {/* GOLD TOP GLOW BAR */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500" />

        {/* HEADER */}
        <div className="p-6 border-b border-zinc-900/60 flex justify-between items-center shrink-0">
          <div className="flex items-center space-x-2.5">
            <div className="bg-amber-500/10 border border-amber-500/30 p-2 rounded-xl text-amber-400">
              <Sparkles className="w-5 h-5 animate-pulse text-amber-400" />
            </div>
            <div>
              <span className="text-[9px] font-mono font-bold text-amber-400 uppercase tracking-widest block">// UPGRADE DE HERÓI</span>
              <h4 className="text-sm font-black text-white uppercase tracking-tight">FocusOS Premium RPG</h4>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-500 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
            title="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* SCROLLABLE BODY */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs leading-relaxed text-zinc-400">
          
          {/* ELIGIBILITY TRACKER CARDS */}
          <div className="bg-zinc-900/40 border border-zinc-900 p-4 rounded-2xl space-y-3.5">
            <div className="flex justify-between items-center">
              <h5 className="text-[10px] font-bold text-white uppercase tracking-wider font-mono">// REQUISITOS DE LIBERAÇÃO</h5>
              <span className={`text-[9px] font-mono px-2 py-0.5 rounded-md font-bold uppercase ${isEligible ? 'bg-amber-950/60 text-amber-400 border border-amber-900/30' : 'bg-zinc-900 text-zinc-500 border border-zinc-800'}`}>
                {isEligible ? 'Elegível para Compra ✨' : 'Bloqueado'}
              </span>
            </div>
            <p className="text-[11px] text-zinc-400">
              Para desbloquear as opções de compra, você deve cumprir <strong>todos os requisitos</strong> da guilda abaixo:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {/* Task milestone */}
              <div className={`p-3 rounded-xl border flex flex-col justify-between ${hasCompleted5Tasks ? 'bg-amber-950/20 border-amber-500/30 text-amber-300' : 'bg-zinc-900/40 border-zinc-900'}`}>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider font-mono">5 Missões</span>
                  {hasCompleted5Tasks ? <Check className="w-4 h-4 text-amber-400 shrink-0" /> : <RefreshCw className="w-3.5 h-3.5 text-zinc-600 animate-spin" style={{ animationDuration: '4s' }} />}
                </div>
                <div className="mt-3">
                  <span className="text-lg font-black font-mono block text-white">{stats.totalTasksCompleted} / 5</span>
                  <span className="text-[10px] text-zinc-500 block">Tarefas completadas</span>
                </div>
              </div>

              {/* Functions milestone */}
              <div className={`p-3 rounded-xl border flex flex-col justify-between ${hasUsedAllFunctions ? 'bg-amber-950/20 border-amber-500/30 text-amber-300' : 'bg-zinc-900/40 border-zinc-900'}`}>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider font-mono">Tudo Usado</span>
                  {hasUsedAllFunctions ? <Check className="w-4 h-4 text-amber-400 shrink-0" /> : <RefreshCw className="w-3.5 h-3.5 text-zinc-600 animate-spin" style={{ animationDuration: '4s' }} />}
                </div>
                <div className="mt-3">
                  <span className="text-lg font-black font-mono block text-white">{usedFunctionsCount} / {totalFunctionsCount}</span>
                  <span className="text-[10px] text-zinc-500 block">Funções exploradas</span>
                </div>
              </div>

              {/* Days milestone */}
              <div className={`p-3 rounded-xl border flex flex-col justify-between ${hasBeen1Day ? 'bg-amber-950/20 border-amber-500/30 text-amber-300' : 'bg-zinc-900/40 border-zinc-900'}`}>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider font-mono">1 Dia</span>
                  {hasBeen1Day ? <Check className="w-4 h-4 text-amber-400 shrink-0" /> : <RefreshCw className="w-3.5 h-3.5 text-zinc-600 animate-spin" style={{ animationDuration: '4s' }} />}
                </div>
                <div className="mt-3">
                  <span className="text-lg font-black font-mono block text-white">{daysOfUse} / 1</span>
                  <span className="text-[10px] text-zinc-500 block">Dia de jornada ativa</span>
                </div>
              </div>
            </div>
          </div>

          {/* SIMULATION HELPER PANEL */}
          <div className="bg-zinc-900/20 border border-zinc-900/50 p-4 rounded-2xl border-dashed">
            <span className="text-[9px] font-bold text-amber-400 uppercase tracking-widest font-mono block mb-2">// PAINEL DE SIMULAÇÃO (PARA TESTES RÁPIDOS)</span>
            <p className="text-[11px] text-zinc-500 mb-3">
              Não quer esperar ou preencher as missões agora? Clique em qualquer botão abaixo para forçar o cumprimento imediato dos requisitos do app!
            </p>
            <div className="flex flex-wrap gap-2">
              <button 
                onClick={() => { playTypeSound(); onSimulateTasks(); }}
                className="bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-zinc-300 py-1.5 px-3 rounded-xl text-[10px] font-bold transition-all hover:border-amber-500/30 cursor-pointer active:scale-95"
              >
                ⚡ Simular 5 Tarefas Concluídas
              </button>
              <button 
                onClick={() => { playTypeSound(); onSimulateFunctions(); }}
                className="bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-zinc-300 py-1.5 px-3 rounded-xl text-[10px] font-bold transition-all hover:border-amber-500/30 cursor-pointer active:scale-95"
              >
                🎮 Simular Uso de Todas as Funções
              </button>
              <button 
                onClick={() => { playTypeSound(); onSimulateDays(); }}
                className="bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-zinc-300 py-1.5 px-3 rounded-xl text-[10px] font-bold transition-all hover:border-amber-500/30 cursor-pointer active:scale-95"
              >
                ⏳ Simular 1 Dia de Uso
              </button>
            </div>
          </div>

          {/* ALL PLAN BENEFITS LIST */}
          <div className="space-y-3">
            <h5 className="text-[10px] font-bold text-white uppercase tracking-wider font-mono">// VANTAGENS DO PLANO PREMIUM</h5>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex items-start gap-2.5 bg-zinc-900/20 p-3 rounded-xl border border-zinc-900 hover:border-zinc-850 transition-colors">
                <Brain className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <h6 className="font-bold text-white text-[11px]">Treinador Mental Inteligente IA</h6>
                  <p className="text-[10px] text-zinc-500 mt-0.5">Prompt de IA para quebrar a paralisia da procrastinação com metas rápidas de 1 minuto.</p>
                </div>
              </div>

              <div className="flex items-start gap-2.5 bg-zinc-900/20 p-3 rounded-xl border border-zinc-900 hover:border-zinc-850 transition-colors">
                <BarChart3 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <h6 className="font-bold text-white text-[11px]">Gráficos & Métricas Avançados</h6>
                  <p className="text-[10px] text-zinc-500 mt-0.5">Visualize estatísticas de XP, sequências de foco semanais e análise de produtividade.</p>
                </div>
              </div>

              <div className="flex items-start gap-2.5 bg-zinc-900/20 p-3 rounded-xl border border-zinc-900 hover:border-zinc-850 transition-colors">
                <Volume2 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <h6 className="font-bold text-white text-[11px]">Trilha Sonora & Sons de RPG</h6>
                  <p className="text-[10px] text-zinc-500 mt-0.5">Efeitos de feedback auditivos épicos, áudios imersivos de ambientação para acalmar a mente.</p>
                </div>
              </div>

              <div className="flex items-start gap-2.5 bg-zinc-900/20 p-3 rounded-xl border border-zinc-900 hover:border-zinc-850 transition-colors">
                <BookOpen className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <h6 className="font-bold text-white text-[11px]">Diário de Reflexões Ilimitado</h6>
                  <p className="text-[10px] text-zinc-500 mt-0.5">Registre suas reflexões emocionais pós-foco sem nenhuma restrição de espaço.</p>
                </div>
              </div>

              <div className="flex items-start gap-2.5 bg-zinc-900/20 p-3 rounded-xl border border-zinc-900 hover:border-zinc-850 transition-colors">
                <Trophy className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <h6 className="font-bold text-white text-[11px]">Insígnias & Conquistas Extras</h6>
                  <p className="text-[10px] text-zinc-500 mt-0.5">Títulos de herói customizados baseados no seu nível de foco, prontos para desbloquear.</p>
                </div>
              </div>

              <div className="flex items-start gap-2.5 bg-zinc-900/20 p-3 rounded-xl border border-zinc-900 hover:border-zinc-850 transition-colors">
                <Cloud className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <h6 className="font-bold text-white text-[11px]">Sincronização Nuvem Contínua</h6>
                  <p className="text-[10px] text-zinc-500 mt-0.5">Seus dados são sincronizados em tempo real na nuvem e locais de forma redundante e segura.</p>
                </div>
              </div>
            </div>
          </div>

          {/* PLAN SELECTOR & PRICING */}
          <div className="space-y-3">
            <h5 className="text-[10px] font-bold text-white uppercase tracking-wider font-mono">// ESCOLHA SUA JORNADA</h5>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Plan A: Monthly */}
              <button
                onClick={() => { playTypeSound(); setSelectedPlan('monthly'); }}
                className={`p-4 rounded-2xl border text-left flex flex-col justify-between cursor-pointer transition-all ${selectedPlan === 'monthly' ? 'bg-amber-950/20 border-amber-500/50 shadow-[0_0_15px_rgba(245,158,11,0.05)]' : 'bg-zinc-900/40 border-zinc-900 hover:border-zinc-800'}`}
              >
                <div className="flex justify-between items-start w-full">
                  <div>
                    <span className="text-[9px] font-mono font-bold text-amber-400 uppercase tracking-wider block">Assinatura</span>
                    <h6 className="font-black text-white text-sm mt-0.5">Plano Mensal Premium</h6>
                  </div>
                  <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${selectedPlan === 'monthly' ? 'border-amber-400 bg-amber-400' : 'border-zinc-750'}`}>
                    {selectedPlan === 'monthly' && <Check className="w-3 h-3 text-zinc-950 stroke-[3]" />}
                  </div>
                </div>
                <div className="mt-4">
                  <span className="text-xl font-black text-white font-mono">R$ 27,90</span>
                  <span className="text-zinc-500 text-[10px] ml-1">/ por mês</span>
                  <p className="text-[10px] text-zinc-500 mt-2 leading-snug">Cobrado mensalmente de forma automática. Cancele quando desejar sem custos ou multas.</p>
                </div>
              </button>

              {/* Plan B: Lifetime */}
              <button
                onClick={() => { playTypeSound(); setSelectedPlan('lifetime'); }}
                className={`p-4 rounded-2xl border text-left flex flex-col justify-between cursor-pointer transition-all relative overflow-hidden ${selectedPlan === 'lifetime' ? 'bg-amber-950/20 border-amber-500/50 shadow-[0_0_15px_rgba(245,158,11,0.05)]' : 'bg-zinc-900/40 border-zinc-900 hover:border-zinc-800'}`}
              >
                <div className="absolute top-0 right-0 bg-gradient-to-l from-amber-600 to-amber-500 text-zinc-950 text-[8px] font-black px-2.5 py-1 uppercase rounded-bl-xl tracking-wider font-mono">
                  Mais Popular ⭐
                </div>
                <div className="flex justify-between items-start w-full">
                  <div>
                    <span className="text-[9px] font-mono font-bold text-amber-400 uppercase tracking-wider block">Pagamento Único</span>
                    <h6 className="font-black text-white text-sm mt-0.5">Plano Vitalício Premium</h6>
                  </div>
                  <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${selectedPlan === 'lifetime' ? 'border-amber-400 bg-amber-400' : 'border-zinc-750'}`}>
                    {selectedPlan === 'lifetime' && <Check className="w-3 h-3 text-zinc-950 stroke-[3]" />}
                  </div>
                </div>
                <div className="mt-4">
                  <span className="text-xl font-black text-white font-mono">R$ 297,00</span>
                  <span className="text-zinc-500 text-[10px] ml-1">/ pagamento único</span>
                  <p className="text-[10px] text-zinc-500 mt-2 leading-snug">Pague uma única vez e tenha acesso irrestrito e permanente ao FocusOS para sempre.</p>
                </div>
              </button>
            </div>
          </div>

          {error && (
            <div className="bg-rose-950/30 border border-rose-900/40 p-3.5 rounded-xl text-rose-400 font-semibold text-[11px] animate-fade-in">
              ❌ {error}
            </div>
          )}

        </div>

        {/* FOOTER ACTIONS */}
        <div className="p-6 border-t border-zinc-900/60 bg-zinc-950/50 flex flex-col sm:flex-row items-center justify-between gap-4 shrink-0">
          <div className="text-left">
            <span className="text-[10px] text-zinc-500 block leading-none font-mono">Plano selecionado:</span>
            <span className="text-xs font-black text-white uppercase mt-1 block">
              {selectedPlan === 'monthly' ? 'Mensal (R$ 27,90/mês)' : 'Vitalício (R$ 297,00 único)'}
            </span>
          </div>

          <button
            onClick={handleCheckout}
            disabled={loading || !isEligible}
            className={`w-full sm:w-auto relative bg-gradient-to-r from-amber-600 via-yellow-600 to-amber-600 hover:from-amber-500 hover:to-yellow-500 disabled:opacity-40 disabled:pointer-events-none text-white font-extrabold py-3.5 px-8 rounded-2xl text-xs uppercase tracking-wider transition-all flex items-center justify-center space-x-2 shadow-[0_4px_25px_rgba(245,158,11,0.2)] hover:shadow-[0_4px_30px_rgba(245,158,11,0.35)] active:scale-95 cursor-pointer`}
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <CreditCard className="w-4 h-4 shrink-0" />
                <span>{isEligible ? 'Adquirir Foco Premium' : 'Desbloqueie Requisitos Primeiro'}</span>
                <ArrowRight className="w-4 h-4 shrink-0" />
              </>
            )}
          </button>
        </div>

        {/* LOCAL PAYMENT SANDBOX DIALOG OVERLAY */}
        <AnimatePresence>
          {showSandbox && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-zinc-950/98 backdrop-blur-md z-50 p-6 flex flex-col justify-center max-h-full overflow-y-auto"
            >
              <div className="max-w-md mx-auto w-full space-y-6">
                <div className="text-center space-y-2">
                  <div className="w-14 h-14 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-center justify-center mx-auto text-amber-400">
                    <CreditCard className="w-7 h-7 animate-pulse" />
                  </div>
                  <h4 className="text-sm font-black text-white uppercase tracking-tight">Stripe Sandbox Simulator</h4>
                  <p className="text-[11px] text-zinc-400">
                    Sua API da Stripe está em modo sandbox offline por falta de chaves em <code>.env</code>. <br />
                    Isto permite que você simule e teste o pagamento com segurança!
                  </p>
                </div>

                <div className="bg-zinc-900/50 border border-zinc-900 p-5 rounded-2xl space-y-4">
                  <div className="flex justify-between border-b border-zinc-900 pb-2">
                    <span className="text-zinc-500">Produto</span>
                    <span className="text-white font-bold">{selectedPlan === 'monthly' ? 'FocusOS Mensal' : 'FocusOS Vitalício'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Total a Pagar</span>
                    <span className="text-amber-400 font-mono font-black">{selectedPlan === 'monthly' ? 'R$ 27,90' : 'R$ 297,00'}</span>
                  </div>

                  {/* Mock Credit Card Fields */}
                  <div className="space-y-3 pt-2">
                    <div className="space-y-1">
                      <label htmlFor="card-number" className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest font-mono">Número do Cartão Simulado</label>
                      <input 
                        id="card-number"
                        type="text" 
                        placeholder="4242 4242 4242 4242"
                        value={sandboxCard}
                        onChange={(e) => { playTypeSound(); setSandboxCard(e.target.value); }}
                        className="w-full text-xs px-3.5 py-2.5 bg-zinc-950 border border-zinc-850 focus:border-amber-500 outline-hidden rounded-xl text-white placeholder-zinc-700 font-mono"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <label htmlFor="card-expiry" className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest font-mono">Expiração</label>
                        <input 
                          id="card-expiry"
                          type="text" 
                          placeholder="12/28" 
                          value={sandboxExpiry}
                          onChange={(e) => { playTypeSound(); setSandboxExpiry(e.target.value); }}
                          className="w-full text-xs px-3.5 py-2.5 bg-zinc-950 border border-zinc-850 focus:border-amber-500 outline-hidden rounded-xl text-white placeholder-zinc-700 font-mono"
                        />
                      </div>
                      <div className="space-y-1">
                        <label htmlFor="card-cvc" className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest font-mono">CVC</label>
                        <input 
                          id="card-cvc"
                          type="text" 
                          placeholder="123" 
                          value={sandboxCVC}
                          onChange={(e) => { playTypeSound(); setSandboxCVC(e.target.value); }}
                          className="w-full text-xs px-3.5 py-2.5 bg-zinc-950 border border-zinc-850 focus:border-amber-500 outline-hidden rounded-xl text-white placeholder-zinc-700 font-mono"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex space-x-2">
                  <button
                    onClick={() => { playTypeSound(); setShowSandbox(false); }}
                    className="flex-1 border border-zinc-800 hover:bg-zinc-900 text-zinc-400 hover:text-white py-3 rounded-xl text-xs font-bold transition-all active:scale-95 cursor-pointer"
                  >
                    Voltar
                  </button>
                  <button
                    onClick={handleConfirmSandboxPayment}
                    disabled={loading}
                    className="flex-1 bg-gradient-to-r from-amber-600 to-yellow-500 hover:from-amber-500 hover:to-yellow-400 text-white font-bold py-3 rounded-xl text-xs uppercase tracking-wider transition-all active:scale-95 shadow-[0_0_15px_rgba(245,158,11,0.2)] cursor-pointer"
                  >
                    {loading ? 'Confirmando...' : 'Confirmar Pagamento'}
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
