import { useCallback, useRef, useState } from "react";
import type { BodyMapMarker, BodyMapProcedure, BodyMapTool, BodyMapView } from "../../types";
import { PfTextarea } from "./PatientFormFields";
import { MarkerProceduresEditor } from "./TreatmentProceduresPanel";

const BODY_IMAGES: Record<BodyMapView, string> = {
  front: "/assets/body-front.png",
  back: "/assets/body-back.png",
};

const MARKER_TOOLS: { id: BodyMapTool; icon: string; label: string }[] = [
  { id: "diamond", icon: "◇", label: "Ромб" },
  { id: "circle", icon: "○", label: "Круг" },
  { id: "link", icon: "🔗", label: "Связь" },
  { id: "grid", icon: "▦", label: "Область" },
  { id: "arrow", icon: "↗", label: "Стрелка" },
];

const ACTION_TOOLS = [
  { id: "zoom-in", icon: "+", label: "Увеличить" },
  { id: "zoom-out", icon: "−", label: "Уменьшить" },
  { id: "zoom-fit", icon: "⊡", label: "Сброс масштаба" },
  { id: "erase", icon: "⌫", label: "Удалить точку" },
  { id: "undo", icon: "↩", label: "Отменить" },
] as const;

type ActionToolId = (typeof ACTION_TOOLS)[number]["id"];
type ActiveTool = BodyMapTool | ActionToolId | "pan";

