import { useEffect, useMemo, useState } from "react";
import {
  DndContext,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

const DragIcon = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
    <circle cx="8" cy="6" r="1.5" fill="currentColor" />
    <circle cx="8" cy="12" r="1.5" fill="currentColor" />
    <circle cx="8" cy="18" r="1.5" fill="currentColor" />
    <circle cx="16" cy="6" r="1.5" fill="currentColor" />
    <circle cx="16" cy="12" r="1.5" fill="currentColor" />
    <circle cx="16" cy="18" r="1.5" fill="currentColor" />
  </svg>
);

const TrashIcon = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M3 6h18" />
    <path d="M8 6v-2h8v2" />
    <path d="M7 6l1 14h8l1-14" />
  </svg>
);

function SortableStageRow({ stage, onChange, onDelete }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: stage.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="funnel-editor-row">
      <button type="button" className="funnel-editor-drag" {...attributes} {...listeners} aria-label="גרור לשינוי סדר">
        <DragIcon />
      </button>
      <input
        className="funnel-editor-input"
        value={stage.label}
        onChange={(e) => onChange({ ...stage, label: e.target.value })}
        placeholder="שם שלב"
      />
      <label className="funnel-editor-toggle">
        <input
          type="checkbox"
          checked={stage.active !== false}
          onChange={(e) => onChange({ ...stage, active: e.target.checked })}
        />
        <span>פעיל</span>
      </label>
      <button type="button" className="funnel-editor-delete" onClick={() => onDelete(stage.id)} aria-label="מחק שלב">
        <TrashIcon />
      </button>
    </div>
  );
}

export default function FunnelStagesEditor({ open, stages, onClose, onSave }) {
  const [draft, setDraft] = useState([]);
  const [newStageName, setNewStageName] = useState("");

  useEffect(() => {
    if (open) {
      setDraft(stages);
      setNewStageName("");
    }
  }, [open, stages]);

  useEffect(() => {
    const body = document.body;
    const root = document.documentElement;
    if (open) {
      body.classList.add("funnel-editor-open");
      root.classList.add("funnel-editor-open");
    } else {
      body.classList.remove("funnel-editor-open");
      root.classList.remove("funnel-editor-open");
    }
    return () => {
      body.classList.remove("funnel-editor-open");
      root.classList.remove("funnel-editor-open");
    };
  }, [open]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } })
  );

  const ids = useMemo(() => draft.map((stage) => stage.id), [draft]);

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = draft.findIndex((item) => item.id === active.id);
    const newIndex = draft.findIndex((item) => item.id === over.id);
    setDraft(arrayMove(draft, oldIndex, newIndex));
  };

  const handleStageChange = (nextStage) => {
    setDraft((prev) => prev.map((item) => (item.id === nextStage.id ? nextStage : item)));
  };

  const handleDelete = (id) => {
    setDraft((prev) => prev.filter((item) => item.id !== id));
  };

  const handleAddStage = () => {
    if (!newStageName.trim()) return;
    const newStage = {
      id: `stage-${Date.now()}`,
      label: newStageName.trim(),
      value: 0,
      percent: "0%",
      conversionRate: null,
      conversionDirection: null,
      dropped: null,
      droppedPercent: null,
      insight: null,
      iconType: "people",
      critical: false,
      active: true,
    };
    setDraft((prev) => [...prev, newStage]);
    setNewStageName("");
  };

  if (!open) return null;

  return (
    <div className="funnel-editor-overlay" role="dialog" aria-modal="true">
      <div className="funnel-editor-panel">
        <div className="funnel-editor-header">
          <div>
            <h3>ניהול שלבי משפך</h3>
            <p>גרור לשינוי סדר, הוסף/מחק שלבים</p>
          </div>
          <div className="funnel-editor-actions">
            <button type="button" className="funnel-editor-btn ghost" onClick={onClose}>
              ביטול
            </button>
            <button type="button" className="funnel-editor-btn primary" onClick={() => onSave(draft)}>
              שמור שינויים
            </button>
          </div>
        </div>

        <div className="funnel-editor-body">
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={ids} strategy={verticalListSortingStrategy}>
              <div className="funnel-editor-list">
                {draft.map((stage) => (
                  <SortableStageRow
                    key={stage.id}
                    stage={stage}
                    onChange={handleStageChange}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>

          <div className="funnel-editor-add">
            <input
              className="funnel-editor-input"
              value={newStageName}
              onChange={(e) => setNewStageName(e.target.value)}
              placeholder="שם שלב חדש"
            />
            <button type="button" className="funnel-editor-btn primary" onClick={handleAddStage}>
              הוסף שלב
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
