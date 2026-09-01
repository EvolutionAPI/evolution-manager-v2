import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { isDirectChatJid, mergeMessagesByKeyId, messageMatchesConversation, messageRecordsFromResponse } from "../src/lib/chat/identity";

describe("isDirectChatJid", () => {
  it("detects phone direct chats", () => {
    assert.equal(isDirectChatJid("5511999999999@s.whatsapp.net"), true);
  });

  it("detects LID direct chats", () => {
    assert.equal(isDirectChatJid("123456789012345@lid"), true);
  });

  it("rejects groups", () => {
    assert.equal(isDirectChatJid("120363012345678901@g.us"), false);
  });

  it("rejects broadcasts", () => {
    assert.equal(isDirectChatJid("status@broadcast"), false);
  });
});

describe("messageMatchesConversation", () => {
  it("matches a selected phone JID through a LID-primary key via remoteJidAlt", () => {
    assert.equal(
      messageMatchesConversation(
        {
          remoteJid: "123456789012345@lid",
          remoteJidAlt: "5511999999999@s.whatsapp.net",
        },
        "5511999999999@s.whatsapp.net",
      ),
      true,
    );
  });

  it("matches a selected LID JID through a phone-primary key via remoteJidAlt", () => {
    assert.equal(
      messageMatchesConversation(
        {
          remoteJid: "5511999999999@s.whatsapp.net",
          remoteJidAlt: "123456789012345@lid",
        },
        "123456789012345@lid",
      ),
      true,
    );
  });
});

describe("mergeMessagesByKeyId", () => {
  it("keeps a phone-primary and LID-primary pair when they have different IDs", () => {
    const phonePrimary = {
      key: {
        id: "phone-msg-1",
        remoteJid: "5511999999999@s.whatsapp.net",
        remoteJidAlt: "123456789012345@lid",
      },
    };
    const lidPrimary = {
      key: {
        id: "lid-msg-1",
        remoteJid: "123456789012345@lid",
        remoteJidAlt: "5511999999999@s.whatsapp.net",
      },
    };

    assert.deepEqual(mergeMessagesByKeyId([[phonePrimary], [lidPrimary]]), [phonePrimary, lidPrimary]);
  });

  it("de-duplicates records that share the same nonempty key id, keeping the first", () => {
    const first = {
      key: {
        id: "shared-id",
        remoteJid: "5511999999999@s.whatsapp.net",
      },
      source: "primary",
    };
    const duplicate = {
      key: {
        id: "shared-id",
        remoteJid: "123456789012345@lid",
      },
      source: "alternate",
    };

    assert.deepEqual(mergeMessagesByKeyId([[first], [duplicate]]), [first]);
  });

  it("keeps unkeyed records without replacing keyed ones", () => {
    const keyed = { key: { id: "keyed-1", remoteJid: "5511999999999@s.whatsapp.net" } };
    const unkeyed = { key: { remoteJid: "5511999999999@s.whatsapp.net" } };

    assert.deepEqual(mergeMessagesByKeyId([[keyed], [unkeyed]]), [keyed, unkeyed]);
  });
});

describe("messageRecordsFromResponse", () => {
  it("normalizes a raw Message array", () => {
    const records = [{ key: { id: "raw-1", remoteJid: "5511999999999@s.whatsapp.net" } }];
    assert.equal(messageRecordsFromResponse(records), records);
  });

  it("normalizes { messages: { records } } payloads", () => {
    const records = [{ key: { id: "nested-1", remoteJid: "123456789012345@lid" } }];
    assert.deepEqual(messageRecordsFromResponse({ messages: { records } }), records);
  });

  it("returns an empty array for unrecognized shapes", () => {
    assert.deepEqual(messageRecordsFromResponse(undefined), []);
    assert.deepEqual(messageRecordsFromResponse(null), []);
    assert.deepEqual(messageRecordsFromResponse({}), []);
    assert.deepEqual(messageRecordsFromResponse({ messages: {} }), []);
  });
});
