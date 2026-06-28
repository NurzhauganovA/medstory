import { useCallback, useEffect, useRef, useState } from "react";

export type SpeechRecognitionStatus = "idle" | "listening" | "error" | "unsupported";

interface UseSpeechRecognitionOptions {
  language?: string;
}

interface SpeechRecognitionLike {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
}

function getSpeechRecognitionCtor(): (new () => SpeechRecognitionLike) | null {
  if (typeof window === "undefined") return null;
  return window.SpeechRecognition ?? window.webkitSpeechRecognition ?? null;
}

export function isSpeechRecognitionSupported() {
  return getSpeechRecognitionCtor() != null;
}

async function ensureMicrophoneAccess(): Promise<boolean> {
  if (!navigator.mediaDevices?.getUserMedia) return true;
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    stream.getTracks().forEach((track) => track.stop());
    return true;
  } catch {
    return false;
  }
}

export function useSpeechRecognition({ language = "ru-RU" }: UseSpeechRecognitionOptions = {}) {
  const [status, setStatus] = useState<SpeechRecognitionStatus>(
    isSpeechRecognitionSupported() ? "idle" : "unsupported",
  );
  const [interimText, setInterimText] = useState("");
  const [finalText, setFinalText] = useState("");
  const [error, setError] = useState<string | null>(null);

  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const listeningRef = useRef(false);
  const restartingRef = useRef(false);
  const launchRecognitionRef = useRef<() => void>(() => undefined);

  const launchRecognition = useCallback(() => {
    const Ctor = getSpeechRecognitionCtor();
    if (!Ctor || !listeningRef.current) return;

    recognitionRef.current?.abort();

    const recognition = new Ctor();
    recognition.lang = language;
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let interim = "";
      let finalChunk = "";
      for (let i = event.resultIndex; i < event.results.length; i += 1) {
        const result = event.results[i];
        const transcript = result[0]?.transcript ?? "";
        if (result.isFinal) {
          finalChunk += transcript;
        } else {
          interim += transcript;
        }
      }
      if (interim) setInterimText(interim);
      if (finalChunk) {
        setFinalText((prev) => {
          const chunk = finalChunk.trim();
          if (!chunk) return prev;
          return prev ? `${prev} ${chunk}` : chunk;
        });
        setInterimText("");
      }
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      if (event.error === "aborted") return;
      if (event.error === "no-speech") {
        setInterimText("");
        return;
      }
      listeningRef.current = false;
      setStatus("error");
      if (event.error === "not-allowed") {
        setError("Разрешите доступ к микрофону в настройках браузера.");
      } else if (event.error === "network") {
        setError("Нет связи с сервисом распознавания. Проверьте интернет.");
      } else {
        setError("Не удалось распознать речь. Нажмите «Начать запись» ещё раз.");
      }
    };

    recognition.onend = () => {
      if (!listeningRef.current) {
        setStatus("idle");
        return;
      }
      if (restartingRef.current) return;
      restartingRef.current = true;
      window.setTimeout(() => {
        restartingRef.current = false;
        if (!listeningRef.current) {
          setStatus("idle");
          return;
        }
        try {
          recognition.start();
          setStatus("listening");
        } catch {
          launchRecognitionRef.current();
        }
      }, 120);
    };

    recognitionRef.current = recognition;

    try {
      recognition.start();
      setStatus("listening");
      setError(null);
    } catch {
      listeningRef.current = false;
      setStatus("error");
      setError("Микрофон занят. Закройте другие вкладки с записью и попробуйте снова.");
    }
  }, [language]);

  launchRecognitionRef.current = launchRecognition;

  const start = useCallback(
    async (options?: { reset?: boolean }) => {
      const Ctor = getSpeechRecognitionCtor();
      if (!Ctor) {
        setStatus("unsupported");
        setError("Используйте Chrome или Edge для голосового ввода.");
        return;
      }

      if (options?.reset) {
        setFinalText("");
        setInterimText("");
      }
      setError(null);

      const micOk = await ensureMicrophoneAccess();
      if (!micOk) {
        setStatus("error");
        setError("Разрешите доступ к микрофону в настройках браузера.");
        return;
      }

      listeningRef.current = true;
      launchRecognition();
    },
    [launchRecognition],
  );

  const stop = useCallback(() => {
    listeningRef.current = false;
    restartingRef.current = false;
    recognitionRef.current?.stop();
    setStatus("idle");
  }, []);

  const abort = useCallback(() => {
    listeningRef.current = false;
    restartingRef.current = false;
    recognitionRef.current?.abort();
    recognitionRef.current = null;
    setStatus("idle");
  }, []);

  const reset = useCallback(() => {
    abort();
    setInterimText("");
    setFinalText("");
    setError(null);
  }, [abort]);

  useEffect(() => () => abort(), [abort]);

  const preview = `${finalText}${finalText && interimText ? " " : ""}${interimText}`.trim();

  return {
    status,
    preview,
    error,
    isSupported: status !== "unsupported",
    start,
    stop,
    abort,
    reset,
  };
}

export function appendVoiceText(current: string, spoken: string) {
  const next = spoken.trim();
  if (!next) return current;
  if (!current.trim()) return next;
  return `${current.trimEnd()} ${next}`;
}
