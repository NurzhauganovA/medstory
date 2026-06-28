import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import {
  appendVoiceText,
  isSpeechRecognitionSupported,
  useSpeechRecognition,
} from "../../hooks/useSpeechRecognition";

interface VoiceInputProps {
  fieldLabel?: string;
  disabled?: boolean;
  className?: string;
  onInsert: (text: string) => void;
}

function MicIcon({ large }: { large?: boolean }) {
  const size = large ? 22 : 16;
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 14a3 3 0 0 0 3-3V6a3 3 0 1 0-6 0v5a3 3 0 0 0 3 3Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M19 11a7 7 0 0 1-14 0M12 18v3M8 21h8"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function VoiceInputButton({ fieldLabel, disabled, className, onInsert }: VoiceInputProps) {
  const [open, setOpen] = useState(false);
  const titleId = useId();
  const supported = isSpeechRecognitionSupported();

  if (!supported || disabled) {
    return null;
  }

  return (
    <>
      <button
        type="button"
        className={`voice-mic-btn ${className ?? ""}`}
        aria-label={`Голосовой ввод: ${fieldLabel ?? "поле"}`}
        title="Голосовой ввод"
        onClick={() => setOpen(true)}
      >
        <MicIcon />
      </button>
      {open &&
        createPortal(
          <VoiceInputPanel
            titleId={titleId}
            fieldLabel={fieldLabel}
            onClose={() => setOpen(false)}
            onInsert={onInsert}
          />,
          document.body,
        )}
    </>
  );
}

function VoiceInputPanel({
  titleId,
  fieldLabel,
  onClose,
  onInsert,
}: {
  titleId: string;
  fieldLabel?: string;
  onClose: () => void;
  onInsert: (text: string) => void;
}) {
  const speech = useSpeechRecognition({ language: "ru-RU" });
  const startedRef = useRef(false);
  const startFnRef = useRef(speech.start);
  startFnRef.current = speech.start;

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;
    void startFnRef.current({ reset: true });
  }, []);

  const handleClose = () => {
    speech.abort();
    onClose();
  };

  const handleInsert = () => {
    speech.stop();
    const text = speech.preview;
    if (text) onInsert(text);
    onClose();
  };

  const handleReset = () => {
    speech.reset();
    void speech.start({ reset: true });
  };

  const listening = speech.status === "listening";
  const canReset = listening || !!speech.preview || speech.status === "error";

  const statusText =
    speech.status === "listening"
      ? "Слушаю… говорите чётко в микрофон"
      : speech.status === "error"
        ? (speech.error ?? "Ошибка распознавания")
        : speech.status === "unsupported"
          ? "Голосовой ввод недоступен в этом браузере"
          : speech.preview
            ? "Запись на паузе — «Сбросить» чтобы начать заново"
            : "Нажмите «Начать запись» и говорите";

  return (
    <div
      className="voice-panel-backdrop"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) handleClose();
      }}
      role="presentation"
    >
      <div
        className="voice-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="voice-panel__header">
          <div>
            <h4 id={titleId} className="voice-panel__title">
              Голосовой ввод
            </h4>
            {fieldLabel && <p className="voice-panel__subtitle">{fieldLabel}</p>}
          </div>
          <button type="button" className="voice-panel__close" onClick={handleClose} aria-label="Закрыть">
            ×
          </button>
        </div>

        <button
          type="button"
          className={`voice-panel__mic ${listening ? "voice-panel__mic--active" : ""}`}
          onClick={() => (listening ? speech.stop() : void speech.start())}
          aria-label={listening ? "Остановить запись" : "Начать запись"}
        >
          <span className="voice-panel__mic-ring" />
          <span className="voice-panel__mic-icon">
            <MicIcon large />
          </span>
        </button>

        <p className={`voice-panel__status ${speech.status === "error" ? "voice-panel__status--error" : ""}`}>
          {statusText}
        </p>

        <div className="voice-panel__preview" aria-live="polite">
          {speech.preview || (
            <span className="voice-panel__preview-placeholder">Здесь появится распознанный текст…</span>
          )}
        </div>

        <div className="voice-panel__actions">
          {listening ? (
            <button type="button" className="btn-form btn-form--ghost" onClick={speech.stop}>
              Стоп
            </button>
          ) : (
            <button type="button" className="btn-form btn-form--ghost" onClick={() => void speech.start()}>
              {speech.preview ? "Продолжить" : "Начать запись"}
            </button>
          )}
          <button
            type="button"
            className="btn-form btn-form--muted"
            disabled={!canReset}
            onClick={handleReset}
          >
            Сбросить
          </button>
          <button
            type="button"
            className="btn-form btn-form--primary"
            disabled={!speech.preview}
            onClick={handleInsert}
          >
            Вставить в поле
          </button>
        </div>

        <p className="voice-panel__hint">Chrome / Edge · язык: русский · текст добавляется к уже введённому</p>
      </div>
    </div>
  );
}

export function VoiceInputWrap({
  children,
  fieldLabel,
  disabled,
  value,
  onVoiceInsert,
}: {
  children: ReactNode;
  fieldLabel?: string;
  disabled?: boolean;
  value: string;
  onVoiceInsert: (value: string) => void;
}) {
  return (
    <div className="voice-input-wrap">
      {children}
      <VoiceInputButton
        fieldLabel={fieldLabel}
        disabled={disabled}
        onInsert={(text) => onVoiceInsert(appendVoiceText(value, text))}
      />
    </div>
  );
}
