import { useEffect, useRef, useState } from 'react';
import { X, Download, Copy, Check, Sparkles, Share2, HelpCircle, FileText } from 'lucide-react';
import { jsPDF } from 'jspdf';
import { Achievement } from '../types';

interface ShareCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  stats: {
    level: number;
    xp: number;
    streak: number;
    totalTasksCompleted?: number;
    totalFocusMinutes?: number;
  };
  xpNeeded: number;
  achievements: Achievement[];
}

export default function ShareCardModal({ isOpen, onClose, stats, xpNeeded, achievements }: ShareCardModalProps) {
  const [imgUrl, setImgUrl] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const [copySupported, setCopySupported] = useState<boolean>(true);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    // Render Canvas
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Enable high DPI rendering
    const width = 600;
    const height = 350;
    canvas.width = width;
    canvas.height = height;

    // Draw background gradient
    const grad = ctx.createLinearGradient(0, 0, width, height);
    grad.addColorStop(0, '#070913');
    grad.addColorStop(0.5, '#0c0f24');
    grad.addColorStop(1, '#13183a');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);

    // Draw tech background grid pattern
    ctx.strokeStyle = 'rgba(99, 102, 241, 0.05)';
    ctx.lineWidth = 1;
    const gridSize = 25;
    for (let x = 0; x < width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 0; y < height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // Draw abstract tech circle/rings in background for aesthetics
    ctx.strokeStyle = 'rgba(99, 102, 241, 0.1)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(width - 80, height / 2, 120, 0, Math.PI * 2);
    ctx.stroke();
    
    ctx.strokeStyle = 'rgba(245, 158, 11, 0.05)';
    ctx.beginPath();
    ctx.arc(width - 80, height / 2, 160, 0, Math.PI * 2);
    ctx.stroke();

    // Draw glowing orbit paths
    ctx.strokeStyle = 'rgba(99, 102, 241, 0.08)';
    ctx.setLineDash([5, 15]);
    ctx.beginPath();
    ctx.arc(80, height - 80, 200, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]); // Reset dash

    // Draw cyber borders / corners
    ctx.strokeStyle = 'rgba(99, 102, 241, 0.3)';
    ctx.lineWidth = 2;
    // Outer border
    ctx.strokeRect(15, 15, width - 30, height - 30);
    
    // Aesthetic corner brackets
    ctx.strokeStyle = '#6366f1';
    ctx.lineWidth = 4;
    const pad = 12;
    const len = 20;
    // Top-Left
    ctx.beginPath(); ctx.moveTo(pad, pad + len); ctx.lineTo(pad, pad); ctx.lineTo(pad + len, pad); ctx.stroke();
    // Top-Right
    ctx.beginPath(); ctx.moveTo(width - pad, pad + len); ctx.lineTo(width - pad, pad); ctx.lineTo(width - pad - len, pad); ctx.stroke();
    // Bottom-Left
    ctx.beginPath(); ctx.moveTo(pad, height - pad - len); ctx.lineTo(pad, height - pad); ctx.lineTo(pad + len, height - pad); ctx.stroke();
    // Bottom-Right
    ctx.beginPath(); ctx.moveTo(width - pad, height - pad - len); ctx.lineTo(width - pad, height - pad); ctx.lineTo(width - pad - len, height - pad); ctx.stroke();

    // Top HUD Bar Header
    ctx.fillStyle = 'rgba(99, 102, 241, 0.1)';
    ctx.fillRect(25, 25, width - 50, 30);
    
    ctx.font = 'bold 10px monospace, "JetBrains Mono", sans-serif';
    ctx.fillStyle = '#6366f1';
    ctx.fillText('FOCUS.OS // STATS REPORT', 40, 44);

    // Active Status Pulse Dot
    ctx.fillStyle = '#10b981';
    ctx.beginPath();
    ctx.arc(width - 55, 40, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.font = '9px monospace';
    ctx.fillStyle = '#10b981';
    ctx.fillText('LIVE', width - 45, 43);

    // Left Side: Level Badge Drawing
    // Rounded container for Level
    ctx.fillStyle = 'rgba(99, 102, 241, 0.15)';
    ctx.strokeStyle = 'rgba(99, 102, 241, 0.3)';
    ctx.lineWidth = 1.5;
    
    const bx = 45, by = 80, bw = 230, bh = 145;
    ctx.beginPath();
    ctx.roundRect ? ctx.roundRect(bx, by, bw, bh, 16) : ctx.rect(bx, by, bw, bh);
    ctx.fill();
    ctx.stroke();

    // Draw little details inside Level Badge
    ctx.font = 'bold 11px monospace, sans-serif';
    ctx.fillStyle = 'rgba(165, 180, 252, 0.8)';
    ctx.fillText('JORNADA DE PRESTÍGIO', bx + 20, by + 30);

    // Large Level Number
    ctx.font = 'black 64px system-ui, -apple-system, sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.fillText(`NÍVEL ${stats.level}`, bx + 16, by + 95);

    // Subtitle XP
    ctx.font = '11px monospace, sans-serif';
    ctx.fillStyle = 'rgba(165, 180, 252, 0.6)';
    ctx.fillText(`PROGRESSO: ${stats.xp} / ${xpNeeded} XP`, bx + 20, by + 124);

    // Right Side: Streak Metric Drawing
    const sx = 315, sy = 80, sw = 240, sh = 145;
    ctx.fillStyle = 'rgba(245, 158, 11, 0.08)';
    ctx.strokeStyle = 'rgba(245, 158, 11, 0.2)';
    ctx.beginPath();
    ctx.roundRect ? ctx.roundRect(sx, sy, sw, sh, 16) : ctx.rect(sx, sy, sw, sh);
    ctx.fill();
    ctx.stroke();

    // Icon / Label for Streak
    ctx.font = 'bold 11px monospace, sans-serif';
    ctx.fillStyle = 'rgba(253, 186, 116, 0.8)';
    ctx.fillText('SEQUÊNCIA DIÁRIA (STREAK)', sx + 20, sy + 30);

    // Streak Days Display
    ctx.font = 'black 54px system-ui, -apple-system, sans-serif';
    ctx.fillStyle = '#f59e0b';
    ctx.fillText(`${stats.streak} ${stats.streak === 1 ? 'DIA' : 'DIAS'}`, sx + 16, sy + 92);

    // Status label
    ctx.font = 'bold 10px monospace, sans-serif';
    ctx.fillStyle = 'rgba(253, 186, 116, 0.6)';
    ctx.fillText('FOGO ATIVO - MENTE EM HIPERFOCO', sx + 20, sy + 124);

    // Bottom Level Progress Bar in Canvas
    const pbx = 45, pby = 250, pbw = 510, pbh = 12;
    ctx.fillStyle = '#0f111a';
    ctx.beginPath();
    ctx.roundRect ? ctx.roundRect(pbx, pby, pbw, pbh, 6) : ctx.rect(pbx, pby, pbw, pbh);
    ctx.fill();

    const percent = Math.min(100, Math.max(3, (stats.xp / xpNeeded) * 100));
    ctx.fillStyle = '#6366f1';
    ctx.beginPath();
    ctx.roundRect ? ctx.roundRect(pbx, pby, (pbw * percent) / 100, pbh, 6) : ctx.rect(pbx, pby, (pbw * percent) / 100, pbh);
    ctx.fill();

    // Footer Info
    ctx.font = '9px monospace, sans-serif';
    ctx.fillStyle = 'rgba(165, 180, 252, 0.35)';
    ctx.fillText('FOCUS.OS - SEU RPG DE PRODUTIVIDADE E CONQUISTAS COGNITIVAS', 45, 290);
    ctx.fillText('NÃO PROCRASTINE. VENÇA O DIA.', 45, 305);

    // QR Code style decorative glyph
    ctx.fillStyle = 'rgba(99, 102, 241, 0.2)';
    ctx.fillRect(width - 85, 275, 40, 40);
    ctx.fillStyle = 'rgba(15, 17, 26, 0.9)';
    ctx.fillRect(width - 81, 279, 32, 32);
    // Draw micro tech dots
    ctx.fillStyle = '#6366f1';
    ctx.fillRect(width - 78, 282, 8, 8);
    ctx.fillRect(width - 63, 282, 8, 8);
    ctx.fillRect(width - 78, 297, 8, 8);
    ctx.fillRect(width - 69, 289, 5, 5);
    ctx.fillRect(width - 65, 299, 6, 6);

    // Export to img state so that the modal shows a crisp image element
    try {
      const url = canvas.toDataURL('image/png');
      setImgUrl(url);
    } catch (err) {
      console.error('Failed to export canvas image', err);
    }
  }, [isOpen, stats, xpNeeded]);

  const handleDownload = () => {
    if (!imgUrl) return;
    const link = document.createElement('a');
    link.download = `focus_os_nivel_${stats.level}_streak_${stats.streak}.png`;
    link.href = imgUrl;
    link.click();
  };

  const handleDownloadPDF = () => {
    if (!imgUrl) return;

    try {
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      // Draw dark cosmic background
      doc.setFillColor(7, 9, 19);
      doc.rect(0, 0, 210, 297, 'F');

      // Draw elegant neon cyber brackets on A4 page
      doc.setDrawColor(99, 102, 241);
      doc.setLineWidth(0.6);
      const p = 8;
      const l = 10;
      doc.line(p, p, p + l, p); doc.line(p, p, p, p + l);
      doc.line(210 - p, p, 210 - p - l, p); doc.line(210 - p, p, 210 - p, p + l);
      doc.line(p, 297 - p, p + l, 297 - p); doc.line(p, 297 - p, p, 297 - p - l);
      doc.line(210 - p, 297 - p, 210 - p - l, 297 - p); doc.line(210 - p, 297 - p, 210 - p, 297 - p - l);

      // PDF Header Banner
      doc.setFillColor(99, 102, 241, 0.1 * 255);
      doc.rect(15, 15, 180, 12, 'F');
      
      doc.setFont('courier', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(99, 102, 241);
      doc.text('FOCUS.OS // RELATORIO DE EVOLUCAO E DESEMPENHO', 22, 23);

      // Embedded Card PNG Image
      // 600x350 is 1.714 ratio, with width 180mm -> height is 105mm
      doc.addImage(imgUrl, 'PNG', 15, 32, 180, 105);

      // Detailed Stats Summary
      doc.setDrawColor(99, 102, 241, 0.25 * 255);
      doc.setLineWidth(0.4);
      doc.line(15, 147, 195, 147);

      doc.setFont('courier', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(245, 158, 11); // Amber
      doc.text('// COGNITIVE METRICS SUMMARY (METRICAS ATIVAS)', 15, 154);

      // Stats boxes
      doc.setFillColor(30, 41, 59, 0.2 * 255);
      doc.setDrawColor(99, 102, 241, 0.15 * 255);
      
      // Total Tasks Completed
      doc.rect(15, 160, 85, 28, 'FD');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(165, 180, 252);
      doc.text('TAREFAS CONCLUIDAS', 20, 169);
      doc.setFontSize(14);
      doc.setTextColor(255, 255, 255);
      doc.text(`${stats.totalTasksCompleted ?? 0}`, 20, 183);

      // Focus Minutes
      doc.rect(110, 160, 85, 28, 'FD');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(165, 180, 252);
      doc.text('MINUTOS DE HIPERFOCO', 115, 169);
      doc.setFontSize(14);
      doc.setTextColor(255, 255, 255);
      doc.text(`${stats.totalFocusMinutes ?? 0}m`, 115, 183);

      // Achievements section
      doc.setDrawColor(99, 102, 241, 0.25 * 255);
      doc.line(15, 198, 195, 198);

      doc.setFont('courier', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(165, 180, 252);
      doc.text('// CONQUISTAS DE PRESTIGIO (TROFEUS DESBLOQUEADOS)', 15, 205);

      const unlocked = achievements.filter(a => a.unlocked);
      let yOffset = 214;
      
      if (unlocked.length === 0) {
        doc.setFont('helvetica', 'italic');
        doc.setFontSize(9);
        doc.setTextColor(113, 113, 122);
        doc.text('Nenhuma conquista desbloqueada ainda. Complete missoes para ganhar trofeus!', 15, yOffset);
      } else {
        const itemsToPrint = unlocked.slice(0, 4);
        itemsToPrint.forEach((ach) => {
          doc.setFillColor(245, 158, 11);
          doc.rect(15, yOffset - 3, 2.5, 2.5, 'F');

          doc.setFont('helvetica', 'bold');
          doc.setFontSize(9);
          doc.setTextColor(255, 255, 255);
          doc.text(`${ach.title.toUpperCase()}`, 20, yOffset);

          doc.setFont('helvetica', 'normal');
          doc.setFontSize(8);
          doc.setTextColor(161, 161, 170);
          doc.text(`- ${ach.description} (+${ach.xpReward} XP)`, 20, yOffset + 4.5);

          yOffset += 11;
        });

        if (unlocked.length > 4) {
          doc.setFont('helvetica', 'italic');
          doc.setFontSize(8);
          doc.setTextColor(99, 102, 241);
          doc.text(`E mais ${unlocked.length - 4} conquistas de prestigio registradas no FocusOS.`, 20, yOffset);
        }
      }

      // Footer
      doc.setFillColor(99, 102, 241, 0.1 * 255);
      doc.rect(15, 275, 180, 8, 'F');
      doc.setFont('courier', 'normal');
      doc.setFontSize(7);
      doc.setTextColor(99, 102, 241);
      doc.text('SISTEMA FOCUS.OS VERIFICADO. RELATORIO EXPORTADO EM SEGURANCA.', 20, 280.5);

      doc.save(`focus_os_resumo_nivel_${stats.level}.pdf`);
    } catch (err) {
      console.error('Failed to export PDF', err);
    }
  };

  const handleCopy = async () => {
    if (!imgUrl) return;
    try {
      const response = await fetch(imgUrl);
      const blob = await response.blob();
      await navigator.clipboard.write([
        new ClipboardItem({
          'image/png': blob
        })
      ]);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.warn('Clipboard write failed or not supported in this environment', err);
      setCopySupported(false);
      // Fallback: download automatically
      handleDownload();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-zinc-950/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-zinc-950 border border-zinc-850 rounded-3xl p-5 sm:p-6 max-w-xl w-full shadow-2xl relative flex flex-col max-h-[90vh] overflow-hidden animate-scale-up">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-900 pb-3 mb-4 shrink-0">
          <div className="flex items-center space-x-2">
            <div className="bg-indigo-950/80 p-1.5 rounded-lg text-indigo-400">
              <Sparkles className="w-4 h-4 animate-pulse" />
            </div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">Compartilhar Progresso</h4>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-500 hover:text-white p-1 transition-colors rounded-lg hover:bg-zinc-900"
            title="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-4 text-center">
          <p className="text-xs text-zinc-400 max-w-md mx-auto leading-relaxed">
            Compartilhe sua sequência de hábitos e nível com seus amigos! Salve a imagem ou copie para a área de transferência.
          </p>

          {/* Hidden Canvas used for high-fidelity generation */}
          <canvas ref={canvasRef} className="hidden" />

          {/* Styled crisp responsive image preview */}
          {imgUrl ? (
            <div className="relative group border border-zinc-850/60 rounded-2xl overflow-hidden bg-[#070913] p-1 shadow-inner max-w-md mx-auto aspect-[600/350]">
              <img
                src={imgUrl}
                alt="Card de Estatísticas Focus.OS"
                className="w-full h-auto rounded-xl object-contain shadow-2xl transition-all group-hover:scale-[1.01]"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-x-0 bottom-3 flex justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                <span className="bg-zinc-950/90 text-[10px] text-zinc-300 px-2.5 py-1 rounded-full border border-zinc-800">
                  Pressione e segure para salvar no celular
                </span>
              </div>
            </div>
          ) : (
            <div className="w-full max-w-md mx-auto aspect-[600/350] bg-zinc-900/40 rounded-2xl flex items-center justify-center border border-dashed border-zinc-800">
              <div className="text-zinc-500 text-xs animate-pulse">Renderizando card estético...</div>
            </div>
          )}

          {/* Mobile Info tip */}
          <p className="text-[10px] text-zinc-500 max-w-xs mx-auto italic sm:hidden">
            Dica: Você também pode tocar e segurar na imagem acima para salvá-la diretamente em suas fotos.
          </p>
        </div>

        {/* Action Buttons Footer */}
        <div className="mt-5 pt-4 border-t border-zinc-900 flex flex-col sm:flex-row gap-2 shrink-0">
          <button
            onClick={onClose}
            className="sm:flex-1 border border-zinc-850 hover:bg-zinc-900 text-zinc-500 hover:text-white font-bold py-2 sm:py-2.5 rounded-xl text-[11px] transition-all active:scale-95 flex items-center justify-center min-h-[44px]"
          >
            Fechar
          </button>
          
          <button
            onClick={handleCopy}
            className="sm:flex-1 bg-zinc-900 hover:bg-zinc-850 border border-zinc-850 hover:border-indigo-500/30 text-white font-bold py-2 sm:py-2.5 rounded-xl text-[11px] transition-all active:scale-95 flex items-center justify-center gap-1.5 min-h-[44px]"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">Copiado!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-indigo-400" />
                <span>{copySupported ? 'Copiar Imagem' : 'Copiar'}</span>
              </>
            )}
          </button>

          <button
            onClick={handleDownload}
            className="sm:flex-1 bg-zinc-900 hover:bg-indigo-950/40 border border-zinc-850 hover:border-indigo-500/40 text-indigo-300 font-bold py-2 sm:py-2.5 rounded-xl text-[11px] transition-all active:scale-95 flex items-center justify-center gap-1.5 min-h-[44px]"
          >
            <Download className="w-3.5 h-3.5 text-indigo-400" />
            <span>Baixar PNG</span>
          </button>

          <button
            onClick={handleDownloadPDF}
            className="sm:flex-1 bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2 sm:py-2.5 rounded-xl text-[11px] transition-all active:scale-95 flex items-center justify-center gap-1.5 min-h-[44px] shadow-[0_0_15px_rgba(79,70,229,0.3)]"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Baixar PDF</span>
          </button>
        </div>

      </div>
    </div>
  );
}
