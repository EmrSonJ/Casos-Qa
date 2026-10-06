import React, { useRef } from 'react';
import { SuiteMetrics, TestCase } from '../types/qa';
import {
  ShieldCheck,
  Plus,
  Sparkles,
  FileText,
  Download,
  Upload,
  RotateCcw,
  FileSpreadsheet,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  Bug
} from 'lucide-react';

interface HeaderProps {
  metrics: SuiteMetrics;
  onNewCase: () => void;
  onOpenAiGenerator: () => void;
  onOpenReport: () => void;
  onExportCSV: () => void;
  onExportJSON: () => void;
  onImportJSON: (cases: TestCase[]) => void;
  onResetToSample: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  metrics,
  onNewCase,
  onOpenAiGenerator,
  onOpenReport,
  onExportCSV,
  onExportJSON,
  onImportJSON,
  onResetToSample
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (Array.isArray(parsed)) {
          onImportJSON(parsed);
          alert(`Se importaron exitosamente ${parsed.length} casos de prueba.`);
        } else {
          alert('El archivo no contiene un formato de casos de prueba válido.');
        }
      } catch (err) {
        alert('Error al leer el archivo JSON.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <header className="bg-slate-900 border-b border-slate-800 text-slate-100 shadow-md sticky top-0 z-30">
      {/* Top Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-4">
        {/* Brand & Subtitle */}
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-tr from-sky-600 to-indigo-600 text-white shadow-lg shadow-sky-950/60 flex items-center justify-center">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-black tracking-tight text-white flex items-center gap-1.5">
                QAFlow <span className="text-sky-400 font-semibold text-xs tracking-normal bg-sky-950 border border-sky-800 px-2 py-0.5 rounded-full">Pro Enterprise</span>
              </h1>
              <span className="text-[11px] font-mono text-slate-400 bg-slate-800 px-2 py-0.5 rounded">v2.5</span>
            </div>
            <p className="text-xs text-slate-400">
              Gestor de Casos de Prueba con Ejecución Paso a Paso y Evidencias Fotográficas
            </p>
          </div>
        </div>

        {/* Global Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={onOpenAiGenerator}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-indigo-950/80 hover:bg-indigo-900 text-indigo-300 border border-indigo-700/60 rounded-lg shadow-sm transition"
            title="Generar casos de prueba a partir de historias de usuario"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>Generar con IA</span>
          </button>

          <button
            type="button"
            onClick={onOpenReport}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 rounded-lg shadow-sm transition"
            title="Ver informe ejecutivo de certificación para stakeholders"
          >
            <FileText className="w-3.5 h-3.5 text-emerald-400" />
            <span>Informe Ejecutivo</span>
          </button>

          <button
            type="button"
            onClick={onExportCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 rounded-lg shadow-sm transition"
            title="Exportar matriz completa con pasos a CSV"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-amber-400" />
            <span>Exportar CSV</span>
          </button>

          {/* Backup dropdown / actions */}
          <div className="flex items-center bg-slate-800 border border-slate-700 rounded-lg overflow-hidden">
            <button
              type="button"
              onClick={onExportJSON}
              className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-750 transition"
              title="Descargar respaldo JSON de casos y evidencias"
            >
              <Download className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-750 border-l border-slate-700 transition"
              title="Importar casos desde archivo JSON"
            >
              <Upload className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={onResetToSample}
              className="p-1.5 text-slate-300 hover:text-rose-400 hover:bg-slate-750 border-l border-slate-700 transition"
              title="Restaurar casos de prueba de ejemplo"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
            <input
              type="file"
              ref={fileInputRef}
              accept=".json"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>

          <button
            type="button"
            onClick={onNewCase}
            className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold bg-sky-600 hover:bg-sky-500 text-white rounded-lg shadow-md shadow-sky-950 transition"
          >
            <Plus className="w-4 h-4" />
            <span>Nuevo Caso</span>
          </button>
        </div>
      </div>

      {/* Real-time QA Metrics Sub-bar */}
      <div className="bg-slate-950/70 border-t border-slate-800/80 px-4 sm:px-6 py-2.5">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4 text-xs">
          {/* Quick Metrics Badges */}
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-slate-400 font-medium">Total Casos:</span>
              <span className="font-mono font-bold text-white px-2 py-0.5 bg-slate-800 rounded">
                {metrics.total}
              </span>
            </div>

            <div className="flex items-center gap-1.5 text-emerald-400">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Aprobados:</span>
              <span className="font-mono font-bold bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-800/50">
                {metrics.passed}
              </span>
            </div>

            <div className="flex items-center gap-1.5 text-rose-400">
              <XCircle className="w-3.5 h-3.5" />
              <span>Fallidos:</span>
              <span className="font-mono font-bold bg-rose-950/60 px-1.5 py-0.5 rounded border border-rose-800/50">
                {metrics.failed}
              </span>
            </div>

            <div className="flex items-center gap-1.5 text-amber-400">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Bloqueados:</span>
              <span className="font-mono font-bold bg-amber-950/60 px-1.5 py-0.5 rounded border border-amber-800/50">
                {metrics.blocked}
              </span>
            </div>

            <div className="flex items-center gap-1.5 text-slate-400">
              <Clock className="w-3.5 h-3.5" />
              <span>Pendientes:</span>
              <span className="font-mono font-bold bg-slate-800 px-1.5 py-0.5 rounded">
                {metrics.untested}
              </span>
            </div>

            <div className="flex items-center gap-1.5 text-sky-400">
              <Bug className="w-3.5 h-3.5 text-rose-400" />
              <span>Defectos:</span>
              <span className="font-mono font-bold bg-rose-950/80 text-rose-300 px-1.5 py-0.5 rounded border border-rose-800/60">
                {metrics.totalDefects}
              </span>
            </div>
          </div>

          {/* Pass Rate Bar */}
          <div className="flex items-center gap-3">
            <span className="text-slate-400">Tasa de Aprobación:</span>
            <div className="w-32 bg-slate-800 rounded-full h-2.5 overflow-hidden border border-slate-700">
              <div
                className={`h-full transition-all duration-500 ${
                  metrics.passRate >= 80
                    ? 'bg-emerald-500'
                    : metrics.passRate >= 50
                    ? 'bg-amber-500'
                    : 'bg-rose-500'
                }`}
                style={{ width: `${metrics.passRate}%` }}
              />
            </div>
            <span className="font-mono font-black text-white text-xs">{metrics.passRate}%</span>
          </div>
        </div>
      </div>
    </header>
  );
};
