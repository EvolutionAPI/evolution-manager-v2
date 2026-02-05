import "./style.css";
import { useTranslation } from "react-i18next";
import { User, MessageCircle, PlusIcon } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import { useInstance } from "@/contexts/InstanceContext";

import { useFindChats } from "@/lib/queries/chat/findChats";
import { getToken, TOKEN_ID } from "@/lib/queries/token";

import { Chat as ChatType } from "@/types/evolution.types";

import React from "react";
import { useMediaQuery } from "@/utils/useMediaQuery";

import { connectSocket, disconnectSocket } from "@/services/websocket/socket";

import { Messages } from "./messages";

// Simple utility function
const formatJid = (remoteJid: string): string => {
  return remoteJid.split("@")[0];
};

function Chat() {
  const { t } = useTranslation();
  const isMD = useMediaQuery("(min-width: 768px)");
  const lastMessageRef = useRef<HTMLDivElement | null>(null);
  const [textareaHeight] = useState("auto");
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const { instance } = useInstance();

  // Local state for real-time chats (to supplement React Query data)
  const [realtimeChats, setRealtimeChats] = useState<ChatType[]>([]);

  const { data: chats, isSuccess } = useFindChats({
    instanceName: instance?.name,
  });

  // Combine React Query chats with real-time updates
  const allChats = React.useMemo(() => {
    if (!chats) return realtimeChats;

    // Merge chats from React Query with real-time updates
    const chatMap = new Map();

    // First add all chats from React Query
    chats.forEach((chat: { remoteJid: any; }) => chatMap.set(chat.remoteJid, chat));

    // Then add/update with real-time chats
    realtimeChats.forEach((chat) => {
      const existing = chatMap.get(chat.remoteJid);
      if (existing) {
        // Update existing chat with newer data
        chatMap.set(chat.remoteJid, { ...existing, ...chat });
      } else {
        // Add new chat from real-time updates
        chatMap.set(chat.remoteJid, chat);
      }
    });

    return Array.from(chatMap.values());
  }, [chats, realtimeChats]);

  const { instanceId, remoteJid } = useParams<{
    instanceId: string;
    remoteJid: string;
  }>();

  const navigate = useNavigate();

  // Add websocket functionality for real-time updates
  useEffect(() => {
    if (!instance?.name) return;

    const serverUrl = getToken(TOKEN_ID.API_URL);
    if (!serverUrl) {
      console.error("API URL not found in localStorage");
      return;
    }

    const socket = connectSocket(serverUrl);

    // Function to update chats from websocket events
    const updateChatsFromWebsocket = (_eventType: string, data: any) => {
      if (!instance) return;

      if (data.instance !== instance.name) {
        return;
      }

      const messageRemoteJid = data?.data?.key?.remoteJid;
      if (!messageRemoteJid) {
        return;
      }

      setRealtimeChats((prevChats) => {
        const existingChatIndex = prevChats.findIndex((chat) => chat.remoteJid === messageRemoteJid);

        // Create or update chat object
        const chatObject: ChatType = {
          id: messageRemoteJid,
          remoteJid: messageRemoteJid,
          pushName: data?.data?.pushName || formatJid(messageRemoteJid),
          profilePicUrl: data?.data?.key?.profilePictureUrl || "",
          // Add other required fields
          ...data?.data,
        };

        if (existingChatIndex !== -1) {
          // Update existing chat
          const updatedChats = [...prevChats];
          updatedChats[existingChatIndex] = {
            ...updatedChats[existingChatIndex],
            ...chatObject,
          };
          return updatedChats;
        } else {
          // Add new chat
          return [...prevChats, chatObject];
        }
      });
    };

    // Set up event listeners
    socket.on("messages.upsert", (data: any) => {
      updateChatsFromWebsocket("messages.upsert", data);
    });

    socket.on("send.message", (data: any) => {
      updateChatsFromWebsocket("send.message", data);
    });

    socket.connect();

    // Cleanup function
    return () => {
      socket.off("messages.upsert");
      socket.off("send.message");
      disconnectSocket(socket);
    };
  }, [instance?.name]);

  const scrollToBottom = useCallback(() => {
    if (lastMessageRef.current) {
      lastMessageRef.current.scrollIntoView({});
    }
  }, []);

  const handleTextareaChange = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      const scrollHeight = textareaRef.current.scrollHeight;
      const lineHeight = parseInt(getComputedStyle(textareaRef.current).lineHeight);
      const maxHeight = lineHeight * 10;
      textareaRef.current.style.height = `${Math.min(scrollHeight, maxHeight)}px`;
    }
  };

  useEffect(() => {
    if (isSuccess) {
      scrollToBottom();
    }
  }, [isSuccess, scrollToBottom]);

  const handleChat = (id: string) => {
    navigate(`/manager/instance/${instanceId}/chat/${id}`);
  };

  return (
    <div className="h-[calc(100vh-160px)] overflow-hidden">
      <ResizablePanelGroup direction={isMD ? "horizontal" : "vertical"} className="h-full">
        <ResizablePanel defaultSize={20}>
          <div className="hidden h-full flex-col bg-background text-foreground md:flex">
            <div className="flex-shrink-0 p-2">
              <Button variant="ghost" className="w-full justify-start gap-2 px-2 text-left">
                <div className="flex h-7 w-7 items-center justify-center rounded-full">
                  <MessageCircle className="h-4 w-4" />
                </div>
                <div className="grow overflow-hidden text-ellipsis whitespace-nowrap text-sm">{t("chat.title")}</div>
                <PlusIcon className="h-4 w-4" />
              </Button>
            </div>
            <Tabs defaultValue="contacts" className="flex flex-col flex-1 min-h-0">
              <TabsList className="tabs-chat flex-shrink-0">
                <TabsTrigger value="contacts">{t("chat.contacts")}</TabsTrigger>
                <TabsTrigger value="groups">{t("chat.groups")}</TabsTrigger>
              </TabsList>
              <TabsContent value="contacts" className="flex-1 overflow-hidden">
                <div className="h-full overflow-auto">
                  <div className="grid gap-1 p-2 text-foreground">
                    <div className="px-2 text-xs font-medium text-muted-foreground">{t("chat.contacts")}</div>
                    {chats?.map(
                      (chat: ChatType) =>
                        chat.remoteJid.includes("@s.whatsapp.net") && (
                          <Link
                            key={chat.id}
                            to="#"
                            onClick={() => handleChat(chat.remoteJid)}
                            className={`chat-item flex items-center overflow-hidden truncate whitespace-nowrap rounded-md border-b border-gray-600/50 p-2 text-sm transition-colors hover:bg-muted/50 ${
                              remoteJid === chat.remoteJid ? "active" : ""
                            }`}>
                            <span className="chat-avatar mr-2">
                              <Avatar className="h-8 w-8">
                                <AvatarImage src={chat.profilePicUrl} alt={chat.pushName || chat.remoteJid.split("@")[0]} />
                                <AvatarFallback className="bg-slate-700 text-slate-300 border border-slate-600">
                                  <User className="h-5 w-5" />
                                </AvatarFallback>
                              </Avatar>
                            </span>
                            <div className="min-w-0 flex-1">
                              <span className="chat-title block font-medium">{chat.pushName || chat.remoteJid.split("@")[0]}</span>
                              <span className="chat-description block text-xs text-gray-500">{chat.remoteJid.split("@")[0]}</span>
                            </div>
                          </Link>
                        ),
                    )}
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="groups" className="flex-1 overflow-hidden">
                <div className="h-full overflow-auto">
                  <div className="grid gap-1 p-2 text-foreground">
                    {allChats?.map(
                      (chat: ChatType) =>
                        chat.remoteJid.includes("@g.us") && (
                          <Link
                            key={chat.id}
                            to="#"
                            onClick={() => handleChat(chat.remoteJid)}
                            className={`chat-item flex items-center overflow-hidden truncate whitespace-nowrap rounded-md border-b border-gray-600/50 p-2 text-sm transition-colors hover:bg-muted/50 ${
                              remoteJid === chat.remoteJid ? "active" : ""
                            }`}>
                            <span className="chat-avatar mr-2">
                              <Avatar className="h-8 w-8">
                                <AvatarImage src={chat.profilePicUrl} alt={chat.pushName || chat.remoteJid.split("@")[0]} />
                                <AvatarFallback className="bg-slate-700 text-slate-300 border border-slate-600">
                                  <User className="h-5 w-5" />
                                </AvatarFallback>
                              </Avatar>
                            </span>
                            <div className="min-w-0 flex-1">
                              <span className="chat-title block font-medium">{chat.pushName || chat.remoteJid.split("@")[0]}</span>
                              <span className="chat-description block text-xs text-gray-500">{chat.remoteJid}</span>
                            </div>
                          </Link>
                        ),
                    )}
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </ResizablePanel>
        <ResizableHandle withHandle className="border border-black" />
        <ResizablePanel>
          {remoteJid && (
            <Messages textareaRef={textareaRef} handleTextareaChange={handleTextareaChange} textareaHeight={textareaHeight} lastMessageRef={lastMessageRef} scrollToBottom={scrollToBottom} />
          )}
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}

export { Chat };
