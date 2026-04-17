import { Instance } from "@/types/evolution.types";

export interface GoInstance {
  id: string;
  name: string;
  token: string;
  webhook: string;
  rabbitmqEnable: string;
  websocketEnable: string;
  natsEnable: string;
  jid: string;
  qrcode: string;
  connected: boolean;
  expiration: number;
  disconnect_reason: string;
  events: string;
  os_name: string;
  proxy: string;
  client_name: string;
  createdAt: string;
  alwaysOnline: boolean;
  rejectCall: boolean;
  msgRejectCall: string;
  readMessages: boolean;
  ignoreGroups: boolean;
  ignoreStatus: boolean;
}

export const toInstance = (go: GoInstance): Instance => ({
  id: go.id,
  name: go.name,
  connectionStatus: go.connected ? "open" : "close",
  ownerJid: go.jid,
  profileName: "",
  profilePicUrl: "",
  integration: "EVOLUTION_GO",
  number: go.jid ? go.jid.split("@")[0].split(":")[0] : "",
  businessId: "",
  token: go.token,
  clientName: go.client_name,
  createdAt: go.createdAt,
  updatedAt: go.createdAt,
  Setting: {
    rejectCall: go.rejectCall,
    msgCall: go.msgRejectCall,
    groupsIgnore: go.ignoreGroups,
    alwaysOnline: go.alwaysOnline,
    readMessages: go.readMessages,
    readStatus: !go.ignoreStatus,
    syncFullHistory: false,
  },
  _count: { Contact: 0, Chat: 0, Message: 0 },
});
