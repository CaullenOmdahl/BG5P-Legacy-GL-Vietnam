export interface MiniMaxMessage {
  role: "system" | "user" | "assistant";
  name?: string;
  content: string;
}

interface MiniMaxAnthropicMessage {
  role: "user" | "assistant";
  content: string;
}

interface MiniMaxAnthropicRequestOptions {
  baseUrl: string;
  model: string;
  maxTokens: number;
  temperature: number;
  topP: number;
}

interface MiniMaxAnthropicRequest {
  endpoint: string;
  body: {
    model: string;
    system?: string;
    messages: MiniMaxAnthropicMessage[];
    max_tokens: number;
    temperature: number;
    top_p: number;
  };
}

interface MiniMaxAnthropicContentBlock {
  type?: string;
  text?: string;
  thinking?: string;
}

interface MiniMaxAnthropicResponse {
  content?: MiniMaxAnthropicContentBlock[];
  base_resp?: {
    status_code?: number;
    status_msg?: string;
  };
  error?: {
    message?: string;
  };
}

const DEFAULT_MODEL = "MiniMax-M2.7-highspeed";
const DEFAULT_API_BASE = "https://api.minimax.io";
const DEFAULT_MAX_TOKENS = 1800;
const DEFAULT_TEMPERATURE = 1;
const DEFAULT_TOP_P = 0.95;

export class MiniMaxError extends Error {
  constructor(message: string, public readonly status = 502) {
    super(message);
    this.name = "MiniMaxError";
  }
}

function numberFromEnv(name: string, fallback: number): number {
  const raw = process.env[name];
  if (!raw) return fallback;

  const value = Number(raw);
  return Number.isFinite(value) ? value : fallback;
}

function createMiniMaxAnthropicRequest(
  messages: MiniMaxMessage[],
  options: MiniMaxAnthropicRequestOptions
): MiniMaxAnthropicRequest {
  const baseUrl = options.baseUrl.replace(/\/$/, "");
  const system = messages
    .filter((message) => message.role === "system")
    .map((message) => message.content.trim())
    .filter(Boolean)
    .join("\n\n");

  const conversation = messages
    .filter((message): message is MiniMaxMessage & { role: "user" | "assistant" } =>
      message.role === "user" || message.role === "assistant"
    )
    .map((message) => ({
      role: message.role,
      content: message.content.trim(),
    }))
    .filter((message) => message.content.length > 0);

  return {
    endpoint: `${baseUrl}/anthropic/v1/messages`,
    body: {
      model: options.model,
      ...(system ? { system } : {}),
      messages: conversation,
      max_tokens: options.maxTokens,
      temperature: options.temperature,
      top_p: options.topP,
    },
  };
}

function extractMiniMaxAnthropicText(body: MiniMaxAnthropicResponse): string {
  const text = body.content
    ?.filter((block) => block.type === "text" && typeof block.text === "string")
    .map((block) => block.text?.trim())
    .filter(Boolean)
    .join("\n\n")
    .trim();

  return text ?? "";
}

export async function callMiniMax(messages: MiniMaxMessage[]): Promise<string> {
  const apiKey = process.env.MINIMAX_API_KEY;
  if (!apiKey) {
    throw new MiniMaxError("MiniMax is not configured. Set MINIMAX_API_KEY.", 503);
  }

  const baseUrl = (process.env.MINIMAX_API_BASE ?? DEFAULT_API_BASE).replace(/\/$/, "");
  const model = process.env.MINIMAX_MODEL ?? DEFAULT_MODEL;
  const request = createMiniMaxAnthropicRequest(messages, {
    baseUrl,
    model,
    maxTokens: numberFromEnv(
      "MINIMAX_MAX_TOKENS",
      numberFromEnv("MINIMAX_MAX_COMPLETION_TOKENS", DEFAULT_MAX_TOKENS)
    ),
    temperature: numberFromEnv("MINIMAX_TEMPERATURE", DEFAULT_TEMPERATURE),
    topP: numberFromEnv("MINIMAX_TOP_P", DEFAULT_TOP_P),
  });

  const response = await fetch(request.endpoint, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(request.body),
  });

  const body = (await response.json().catch(() => ({}))) as MiniMaxAnthropicResponse;

  if (!response.ok) {
    const message = body.error?.message || body.base_resp?.status_msg || response.statusText;
    throw new MiniMaxError(`MiniMax request failed: ${message}`, response.status);
  }

  if (body.base_resp?.status_code && body.base_resp.status_code !== 0) {
    throw new MiniMaxError(
      `MiniMax returned status ${body.base_resp.status_code}: ${body.base_resp.status_msg || "unknown error"}`
    );
  }

  const content = extractMiniMaxAnthropicText(body);
  if (!content) {
    throw new MiniMaxError("MiniMax returned an empty response.");
  }

  return content;
}

export const createMiniMaxAnthropicRequestForTest = createMiniMaxAnthropicRequest;
export const extractMiniMaxAnthropicTextForTest = extractMiniMaxAnthropicText;
