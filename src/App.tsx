import React, { useState, useEffect, useMemo } from 'react';
import { TestCase, StepEvidence } from './types/qa';
import {
  loadTestCasesFromStorage,
  saveTestCasesToStorage,
  calculateSuiteMetrics,
  exportTestCasesToCSV,
  exportTestCasesToJSON
} from './utils/storage';
import { INITIAL_TEST_CASES } from './data/sampleTestCases';
import { Header } from './components/Header';
import { TestCaseList } from './components/TestCaseList';
import { TestCaseEditor } from './components/TestCaseEditor';
import { TestExecutionRunner } from './components/TestExecutionRunner';
import { EvidenceModal } from './components/EvidenceModal';
import { ReportView } from './components/ReportView';
import { AITestCaseGeneratorModal } from './components/AITestCaseGeneratorModal';

export default function App() {
  const [testCases, setTestCases] = useState<TestCase[]>(() => loadTestCasesFromStorage());
  const [executingCase, setExecutingCase] = useState<TestCase | null>(null);
  const [editingCase, setEditingCase] = useState<TestCase | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState<boolean>(false);
  const [isAiGeneratorOpen, setIsAiGeneratorOpen] = useState<boolean>(false);
  const [isReportOpen, setIsReportOpen] = useState<boolean>(false);
  const [activeEvidence, setActiveEvidence] = useState<StepEvidence | null>(null);

  // Sync to local storage
  useEffect(() => {
    saveTestCasesToStorage(testCases);
  }, [testCases]);

  const metrics = useMemo(() => calculateSuiteMetrics(testCases), [testCases]);

  // Handlers
  const handleSaveCase = (newOrUpdatedCase: TestCase) => {
    setTestCases((prev) => {
      const exists = prev.some((c) => c.id === newOrUpdatedCase.id);
      if (exists) {
        return prev.map((c) => (c.id === newOrUpdatedCase.id ? newOrUpdatedCase : c));
      }
      return [newOrUpdatedCase, ...prev];
    });
    setEditingCase(null);
    setIsCreatingNew(false);
  };

  const handleDeleteCase = (id: string) => {
    setTestCases((prev) => prev.filter((c) => c.id !== id));
  };

  const handleDuplicateCase = (tc: TestCase) => {
    const clone: TestCase = {
      ...JSON.parse(JSON.stringify(tc)),
      id: `${tc.id}-CLONE-${Math.floor(100 + Math.random() * 900)}`,
      title: `${tc.title} (Copia)`,
      overallStatus: 'untested',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      steps: tc.steps.map((s) => ({
        ...s,
        status: 'untested',
        actualResult: '',
        defect: undefined
      }))
    };
    setTestCases((prev) => [clone, ...prev]);
  };

  const handleSaveRun = (completedCase: TestCase) => {
    setTestCases((prev) =>
      prev.map((c) => (c.id === completedCase.id ? completedCase : c))
    );
    setExecutingCase(null);
  };

  const handleResetToSample = () => {
    if (confirm('¿Deseas restaurar los casos de prueba de ejemplo? Esto reemplazará los datos actuales.')) {
      setTestCases(INITIAL_TEST_CASES);
      saveTestCasesToStorage(INITIAL_TEST_CASES);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-sky-500 selection:text-white">
      {/* Global Navigation & Metrics Bar */}
      <Header
        metrics={metrics}
        onNewCase={() => setIsCreatingNew(true)}
        onOpenAiGenerator={() => setIsAiGeneratorOpen(true)}
        onOpenReport={() => setIsReportOpen(true)}
        onExportCSV={() => exportTestCasesToCSV(testCases)}
        onExportJSON={() => exportTestCasesToJSON(testCases)}
        onImportJSON={(imported) => setTestCases(imported)}
        onResetToSample={handleResetToSample}
      />

      {/* Main Content Hub */}
      <main className="flex-1 max-w-7xl mx-auto w-full p-4 sm:p-6 space-y-6">
        {/* Hub Header Info Banner */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-sky-950/40 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1.5 max-w-2xl">
            <span className="text-[11px] font-bold text-sky-400 uppercase tracking-widest bg-sky-950 border border-sky-850 px-2.5 py-0.5 rounded-full">
              QA Management System • Suite Activa
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Diseño de Pruebas & Repositorio de Evidencias Paso a Paso
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              Define secuencias de validación con precondiciones, ejecuta pruebas interactivas y adjunta capturas de pantalla con atajo <kbd className="font-mono bg-slate-800 text-slate-200 px-1.5 py-0.5 rounded border border-slate-700">Ctrl+V</kbd>, registros de consola y payloads HTTP paso a paso.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3">
            <button
              type="button"
              onClick={() => setIsCreatingNew(true)}
              className="w-full sm:w-auto px-4 py-2.5 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-sky-950 transition flex items-center justify-center gap-2"
            >
              <span>+ Nuevo Caso de Prueba</span>
            </button>
            <button
              type="button"
              onClick={() => setIsAiGeneratorOpen(true)}
              className="w-full sm:w-auto px-4 py-2.5 bg-slate-800 hover:bg-slate-750 text-indigo-300 border border-indigo-900/60 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2"
            >
              <span>Asistente de Requisitos IA</span>
            </button>
          </div>
        </div>

        {/* Test Cases Table / List */}
        <TestCaseList
          testCases={testCases}
          onExecute={(tc) => setExecutingCase(tc)}
          onEdit={(tc) => setEditingCase(tc)}
          onDuplicate={handleDuplicateCase}
          onDelete={handleDeleteCase}
          onViewEvidence={(ev) => setActiveEvidence(ev)}
          onNewCase={() => setIsCreatingNew(true)}
        />
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-900/40 py-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-wrap items-center justify-between gap-2">
          <span>QAFlow Enterprise • Sistema de Aseguramiento de Calidad de Software</span>
          <span>Soporta adjuntos de imágenes con Ctrl+V, volcados de red JSON y generación de informes ejecutivos</span>
        </div>
      </footer>

      {/* Editor Modal (Create or Edit) */}
      {(isCreatingNew || editingCase) && (
        <TestCaseEditor
          initialCase={editingCase}
          onSave={handleSaveCase}
          onClose={() => {
            setIsCreatingNew(false);
            setEditingCase(null);
          }}
        />
      )}

      {/* Execution Runner Modal */}
      {executingCase && (
        <TestExecutionRunner
          testCase={executingCase}
          onSaveRun={handleSaveRun}
          onClose={() => setExecutingCase(null)}
          onViewEvidence={(ev) => setActiveEvidence(ev)}
        />
      )}

      {/* High-Resolution Evidence Lightbox */}
      {activeEvidence && (
        <EvidenceModal
          evidence={activeEvidence}
          onClose={() => setActiveEvidence(null)}
        />
      )}

      {/* Printable Executive QA Report */}
      {isReportOpen && (
        <ReportView
          testCases={testCases}
          metrics={metrics}
          onClose={() => setIsReportOpen(false)}
          onViewEvidence={(ev) => setActiveEvidence(ev)}
        />
      )}

      {/* AI Test Case Generator Modal */}
      {isAiGeneratorOpen && (
        <AITestCaseGeneratorModal
          onGenerate={(newCase) => {
            setTestCases((prev) => [newCase, ...prev]);
            setIsAiGeneratorOpen(false);
          }}
          onClose={() => setIsAiGeneratorOpen(false)}
        />
      )}
    </div>
  );
}
