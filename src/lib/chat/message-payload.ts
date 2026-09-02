/** Evolution persists some Android outbound records with messageType set and message null. */
export const MISSING_CHAT_MESSAGE_FALLBACK = "Message unavailable";

export function getChatMessagePayload<T>(message: { message?: T | null } | null | undefined): T | null {
  if (message == null || message.message == null) {
    return null;
  }

  return message.message;
}
