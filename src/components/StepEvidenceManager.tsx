import React, { useState } from 'react';
import { StepEvidence, EvidenceType } from '../types/qa';
import { Camera, Upload, FileCode, Trash2, Eye, Plus, Sparkles, Check, Paperclip } from 'lucide-react';

interface StepEvidenceManagerProps {
  evidences: StepEvidence[];
  onChange: (evidences: StepEvidence[]) => void;
  onViewEvidence: (evidence: StepEvidence) => void;
  isExecutionMode?: boolean;
}

export const StepEvidenceManager: React.FC<StepEvidenceManagerProps> = ({
  evidences,
  onChange,
  onViewEvidence,
  isExecutionMode = false
}) => {
  const [showAddLogModal, setShowAddLogModal] = useState(false);
  const [logName, setLogName] = useState('');
  const [logContent, setLogContent] = useState('');
  const [logType, setLogType] = useState<'log' | 'payload'>('log');
  const [notes, setNotes] = useState('');
  const [pasteSuccess, setPasteSuccess] = useState(false);

  // File upload handler
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      const isImg = file.type.startsWith('image/');
      const reader = new FileReader();

      reader.onload = (event) => {
        const result = event.target?.result as string;
        const newEvidence: StepEvidence = {
          id: `ev-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          type: isImg ? 'screenshot' : 'log',
          name: file.name,
          dataUrl: isImg ? result : undefined,
          textContent: !isImg ? result : undefined,
          fileSize: `${(file.size / 1024).toFixed(1)} KB`,
          timestamp: new Date().toLocaleTimeString(),
          notes: ''
        };

        onChange([...evidences, newEvidence]);
      };

      if (isImg) {
        reader.readAsDataURL(file);
      } else {
        reader.readAsText(file);
      }
    });

    // Reset input
    e.target.value = '';
  };

  // Dedicated paste button / paste handler helper
  const handleClipboardPaste = async () => {
    try {
      if (!navigator.clipboard || !navigator.clipboard.read) {
        // Fallback info
        alert('Por favor presiona Ctrl+V o Cmd+V directamente para pegar la captura.');
        return;
      }
      const clipboardItems = await navigator.clipboard.read();
      let foundImage = false;

      for (const item of clipboardItems) {
        for (const type of item.types) {
          if (type.startsWith('image/')) {
            const blob = await item.getType(type);
            const reader = new FileReader();
            reader.onload = (event) => {
              const dataUrl = event.target?.result as string;
              const newEvidence: StepEvidence = {
                id: `ev-paste-${Date.now()}`,
                type: 'screenshot',
                name: `Captura_Portapapeles_${new Date().toLocaleTimeString().replace(/:/g, '-')}.png`,
                dataUrl,
                fileSize: `${(blob.size / 1024).toFixed(1)} KB`,
                timestamp: new Date().toLocaleTimeString(),
                notes: 'Pegado directamente desde el portapapeles'
              };
              onChange([...evidences, newEvidence]);
              setPasteSuccess(true);
              setTimeout(() => setPasteSuccess(false), 2000);
            };
            reader.readAsDataURL(blob);
            foundImage = true;
            break;
          }
        }
        if (foundImage) break;
      }

      if (!foundImage) {
        alert('No se encontró una imagen en el portapapeles. Copia una captura con Impr Pant / Win+Shift+S e intenta nuevamente.');
      }
    } catch (err) {
      console.warn('Clipboard read permission notice:', err);
      alert('Para pegar con portapapeles, haz clic aquí y presiona Ctrl + V en tu teclado.');
    }
  };

  const handleSaveLogEvidence = (e: React.FormEvent) => {
    e.preventDefault();
    if (!logContent.trim()) return;

    const newEvidence: StepEvidence = {
      id: `ev-log-${Date.now()}`,
      type: logType,
      name: logName.trim() || (logType === 'payload' ? 'HTTP_Payload.json' : 'Console_Trace.log'),
      textContent: logContent.trim(),
      fileSize: `${(new Blob([logContent]).size / 1024).toFixed(1)} KB`,
      timestamp: new Date().toLocaleTimeString(),
      notes: notes.trim()
    };

    onChange([...evidences, newEvidence]);
    setShowAddLogModal(false);
    setLogName('');
    setLogContent('');
    setNotes('');
  };

  const handleDeleteEvidence = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(evidences.filter((item) => item.id !== id));
  };

  return (
    <div className="space-y-3">
      {/* Evidence Actions Bar */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Upload File Input */}
        <label className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg border border-slate-700 cursor-pointer transition shadow-sm">
          <Upload className="w-3.5 h-3.5 text-sky-400" />
          <span>Subir Captura / Archivo</span>
          <input
            type="file"
            accept="image/*,.log,.json,.txt"
            multiple
            className="hidden"
            onChange={handleFileUpload}
          />
        </label>

        {/* Paste Clipboard button */}
        <button
          type="button"
          onClick={handleClipboardPaste}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-sky-950/60 hover:bg-sky-900/80 text-sky-300 text-xs font-medium rounded-lg border border-sky-800/60 transition shadow-sm"
          title="Pega una captura copiada con ImprPant / Win+Shift+S / Cmd+Shift+4"
        >
          {pasteSuccess ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-emerald-300">¡Pegada!</span>
            </>
          ) : (
            <>
              <Camera className="w-3.5 h-3.5 text-sky-400" />
              <span>Pegar Captura (Ctrl+V)</span>
            </>
          )}
        </button>

        {/* Add Log / JSON Payload */}
        <button
          type="button"
          onClick={() => setShowAddLogModal(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg border border-slate-700 transition shadow-sm"
        >
          <FileCode className="w-3.5 h-3.5 text-amber-400" />
          <span>Registrar Log / Payload</span>
        </button>
      </div>

      {/* Evidences List / Thumbnails */}
      {evidences.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 pt-1">
          {evidences.map((ev) => (
            <div
              key={ev.id}
              onClick={() => onViewEvidence(ev)}
              className="group relative flex items-center gap-3 p-2.5 bg-slate-900/80 hover:bg-slate-850 border border-slate-800 hover:border-sky-700/60 rounded-lg cursor-pointer transition shadow-sm overflow-hidden"
            >
              {/* Evidence Icon / Thumbnail */}
              {ev.type === 'screenshot' && ev.dataUrl ? (
                <div className="w-12 h-12 rounded bg-slate-950 border border-slate-800 overflow-hidden flex-shrink-0 flex items-center justify-center">
                  <img
                    src={ev.dataUrl}
                    alt={ev.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-200"
                  />
                </div>
              ) : (
                <div className="w-12 h-12 rounded bg-amber-950/40 border border-amber-900/50 text-amber-400 flex items-center justify-center flex-shrink-0">
                  <FileCode className="w-6 h-6" />
                </div>
              )}

              {/* Evidence Info */}
              <div className="flex-1 min-w-0 pr-6">
                <p className="text-xs font-medium text-slate-200 truncate group-hover:text-sky-300 transition">
                  {ev.name}
                </p>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  {ev.timestamp} {ev.fileSize ? `• ${ev.fileSize}` : ''}
                </p>
                {ev.notes && (
                  <p className="text-[10px] text-slate-400 truncate mt-0.5 italic">
                    "{ev.notes}"
                  </p>
                )}
              </div>

              {/* Action Buttons overlay */}
              <div className="absolute right-2 top-2 flex items-center gap-1 opacity-80 group-hover:opacity-100 transition">
                <button
                  type="button"
                  onClick={(e) => handleDeleteEvidence(ev.id, e)}
                  className="p-1 text-slate-500 hover:text-red-400 hover:bg-red-950/40 rounded transition"
                  title="Eliminar evidencia"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-xs text-slate-400 p-2.5 rounded-lg border border-dashed border-slate-800 bg-slate-900/30 flex items-center justify-center gap-2">
          <Paperclip className="w-3.5 h-3.5" />
          <span>Sin evidencias adjuntas en este paso aún. Usa los botones superiores o pega con Ctrl+V.</span>
        </div>
      )}

      {/* Log / Payload Input Modal */}
      {showAddLogModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-xl shadow-2xl max-w-lg w-full p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h4 className="text-sm font-semibold text-white flex items-center gap-2">
                <FileCode className="w-4 h-4 text-amber-400" />
                Adjuntar Log / Respuesta HTTP
              </h4>
              <button
                type="button"
                onClick={() => setShowAddLogModal(false)}
                className="text-slate-400 hover:text-white text-xs"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveLogEvidence} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Tipo de Registro</label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setLogType('log')}
                    className={`flex-1 py-1.5 text-xs rounded-lg border font-medium transition ${
                      logType === 'log'
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                        : 'bg-slate-800 text-slate-400 border-slate-700'
                    }`}
                  >
                    Log de Servidor / Consola
                  </button>
                  <button
                    type="button"
                    onClick={() => setLogType('payload')}
                    className={`flex-1 py-1.5 text-xs rounded-lg border font-medium transition ${
                      logType === 'payload'
                        ? 'bg-sky-500/20 text-sky-300 border-sky-500/40'
                        : 'bg-slate-800 text-slate-400 border-slate-700'
                    }`}
                  >
                    Payload JSON / API Response
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Nombre / Identificador</label>
                <input
                  type="text"
                  placeholder="ej. StackTrace_Error_500.log o POST_Order_Response.json"
                  value={logName}
                  onChange={(e) => setLogName(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Contenido del Log / JSON</label>
                <textarea
                  rows={6}
                  placeholder="Pega aquí el contenido del log, error trace o respuesta de red..."
                  value={logContent}
                  onChange={(e) => setLogContent(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-mono bg-slate-950 border border-slate-700 rounded-lg text-sky-200 focus:outline-none focus:border-sky-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Notas del QA (Opcional)</label>
                <input
                  type="text"
                  placeholder="ej. Observado código 400 Bad Request al enviar payload mal formado."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddLogModal(false)}
                  className="px-3 py-1.5 text-xs text-slate-400 hover:text-white bg-slate-800 rounded-lg border border-slate-700"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-medium text-white bg-sky-600 hover:bg-sky-500 rounded-lg shadow"
                >
                  Guardar Evidencia
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
