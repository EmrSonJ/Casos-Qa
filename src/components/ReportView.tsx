import React from 'react';
import { TestCase, SuiteMetrics, StepEvidence } from '../types/qa';
import {
  Printer,
  X,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  MinusCircle,
  ShieldCheck,
  Bug,
  Image as ImageIcon,
  FileText
} from 'lucide-react';

interface ReportViewProps {
  testCases: TestCase[];
  metrics: SuiteMetrics;
  onClose: () => void;
  onViewEvidence: (evidence: StepEvidence) => void;
}

export const ReportView: React.FC<ReportViewProps> = ({
  testCases,
  metrics,
  onClose,
  onViewEvidence
}) => {
  const currentDate = new Date().toLocaleDateString('es-ES', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950 flex flex-col overflow-y-auto text-slate-100 print:bg-white print:text-black print:overflow-visible">
      {/* Top action bar - Hidden when printing */}
      <div className="bg-slate-900 border-b border-slate-800 px-6 py-4 flex items-center justify-between sticky top-0 z-10 print:hidden">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-lg">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">Informe Ejecutivo de Calidad & Evidencias QA</h2>
            <p className="text-xs text-slate-400">
              Certificación de ejecución y matriz de trazabilidad con evidencias adjuntas
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-xs font-semibold shadow transition"
          >
            <Printer className="w-4 h-4" />
            Imprimir / Guardar como PDF
          </button>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Printable Report Canvas */}
      <div className="max-w-5xl mx-auto w-full p-8 space-y-8 print:p-0 print:max-w-full">
        {/* Report Header */}
        <div className="border-b border-slate-800 pb-6 print:border-black flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-bold px-2 py-0.5 rounded bg-sky-500/10 text-sky-400 border border-sky-500/30 print:bg-transparent print:border-black print:text-black">
                REPORTE DE CERTIFICACIÓN QA
              </span>
              <span className="text-xs text-slate-400 print:text-gray-600 font-mono">
                BUILD #2026.10-PROD
              </span>
            </div>
            <h1 className="text-2xl font-black tracking-tight text-white print:text-black">
              Dictamen de Calidad de Software & Ejecución de Pruebas
            </h1>
            <p className="text-sm text-slate-300 print:text-gray-700 mt-1">
              Registro auditado de casos de prueba, resultados obtenidos y archivo probatorio de evidencias.
            </p>
          </div>

          <div className="text-right text-xs text-slate-400 print:text-gray-600">
            <p className="font-semibold text-slate-200 print:text-black">Fecha de Certificación:</p>
            <p className="capitalize">{currentDate}</p>
            <p className="mt-1">Auditor: QA Lead / Engineering Team</p>
          </div>
        </div>

        {/* Executive Summary Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 print:grid-cols-4">
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 print:border-gray-300 print:bg-gray-50">
            <span className="text-xs font-medium text-slate-400 print:text-gray-600">Tasa de Éxito (Pass Rate)</span>
            <div className="text-2xl font-black text-emerald-400 print:text-emerald-700 mt-1">
              {metrics.passRate}%
            </div>
            <span className="text-[11px] text-slate-500 print:text-gray-500">{metrics.passed} de {metrics.total} casos aprobados</span>
          </div>

          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 print:border-gray-300 print:bg-gray-50">
            <span className="text-xs font-medium text-slate-400 print:text-gray-600">Defectos Detectados</span>
            <div className="text-2xl font-black text-rose-400 print:text-rose-700 mt-1">
              {metrics.totalDefects}
            </div>
            <span className="text-[11px] text-slate-500 print:text-gray-500">{metrics.failed} casos con fallas críticas</span>
          </div>

          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 print:border-gray-300 print:bg-gray-50">
            <span className="text-xs font-medium text-slate-400 print:text-gray-600">Evidencias Adjuntas</span>
            <div className="text-2xl font-black text-sky-400 print:text-sky-700 mt-1">
              {metrics.totalEvidences}
            </div>
            <span className="text-[11px] text-slate-500 print:text-gray-500">Capturas, logs y payloads</span>
          </div>

          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 print:border-gray-300 print:bg-gray-50">
            <span className="text-xs font-medium text-slate-400 print:text-gray-600">Estado Global Suite</span>
            <div className="text-base font-bold text-white print:text-black mt-2">
              {metrics.failed > 0 ? 'CON RECHAZOS (REJECTED)' : 'APROBADA (READY)'}
            </div>
            <span className="text-[11px] text-slate-500 print:text-gray-500">
              {metrics.blocked} bloqueados • {metrics.untested} pendientes
            </span>
          </div>
        </div>

        {/* Detailed Test Cases Table with Steps & Evidence */}
        <div className="space-y-6">
          <h3 className="text-base font-bold text-white print:text-black border-b border-slate-800 print:border-black pb-2">
            Desglose Pormenorizado de Casos y Evidencias Paso a Paso
          </h3>

          {testCases.map((tc) => (
            <div
              key={tc.id}
              className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 space-y-4 break-inside-avoid print:border-gray-400 print:bg-white"
            >
              {/* Case Header */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 print:border-gray-300 pb-3">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs font-bold px-2 py-1 bg-slate-800 text-sky-400 rounded print:bg-gray-200 print:text-black">
                    {tc.id}
                  </span>
                  <div>
                    <h4 className="text-sm font-bold text-white print:text-black">{tc.title}</h4>
                    <span className="text-xs text-slate-400 print:text-gray-600">
                      Módulo: {tc.suite} • Prioridad: {tc.priority.toUpperCase()} • Tipo: {tc.type}
                    </span>
                  </div>
                </div>

                <div>
                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase ${
                      tc.overallStatus === 'passed'
                        ? 'bg-emerald-500/20 text-emerald-400 print:bg-emerald-100 print:text-emerald-800'
                        : tc.overallStatus === 'failed'
                        ? 'bg-rose-500/20 text-rose-400 print:bg-rose-100 print:text-rose-800'
                        : 'bg-amber-500/20 text-amber-400 print:bg-amber-100 print:text-amber-800'
                    }`}
                  >
                    {tc.overallStatus === 'passed' && <CheckCircle2 className="w-3.5 h-3.5" />}
                    {tc.overallStatus === 'failed' && <XCircle className="w-3.5 h-3.5" />}
                    {tc.overallStatus}
                  </span>
                </div>
              </div>

              {/* Steps Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800 print:border-gray-300 text-slate-400 print:text-gray-600 font-semibold">
                      <th className="py-2 px-2 w-10">#</th>
                      <th className="py-2 px-3 w-1/3">Acción del Paso & Datos</th>
                      <th className="py-2 px-3 w-1/4">Resultado Esperado</th>
                      <th className="py-2 px-3 w-1/4">Resultado Obtenido</th>
                      <th className="py-2 px-2 text-center w-20">Estado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 print:divide-gray-200">
                    {tc.steps.map((step) => (
                      <React.Fragment key={step.id}>
                        <tr className="align-top hover:bg-slate-800/30 print:hover:bg-transparent">
                          <td className="py-3 px-2 font-mono font-bold text-slate-400 print:text-gray-700">
                            {step.stepNumber}
                          </td>
                          <td className="py-3 px-3 space-y-1">
                            <p className="text-slate-200 print:text-black font-medium">{step.action}</p>
                            {step.testData && (
                              <p className="font-mono text-[11px] text-amber-400 print:text-amber-800">
                                Datos: {step.testData}
                              </p>
                            )}
                          </td>
                          <td className="py-3 px-3 text-slate-300 print:text-gray-700">
                            {step.expectedResult}
                          </td>
                          <td className="py-3 px-3 text-slate-300 print:text-gray-700">
                            {step.actualResult || (
                              <span className="italic text-slate-500 print:text-gray-400">Sin registrar</span>
                            )}
                          </td>
                          <td className="py-3 px-2 text-center">
                            <span
                              className={`inline-block px-2 py-0.5 rounded text-[11px] font-bold ${
                                step.status === 'passed'
                                  ? 'bg-emerald-950 text-emerald-300 print:bg-emerald-100 print:text-emerald-800'
                                  : step.status === 'failed'
                                  ? 'bg-rose-950 text-rose-300 print:bg-rose-100 print:text-rose-800'
                                  : 'bg-slate-800 text-slate-400 print:bg-gray-100 print:text-gray-800'
                              }`}
                            >
                              {step.status}
                            </span>
                          </td>
                        </tr>

                        {/* Evidences and Defect Row if exists */}
                        {(step.evidences.length > 0 || step.defect) && (
                          <tr className="bg-slate-950/40 print:bg-gray-50 border-b border-slate-800/40">
                            <td colSpan={5} className="py-2.5 px-4 space-y-2">
                              {/* Evidences list */}
                              {step.evidences.length > 0 && (
                                <div className="space-y-1.5">
                                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block print:text-gray-600">
                                    Evidencias Adjuntas ({step.evidences.length}):
                                  </span>
                                  <div className="flex flex-wrap gap-2">
                                    {step.evidences.map((ev) => (
                                      <div
                                        key={ev.id}
                                        onClick={() => onViewEvidence(ev)}
                                        className="flex items-center gap-2 p-1.5 bg-slate-900 border border-slate-800 rounded hover:border-sky-500 cursor-pointer transition print:border-gray-300 print:bg-white"
                                      >
                                        {ev.type === 'screenshot' && ev.dataUrl ? (
                                          <img
                                            src={ev.dataUrl}
                                            alt={ev.name}
                                            className="w-10 h-7 object-cover rounded bg-slate-950"
                                          />
                                        ) : (
                                          <div className="w-8 h-7 bg-amber-950/60 rounded flex items-center justify-center text-amber-400">
                                            <FileText className="w-4 h-4" />
                                          </div>
                                        )}
                                        <div className="text-[11px] max-w-[200px]">
                                          <p className="truncate font-medium text-slate-200 print:text-black">
                                            {ev.name}
                                          </p>
                                          <p className="text-[9px] text-slate-500 print:text-gray-500">
                                            {ev.timestamp}
                                          </p>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* Defect note */}
                              {step.defect && (
                                <div className="p-2 bg-rose-950/40 border border-rose-900/60 rounded text-rose-200 text-xs print:bg-rose-50 print:border-rose-300 print:text-rose-900 flex items-start gap-2">
                                  <Bug className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
                                  <div>
                                    <span className="font-bold">
                                      Defecto {step.defect.id} [{step.defect.severity.toUpperCase()}]:
                                    </span>{' '}
                                    {step.defect.title} - {step.defect.description}
                                  </div>
                                </div>
                              )}
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>

        {/* Sign-off footer */}
        <div className="border-t border-slate-800 print:border-gray-400 pt-6 grid grid-cols-2 gap-8 text-xs text-slate-400 print:text-gray-700">
          <div>
            <p className="font-bold text-slate-200 print:text-black">Firma Lead QA Automation:</p>
            <div className="mt-8 border-b border-dashed border-slate-700 print:border-gray-400 w-48"></div>
            <p className="mt-1">Ing. Lead QA & Release Manager</p>
          </div>
          <div>
            <p className="font-bold text-slate-200 print:text-black">Visto Bueno Product Owner:</p>
            <div className="mt-8 border-b border-dashed border-slate-700 print:border-gray-400 w-48"></div>
            <p className="mt-1">Certificación para despliegue en Producción</p>
          </div>
        </div>
      </div>
    </div>
  );
};
