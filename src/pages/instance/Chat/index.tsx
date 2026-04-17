import "./style.css";
import { Avatar, AvatarFallback, AvatarImage } from "@evoapi/design-system/avatar";
import { Button } from "@evoapi/design-system/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, MessageCircle, Search, User, Users } from "lucide-react";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";

import { useInstance } from "@/contexts/InstanceContext";

import { useFindChats } from "@/lib/queries/chat/findChats";
import { getToken, TOKEN_ID } from "@/lib/queries/token";
import { cn } from "@/lib/utils";

import { connectSocket, disconnectSocket } from "@/services/websocket/socket";

import { Chat as ChatType } from "@/types/evolution.types";

import { useMediaQuery } from "@/utils/useMediaQuery";

import { Messages } from "./messages";

const formatJid = (remoteJid: string): string => remoteJid.split("@")[0];

type ChatKind = "contacts" | "groups";

function Chat() {
  const { t } = useTranslation();
  const isMD = useMediaQuery("(min-width: 768px)");
  const lastMessageRef = useRef<HTMLDivElement | null>(null);
  const [textareaHeight] = useState("auto");
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const { instance } = useInstance();

  const [realtimeChats, setRealtimeChats] = useState<ChatType[]>([]);
  const [search, setSearch] = useState("");
  const [kind, setKind] = useState<ChatKind>("contacts");

  const { data: chats } = useFindChats({ instanceName: instance?.name });

  const allChats = useMemo(() => {
    if (!chats) return realtimeChats;
    const map = new Map<string, ChatType>();
    chats.forEach((c) => map.set(c.remoteJid, c));
    realtimeChats.forEach((c) => {
      const existing = map.get(c.remoteJid);
      map.set(c.remoteJid, existing ? { ...existing, ...c } : c);
    });
    return Array.from(map.values());
  }, [chats, realtimeChats]);

  const { instanceId, remoteJid } = useParams<{ instanceId: string; remoteJid: string }>();
  const navigate = useNavigate();

  useEffect(() => {
    if (!instance?.name) return;
    const serverUrl = getToken(TOKEN_ID.API_URL);
    if (!serverUrl) return;

    const socket = connectSocket(serverUrl);

    const handle = (data: { instance?: string; data?: { key?: { remoteJid?: string; profilePictureUrl?: string }; pushName?: string } }) => {
      if (!instance || data.instance !== instance.name) return;
      const jid = data?.data?.key?.remoteJid;
      if (!jid) return;

      setRealtimeChats((prev) => {
        const idx = prev.findIndex((c) => c.remoteJid === jid);
        const obj: ChatType = {
          id: jid,
          remoteJid: jid,
          pushName: data?.data?.pushName || formatJid(jid),
          profilePicUrl: data?.data?.key?.profilePictureUrl || "",
          ...(data?.data as Partial<ChatType>),
        };
        if (idx !== -1) {
          const next = [...prev];
          next[idx] = { ...next[idx], ...obj };
          return next;
        }
        return [...prev, obj];
      });
    };

    socket.on("messages.upsert", handle);
    socket.on("send.message", handle);
    socket.connect();

    return () => {
      socket.off("messages.upsert");
      socket.off("send.message");
      disconnectSocket(socket);
    };
  }, [instance, instance?.name]);

  const scrollToBottom = useCallback(() => {
    lastMessageRef.current?.scrollIntoView({});
  }, []);

  const handleTextareaChange = () => {
    if (!textareaRef.current) return;
    textareaRef.current.style.height = "auto";
    const scrollHeight = textareaRef.current.scrollHeight;
    const lineHeight = parseInt(getComputedStyle(textareaRef.current).lineHeight);
    const maxHeight = lineHeight * 10;
    textareaRef.current.style.height = `${Math.min(scrollHeight, maxHeight)}px`;
  };

  const handleChat = (jid: string) => navigate(`/manager/instance/${instanceId}/chat/${jid}`);

  const handleBack = () => navigate(`/manager/instance/${instanceId}/chat`);

  const visibleChats = useMemo(() => {
    const isContacts = kind === "contacts";
    const filtered = allChats.filter((c) =>
      isContacts ? c.remoteJid.includes("@s.whatsapp.net") : c.remoteJid.includes("@g.us"),
    );
    if (!search.trim()) return filtered;
    const q = search.toLowerCase();
    return filtered.filter(
      (c) =>
        (c.pushName && c.pushName.toLowerCase().includes(q)) ||
        c.remoteJid.toLowerCase().includes(q),
    );
  }, [allChats, kind, search]);

  const showSidebar = !remoteJid || isMD;
  const showChat = !!remoteJid;

  return (
    <div className="flex h-full w-full overflow-hidden rounded-lg border">
      <aside
        className={cn(
          "flex w-full flex-col border-r bg-card/50 md:w-80 md:flex-shrink-0",
          showSidebar ? "flex" : "hidden md:flex",
        )}
      >
        <div className="space-y-3 border-b p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder={t("chat.search")}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              size="sm"
              variant={kind === "contacts" ? "secondary" : "ghost"}
              className="h-8"
              onClick={() => setKind("contacts")}
            >
              <User className="mr-1 h-4 w-4" />
              {t("chat.tabs.contacts")}
            </Button>
            <Button
              type="button"
              size="sm"
              variant={kind === "groups" ? "secondary" : "ghost"}
              className="h-8"
              onClick={() => setKind("groups")}
            >
              <Users className="mr-1 h-4 w-4" />
              {t("chat.tabs.groups")}
            </Button>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">
              {t("chat.count", { count: visibleChats.length })}
            </span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {visibleChats.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center p-6 text-center">
              <MessageCircle className="mb-3 h-10 w-10 text-muted-foreground/50" />
              <p className="text-sm font-medium text-muted-foreground">
                {search ? t("chat.empty.search") : t("chat.empty.default")}
              </p>
              {search && <p className="mt-1 text-xs text-muted-foreground">{t("chat.empty.tryAnother")}</p>}
            </div>
          ) : (
            visibleChats.map((chat) => {
              const selected = remoteJid === chat.remoteJid;
              const name = chat.pushName || formatJid(chat.remoteJid);

              return (
                <button
                  key={chat.remoteJid}
                  type="button"
                  onClick={() => handleChat(chat.remoteJid)}
                  className={cn(
                    "block w-full cursor-pointer p-4 text-left transition-colors",
                    selected
                      ? "border-l-2 border-l-primary bg-primary/10"
                      : "border-b border-border/50 hover:bg-accent",
                  )}
                >
                  <div className="flex items-start gap-3">
                    <Avatar className="h-10 w-10 flex-shrink-0">
                      <AvatarImage src={chat.profilePicUrl} alt={name} />
                      <AvatarFallback className="bg-muted text-muted-foreground">
                        {kind === "groups" ? <Users className="h-5 w-5" /> : <User className="h-5 w-5" />}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <div className="mb-0.5 flex items-center justify-between gap-2">
                        <p className="truncate font-medium">{name}</p>
                      </div>
                      <p className="truncate text-sm text-muted-foreground">
                        {formatJid(chat.remoteJid)}
                      </p>
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </aside>

      <main
        className={cn(
          "flex h-full min-h-0 flex-1 flex-col overflow-hidden",
          showChat ? "flex" : "hidden md:flex",
        )}
      >
        {remoteJid ? (
          <>
            {!isMD && (
              <div className="flex items-center border-b bg-background/95 p-2 backdrop-blur-sm">
                <Button variant="ghost" size="sm" onClick={handleBack}>
                  <ArrowLeft className="mr-1 h-4 w-4" />
                  {t("chat.back")}
                </Button>
              </div>
            )}
            <Messages
              textareaRef={textareaRef}
              handleTextareaChange={handleTextareaChange}
              textareaHeight={textareaHeight}
              lastMessageRef={lastMessageRef}
              scrollToBottom={scrollToBottom}
            />
          </>
        ) : (
          <div className="flex h-full flex-1 items-center justify-center p-8">
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                <MessageCircle className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="mb-1 text-lg font-semibold">{t("chat.empty.selectTitle")}</h3>
              <p className="text-sm text-muted-foreground">
                {t("chat.empty.selectDescription")}
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export { Chat };
