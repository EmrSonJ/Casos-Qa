import React, { useState, useMemo } from 'react';
import { TestCase, FilterOptions, StepEvidence } from '../types/qa';
import {
  Search,
  Filter,
  Play,
  Edit3,
  Copy,
  Trash2,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  MinusCircle,
  Clock,
  Bug,
  Image as ImageIcon,
  Layers,
  ChevronDown,
  ChevronUp,
  Tag,
  Plus
} from 'lucide-react';

interface TestCaseListProps {
  testCases: TestCase[];
  onExecute: (testCase: TestCase) => void;
  onEdit: (testCase: TestCase) => void;
  onDuplicate: (testCase: TestCase) => void;
  onDelete: (id: string) => void;
  onViewEvidence: (evidence: StepEvidence) => void;
  onNewCase: () => void;
}

export const TestCaseList: React.FC<TestCaseListProps> = ({
  testCases,
  onExecute,
  onEdit,
  onDuplicate,
  onDelete,
  onViewEvidence,
  onNewCase
}) => {
  const [filters, setFilters] = useState<FilterOptions>({
    searchQuery: '',
    suite: 'all',
    status: 'all',
    priority: 'all',
    type: 'all'
  });

  const [expandedCaseId, setExpandedCaseId] = useState<string | null>(null);

  // Extract unique suites
  const availableSuites = useMemo(() => {
    const suites = new Set<string>();
    testCases.forEach((tc) => {
      if (tc.suite) suites.add(tc.suite);
    });
    return Array.from(suites);
  }, [testCases]);

  // Filter logic
  const filteredCases = useMemo(() => {
    return testCases.filter((tc) => {
      if (filters.searchQuery) {
        const query = filters.searchQuery.toLowerCase();
        const matchesId = tc.id.toLowerCase().includes(query);
        const matchesTitle = tc.title.toLowerCase().includes(query);
        const matchesSuite = tc.suite.toLowerCase().includes(query);
        const matchesTags = tc.tags?.some((t) => t.toLowerCase().includes(query));
        const matchesSteps = tc.steps.some(
          (s) =>
            s.action.toLowerCase().includes(query) ||
            s.expectedResult.toLowerCase().includes(query)
        );
        if (!matchesId && !matchesTitle && !matchesSuite && !matchesTags && !matchesSteps) {
          return false;
        }
      }

      if (filters.suite !== 'all' && tc.suite !== filters.suite) return false;
      if (filters.status !== 'all' && tc.overallStatus !== filters.status) return false;
      if (filters.priority !== 'all' && tc.priority !== filters.priority) return false;
      if (filters.type !== 'all' && tc.type !== filters.type) return false;

      return true;
    });
  }, [testCases, filters]);

  const toggleExpand = (id: string) => {
    setExpandedCaseId((prev) => (prev === id ? null : id));
  };

  return (
    <div className="space-y-4">
      {/* Search and Filters Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm space-y-3">
        <div className="flex flex-wrap items-center gap-3">
          {/* Search Input */}
          <div className="relative flex-1 min-w-[240px]">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por ID, título, etiquetas o contenido de los pasos..."
              value={filters.searchQuery}
              onChange={(e) => setFilters((prev) => ({ ...prev, searchQuery: e.target.value }))}
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-950 border border-slate-850 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
            />
            {filters.searchQuery && (
              <button
                type="button"
                onClick={() => setFilters((prev) => ({ ...prev, searchQuery: '' }))}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white text-xs"
              >
                ✕
              </button>
            )}
          </div>

          {/* Suite Filter */}
          <select
            value={filters.suite}
            onChange={(e) => setFilters((prev) => ({ ...prev, suite: e.target.value }))}
            className="px-3 py-2 text-xs bg-slate-950 border border-slate-850 rounded-lg text-slate-300 focus:outline-none focus:border-sky-500"
          >
            <option value="all">Todas las Suites / Módulos</option>
            {availableSuites.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={filters.status}
            onChange={(e) => setFilters((prev) => ({ ...prev, status: e.target.value }))}
            className="px-3 py-2 text-xs bg-slate-950 border border-slate-850 rounded-lg text-slate-300 focus:outline-none focus:border-sky-500"
          >
            <option value="all">Todos los Estados</option>
            <option value="passed">Aprobados (Passed)</option>
            <option value="failed">Fallidos (Failed)</option>
            <option value="blocked">Bloqueados (Blocked)</option>
            <option value="untested">Pendientes (Untested)</option>
          </select>

          {/* Priority Filter */}
          <select
            value={filters.priority}
            onChange={(e) => setFilters((prev) => ({ ...prev, priority: e.target.value }))}
            className="px-3 py-2 text-xs bg-slate-950 border border-slate-850 rounded-lg text-slate-300 focus:outline-none focus:border-sky-500"
          >
            <option value="all">Todas las Prioridades</option>
            <option value="critical">Crítica (P1)</option>
            <option value="high">Alta (P2)</option>
            <option value="medium">Media (P3)</option>
            <option value="low">Baja (P4)</option>
          </select>
        </div>
      </div>

      {/* Test Cases List */}
      {filteredCases.length > 0 ? (
        <div className="space-y-3">
          {filteredCases.map((tc) => {
            const isExpanded = expandedCaseId === tc.id;
            const totalSteps = tc.steps.length;
            const passedSteps = tc.steps.filter((s) => s.status === 'passed').length;
            const failedSteps = tc.steps.filter((s) => s.status === 'failed').length;
            const totalEvidences = tc.steps.reduce((acc, s) => acc + (s.evidences?.length || 0), 0);
            const hasDefect = tc.steps.some((s) => Boolean(s.defect));

            return (
              <div
                key={tc.id}
                className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl transition duration-150 shadow-sm overflow-hidden"
              >
                {/* Main Card Header */}
                <div className="p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4">
                  {/* Left Column: ID, Titles, Badges */}
                  <div className="flex-1 min-w-[280px] space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs font-bold px-2.5 py-0.5 rounded bg-slate-950 text-sky-400 border border-slate-800">
                        {tc.id}
                      </span>
                      <span className="text-xs px-2.5 py-0.5 rounded bg-slate-800 text-slate-300 font-medium">
                        {tc.suite}
                      </span>
                      <span
                        className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                          tc.priority === 'critical'
                            ? 'bg-rose-950/80 text-rose-300 border border-rose-850'
                            : tc.priority === 'high'
                            ? 'bg-amber-950/80 text-amber-300 border border-amber-850'
                            : 'bg-slate-800 text-slate-300'
                        }`}
                      >
                        {tc.priority}
                      </span>
                      <span className="text-[10px] uppercase font-semibold text-slate-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-850">
                        {tc.type}
                      </span>
                    </div>

                    <h3 className="text-sm sm:text-base font-bold text-white tracking-tight">
                      {tc.title}
                    </h3>

                    {tc.description && (
                      <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                        {tc.description}
                      </p>
                    )}

                    {/* Meta stats bar */}
                    <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 pt-1">
                      <span className="flex items-center gap-1.5">
                        <Layers className="w-3.5 h-3.5 text-sky-400" />
                        {totalSteps} pasos ({passedSteps} aprobados)
                      </span>

                      <span className="flex items-center gap-1.5">
                        <ImageIcon className="w-3.5 h-3.5 text-emerald-400" />
                        {totalEvidences} evidencias adjuntas
                      </span>

                      {hasDefect && (
                        <span className="flex items-center gap-1 text-rose-400 font-semibold">
                          <Bug className="w-3.5 h-3.5" />
                          Defecto registrado
                        </span>
                      )}

                      {tc.assignedTo && (
                        <span className="text-slate-400">
                          Tester: <span className="text-slate-300">{tc.assignedTo}</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Right Column: Status & Action Buttons */}
                  <div className="flex flex-col sm:flex-row items-end sm:items-center gap-3">
                    {/* Status Badge */}
                    <div className="flex items-center">
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider ${
                          tc.overallStatus === 'passed'
                            ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800'
                            : tc.overallStatus === 'failed'
                            ? 'bg-rose-950/80 text-rose-300 border border-rose-800'
                            : tc.overallStatus === 'blocked'
                            ? 'bg-amber-950/80 text-amber-300 border border-amber-800'
                            : 'bg-slate-800 text-slate-300 border border-slate-700'
                        }`}
                      >
                        {tc.overallStatus === 'passed' && <CheckCircle2 className="w-3.5 h-3.5" />}
                        {tc.overallStatus === 'failed' && <XCircle className="w-3.5 h-3.5" />}
                        {tc.overallStatus === 'blocked' && <AlertTriangle className="w-3.5 h-3.5" />}
                        {tc.overallStatus === 'untested' && <Clock className="w-3.5 h-3.5" />}
                        {tc.overallStatus}
                      </span>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1.5">
                      {/* Execute Button */}
                      <button
                        type="button"
                        onClick={() => onExecute(tc)}
                        className="flex items-center gap-1.5 px-3.5 py-1.5 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-xs font-semibold shadow-sm transition"
                        title="Iniciar ejecución interactiva paso a paso"
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>Ejecutar</span>
                      </button>

                      {/* Edit Button */}
                      <button
                        type="button"
                        onClick={() => onEdit(tc)}
                        className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg border border-slate-750 transition"
                        title="Editar caso y pasos"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>

                      {/* Duplicate Button */}
                      <button
                        type="button"
                        onClick={() => onDuplicate(tc)}
                        className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg border border-slate-750 transition"
                        title="Clonar caso"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>

                      {/* Delete Button */}
                      <button
                        type="button"
                        onClick={() => {
                          if (confirm(`¿Eliminar el caso de prueba ${tc.id}?`)) {
                            onDelete(tc.id);
                          }
                        }}
                        className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 rounded-lg border border-slate-750 transition"
                        title="Eliminar caso"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>

                      {/* Expand / Collapse steps details */}
                      <button
                        type="button"
                        onClick={() => toggleExpand(tc.id)}
                        className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg border border-slate-750 transition ml-1"
                        title={isExpanded ? 'Ocultar pasos' : 'Ver detalle paso a paso'}
                      >
                        {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Collapsible Step-by-Step Preview */}
                {isExpanded && (
                  <div className="bg-slate-950/70 border-t border-slate-800 p-4 sm:p-5 space-y-3 animate-in fade-in duration-150">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
                      <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                        Desglose Paso a Paso ({tc.steps.length} Pasos)
                      </span>
                      <button
                        type="button"
                        onClick={() => onExecute(tc)}
                        className="text-xs text-sky-400 hover:text-sky-300 font-semibold"
                      >
                        Abrir consola de ejecución →
                      </button>
                    </div>

                    <div className="space-y-2.5">
                      {tc.steps.map((step) => (
                        <div
                          key={step.id}
                          className="p-3 bg-slate-900 border border-slate-800/80 rounded-lg space-y-2 text-xs"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-start gap-2.5">
                              <span className="w-5 h-5 rounded-full bg-slate-800 text-sky-400 border border-slate-700 font-bold text-[10px] flex items-center justify-center flex-shrink-0 mt-0.5">
                                {step.stepNumber}
                              </span>
                              <div>
                                <p className="font-semibold text-slate-200">{step.action}</p>
                                {step.testData && (
                                  <p className="font-mono text-[11px] text-amber-300 mt-0.5">
                                    Datos: {step.testData}
                                  </p>
                                )}
                              </div>
                            </div>

                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                step.status === 'passed'
                                  ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                                  : step.status === 'failed'
                                  ? 'bg-rose-950 text-rose-300 border border-rose-800'
                                  : 'bg-slate-800 text-slate-400'
                              }`}
                            >
                              {step.status}
                            </span>
                          </div>

                          <div className="pl-7 grid grid-cols-1 sm:grid-cols-2 gap-3 text-slate-400 pt-1">
                            <div>
                              <span className="text-[10px] font-semibold text-slate-500 uppercase block">
                                Esperado:
                              </span>
                              <p className="text-slate-300">{step.expectedResult}</p>
                            </div>
                            <div>
                              <span className="text-[10px] font-semibold text-slate-500 uppercase block">
                                Obtenido:
                              </span>
                              <p className="text-slate-300 italic">
                                {step.actualResult || 'Pendiente de ejecución'}
                              </p>
                            </div>
                          </div>

                          {/* Evidences list preview */}
                          {step.evidences && step.evidences.length > 0 && (
                            <div className="pl-7 pt-2 flex flex-wrap gap-2 items-center">
                              <span className="text-[10px] font-semibold text-slate-500 uppercase mr-1">
                                Evidencias:
                              </span>
                              {step.evidences.map((ev) => (
                                <button
                                  key={ev.id}
                                  type="button"
                                  onClick={() => onViewEvidence(ev)}
                                  className="inline-flex items-center gap-1.5 px-2 py-1 rounded bg-slate-950 border border-slate-800 hover:border-sky-500 text-slate-300 text-[11px] transition"
                                >
                                  {ev.type === 'screenshot' ? (
                                    <ImageIcon className="w-3 h-3 text-sky-400" />
                                  ) : (
                                    <Tag className="w-3 h-3 text-amber-400" />
                                  )}
                                  <span className="truncate max-w-[120px]">{ev.name}</span>
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        /* Empty State */
        <div className="p-12 text-center bg-slate-900 border border-slate-800 rounded-xl space-y-4">
          <div className="w-12 h-12 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
            <Search className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-white">No se encontraron casos de prueba</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            No existen casos que coincidan con los filtros actuales o la lista se encuentra vacía.
            Crea uno nuevo o ajusta tu búsqueda.
          </p>
          <div className="pt-2">
            <button
              type="button"
              onClick={onNewCase}
              className="inline-flex items-center gap-2 px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-xs font-semibold shadow transition"
            >
              <Plus className="w-4 h-4" />
              Crear Nuevo Caso de Prueba
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
