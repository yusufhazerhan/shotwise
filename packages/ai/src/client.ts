import { GoogleGenerativeAI, type GenerationConfig } from "@google/generative-ai";

let _client: GoogleGenerativeAI | undefined;

export function getGemini() {
  if (_client) return _client;
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error("[@shotwise/ai] GEMINI_API_KEY is not set");
  _client = new GoogleGenerativeAI(key);
  return _client;
}

export const MODELS = {
  flash: "gemini-1.5-flash",
  flashLatest: "gemini-1.5-flash-latest",
  pro: "gemini-1.5-pro",
} as const;

export const DEFAULT_GENERATION_CONFIG: GenerationConfig = {
  temperature: 0.7,
  topP: 0.95,
  topK: 40,
  maxOutputTokens: 2048,
  responseMimeType: "application/json",
};

export class AiError extends Error {
  constructor(
    message: string,
    public readonly retriable: boolean,
    public override readonly cause?: unknown
  ) {
    super(message);
    this.name = "AiError";
  }
}

/**
 * Wrap a Gemini call with retry + timeout.
 * Retries on 429 / 503 / network errors; surfaces 400 etc. immediately.
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  opts: { retries?: number; timeoutMs?: number; label?: string } = {}
): Promise<T> {
  const retries = opts.retries ?? 2;
  const timeoutMs = opts.timeoutMs ?? 30_000;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await withTimeout(fn(), timeoutMs);
    } catch (err) {
      const retriable = isRetriable(err);
      if (attempt === retries || !retriable) {
        throw new AiError(
          `[${opts.label ?? "gemini"}] failed after ${attempt + 1} attempt(s): ${errorMessage(err)}`,
          retriable,
          err
        );
      }
      // Backoff: 500ms, 1500ms, ...
      await sleep(500 * (attempt + 1) ** 2);
    }
  }
  throw new AiError("unreachable", false);
}

function withTimeout<T>(p: Promise<T>, ms: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const t = setTimeout(() => reject(new Error(`timeout after ${ms}ms`)), ms);
    p.then(
      (v) => {
        clearTimeout(t);
        resolve(v);
      },
      (e) => {
        clearTimeout(t);
        reject(e);
      }
    );
  });
}

function isRetriable(err: unknown): boolean {
  const msg = errorMessage(err).toLowerCase();
  return (
    msg.includes("timeout") ||
    msg.includes("429") ||
    msg.includes("rate") ||
    msg.includes("503") ||
    msg.includes("temporar") ||
    msg.includes("network")
  );
}

function errorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  try {
    return JSON.stringify(err);
  } catch {
    return String(err);
  }
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}
