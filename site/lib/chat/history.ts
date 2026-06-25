export interface ChatHistoryMessage {
  role: "user" | "assistant";
}

export const MAX_CHAT_HISTORY_MESSAGES = 8;

export function trimUserFirstHistory<T extends ChatHistoryMessage>(
  messages: T[],
  maxMessages = MAX_CHAT_HISTORY_MESSAGES
): T[] {
  let trimmed = messages.slice(-maxMessages);
  while (trimmed[0]?.role === "assistant") {
    trimmed = trimmed.slice(1);
  }
  return trimmed;
}
