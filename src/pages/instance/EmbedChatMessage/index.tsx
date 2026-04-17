/* eslint-disable @typescript-eslint/no-explicit-any */
// Importação do arquivo de estilo
import "./style.css";
// import axios from "axios";
import { MessageCircle, PlusIcon } from "lucide-react";
import React, { useEffect, useState, useRef } from "react";
// Importações de bibliotecas externas
import { useTranslation } from "react-i18next";
import { useSearchParams, useNavigate, useParams } from "react-router-dom";
// Importações de componentes da aplicação
import { toast } from "react-toastify";

import { Button } from "@evoapi/design-system/button";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@evoapi/design-system/resizable";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@evoapi/design-system/tabs";

// Importações de contextos
import { useEmbedColors } from "@/contexts/EmbedColorsContext";
import { useEmbedInstance } from "@/contexts/EmbedInstanceContext";
import { ReplyMessageProvider } from "@/contexts/ReplyingMessage/ReplyingMessageContext";
// import { useWebphone } from "@/contexts/Webphone";

import { api } from "@/lib/queries/api";
import { TOKEN_ID, getToken } from "@/lib/queries/token";

import { connectSocket, disconnectSocket } from "@/services/websocket/socket";

import { Chat as ChatType } from "@/types/evolution.types";

// Importações de utilitários
import { useMediaQuery } from "@/utils/useMediaQuery";

// Local utility function (replaces the missing @/utils/format-remoteJid)
const formatRemoteJid = (remoteJid: string): string => {
  if (!remoteJid) return "";
  return remoteJid.replace("@s.whatsapp.net", "").replace("@g.us", "");
};

// Importações de componentes locais
import { InputMessage } from "./InputMessage";
import { Messages } from "../Chat/messages";
import { NewChat } from "./NewChat";

