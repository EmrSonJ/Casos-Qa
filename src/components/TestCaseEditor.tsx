import React, { useState } from 'react';
import { TestCase, TestStep, TestPriority, TestType } from '../types/qa';
import {
  X,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Save,
  CheckCircle2,
  Layers,
  Sparkles,
  ShieldCheck,
  FileSpreadsheet
} from 'lucide-react';

interface TestCaseEditorProps {
  initialCase?: TestCase | null;
  onSave: (testCase: TestCase) => void;
  onClose: () => void;
}

export const TestCaseEditor: React.FC<TestCaseEditorProps> = ({
  initialCase,
  onSave,
  onClose
}) => {
  const isEditing = Boolean(initialCase);

  const [id, setId] = useState<string>(
    initialCase?.id || `TC-${Math.floor(100 + Math.random() * 900)}`
  );
  const [title, setTitle] = useState<string>(initialCase?.title || '');
  const [description, setDescription] = useState<string>(initialCase?.description || '');
  const [suite, setSuite] = useState<string>(initialCase?.suite || 'Autenticación & Seguridad');
  const [priority, setPriority] = useState<TestPriority>(initialCase?.priority || 'high');
  const [type, setType] = useState<TestType>(initialCase?.type || 'functional');
  const [preconditions, setPreconditions] = useState<string>(
    initialCase?.preconditions || '1. Ambiente Staging desplegado y operativo.\n2. Usuario de prueba con credenciales activas.'
  );
  const [testDataRequirements, setTestDataRequirements] = useState<string>(
    initialCase?.testDataRequirements || ''
  );
  const [author, setAuthor] = useState<string>(initialCase?.author || 'QA Lead Engineer');
  const [assignedTo, setAssignedTo] = useState<string>(initialCase?.assignedTo || '');
  const [tagsInput, setTagsInput] = useState<string>(
    initialCase?.tags?.join(', ') || 'Sprint-42, Regresion'
  );

  const [steps, setSteps] = useState<TestStep[]>(
    initialCase?.steps && initialCase.steps.length > 0
      ? JSON.parse(JSON.stringify(initialCase.steps))
      : [
          {
            id: `step-${Date.now()}-1`,
            stepNumber: 1,
            action: '',
            testData: '',
            expectedResult: '',
            status: 'untested',
            evidences: []
          }
        ]
  );

  const handleAddStep = () => {
    const nextNumber = steps.length + 1;
    const newStep: TestStep = {
      id: `step-${Date.now()}-${nextNumber}`,
      stepNumber: nextNumber,
      action: '',
      testData: '',
      expectedResult: '',
      status: 'untested',
      evidences: []
    };
    setSteps([...steps, newStep]);
  };

  const handleRemoveStep = (index: number) => {
    if (steps.length <= 1) {
      alert('Un caso de prueba debe tener al menos 1 paso.');
      return;
    }
    const filtered = steps.filter((_, idx) => idx !== index);
    const renumbered = filtered.map((s, idx) => ({ ...s, stepNumber: idx + 1 }));
    setSteps(renumbered);
  };

  const handleMoveStep = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= steps.length) return;

    const copy = [...steps];
    const temp = copy[index];
    copy[index] = copy[targetIndex];
    copy[targetIndex] = temp;

    const renumbered = copy.map((s, idx) => ({ ...s, stepNumber: idx + 1 }));
    setSteps(renumbered);
  };

  const handleUpdateStepField = (index: number, field: keyof TestStep, value: any) => {
    setSteps((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      alert('Por favor ingresa un título descriptivo para el caso de prueba.');
      return;
    }

    const emptySteps = steps.filter((s) => !s.action.trim() || !s.expectedResult.trim());
    if (emptySteps.length > 0) {
      alert('Todos los pasos deben contener una Acción y un Resultado Esperado.');
      return;
    }

    const tags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    const updatedTestCase: TestCase = {
      id: id.trim() || `TC-${Date.now().toString().slice(-4)}`,
      title: title.trim(),
      description: description.trim(),
      suite: suite.trim() || 'General',
      priority,
      type,
      preconditions: preconditions.trim(),
      testDataRequirements: testDataRequirements.trim(),
      steps,
      overallStatus: initialCase?.overallStatus || 'untested',
      author: author.trim() || 'QA Engineer',
      assignedTo: assignedTo.trim() || undefined,
      createdAt: initialCase?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      tags,
      executionDurationSecs: initialCase?.executionDurationSecs,
      lastExecutedAt: initialCase?.lastExecutedAt
    };

    onSave(updatedTestCase);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-xl shadow-2xl max-w-5xl w-full max-h-[94vh] flex flex-col overflow-hidden">
        {/* Modal Top Bar */}
        <div className="px-6 py-4 border-b border-slate-800 bg-slate-900/90 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-sky-500/10 text-sky-400 border border-sky-500/20">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                {isEditing ? `Editar Caso de Prueba: ${initialCase?.id}` : 'Crear Nuevo Caso de Prueba'}
              </h3>
              <p className="text-xs text-slate-400">
                Define precondiciones, datos de prueba y la secuencia paso a paso verificable.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Metadata Section */}
          <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-4">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-sky-400" />
              1. Metadatos & Configuración del Caso
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">ID del Caso</label>
                <input
                  type="text"
                  value={id}
                  onChange={(e) => setId(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-mono font-bold bg-slate-900 border border-slate-700 rounded-lg text-sky-400 focus:outline-none focus:border-sky-500"
                  required
                />
              </div>

              <div className="sm:col-span-3">
                <label className="block text-xs font-medium text-slate-300 mb-1">Título del Caso de Prueba</label>
                <input
                  type="text"
                  placeholder="ej. Validación de Checkout con Tarjeta 3D Secure y cálculo de IVA"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-sky-500"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Suite / Módulo</label>
                <input
                  type="text"
                  list="suite-options"
                  placeholder="ej. Autenticación"
                  value={suite}
                  onChange={(e) => setSuite(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-sky-500"
                  required
                />
                <datalist id="suite-options">
                  <option value="Autenticación & Seguridad" />
                  <option value="Pasarela de Pagos" />
                  <option value="Carrito & Checkout" />
                  <option value="API REST & Integración" />
                  <option value="Gestión de Perfil" />
                  <option value="Notificaciones & Email" />
                </datalist>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Prioridad</label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as TestPriority)}
                  className="w-full px-3 py-2 text-xs bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-sky-500"
                >
                  <option value="critical">Crítica (P1 - Blocker)</option>
                  <option value="high">Alta (P2)</option>
                  <option value="medium">Media (P3)</option>
                  <option value="low">Baja (P4)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Tipo de Prueba</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as TestType)}
                  className="w-full px-3 py-2 text-xs bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-sky-500"
                >
                  <option value="functional">Funcional</option>
                  <option value="regression">Regresión</option>
                  <option value="smoke">Prueba de Humo (Smoke)</option>
                  <option value="integration">Integración</option>
                  <option value="e2e">End-to-End (E2E)</option>
                  <option value="security">Seguridad</option>
                  <option value="api">API / Backend</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Tester Asignado</label>
                <input
                  type="text"
                  placeholder="ej. Carlos Méndez (QA Senior)"
                  value={assignedTo}
                  onChange={(e) => setAssignedTo(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-sky-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Precondiciones del Entorno</label>
                <textarea
                  rows={2}
                  placeholder="Requisitos previos de base de datos, estado de sesión..."
                  value={preconditions}
                  onChange={(e) => setPreconditions(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Datos de Prueba Requeridos</label>
                <textarea
                  rows={2}
                  placeholder="Credenciales de prueba, tarjetas simuladas, tokens..."
                  value={testDataRequirements}
                  onChange={(e) => setTestDataRequirements(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-sky-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Etiquetas / Tags (separadas por coma)</label>
              <input
                type="text"
                placeholder="ej. Auth, 2FA, Sprint-42, Regresion"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-sky-500"
              />
            </div>
          </div>

          {/* Step by Step Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                  <FileSpreadsheet className="w-4 h-4 text-sky-400" />
                  2. Especificación Paso a Paso ({steps.length} pasos)
                </h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  Cada paso debe tener una acción precisa y su resultado esperado verificable.
                </p>
              </div>

              <button
                type="button"
                onClick={handleAddStep}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-sky-600 hover:bg-sky-500 text-white rounded-lg shadow transition"
              >
                <Plus className="w-3.5 h-3.5" />
                Añadir Paso
              </button>
            </div>

            <div className="space-y-3">
              {steps.map((step, idx) => (
                <div
                  key={step.id}
                  className="p-4 bg-slate-950/70 border border-slate-800 rounded-xl space-y-3 hover:border-slate-700 transition"
                >
                  <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-sky-950 text-sky-400 border border-sky-800 text-xs font-bold flex items-center justify-center">
                        {step.stepNumber}
                      </span>
                      <span className="text-xs font-bold text-slate-300">Paso #{step.stepNumber}</span>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleMoveStep(idx, 'up')}
                        disabled={idx === 0}
                        className="p-1 text-slate-400 hover:text-white disabled:opacity-30 rounded hover:bg-slate-800"
                        title="Mover arriba"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleMoveStep(idx, 'down')}
                        disabled={idx === steps.length - 1}
                        className="p-1 text-slate-400 hover:text-white disabled:opacity-30 rounded hover:bg-slate-800"
                        title="Mover abajo"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemoveStep(idx)}
                        disabled={steps.length <= 1}
                        className="p-1 text-slate-500 hover:text-rose-400 disabled:opacity-30 rounded hover:bg-rose-950/40 ml-1"
                        title="Eliminar paso"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                          Acción a Realizar (Paso a Paso) *
                        </label>
                        <textarea
                          rows={2}
                          placeholder="ej. Navegar a /checkout y seleccionar método Tarjeta de Crédito."
                          value={step.action}
                          onChange={(e) => handleUpdateStepField(idx, 'action', e.target.value)}
                          className="w-full px-3 py-1.5 text-xs bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-sky-500"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-medium text-slate-400 mb-1">
                          Datos de Entrada (Test Data)
                        </label>
                        <input
                          type="text"
                          placeholder="ej. Tarjeta: 4000 0012 3456 0005 | CVC: 312"
                          value={step.testData || ''}
                          onChange={(e) => handleUpdateStepField(idx, 'testData', e.target.value)}
                          className="w-full px-3 py-1.5 text-xs bg-slate-900 border border-slate-700 rounded-lg text-amber-300 font-mono focus:outline-none focus:border-sky-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                        Resultado Esperado Verificable *
                      </label>
                      <textarea
                        rows={4}
                        placeholder="ej. El sistema muestra modal 3D Secure con el formulario de confirmación bancaria."
                        value={step.expectedResult}
                        onChange={(e) => handleUpdateStepField(idx, 'expectedResult', e.target.value)}
                        className="w-full px-3 py-1.5 text-xs bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-sky-500"
                        required
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={handleAddStep}
              className="w-full py-2.5 border border-dashed border-slate-700 hover:border-sky-500 text-slate-400 hover:text-sky-400 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition"
            >
              <Plus className="w-4 h-4" />
              Añadir Otro Paso al Flujo
            </button>
          </div>

          {/* Form Actions Footer */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-750 border border-slate-700 rounded-lg transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-5 py-2 text-xs font-bold text-white bg-sky-600 hover:bg-sky-500 rounded-lg shadow-lg shadow-sky-950 transition"
            >
              <Save className="w-4 h-4" />
              {isEditing ? 'Guardar Cambios' : 'Crear Caso de Prueba'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