function newMarkerId() {
  return `bm-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function markerLabel(tool: BodyMapTool) {
  return MARKER_TOOLS.find((t) => t.id === tool)?.label ?? tool;
}

interface BodyMapEditorProps {
  markers: BodyMapMarker[];
  onChange: (markers: BodyMapMarker[]) => void;
  onPersist?: (markers: BodyMapMarker[]) => Promise<void>;
  procedureOptions?: string[];
  drugOptions?: string[];
}

export function BodyMapEditor({
  markers,
  onChange,
  onPersist,
  procedureOptions = [],
  drugOptions = [],
}: BodyMapEditorProps) {
  const [view, setView] = useState<BodyMapView>("back");
  const [activeTool, setActiveTool] = useState<ActiveTool>("diamond");
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [draftDescription, setDraftDescription] = useState("");
  const [draftProcedures, setDraftProcedures] = useState<BodyMapProcedure[]>([]);
  const [persisting, setPersisting] = useState(false);
  const [savedFlash, setSavedFlash] = useState(false);
  const viewportRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{ x: number; y: number; panX: number; panY: number; moved: boolean } | null>(null);
  const savedFlashTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const viewMarkers = markers.filter((m) => m.view === view);
  const selected = markers.find((m) => m.id === selectedId) ?? null;

  const applyMarkers = useCallback(
    async (next: BodyMapMarker[], persist = false) => {
      onChange(next);
      if (!persist || !onPersist) return;
      setPersisting(true);
      try {
        await onPersist(next);
        if (savedFlashTimer.current) clearTimeout(savedFlashTimer.current);
        setSavedFlash(true);
        savedFlashTimer.current = setTimeout(() => setSavedFlash(false), 2000);
      } finally {
        setPersisting(false);
      }
    },
    [onChange, onPersist],
  );

  const resetView = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  const handleViewChange = (next: BodyMapView) => {
    setView(next);
    setSelectedId(null);
    setDraftDescription("");
    setDraftProcedures([]);
    resetView();
  };

  const openMarker = (marker: BodyMapMarker) => {
    setSelectedId(marker.id);
    setDraftDescription(marker.description ?? "");
    setDraftProcedures(marker.procedures ?? []);
  };

  const saveMarker = async () => {
    if (!selectedId) return;
    const next = markers.map((m) =>
      m.id === selectedId
        ? {
            ...m,
            description: draftDescription.trim() || null,
            procedures: draftProcedures,
          }
        : m,
    );
    await applyMarkers(next, true);
  };

  const deleteMarker = async (id: string) => {
    const next = markers.filter((m) => m.id !== id);
    await applyMarkers(next, true);
    if (selectedId === id) {
      setSelectedId(null);
      setDraftDescription("");
      setDraftProcedures([]);
    }
  };

  const placeMarker = async (x: number, y: number) => {
    if (activeTool === "erase" || activeTool === "zoom-in" || activeTool === "zoom-out" || activeTool === "zoom-fit" || activeTool === "undo" || activeTool === "pan") {
      return;
    }
    const marker: BodyMapMarker = {
      id: newMarkerId(),
      view,
      tool: activeTool,
      x,
      y,
      description: null,
      procedures: [],
    };
    const next = [...markers, marker];
    await applyMarkers(next, true);
    openMarker(marker);
  };

  const getPointFromEvent = (clientX: number, clientY: number) => {
    const viewport = viewportRef.current;
    const stage = stageRef.current;
    if (!viewport || !stage) return null;

    const vpRect = viewport.getBoundingClientRect();
    const w = stage.offsetWidth;
    const h = stage.offsetHeight;
    if (!w || !h) return null;

    const px = clientX - vpRect.left;
    const py = clientY - vpRect.top;
    const originX = vpRect.width / 2;
    const originY = h / 2;

    const localX = originX + (px - originX - pan.x) / zoom;
    const localY = originY + (py - originY - pan.y) / zoom;

    const x = (localX / w) * 100;
    const y = (localY / h) * 100;
    if (x < 0 || x > 100 || y < 0 || y > 100) return null;
    return { x, y };
  };

  const handleStageClick = async (e: React.MouseEvent) => {
    if (dragRef.current?.moved) return;

    const point = getPointFromEvent(e.clientX, e.clientY);
    if (!point) return;

    if (activeTool === "zoom-in") {
      setZoom((z) => Math.min(z * 1.5, 4));
      return;
    }
    if (activeTool === "zoom-out") {
      setZoom((z) => Math.max(z / 1.5, 1));
      return;
    }
    if (activeTool === "zoom-fit") {
      resetView();
      return;
    }
    if (activeTool === "undo") {
      const last = [...markers].reverse().find((m) => m.view === view);
      if (last) await deleteMarker(last.id);
      return;
    }
    if (activeTool === "erase") {
      const hitRadius = 4 / zoom;
      const hit = viewMarkers.find((m) => Math.hypot(m.x - point.x, m.y - point.y) < hitRadius);
      if (hit) await deleteMarker(hit.id);
      return;
    }

    await placeMarker(point.x, point.y);
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    if (activeTool !== "pan") return;
    if ((e.target as HTMLElement).closest(".body-map-marker")) return;
    dragRef.current = { x: e.clientX, y: e.clientY, panX: pan.x, panY: pan.y, moved: false };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    const drag = dragRef.current;
    if (!drag) return;
    const dx = e.clientX - drag.x;
    const dy = e.clientY - drag.y;
    if (Math.abs(dx) > 3 || Math.abs(dy) > 3) drag.moved = true;
    setPan({ x: drag.panX + dx, y: drag.panY + dy });
  };

  const handlePointerUp = () => {
    dragRef.current = null;
  };

  const selectTool = (tool: ActiveTool) => {
    setActiveTool(tool);
    if (tool === "zoom-fit") resetView();
  };

  return (
    <div className="body-map-editor">
      <div className="body-map-editor__main">
        <div className="body-map-editor__canvas-col">
          <div className="body-map-editor__toolbar-row">
            <div className="body-map-editor__view-toggle">
              <button
                type="button"
                className={`body-map-editor__view-btn ${view === "front" ? "body-map-editor__view-btn--active" : ""}`}
                onClick={() => handleViewChange("front")}
              >
                Спереди
              </button>
              <button
                type="button"
                className={`body-map-editor__view-btn ${view === "back" ? "body-map-editor__view-btn--active" : ""}`}
                onClick={() => handleViewChange("back")}
              >
                Сзади
              </button>
            </div>
            <span className="body-map-editor__hint">
              {activeTool === "erase"
                ? "Нажмите на метку, чтобы удалить"
                : MARKER_TOOLS.some((t) => t.id === activeTool)
                  ? `Инструмент «${markerLabel(activeTool as BodyMapTool)}» — кликните на тело`
                  : "Выберите инструмент справа"}
            </span>
          </div>

          <div
            ref={viewportRef}
            className="body-map-editor__viewport"
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerLeave={handlePointerUp}
          >
            <div
              className="body-map-editor__transform"
              style={{ transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})` }}
            >
              <div
                ref={stageRef}
                className="body-map-editor__stage"
                onClick={handleStageClick}
              >
                <img
                  src={BODY_IMAGES[view]}
                  alt={view === "front" ? "Тело спереди" : "Тело сзади"}
                  className="body-map-editor__image"
                  draggable={false}
                />
                {viewMarkers.map((marker) => (
                  <button
                    key={marker.id}
                    type="button"
                    className={`body-map-marker body-map-marker--${marker.tool} ${selectedId === marker.id ? "body-map-marker--selected" : ""} ${marker.description ? "body-map-marker--filled" : ""} ${marker.procedures?.length ? "body-map-marker--has-procedures" : ""}`}
                    style={{
                      left: `${marker.x}%`,
                      top: `${marker.y}%`,
                      transform: `translate(-50%, -50%) scale(${1 / zoom})`,
                    }}
                    title={marker.description ?? "Добавить описание"}
                    onPointerDown={(e) => e.stopPropagation()}
                    onClick={(e) => {
                      e.stopPropagation();
                      openMarker(marker);
                    }}
                  >
                    <span className="body-map-marker__glyph">
                      {MARKER_TOOLS.find((t) => t.id === marker.tool)?.icon}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="body-map-editor__zoom-bar">
            <button type="button" className="body-map-editor__zoom-btn" onClick={() => setZoom((z) => Math.min(z * 1.25, 4))}>
              +
            </button>
            <span className="body-map-editor__zoom-label">{Math.round(zoom * 100)}%</span>
            <button type="button" className="body-map-editor__zoom-btn" onClick={() => setZoom((z) => Math.max(z / 1.25, 1))}>
              −
            </button>
            <button type="button" className="body-map-editor__zoom-reset" onClick={resetView}>
              Сброс
            </button>
          </div>
        </div>

        <div className="body-map-editor__tools">
          <span className="body-map-editor__tools-title">Метки</span>
          {MARKER_TOOLS.map((tool) => (
            <button
              key={tool.id}
              type="button"
              className={`diagnosis-body-map__tool ${activeTool === tool.id ? "diagnosis-body-map__tool--active" : ""}`}
              title={tool.label}
              onClick={() => selectTool(tool.id)}
            >
              {tool.icon}
            </button>
          ))}
          <span className="body-map-editor__tools-divider" />
          <span className="body-map-editor__tools-title">Действия</span>
          {ACTION_TOOLS.map((tool) => (
            <button
              key={tool.id}
              type="button"
              className={`diagnosis-body-map__tool ${activeTool === tool.id ? "diagnosis-body-map__tool--active" : ""}`}
              title={tool.label}
              onClick={() => selectTool(tool.id)}
            >
              {tool.icon}
            </button>
          ))}
          <button
            type="button"
            className={`diagnosis-body-map__tool ${activeTool === "pan" ? "diagnosis-body-map__tool--active" : ""}`}
            title="Перемещение"
            onClick={() => selectTool("pan")}
          >
            ✥
          </button>
        </div>
      </div>

      <div className="body-map-editor__details">
        {selected ? (
          <div className="body-map-editor__editor">
            <div className="body-map-editor__editor-head">
              <span className="body-map-editor__editor-title">
                {markerLabel(selected.tool)} · {view === "front" ? "спереди" : "сзади"}
              </span>
              <button type="button" className="body-map-editor__editor-delete" onClick={() => deleteMarker(selected.id)}>
                Удалить
              </button>
            </div>
            <PfTextarea
              label="Клиническое описание точки"
              value={draftDescription}
              onChange={setDraftDescription}
              rows={2}
              placeholder="Боль, гипертонус, триггерная точка…"
            />
            <MarkerProceduresEditor
              procedures={draftProcedures}
              procedureOptions={procedureOptions}
              drugOptions={drugOptions}
              onChange={setDraftProcedures}
            />
            <button
              type="button"
              className="btn-form btn-form--primary body-map-editor__save"
              onClick={() => void saveMarker()}
              disabled={persisting}
            >
              {persisting ? "Сохранение…" : "Сохранить метку"}
            </button>
            {savedFlash && <span className="body-map-editor__saved-hint">Метка сохранена в приём</span>}
          </div>
        ) : (
          <div className="body-map-editor__editor body-map-editor__editor--empty">
            <p>Выберите инструмент и отметьте точку на теле, или нажмите на существующую метку.</p>
          </div>
        )}

        <div className="body-map-editor__list">
          <span className="body-map-editor__list-title">
            Метки ({viewMarkers.length}) · {view === "front" ? "спереди" : "сзади"}
          </span>
          {viewMarkers.length === 0 ? (
            <p className="body-map-editor__list-empty">Пока нет меток на этом виде</p>
          ) : (
            <ul className="body-map-marker-list">
              {viewMarkers.map((marker, index) => (
                <li key={marker.id}>
                  <button
                    type="button"
                    className={`body-map-marker-list__item ${selectedId === marker.id ? "body-map-marker-list__item--active" : ""}`}
                    onClick={() => openMarker(marker)}
                  >
                    <span className="body-map-marker-list__num">{index + 1}</span>
                    <span className="body-map-marker-list__text">
                      {marker.description?.trim() ||
                        (marker.procedures?.length
                          ? `${marker.procedures.length} процедур(а)`
                          : "Без описания — нажмите, чтобы заполнить")}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
