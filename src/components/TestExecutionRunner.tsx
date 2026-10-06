import React, { useState, useEffect } from 'react';
import { TestCase, TestStep, TestStatus, StepEvidence, DefectReport } from '../types/qa';
import { StepEvidenceManager } from './StepEvidenceManager';
import {
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  MinusCircle,
  Clock,
  Bug,
  Save,
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  Sparkles,
  ShieldCheck,
  Check
} from 'lucide-react';

interface TestExecutionRunnerProps {
  testCase: TestCase;
  onSaveRun: (updatedCase: TestCase) => void;
  onClose: () => void;
  onViewEvidence: (evidence: StepEvidence) => void;
}

export const TestExecutionRunner: React.FC<TestExecutionRunnerProps> = ({
  testCase,
  onSaveRun,
  onClose,
  onViewEvidence
}) => {
  const [steps, setSteps] = useState<TestStep[]>(JSON.parse(JSON.stringify(testCase.steps)));
  const [activeStepIndex, setActiveStepIndex] = useState<number>(0);
  const [timerSeconds, setTimerSeconds] = useState<number>(testCase.executionDurationSecs || 0);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(true);
  const [notes, setNotes] = useState<string>('');

  // Execution timer
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerRunning]);

  const formatTimer = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Keyboard shortcut listener for Ctrl+V paste globally into the active step
  useEffect(() => {
    const handleGlobalPaste = (e: ClipboardEvent) => {
      if (!e.clipboardData || !e.clipboardData.items) return;
      
      const items = e.clipboardData.items;
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          const file = items[i].getAsFile();
          if (!file) continue;

          const reader = new FileReader();
          reader.onload = (event) => {
            const dataUrl = event.target?.result as string;
            const newEv: StepEvidence = {
              id: `ev-paste-auto-${Date.now()}`,
              type: 'screenshot',
              name: `Evidencia_Paso_${activeStepIndex + 1}_${new Date().toLocaleTimeString().replace(/:/g, '-')}.png`,
              dataUrl,
              fileSize: `${(file.size / 1024).toFixed(1)} KB`,
              timestamp: new Date().toLocaleTimeString(),
              notes: `Captura pegada en Paso ${activeStepIndex + 1}`
            };

            setSteps((prevSteps) => {
              const updated = [...prevSteps];
              const target = updated[activeStepIndex];
              if (target) {
                target.evidences = [...(target.evidences || []), newEv];
              }
              return updated;
            });
          };
          reader.readAsDataURL(file);
          break;
        }
      }
    };

    window.addEventListener('paste', handleGlobalPaste);
    return () => window.removeEventListener('paste', handleGlobalPaste);
  }, [activeStepIndex]);

  // Update step status
  const handleSetStepStatus = (index: number, status: TestStatus) => {
    setSteps((prev) => {
      const copy = [...prev];
      copy[index] = {
        ...copy[index],
        status,
        executedAt: new Date().toISOString()
      };

      // If status is passed and actualResult is empty, auto-fill standard confirmation
      if (status === 'passed' && !copy[index].actualResult) {
        copy[index].actualResult = 'Comportamiento observado conforme al resultado esperado.';
      }

      // If failed and no defect report yet, initialize defect template
      if (status === 'failed' && !copy[index].defect) {
        copy[index].defect = {
          id: `BUG-${Math.floor(1000 + Math.random() * 9000)}`,
          title: `Fallo en Paso ${index + 1}: ${copy[index].action.substring(0, 50)}...`,
          severity: 'critical',
          description: `Discrepancia entre resultado esperado ("${copy[index].expectedResult}") y resultado obtenido.`,
          timestamp: new Date().toISOString()
        };
      }

      return copy;
    });

    // Auto-advance to next step if not last
    if (index < steps.length - 1 && status === 'passed') {
      setActiveStepIndex(index + 1);
    }
  };

  const handleUpdateStepActualResult = (index: number, val: string) => {
    setSteps((prev) => {
      const copy = [...prev];
      copy[index].actualResult = val;
      return copy;
    });
  };

  const handleUpdateStepEvidences = (index: number, newEvidences: StepEvidence[]) => {
    setSteps((prev) => {
      const copy = [...prev];
      copy[index].evidences = newEvidences;
      return copy;
    });
  };

  const handleUpdateDefect = (index: number, defect: DefectReport | undefined) => {
    setSteps((prev) => {
      const copy = [...prev];
      copy[index].defect = defect;
      return copy;
    });
  };

  // Derive overall status from steps
  const deriveOverallStatus = (): TestStatus => {
    const hasFailed = steps.some((s) => s.status === 'failed');
    if (hasFailed) return 'failed';

    const hasBlocked = steps.some((s) => s.status === 'blocked');
    if (hasBlocked) return 'blocked';

    const allPassedOrSkipped = steps.every((s) => s.status === 'passed' || s.status === 'skipped');
    if (allPassedOrSkipped) return 'passed';

    const anyExecuted = steps.some((s) => s.status !== 'untested');
    if (anyExecuted) return 'blocked';

    return 'untested';
  };

  const handleQuickPassAll = () => {
    setSteps((prev) =>
      prev.map((step) => ({
        ...step,
        status: 'passed',
        actualResult: step.actualResult || 'Conforme a resultado esperado.',
        executedAt: new Date().toISOString()
      }))
    );
  };

  const handleSaveAndClose = () => {
    const overall = deriveOverallStatus();
    const updated: TestCase = {
      ...testCase,
      steps,
      overallStatus: overall,
      lastExecutedAt: new Date().toISOString(),
      executionDurationSecs: timerSeconds,
      updatedAt: new Date().toISOString()
    };
    onSaveRun(updated);
  };

  const completedStepsCount = steps.filter((s) => s.status !== 'untested').length;
  const progressPercent = Math.round((completedStepsCount / steps.length) * 100);

  return (
    <div className="fixed inset-0 z-40 bg-slate-950 flex flex-col overflow-hidden text-slate-100">
      {/* Header Bar */}
      <div className="bg-slate-900 border-b border-slate-800 px-6 py-3 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
            title="Volver sin guardar"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-sky-950 text-sky-400 border border-sky-800">
                {testCase.id}
              </span>
              <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-medium border border-slate-700">
                {testCase.suite}
              </span>
              <span
                className={`text-[11px] font-semibold uppercase px-2 py-0.5 rounded ${
                  testCase.priority === 'critical'
                    ? 'bg-rose-950/80 text-rose-300 border border-rose-800'
                    : testCase.priority === 'high'
                    ? 'bg-amber-950/80 text-amber-300 border border-amber-800'
                    : 'bg-slate-800 text-slate-300'
                }`}
              >
                {testCase.priority}
              </span>
            </div>
            <h2 className="text-base font-bold text-white mt-1 line-clamp-1">{testCase.title}</h2>
          </div>
        </div>

        {/* Execution Tools */}
        <div className="flex items-center gap-3">
          {/* Stopwatch */}
          <div className="flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800 font-mono text-sm">
            <Clock className="w-4 h-4 text-sky-400" />
            <span className="font-bold text-sky-300">{formatTimer(timerSeconds)}</span>
            <button
              type="button"
              onClick={() => setIsTimerRunning(!isTimerRunning)}
              className="p-1 text-slate-400 hover:text-white"
              title={isTimerRunning ? 'Pausar Cronómetro' : 'Reanudar Cronómetro'}
            >
              {isTimerRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            </button>
            <button
              type="button"
              onClick={() => setTimerSeconds(0)}
              className="p-1 text-slate-400 hover:text-white"
              title="Reiniciar a cero"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Quick pass button */}
          <button
            type="button"
            onClick={handleQuickPassAll}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-950/60 hover:bg-emerald-900 text-emerald-300 text-xs font-semibold rounded-lg border border-emerald-800/80 transition"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            Marcar Todos Aprobados
          </button>

          {/* Save & Finish Run */}
          <button
            type="button"
            onClick={handleSaveAndClose}
            className="flex items-center gap-2 px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold rounded-lg shadow-lg shadow-sky-950 transition"
          >
            <Save className="w-4 h-4" />
            Guardar Ejecución & Finalizar
          </button>
        </div>
      </div>

      {/* Progress & Preconditions Sub-bar */}
      <div className="bg-slate-900/60 border-b border-slate-800 px-6 py-2.5 flex flex-wrap items-center justify-between text-xs gap-3">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <span className="text-slate-400">Progreso de ejecución:</span>
          <div className="w-48 bg-slate-800 rounded-full h-2 overflow-hidden border border-slate-700">
            <div
              className="bg-emerald-500 h-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <span className="font-mono text-slate-300 font-semibold">{completedStepsCount} de {steps.length} ({progressPercent}%)</span>
        </div>

        <div className="text-slate-400 flex items-center gap-2 text-[11px]">
          <span className="px-2 py-0.5 rounded bg-sky-950/60 border border-sky-800/40 text-sky-300">
            Atajo: Selecciona un paso y presiona <kbd className="font-mono bg-slate-800 px-1 py-0.5 rounded text-white">Ctrl+V</kbd> para adjuntar captura instantánea
          </span>
        </div>
      </div>

      {/* Main Runner Body */}
      <div className="flex-1 overflow-y-auto p-6 max-w-6xl mx-auto w-full space-y-6">
        {/* Preconditions Collapsible Info */}
        {testCase.preconditions && (
          <div className="p-3.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-300 space-y-1">
            <div className="flex items-center gap-2 text-sky-400 font-semibold uppercase tracking-wider text-[11px]">
              <ShieldCheck className="w-4 h-4" />
              Precondiciones del Caso de Prueba:
            </div>
            <div className="whitespace-pre-line text-slate-300 pl-6 leading-relaxed">
              {testCase.preconditions}
            </div>
            {testCase.testDataRequirements && (
              <div className="pl-6 pt-1 text-slate-400 font-mono text-[11px]">
                <strong className="text-slate-300 font-sans">Datos de Prueba requeridos:</strong> {testCase.testDataRequirements}
              </div>
            )}
          </div>
        )}

        {/* Step-by-Step Execution Cards */}
        <div className="space-y-4">
          {steps.map((step, idx) => {
            const isActive = activeStepIndex === idx;
            const isPassed = step.status === 'passed';
            const isFailed = step.status === 'failed';
            const isBlocked = step.status === 'blocked';
            const isSkipped = step.status === 'skipped';

            return (
              <div
                key={step.id}
                onClick={() => setActiveStepIndex(idx)}
                className={`rounded-xl border transition-all duration-200 overflow-hidden ${
                  isActive
                    ? 'border-sky-500 bg-slate-900 shadow-lg shadow-sky-950/40'
                    : 'border-slate-800 bg-slate-900/50 hover:border-slate-700'
                }`}
              >
                {/* Step Card Header */}
                <div className="p-4 flex flex-wrap items-start justify-between gap-3 border-b border-slate-800/80">
                  <div className="flex items-start gap-3 flex-1 min-w-[280px]">
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs flex-shrink-0 mt-0.5 ${
                        isPassed
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                          : isFailed
                          ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                          : isBlocked
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                          : isSkipped
                          ? 'bg-slate-700/40 text-slate-400 border border-slate-600'
                          : 'bg-slate-800 text-slate-400 border border-slate-700'
                      }`}
                    >
                      {step.stepNumber}
                    </div>

                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                          Paso #{step.stepNumber}
                        </span>
                        {isActive && (
                          <span className="text-[10px] bg-sky-500/20 text-sky-300 font-semibold px-2 py-0.2 rounded border border-sky-500/40">
                            Activo
                          </span>
                        )}
                      </div>
                      <p className="text-sm font-medium text-white leading-snug">{step.action}</p>

                      {step.testData && (
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-950 border border-slate-800 font-mono text-[11px] text-amber-300">
                          <span className="text-slate-500 font-sans">Datos:</span>
                          {step.testData}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Status Action Buttons */}
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSetStepStatus(idx, 'passed');
                      }}
                      className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${
                        isPassed
                          ? 'bg-emerald-600 text-white border-emerald-500 shadow-md shadow-emerald-950'
                          : 'bg-slate-800/80 hover:bg-emerald-950/60 text-slate-300 hover:text-emerald-300 border-slate-700'
                      }`}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Aprobado
                    </button>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSetStepStatus(idx, 'failed');
                      }}
                      className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${
                        isFailed
                          ? 'bg-rose-600 text-white border-rose-500 shadow-md shadow-rose-950'
                          : 'bg-slate-800/80 hover:bg-rose-950/60 text-slate-300 hover:text-rose-300 border-slate-700'
                      }`}
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      Fallido
                    </button>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSetStepStatus(idx, 'blocked');
                      }}
                      className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${
                        isBlocked
                          ? 'bg-amber-600 text-white border-amber-500 shadow-md shadow-amber-950'
                          : 'bg-slate-800/80 hover:bg-amber-950/60 text-slate-300 hover:text-amber-300 border-slate-700'
                      }`}
                    >
                      <AlertTriangle className="w-3.5 h-3.5" />
                      Bloqueado
                    </button>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSetStepStatus(idx, 'skipped');
                      }}
                      className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition ${
                        isSkipped
                          ? 'bg-slate-700 text-white border-slate-600'
                          : 'bg-slate-800/80 hover:bg-slate-750 text-slate-400 border-slate-700'
                      }`}
                      title="Omitir este paso"
                    >
                      <MinusCircle className="w-3.5 h-3.5" />
                      Omitir
                    </button>
                  </div>
                </div>

                {/* Step Details & Evidence Section */}
                <div className="p-4 space-y-4 bg-slate-900/40">
                  {/* Results: Expected vs Actual */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Expected Result Box */}
                    <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-lg">
                      <span className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                        Resultado Esperado:
                      </span>
                      <p className="text-xs text-slate-200 leading-relaxed font-sans">{step.expectedResult}</p>
                    </div>

                    {/* Actual Result Input Box */}
                    <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-lg flex flex-col justify-between">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                          Resultado Obtenido (Actual):
                        </span>
                        <button
                          type="button"
                          onClick={() => handleUpdateStepActualResult(idx, step.expectedResult)}
                          className="text-[10px] text-sky-400 hover:text-sky-300 underline font-medium"
                        >
                          Copiar esperado
                        </button>
                      </div>
                      <textarea
                        rows={2}
                        value={step.actualResult || ''}
                        onChange={(e) => handleUpdateStepActualResult(idx, e.target.value)}
                        placeholder="Describe el resultado observado durante la prueba..."
                        className="w-full px-2.5 py-1.5 text-xs bg-slate-900 border border-slate-750 rounded text-slate-100 placeholder-slate-600 focus:outline-none focus:border-sky-500"
                      />
                    </div>
                  </div>

                  {/* Evidence Attachment Component */}
                  <div className="pt-1">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-sky-400"></span>
                        Evidencias de este paso ({step.evidences?.length || 0}):
                      </span>
                    </div>

                    <StepEvidenceManager
                      evidences={step.evidences || []}
                      onChange={(newEvs) => handleUpdateStepEvidences(idx, newEvs)}
                      onViewEvidence={onViewEvidence}
                      isExecutionMode={true}
                    />
                  </div>

                  {/* Defect / Bug Section if Step Failed */}
                  {isFailed && (
                    <div className="p-4 bg-rose-950/30 border border-rose-900/60 rounded-xl space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-rose-300 font-bold text-xs uppercase tracking-wider">
                          <Bug className="w-4 h-4 text-rose-400" />
                          Registro de Defecto / Bug Encontrado en este Paso
                        </div>
                        <span className="font-mono text-xs text-rose-400 bg-rose-950 px-2 py-0.5 rounded border border-rose-900">
                          {step.defect?.id || 'BUG-PENDING'}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="sm:col-span-2">
                          <label className="block text-[11px] font-medium text-slate-300 mb-1">Título del Bug</label>
                          <input
                            type="text"
                            value={step.defect?.title || ''}
                            onChange={(e) =>
                              handleUpdateDefect(idx, {
                                id: step.defect?.id || `BUG-${Date.now().toString().slice(-4)}`,
                                title: e.target.value,
                                severity: step.defect?.severity || 'critical',
                                description: step.defect?.description || '',
                                jiraTicket: step.defect?.jiraTicket || '',
                                timestamp: step.defect?.timestamp || new Date().toISOString()
                              })
                            }
                            className="w-full px-3 py-1.5 text-xs bg-slate-900 border border-slate-700 rounded-lg text-white"
                            placeholder="Resumen del defecto detectado..."
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-medium text-slate-300 mb-1">Severidad</label>
                          <select
                            value={step.defect?.severity || 'critical'}
                            onChange={(e) =>
                              handleUpdateDefect(idx, {
                                id: step.defect?.id || `BUG-${Date.now().toString().slice(-4)}`,
                                title: step.defect?.title || '',
                                severity: e.target.value as any,
                                description: step.defect?.description || '',
                                jiraTicket: step.defect?.jiraTicket || '',
                                timestamp: step.defect?.timestamp || new Date().toISOString()
                              })
                            }
                            className="w-full px-2.5 py-1.5 text-xs bg-slate-900 border border-slate-700 rounded-lg text-white"
                          >
                            <option value="blocker">Bloqueante (Blocker)</option>
                            <option value="critical">Crítica (Critical)</option>
                            <option value="major">Mayor (Major)</option>
                            <option value="minor">Menor (Minor)</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] font-medium text-slate-300 mb-1">
                          Comportamiento Anómalo / Pasos para reproducir
                        </label>
                        <textarea
                          rows={2}
                          value={step.defect?.description || ''}
                          onChange={(e) =>
                            handleUpdateDefect(idx, {
                              id: step.defect?.id || `BUG-${Date.now().toString().slice(-4)}`,
                              title: step.defect?.title || '',
                              severity: step.defect?.severity || 'critical',
                              description: e.target.value,
                              jiraTicket: step.defect?.jiraTicket || '',
                              timestamp: step.defect?.timestamp || new Date().toISOString()
                            })
                          }
                          className="w-full px-3 py-1.5 text-xs bg-slate-900 border border-slate-700 rounded-lg text-white"
                          placeholder="Detalles técnicos y comportamiento inconsistente..."
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