function EmbedChatMessage() {
  const [searchParams] = useSearchParams();
  const { backgroundColor, textForegroundColor, primaryColor } = useEmbedColors();

  const isNotMobile = useMediaQuery("(min-width: 768px)");
  const { t } = useTranslation();
  const navigate = useNavigate();
  const tokenFromUrl = searchParams.get("token");

  const { remoteJid: routeRemoteJid } = useParams();
  const remoteJid = routeRemoteJid || searchParams.get("remoteJid");

  const [chats, setChats] = useState<ChatType[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const lastMessageRef = useRef<HTMLDivElement | null>(null);
  const [selectedChat, setSelectedChat] = useState<ChatType | null>(null);
  const [isNewChatDialogOpen, setIsNewChatDialogOpen] = useState(false);

  // const { setIsOpen, makeCall } = useWebphone();

  const { instance: activeInstance } = useEmbedInstance();

  const handleChatClick = (chat: ChatType) => {
    const newSearchParams = new URLSearchParams(searchParams);
    // Keep token and instanceName in query params
    navigate(`/manager/embed-chat/${encodeURIComponent(chat.remoteJid || chat.id)}?${newSearchParams.toString()}`);
  };

  useEffect(() => {
    // Guard clause: ensure we have the required instance data
    if (!activeInstance?.name) return;

    let isSubscribed = true; // Cleanup flag to prevent setting state after unmount

    // Fetch only chats/contacts - messages are handled by the Messages component via React Query
    const fetchChats = async () => {
      try {
        const { data: chatsData } = await api.post(
          `/chat/findChats/${activeInstance.name}`,
          {
            where: {},
          },
          {
            headers: {
              apikey: tokenFromUrl || activeInstance.token,
            },
          },
        );

        // Only update state if component is still mounted
        if (isSubscribed) {
          setChats(chatsData || []);
        }
      } catch (error) {
        if (isSubscribed) {
          console.error("Erro ao buscar chats:", error);
          toast.error("Erro ao buscar chats");
        }
      }
    };

    fetchChats();

    // Cleanup function to prevent state updates after unmount
    return () => {
      isSubscribed = false;
    };
  }, [activeInstance?.name, tokenFromUrl]);

  useEffect(() => {
    if (!activeInstance) return;

    const serverUrl = getToken(TOKEN_ID.API_URL);

    if (!serverUrl) {
      console.error("API URL not found in localStorage");
      return;
    }

    const currentToken = localStorage.getItem("accessToken");

    if (tokenFromUrl) {
      localStorage.setItem("accessToken", tokenFromUrl);
    }

    const socket = connectSocket(serverUrl);

    function updateChats(_: string, data: any) {
      if (!activeInstance) return;

      if (data.instance !== activeInstance.name) return;

      setChats((prevChats) => {
        // Check both remoteJid and id fields - some chats might only have one or the other
        const messageRemoteJid = data?.data?.key?.remoteJid;

        // Find existing chat by any matching identifier
        const existingChatIndex = prevChats.findIndex((chat) => (chat.remoteJid && chat.remoteJid === messageRemoteJid) || (chat.id && chat.id === messageRemoteJid));

        const existingChat = existingChatIndex !== -1 ? prevChats[existingChatIndex] : null;

        // Create chat object with Chat properties
        const chatObject: ChatType = {
          id: messageRemoteJid,
          remoteJid: messageRemoteJid,
          // Prefer existing contact info over pushname from message
          pushName: existingChat?.pushName || data?.data?.pushName || formatRemoteJid(messageRemoteJid),
          // Keep existing profile picture if available
          profilePicUrl: existingChat?.profilePicUrl || data?.data?.key?.profilePictureUrl || "https://as2.ftcdn.net/jpg/05/89/93/27/1000_F_589932782_vQAEAZhHnq1QCGu5ikwrYaQD0Mmurm0N.jpg",
          updatedAt: new Date().toISOString(),
          // Preserve existing labels
          labels: existingChat?.labels || [],
          // Keep existing createdAt if available
          createdAt: existingChat?.createdAt || new Date().toISOString(),
          instanceId: activeInstance.id,
        };

        if (existingChatIndex !== -1) {
          const updatedChats = [...prevChats];
          // Merge existing chat with new data, prioritizing existing information
          updatedChats[existingChatIndex] = {
            ...existingChat!,
            updatedAt: chatObject.updatedAt,
          };
          return updatedChats;
        } else {
          return [...prevChats, chatObject];
        }
      });
    }

    function updateMessages(_data: any) {
      // Message handling is now done by the main chat Messages component
      // which uses React Query and websockets internally
    }

    function updateMessageStatus(_data: any) {
      // Message status updates are now handled by the main chat Messages component
      // which uses React Query and websockets internally
    }

    socket.on("messages.upsert", (data: any) => {
      updateMessages(data);
      updateChats("messages.upsert", data);
    });

    socket.on("send.message", (data: any) => {
      updateMessages(data);
      updateChats("send.message", data);
    });

    socket.on("messages.update", (data: any) => {
      updateMessageStatus(data);
    });

    socket.connect();

    return () => {
      socket.off("messages.upsert");
      socket.off("send.message");
      socket.off("messages.update");
      disconnectSocket(socket);

      if (tokenFromUrl) {
        localStorage.setItem("accessToken", currentToken || "");
      } else {
        localStorage.removeItem("accessToken");
      }
    };
  }, [activeInstance, remoteJid, tokenFromUrl]);

  useEffect(() => {
    if (remoteJid) {
      const currentChat = chats.find((chat) => chat.id === remoteJid);
      setSelectedChat(currentChat || null);
    }
  }, [remoteJid, chats]);

  // const handleCallClick = () => {
  //   if (!selectedChat?.remoteJid) return;

  //   setIsOpen(true);
  //   makeCall(selectedChat.remoteJid);
  // };

  const containerStyle = {
    backgroundColor,
    color: textForegroundColor,
  };

  return (
    <div className="relative h-full" style={containerStyle}>
      <ResizablePanelGroup direction={isNotMobile ? "horizontal" : "vertical"}>
        <ResizablePanel defaultSize={30} minSize={20} maxSize={60}>
          <div className="hidden flex-col gap-2 text-foreground md:flex" style={containerStyle}>
            <div className="sticky top-0 p-2">
              <Button
                variant="ghost"
                className="w-full justify-start gap-2 px-2 text-left"
                onClick={() => setIsNewChatDialogOpen(true)}
                style={{
                  backgroundColor: primaryColor,
                  color: textForegroundColor,
                }}>
                <div className="flex h-7 w-7 items-center justify-center rounded-full">
                  <MessageCircle className="h-4 w-4" />
                </div>
                <div className="grow overflow-hidden text-ellipsis whitespace-nowrap text-sm">{t("chat.title")}</div>
                <PlusIcon className="h-4 w-4" />
              </Button>
            </div>
            <Tabs defaultValue="contacts">
              <TabsList className="tabs-chat">
                <TabsTrigger
                  value="contacts"
                  className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                  style={
                    {
                      "--primary": primaryColor || "#e2e8f0",
                      "--primary-foreground": textForegroundColor || "#000000",
                    } as React.CSSProperties
                  }>
                  {t("chat.contacts")}
                </TabsTrigger>
                <TabsTrigger
                  value="groups"
                  className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                  style={
                    {
                      "--primary": primaryColor || "#e2e8f0",
                      "--primary-foreground": textForegroundColor || "#000000",
                    } as React.CSSProperties
                  }>
                  {t("chat.groups")}
                </TabsTrigger>
              </TabsList>
              <TabsContent value="contacts">
                <div className="contacts-container">
                  <div className="grid gap-1 p-2 text-foreground">
                    <div className="px-2 text-xs font-medium text-muted-foreground">{t("chat.contacts")}</div>
                    {chats
                      ?.sort((a: any, b: any) => new Date(b.lastMessage.messageTimestamp).getTime() - new Date(a.lastMessage.messageTimestamp).getTime())
                      .map(
                        (chat: ChatType) =>
                          chat?.id &&
                          !chat.id.includes("@g.us") && (
                            <div
                              key={chat.id}
                              onClick={() => handleChatClick(chat)}
                              className={`chat-item flex cursor-pointer items-center overflow-hidden rounded-md p-2 text-sm transition-colors`}
                              style={{
                                backgroundColor: remoteJid === chat.id ? primaryColor : "",
                              }}>
                              <span className="chat-avatar mr-2">
                                <img
                                  src={chat.profilePicUrl || "https://as2.ftcdn.net/jpg/05/89/93/27/1000_F_589932782_vQAEAZhHnq1QCGu5ikwrYaQD0Mmurm0N.jpg"}
                                  alt="Avatar"
                                  className="h-12 w-12 rounded-full"
                                />
                              </span>
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center justify-between">
                                  <span className="chat-title font-medium" style={{ color: textForegroundColor }}>
                                    {chat.pushName || formatRemoteJid(chat.id)}
                                  </span>
                                  <span className="text-xs" style={{ color: textForegroundColor }}>
                                    {/* TODO: Add timestamp when Chat type includes lastMessage */}
                                  </span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <span className="text-xs font-bold" style={{ color: textForegroundColor }}>
                                    {t("chat.recent")}:{" "}
                                  </span>
                                  <span className="block truncate text-xs" style={{ color: textForegroundColor }}>
                                    {/* TODO: Add last message preview when available */}
                                  </span>
                                </div>
                              </div>
                            </div>
                          ),
                      )}
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="groups">
                <div className="contacts-container">
                  <div className="grid gap-1 p-2 text-foreground">
                    <div className="px-2 text-xs font-medium text-muted-foreground">{t("chat.groups")}</div>
                    {chats
                      ?.sort((a: any, b: any) => new Date(b.lastMessage.messageTimestamp).getTime() - new Date(a.lastMessage.messageTimestamp).getTime())
                      .map(
                        (chat: ChatType) =>
                          chat?.id &&
                          chat.id.includes("@g.us") && (
                            <div
                              key={chat.id}
                              onClick={() => handleChatClick(chat)}
                              className={`chat-item flex cursor-pointer items-center overflow-hidden rounded-md p-2 text-sm transition-colors`}
                              style={{
                                backgroundColor: remoteJid === chat.id ? primaryColor : "",
                              }}>
                              <span className="chat-avatar mr-2">
                                <img
                                  src={chat.profilePicUrl || "https://as2.ftcdn.net/jpg/05/89/93/27/1000_F_589932782_vQAEAZhHnq1QCGu5ikwrYaQD0Mmurm0N.jpg"}
                                  alt="Avatar"
                                  className="h-12 w-12 rounded-full"
                                />
                              </span>
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center justify-between">
                                  <span className="chat-title font-medium">{chat.pushName}</span>
                                  <span className="text-xs text-gray-500 dark:text-gray-400">{/* TODO: Add timestamp when available */}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <span className="text-xs font-bold text-gray-500 dark:text-gray-400">{t("chat.recent")} </span>
                                  <span className="block truncate text-xs text-gray-500">{/* TODO: Add last message preview when available */}</span>
                                </div>
                              </div>
                            </div>
                          ),
                      )}
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel style={containerStyle}>
          {remoteJid && (
            <ReplyMessageProvider>
              <div className="flex h-full flex-col justify-between" style={containerStyle}>
                <div className="flex items-center gap-3 p-3">
                  <div className="flex flex-1 items-center gap-3">
                    <img
                      src={selectedChat?.profilePicUrl || "https://as2.ftcdn.net/jpg/05/89/93/27/1000_F_589932782_vQAEAZhHnq1QCGu5ikwrYaQD0Mmurm0N.jpg"}
                      alt="Avatar"
                      className="h-10 w-10 rounded-full"
                    />
                    <div className="flex flex-col">
                      <span className="font-medium">{selectedChat?.pushName || formatRemoteJid(remoteJid)}</span>
                    </div>
                  </div>
                </div>

                <Messages
                  textareaRef={textareaRef}
                  handleTextareaChange={() => {}}
                  textareaHeight="auto"
                  lastMessageRef={lastMessageRef}
                  scrollToBottom={() => {
                    if (lastMessageRef.current) {
                      lastMessageRef.current.scrollIntoView({ behavior: "smooth" });
                    }
                  }}
                />

                <InputMessage chat={selectedChat as any} />
              </div>
            </ReplyMessageProvider>
          )}
          <NewChat isOpen={isNewChatDialogOpen} setIsOpen={setIsNewChatDialogOpen} />
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}

export { EmbedChatMessage };
