import React, { useState } from 'react';
import { TestCase } from '../types/qa';
import { generateTestCaseFromRequirement } from '../utils/aiGenerator';
import { Sparkles, X, Wand2, CheckCircle2, FileText, Layers } from 'lucide-react';

interface AITestCaseGeneratorModalProps {
  onGenerate: (newCase: TestCase) => void;
  onClose: () => void;
}

export const AITestCaseGeneratorModal: React.FC<AITestCaseGeneratorModalProps> = ({
  onGenerate,
  onClose
}) => {
  const [requirement, setRequirement] = useState('');
  const [suite, setSuite] = useState('Autenticación & Seguridad');
  const [type, setType] = useState<'functional' | 'security' | 'regression' | 'api'>('functional');
  const [priority, setPriority] = useState<'critical' | 'high' | 'medium' | 'low'>('high');
  const [isGenerating, setIsGenerating] = useState(false);

  const presets = [
    {
      title: 'Recuperación de Clave por SMS',
      desc: 'Como usuario quiero restablecer mi contraseña mediante un código OTP enviado por SMS a mi móvil.',
      suite: 'Autenticación & Seguridad',
      type: 'functional' as const,
      priority: 'high' as const
    },
    {
      title: 'Carga de Comprobante PDF / Foto',
      desc: 'Validar la subida de archivos adjuntos permitiendo solo PDF/PNG menores a 5MB con antivirus en gateway.',
      suite: 'Documentos & Archivos',
      type: 'security' as const,
      priority: 'critical' as const
    },
    {
      title: 'Flujo de Checkout con Apple Pay',
      desc: 'Comprobar el botón de pago rápido con Apple Pay desde Safari móvil y validar webhook de confirmación.',
      suite: 'Pasarela de Pagos',
      type: 'functional' as const,
      priority: 'high' as const
    }
  ];

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!requirement.trim()) return;

    setIsGenerating(true);
    try {
      const generated = await generateTestCaseFromRequirement({
        requirement: requirement.trim(),
        suite,
        type,
        priority,
        author: 'Generador Inteligente QA'
      });
      onGenerate(generated);
    } catch (err) {
      console.error(err);
      alert('Error al generar el caso de prueba.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleApplyPreset = (p: typeof presets[0]) => {
    setRequirement(p.desc);
    setSuite(p.suite);
    setType(p.type);
    setPriority(p.priority);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-xl shadow-2xl max-w-2xl w-full p-6 space-y-5 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Generador Inteligente de Casos de Prueba</h3>
              <p className="text-xs text-slate-400">
                Convierte una Historia de Usuario o Criterio de Aceptación en pasos de prueba verificables.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Presets */}
        <div className="space-y-1.5">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Plantillas rápidas de ejemplo:
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {presets.map((p, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handleApplyPreset(p)}
                className="text-left p-2.5 bg-slate-950/60 hover:bg-slate-800 border border-slate-800 hover:border-indigo-500/60 rounded-lg transition text-xs space-y-1"
              >
                <p className="font-semibold text-indigo-300">{p.title}</p>
                <p className="text-[11px] text-slate-400 line-clamp-2">{p.desc}</p>
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleGenerate} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-200 mb-1">
              Historia de Usuario o Requisito Funcional *
            </label>
            <textarea
              rows={4}
              value={requirement}
              onChange={(e) => setRequirement(e.target.value)}
              placeholder="Ej: Como usuario comprador quiero aplicar un cupón de 15% de descuento en el carrito y verificar que no se acumule con promociones bancarias existentes..."
              className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-indigo-500"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Suite / Módulo</label>
              <input
                type="text"
                value={suite}
                onChange={(e) => setSuite(e.target.value)}
                className="w-full px-3 py-1.5 text-xs bg-slate-950 border border-slate-700 rounded-lg text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Tipo de Prueba</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as any)}
                className="w-full px-2.5 py-1.5 text-xs bg-slate-950 border border-slate-700 rounded-lg text-white"
              >
                <option value="functional">Funcional</option>
                <option value="security">Seguridad</option>
                <option value="regression">Regresión</option>
                <option value="api">API</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Prioridad</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as any)}
                className="w-full px-2.5 py-1.5 text-xs bg-slate-950 border border-slate-700 rounded-lg text-white"
              >
                <option value="critical">Crítica (P1)</option>
                <option value="high">Alta (P2)</option>
                <option value="medium">Media (P3)</option>
                <option value="low">Baja (P4)</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white bg-slate-800 rounded-lg"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isGenerating || !requirement.trim()}
              className="flex items-center gap-2 px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 rounded-lg shadow-lg shadow-indigo-950 transition"
            >
              <Wand2 className="w-4 h-4" />
              {isGenerating ? 'Generando pasos...' : 'Generar Caso Paso a Paso'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
