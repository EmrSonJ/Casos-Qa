import React, { useState } from 'react';
import { StepEvidence } from '../types/qa';
import { X, Download, Copy, Check, ZoomIn, ZoomOut, Maximize2, FileText, Image as ImageIcon } from 'lucide-react';

interface EvidenceModalProps {
  evidence: StepEvidence | null;
  onClose: () => void;
}

export const EvidenceModal: React.FC<EvidenceModalProps> = ({ evidence, onClose }) => {
  const [zoom, setZoom] = useState(1);
  const [copied, setCopied] = useState(false);

  if (!evidence) return null;

  const handleCopy = () => {
    if (evidence.textContent) {
      navigator.clipboard.writeText(evidence.textContent);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownload = () => {
    if (evidence.dataUrl) {
      const a = document.createElement('a');
      a.href = evidence.dataUrl;
      a.download = evidence.name || 'evidencia_qa.png';
      document.body.appendChild(a);
      a.click();
      a.remove();
    } else if (evidence.textContent) {
      const blob = new Blob([evidence.textContent], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = evidence.name || 'log_evidencia_qa.txt';
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-xl shadow-2xl max-w-5xl w-full max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center gap-3">
            {evidence.type === 'screenshot' ? (
              <div className="p-2 rounded-lg bg-sky-500/10 text-sky-400 border border-sky-500/20">
                <ImageIcon className="w-5 h-5" />
              </div>
            ) : (
              <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <FileText className="w-5 h-5" />
              </div>
            )}
            <div>
              <h3 className="text-base font-semibold text-white tracking-wide">{evidence.name}</h3>
              <p className="text-xs text-slate-400">
                Registrado: {evidence.timestamp} {evidence.fileSize ? `• ${evidence.fileSize}` : ''}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {evidence.type === 'screenshot' && (
              <div className="flex items-center bg-slate-800 rounded-lg p-1 border border-slate-700">
                <button
                  type="button"
                  onClick={() => setZoom(prev => Math.max(0.5, prev - 0.25))}
                  className="p-1.5 text-slate-400 hover:text-white rounded hover:bg-slate-700 transition"
                  title="Alejar"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>
                <span className="px-2 text-xs font-mono text-slate-300">{Math.round(zoom * 100)}%</span>
                <button
                  type="button"
                  onClick={() => setZoom(prev => Math.min(2.5, prev + 0.25))}
                  className="p-1.5 text-slate-400 hover:text-white rounded hover:bg-slate-700 transition"
                  title="Acercar"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setZoom(1)}
                  className="p-1.5 text-slate-400 hover:text-white rounded hover:bg-slate-700 transition ml-1"
                  title="Restablecer Zoom"
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {evidence.textContent && (
              <button
                type="button"
                onClick={handleCopy}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copiado' : 'Copiar'}
              </button>
            )}

            <button
              type="button"
              onClick={handleDownload}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition"
            >
              <Download className="w-3.5 h-3.5" />
              Descargar
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition ml-2"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-auto p-6 bg-slate-950 flex flex-col items-center justify-center min-h-[400px]">
          {evidence.type === 'screenshot' && evidence.dataUrl ? (
            <div className="overflow-auto max-w-full max-h-[70vh] flex items-center justify-center p-2 rounded-lg border border-slate-800 bg-slate-900/40">
              <img
                src={evidence.dataUrl}
                alt={evidence.name}
                style={{ transform: `scale(${zoom})`, transformOrigin: 'center center' }}
                className="transition-transform duration-150 max-w-full object-contain rounded shadow-lg"
              />
            </div>
          ) : (
            <div className="w-full max-h-[65vh] overflow-auto bg-slate-900/90 rounded-lg p-4 border border-slate-800 font-mono text-xs text-sky-300 whitespace-pre-wrap leading-relaxed shadow-inner">
              {evidence.textContent || '// Sin contenido disponible'}
            </div>
          )}

          {evidence.notes && (
            <div className="w-full mt-4 p-3 bg-slate-900/60 border border-slate-800/80 rounded-lg text-xs text-slate-300">
              <span className="font-semibold text-slate-400 uppercase tracking-wider text-[10px] mr-2">Nota del Tester:</span>
              {evidence.notes}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
