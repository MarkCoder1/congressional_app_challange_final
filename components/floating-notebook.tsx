"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  BookOpen,
  Eraser,
  FileText,
  NotebookPen,
  Pencil,
  Plus,
  Sigma,
  Trash2,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip } from "@/components/ui/tooltip";

const NOTEBOOK_STORAGE_KEY = "studyflow-notebook";
const NOTEBOOK_TOOLS_STORAGE_KEY = "studyflow-notebook-tools";

export type NotebookNote = {
  id: string;
  taskId: string;
  title: string;
  content: string;
  createdAt: number;
  updatedAt: number;
};

type NotebookToolState = {
  taskId: string;
  noteId: string;
  drawing: string;
  equation: string;
};

type NotebookMode = "notes" | "draw" | "equations";

interface FloatingNotebookProps {
  taskId: string;
  taskTitle?: string;
}

function createNote(taskId: string): NotebookNote {
  const id = typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const now = Date.now();

  return {
    id,
    taskId,
    title: "Untitled Note",
    content: "",
    createdAt: now,
    updatedAt: now,
  };
}

function readNotes(): NotebookNote[] {
  try {
    const raw = window.localStorage.getItem(NOTEBOOK_STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function readToolStates(): NotebookToolState[] {
  try {
    const raw = window.localStorage.getItem(NOTEBOOK_TOOLS_STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function getNotePreview(content: string): string {
  const preview = content.replace(/\s+/g, " ").trim();
  return preview.length > 54 ? `${preview.slice(0, 54)}...` : preview;
}

export function FloatingNotebook({ taskId, taskTitle }: FloatingNotebookProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<NotebookMode>("notes");
  const [drawingTool, setDrawingTool] = useState<"pen" | "eraser">("pen");
  const [notes, setNotes] = useState<NotebookNote[]>([]);
  const [toolStates, setToolStates] = useState<NotebookToolState[]>([]);
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"Saved" | "Saving...">("Saved");
  const titleRef = useRef<HTMLInputElement>(null);
  const equationRef = useRef<HTMLTextAreaElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawingRef = useRef(false);
  const drawingChangedRef = useRef(false);
  const focusTitleRef = useRef(false);

  const taskNotes = notes
    .filter((note) => note.taskId === taskId)
    .sort((first, second) => second.updatedAt - first.updatedAt);
  const selectedNote = taskNotes.find((note) => note.id === selectedNoteId) ?? taskNotes[0];
  const toolNoteId = selectedNote?.id ?? "task-default";
  const currentToolState = toolStates.find((state) => state.taskId === taskId && state.noteId === toolNoteId);
  const equation = currentToolState?.equation ?? "";

  useEffect(() => {
    const hydrationId = window.setTimeout(() => {
      setNotes(readNotes());
      setToolStates(readToolStates());
      setHasLoaded(true);
    }, 0);
    return () => window.clearTimeout(hydrationId);
  }, []);

  useEffect(() => {
    if (!hasLoaded) return;
    const saveId = window.setTimeout(() => {
      window.localStorage.setItem(NOTEBOOK_STORAGE_KEY, JSON.stringify(notes));
      window.localStorage.setItem(NOTEBOOK_TOOLS_STORAGE_KEY, JSON.stringify(toolStates));
      setSaveStatus("Saved");
    }, 180);
    return () => window.clearTimeout(saveId);
  }, [hasLoaded, notes, toolStates]);

  useEffect(() => {
    if (!hasLoaded) return;
    const flushStorage = () => {
      window.localStorage.setItem(NOTEBOOK_STORAGE_KEY, JSON.stringify(notes));
      window.localStorage.setItem(NOTEBOOK_TOOLS_STORAGE_KEY, JSON.stringify(toolStates));
    };
    window.addEventListener("pagehide", flushStorage);
    return () => window.removeEventListener("pagehide", flushStorage);
  }, [hasLoaded, notes, toolStates]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  useEffect(() => {
    if (focusTitleRef.current && selectedNote) {
      titleRef.current?.focus();
      titleRef.current?.select();
      focusTitleRef.current = false;
    }
  }, [selectedNote]);

  useEffect(() => {
    if (!isOpen || mode !== "draw" || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");
    if (!context) return;

    let isInitialResize = true;
    const resizeCanvas = () => {
      const previousImage = isInitialResize || canvas.width === 0 || canvas.height === 0 ? "" : canvas.toDataURL();
      const ratio = window.devicePixelRatio || 1;
      const width = Math.max(canvas.clientWidth, 1);
      const height = Math.max(canvas.clientHeight, 1);
      canvas.width = width * ratio;
      canvas.height = height * ratio;
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      context.lineCap = "round";
      context.lineJoin = "round";
      context.lineWidth = 2.5;
      context.strokeStyle = "#334155";

      const imageSource = previousImage || currentToolState?.drawing;
      if (imageSource) {
        const image = new Image();
        image.onload = () => context.drawImage(image, 0, 0, width, height);
        image.src = imageSource;
      }
      isInitialResize = false;
    };

    resizeCanvas();
    const observer = new ResizeObserver(resizeCanvas);
    observer.observe(canvas);
    return () => observer.disconnect();
  }, [currentToolState?.drawing, isOpen, mode, toolNoteId]);

  useEffect(() => {
    const context = canvasRef.current?.getContext("2d");
    if (!context) return;
    context.globalCompositeOperation = drawingTool === "eraser" ? "destination-out" : "source-over";
    context.strokeStyle = "#334155";
    context.lineWidth = drawingTool === "eraser" ? 18 : 2.5;
  }, [drawingTool]);

  const handleCreateNote = () => {
    const note = createNote(taskId);
    setNotes((currentNotes) => [...currentNotes, note]);
    setSelectedNoteId(note.id);
    setSaveStatus("Saving...");
    focusTitleRef.current = true;
  };

  const updateSelectedNote = (updates: Partial<Pick<NotebookNote, "title" | "content">>) => {
    if (!selectedNote) return;
    setSaveStatus("Saving...");
    setNotes((currentNotes) => currentNotes.map((note) => (
      note.id === selectedNote.id
        ? { ...note, ...updates, updatedAt: Date.now() }
        : note
    )));
  };

  const handleDeleteNote = () => {
    if (!selectedNote) return;
    if (!window.confirm("Delete this note?")) return;

    const remainingTaskNotes = taskNotes.filter((note) => note.id !== selectedNote.id);
    setNotes((currentNotes) => currentNotes.filter((note) => note.id !== selectedNote.id));
    setSelectedNoteId(remainingTaskNotes[0]?.id ?? null);
    setSaveStatus("Saving...");
  };

  const updateToolState = (updates: Partial<Pick<NotebookToolState, "drawing" | "equation">>) => {
    setSaveStatus("Saving...");
    setToolStates((currentStates) => {
      const existing = currentStates.find((state) => state.taskId === taskId && state.noteId === toolNoteId);
      if (existing) {
        return currentStates.map((state) => (
          state === existing ? { ...state, ...updates } : state
        ));
      }
      return [...currentStates, { taskId, noteId: toolNoteId, drawing: "", equation: "", ...updates }];
    });
  };

  const getCanvasPoint = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const bounds = canvas.getBoundingClientRect();
    return { x: event.clientX - bounds.left, y: event.clientY - bounds.top };
  };

  const handlePointerDown = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context) return;
    const point = getCanvasPoint(event);
    canvas.setPointerCapture(event.pointerId);
    drawingRef.current = true;
    context.beginPath();
    context.moveTo(point.x, point.y);
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawingRef.current) return;
    const context = canvasRef.current?.getContext("2d");
    if (!context) return;
    const point = getCanvasPoint(event);
    context.lineTo(point.x, point.y);
    context.stroke();
    drawingChangedRef.current = true;
  };

  const finishDrawing = () => {
    if (!drawingRef.current) return;
    drawingRef.current = false;
    if (drawingChangedRef.current && canvasRef.current) {
      updateToolState({ drawing: canvasRef.current.toDataURL("image/png") });
      drawingChangedRef.current = false;
    }
  };

  const handleClearDrawing = () => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context) return;
    context.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);
    updateToolState({ drawing: "" });
  };

  const handleDrawingMode = (tool: "pen" | "eraser") => {
    setDrawingTool(tool);
    const context = canvasRef.current?.getContext("2d");
    if (!context) return;
    context.globalCompositeOperation = tool === "eraser" ? "destination-out" : "source-over";
    context.strokeStyle = "#334155";
    context.lineWidth = tool === "eraser" ? 18 : 2.5;
  };

  const handleEquationChange = (value: string) => updateToolState({ equation: value });

  const insertEquationSymbol = (symbol: string) => {
    const input = equationRef.current;
    if (!input) return;
    const start = input.selectionStart;
    const end = input.selectionEnd;
    const nextEquation = `${equation.slice(0, start)}${symbol}${equation.slice(end)}`;
    handleEquationChange(nextEquation);
    window.requestAnimationFrame(() => {
      input.focus();
      input.setSelectionRange(start + symbol.length, start + symbol.length);
    });
  };

  const modes: { id: NotebookMode; label: string; icon: typeof NotebookPen }[] = [
    { id: "notes", label: "Notes", icon: NotebookPen },
    { id: "draw", label: "Draw", icon: Pencil },
    { id: "equations", label: "Equations", icon: Sigma },
  ];

  return (
    <div className="fixed bottom-4 right-4 z-40 flex flex-col items-end gap-3 sm:bottom-6 sm:right-6">
      <AnimatePresence>
        {isOpen && (
          <motion.section
            initial={{ opacity: 0, y: 10, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.97 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="flex h-[min(36rem,calc(100vh-6rem))] w-[min(30rem,calc(100vw-1rem))] flex-col overflow-hidden rounded-xl border border-border bg-card shadow-xl sm:h-[min(36rem,calc(100vh-7rem))] sm:w-[min(30rem,calc(100vw-2rem))]"
            aria-label="Notebook"
          >
            <header className="flex shrink-0 items-center justify-between border-b border-border bg-secondary/40 px-4 py-3">
              <div className="min-w-0 flex items-center gap-2">
                <BookOpen size={17} className="text-primary" />
                <div className="min-w-0">
                  <h2 className="text-sm font-semibold text-foreground">Notebook</h2>
                  {taskTitle && <p className="max-w-48 truncate text-[11px] text-muted-foreground" title={taskTitle}>{taskTitle}</p>}
                </div>
                <span className="text-[11px] text-muted-foreground" aria-live="polite">{saveStatus}</span>
              </div>
              <div className="flex items-center gap-1">
                {selectedNote && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                    onClick={handleDeleteNote}
                    aria-label="Delete selected note"
                    title="Delete selected note"
                  >
                    <Trash2 size={15} />
                  </Button>
                )}
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setIsOpen(false)}
                  aria-label="Close notebook"
                  title="Close notebook"
                >
                  <X size={16} />
                </Button>
              </div>
            </header>

            <nav className="flex shrink-0 gap-1 border-b border-border px-3 py-2" aria-label="Notebook tools" role="tablist">
              {modes.map(({ id, label, icon: Icon }) => (
                <button
                  type="button"
                  key={id}
                  onClick={() => setMode(id)}
                  role="tab"
                  aria-selected={mode === id}
                  className={`flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                    mode === id ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                  }`}
                >
                  <Icon size={14} />
                  {label}
                </button>
              ))}
            </nav>

            {mode === "notes" ? <div className="flex min-h-0 flex-1 flex-col sm:flex-row">
              <aside className="flex max-h-36 shrink-0 flex-col border-b border-border bg-secondary/20 sm:w-40 sm:max-h-none sm:border-b-0 sm:border-r">
                <div className="flex items-center justify-between px-3 py-2.5">
                  <span className="uppercase-label">Notes</span>
                  <button
                    type="button"
                    onClick={handleCreateNote}
                    className="rounded-md p-1.5 text-primary transition-colors hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                    aria-label="Create note"
                    title="Create note"
                  >
                    <Plus size={16} />
                  </button>
                </div>
                <div className="min-h-0 overflow-y-auto px-2 pb-2">
                  {taskNotes.length > 0 ? taskNotes.map((note) => (
                    <button
                      type="button"
                      key={note.id}
                      onClick={() => setSelectedNoteId(note.id)}
                      className={`mb-1 flex w-full items-start gap-2 rounded-lg px-2.5 py-2 text-left text-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                        selectedNote?.id === note.id
                          ? "bg-primary/10 font-medium text-primary"
                          : "text-foreground hover:bg-secondary"
                      }`}
                    >
                      <FileText size={14} className="mt-0.5 shrink-0" />
                      <span className="min-w-0">
                        <span className="block truncate">{note.title.trim() || "Untitled Note"}</span>
                        {getNotePreview(note.content) && (
                          <span className="mt-0.5 block truncate text-[11px] font-normal text-muted-foreground">
                            {getNotePreview(note.content)}
                          </span>
                        )}
                      </span>
                    </button>
                  )) : (
                    <p className="px-2.5 py-2 text-xs text-muted-foreground">No notes yet</p>
                  )}
                </div>
              </aside>

              <div className="min-h-0 flex-1 overflow-y-auto p-4">
                {selectedNote ? (
                  <div className="flex h-full min-h-52 flex-col gap-3">
                    <label className="sr-only" htmlFor="notebook-note-title">Note title</label>
                    <input
                      ref={titleRef}
                      id="notebook-note-title"
                      value={selectedNote.title}
                      onChange={(event) => updateSelectedNote({ title: event.target.value })}
                      className="input-base font-semibold"
                      aria-label="Note title"
                    />
                    <label className="sr-only" htmlFor="notebook-note-content">Note content</label>
                    <textarea
                      id="notebook-note-content"
                      value={selectedNote.content}
                      onChange={(event) => updateSelectedNote({ content: event.target.value })}
                      placeholder="Write down an idea, question, or reminder..."
                      className="textarea-base min-h-40 flex-1 resize-none bg-secondary/20 leading-relaxed"
                      aria-label="Note content"
                    />
                    <p className="text-[11px] text-muted-foreground">Notes are saved on this device.</p>
                  </div>
                ) : (
                  <div className="flex h-full min-h-52 flex-col items-center justify-center text-center">
                    <div className="mb-3 rounded-full bg-primary/10 p-3 text-primary">
                      <FileText size={20} />
                    </div>
                    <h3 className="text-sm font-semibold text-foreground">Your notebook is empty</h3>
                    <p className="mt-1 max-w-xs text-xs leading-relaxed text-muted-foreground">
                      Capture ideas, questions, formulas, or reminders while you learn.
                    </p>
                    <Button type="button" size="sm" className="mt-4" onClick={handleCreateNote}>
                      <Plus size={14} />
                      Create Note
                    </Button>
                  </div>
                )}
              </div>
            </div> : mode === "draw" ? (
              <div className="flex min-h-0 flex-1 flex-col p-4">
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Sketch a quick idea</span>
                  <div className="flex items-center gap-1">
                    <Button type="button" variant={drawingTool === "pen" ? "secondary" : "ghost"} size="sm" onClick={() => handleDrawingMode("pen")} className="h-8 gap-1.5 px-2.5 text-xs" aria-pressed={drawingTool === "pen"}>
                      <Pencil size={14} /> Pen
                    </Button>
                    <Button type="button" variant={drawingTool === "eraser" ? "secondary" : "ghost"} size="sm" onClick={() => handleDrawingMode("eraser")} className="h-8 gap-1.5 px-2.5 text-xs" aria-pressed={drawingTool === "eraser"}>
                      <Eraser size={14} /> Eraser
                    </Button>
                    <Button type="button" variant="ghost" size="sm" onClick={handleClearDrawing} className="h-8 px-2.5 text-xs">Clear</Button>
                  </div>
                </div>
                <canvas
                  ref={canvasRef}
                  className={`min-h-0 w-full flex-1 touch-none rounded-lg border border-border bg-background ${drawingTool === "eraser" ? "cursor-cell" : "cursor-crosshair"}`}
                  onPointerDown={handlePointerDown}
                  onPointerMove={handlePointerMove}
                  onPointerUp={finishDrawing}
                  onPointerCancel={finishDrawing}
                  aria-label="Drawing canvas"
                />
              </div>
            ) : (
              <div className="flex min-h-0 flex-1 flex-col p-4">
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Work through a calculation</span>
                  <div className="flex flex-wrap justify-end gap-1">
                    {["−", "×", "÷", "=", "√", "²", "π", "(", ")"].map((symbol) => (
                      <button
                        type="button"
                        key={symbol}
                        onClick={() => insertEquationSymbol(symbol)}
                        className="h-7 min-w-7 rounded border border-border bg-secondary/40 px-1.5 font-mono text-xs text-foreground transition-colors hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                        aria-label={`Insert ${symbol}`}
                      >
                        {symbol}
                      </button>
                    ))}
                  </div>
                </div>
                <textarea
                  ref={equationRef}
                  value={equation}
                  onChange={(event) => handleEquationChange(event.target.value)}
                  placeholder={'x + 5 = 12\n2x = 7'}
                  className="min-h-0 flex-1 resize-none rounded-lg border border-border bg-secondary/20 p-4 font-mono text-sm leading-relaxed outline-none transition-colors placeholder:text-muted-foreground/70 focus:border-primary focus:ring-2 focus:ring-primary/20"
                  aria-label="Equation workspace"
                />
              </div>
            )}
          </motion.section>
        )}
      </AnimatePresence>

      <Tooltip content="Notebook" side="left">
        <Button
          type="button"
          variant={isOpen ? "secondary" : "default"}
          size="icon"
          onClick={() => setIsOpen((open) => !open)}
          aria-label={isOpen ? "Minimize notebook" : "Open notebook"}
          aria-expanded={isOpen}
          className="h-12 w-12 rounded-full shadow-lg transition-transform hover:-translate-y-0.5"
        >
          {isOpen ? <X size={19} /> : <BookOpen size={19} />}
        </Button>
      </Tooltip>
    </div>
  );
}