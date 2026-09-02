import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { getChatMessagePayload, MISSING_CHAT_MESSAGE_FALLBACK } from "../src/lib/chat/message-payload.js";

describe("getChatMessagePayload", () => {
  it("returns null for persisted conversation records whose message payload is null", () => {
    const record = {
      messageType: "conversation",
      message: null,
    };

    assert.equal(getChatMessagePayload(record), null);
  });

  it("returns null for undefined message payloads across messageType branches", () => {
    for (const messageType of ["conversation", "extendedTextMessage", "imageMessage", "videoMessage", "audioMessage", "documentMessage", "stickerMessage"]) {
      const record: { messageType: string; message?: null } = { messageType, message: undefined };
      assert.equal(getChatMessagePayload(record), null);
    }
  });

  it("returns null when the message record itself is missing", () => {
    assert.equal(getChatMessagePayload(null), null);
    assert.equal(getChatMessagePayload(undefined), null);
  });

  it("returns the original payload when one is present", () => {
    const payload = { conversation: "hello" };
    const record = { messageType: "conversation", message: payload };

    assert.equal(getChatMessagePayload(record), payload);
  });
});

describe("MISSING_CHAT_MESSAGE_FALLBACK", () => {
  it("is a concise user-visible string", () => {
    assert.equal(typeof MISSING_CHAT_MESSAGE_FALLBACK, "string");
    assert.ok(MISSING_CHAT_MESSAGE_FALLBACK.length > 0);
  });
});
