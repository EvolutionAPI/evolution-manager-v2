type ConversationKey = {
  id?: string;
  remoteJid?: string;
  remoteJidAlt?: string;
};

type MessageRecord = {
  key?: ConversationKey;
};

export function isDirectChatJid(jid: string): boolean {
  return jid.endsWith("@s.whatsapp.net") || jid.endsWith("@lid");
}

export function messageMatchesConversation(key: ConversationKey | null | undefined, selectedJid: string): boolean {
  if (!key) {
    return false;
  }

  return key.remoteJid === selectedJid || key.remoteJidAlt === selectedJid;
}

export function mergeMessagesByKeyId<T extends MessageRecord>(groups: T[][]): T[] {
  const seenIds = new Set<string>();
  const merged: T[] = [];

  for (const group of groups) {
    for (const record of group) {
      const id = record.key?.id;
      if (id) {
        if (seenIds.has(id)) {
          continue;
        }
        seenIds.add(id);
        merged.push(record);
        continue;
      }

      merged.push(record);
    }
  }

  return merged;
}

export function messageRecordsFromResponse(payload: unknown): MessageRecord[] {
  if (Array.isArray(payload)) {
    return payload;
  }

  if (
    payload &&
    typeof payload === "object" &&
    "messages" in payload &&
    payload.messages &&
    typeof payload.messages === "object" &&
    "records" in payload.messages &&
    Array.isArray(payload.messages.records)
  ) {
    return payload.messages.records;
  }

  return [];
}
