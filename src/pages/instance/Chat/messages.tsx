import { useTranslation } from "react-i18next";

import { DropdownMenu, DropdownMenuTrigger } from "@radix-ui/react-dropdown-menu";
import { ArrowRightIcon, ChevronDownIcon, SparkleIcon, User, ZapIcon } from "lucide-react";
import { RefObject, useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import { useInstance } from "@/contexts/InstanceContext";

import { useFindChat } from "@/lib/queries/chat/findChat";
import { useFindMessages } from "@/lib/queries/chat/findMessages";
import { useSendMessage, useSendMedia } from "@/lib/queries/chat/sendMessage";
import { getToken, TOKEN_ID } from "@/lib/queries/token";

import { Message } from "@/types/evolution.types";

import { connectSocket, disconnectSocket } from "@/services/websocket/socket";

// Import components from EmbedChatMessage for attachment functionality
import { MediaOptions } from "../EmbedChatMessage/InputMessage/media-options";
import { SelectedMedia } from "../EmbedChatMessage/InputMessage/selected-media";

type MessagesProps = {
  textareaRef: RefObject<HTMLTextAreaElement>;
  handleTextareaChange: () => void;
  textareaHeight: string;
  lastMessageRef: RefObject<HTMLDivElement>;
  scrollToBottom: () => void;
};

// Utility function to format dates like WhatsApp
const formatDateSeparator = (date: Date): string => {
  const { t } = useTranslation();
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const messageDate = new Date(date);

  // Check if it's today
  if (messageDate.toDateString() === today.toDateString()) {
    return t("chat.date.today");
  }

  // Check if it's yesterday
  if (messageDate.toDateString() === yesterday.toDateString()) {
    return t("chat.date.yesterday");
  }

  // Check if it's within the last week
  const daysDiff = Math.floor((today.getTime() - messageDate.getTime()) / (1000 * 60 * 60 * 24));
  if (daysDiff < 7) {
    return messageDate.toLocaleDateString(t("chat.date.location"), { weekday: "long" });
  }

  // For older dates, show the full date
  return messageDate.toLocaleDateString(t("chat.date.location"), {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

// Utility function to get timestamp from message
const getMessageTimestamp = (message: Message): Date => {
  try {
    if (!message.messageTimestamp) {
      return new Date();
    }

    // Handle case where timestamp is an object
    if (typeof message.messageTimestamp === "object") {
      const possibleTimestamps = [
        (message.messageTimestamp as any).low,
        (message.messageTimestamp as any).seconds,
        (message.messageTimestamp as any).timestamp,
        (message.messageTimestamp as any).time,
        (message.messageTimestamp as any).value,
      ];

      const timestamp = possibleTimestamps.find((val) => typeof val === "number" && !isNaN(val)) || Date.now() / 1000;

      return new Date(timestamp * 1000);
    }
    // Handle number or numeric string
    else if (!isNaN(Number(message.messageTimestamp))) {
      const timestamp = Number(message.messageTimestamp);

      // Check if it's milliseconds format (13 digits) or seconds format (10 digits)
      if (timestamp > 1000000000000) {
        return new Date(timestamp);
      } else {
        return new Date(timestamp * 1000);
      }
    }
    // If it's an ISO date string format
    else if (typeof message.messageTimestamp === "string" && message.messageTimestamp.includes("T")) {
      return new Date(message.messageTimestamp);
    }

    return new Date();
  } catch (error) {
    return new Date();
  }
};

// Component for date separator
const DateSeparator = ({ date }: { date: string }) => (
  <div className="flex items-center justify-center py-4">
    <div className="rounded-full bg-muted px-3 py-1">
      <span className="text-sm font-medium text-muted-foreground">{date}</span>
    </div>
  </div>
);

// Helper function to extract text content from message
const getMessageText = (messageObj: any): string => {
  if (!messageObj) return "";

  // Try to parse if it's a string
  if (typeof messageObj === "string") {
    try {
      const parsed = JSON.parse(messageObj);
      return parsed.conversation || parsed.text || messageObj;
    } catch {
      return messageObj;
    }
  }

  // If it's already an object, extract conversation or text
  if (typeof messageObj === "object") {
    return messageObj.conversation || messageObj.text || "";
  }

  return String(messageObj);
};

// Component to render different message types based on messageType
const MessageContent = ({ message }: { message: Message }) => {
  const { t } = useTranslation();
  
  const messageType = message.messageType as string;

  switch (messageType) {
    case "conversation":
      if (message.message.contactMessage) {
        const contactMsg = message.message.contactMessage;
        return (
          <div className="p-3 bg-muted rounded-lg max-w-xs">
            <div className="flex items-center gap-2 mb-2">
              <div className="text-xl">👤</div>
              <span className="font-medium">{t("chat.contact")}</span>
            </div>
            {contactMsg.displayName && <p className="text-sm font-medium">{contactMsg.displayName}</p>}
            {contactMsg.vcard && <p className="text-xs text-muted-foreground">{t("chat.contactCart")}</p>}
          </div>
        );
      }

      if (message.message.locationMessage) {
        const locationMsg = message.message.locationMessage;
        return (
          <div className="p-3 bg-muted rounded-lg max-w-xs">
            <div className="flex items-center gap-2 mb-2">
              <div className="text-xl">📍</div>
              <span className="font-medium">{t("chat.messageType.location.title")}</span>
            </div>
            {locationMsg.name && <p className="text-sm font-medium">{locationMsg.name}</p>}
            {locationMsg.address && <p className="text-xs text-muted-foreground">{locationMsg.address}</p>}
            {locationMsg.degreesLatitude && locationMsg.degreesLongitude && (
              <a
                href={`https://maps.google.com/?q=${locationMsg.degreesLatitude},${locationMsg.degreesLongitude}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline text-sm mt-1 inline-block">
                {t("chat.messageType.location.viewOnMaps")}
              </a>
            )}
          </div>
        );
      }

      return <span>{getMessageText(message.message)}</span>;

    case "extendedTextMessage":
      return <span>{message.message.conversation ?? message.message.extendedTextMessage?.text}</span>;

    case "imageMessage":
      // Use base64 data or mediaUrl for images
      const imageBase64 = message.message.base64 ? (message.message.base64.startsWith("data:") ? message.message.base64 : `data:image/jpeg;base64,${message.message.base64}`) : null;

      const imageSrc = imageBase64 || message.message.mediaUrl;

      return (
        <div className="flex flex-col gap-2">
          {imageSrc ? (
            <img
              src={imageSrc}
              alt="Image"
              className="rounded-lg max-w-full h-auto"
              style={{
                maxWidth: "400px",
                maxHeight: "400px",
                objectFit: "contain",
              }}
              loading="lazy"
            />
          ) : (
            <div className="rounded bg-muted p-4 max-w-xs">
              <p className="text-center text-muted-foreground">{t("chat.messageType.image.notFound")}</p>
              <p className="text-center text-xs text-muted-foreground mt-1">{t("chat.media.missingData")}</p>
            </div>
          )}
          {message.message.imageMessage?.caption && <p className="text-sm">{message.message.imageMessage.caption}</p>}
        </div>
      );

    case "videoMessage":
      // Use base64 data or mediaUrl for videos
      const videoBase64 = message.message.base64 ? (message.message.base64.startsWith("data:") ? message.message.base64 : `data:video/mp4;base64,${message.message.base64}`) : null;

      const videoSrc = videoBase64 || message.message.mediaUrl;

      return (
        <div className="flex flex-col gap-2">
          {videoSrc ? (
            <video
              src={videoSrc}
              controls
              className="rounded-lg max-w-full h-auto"
              style={{
                maxWidth: "400px",
                maxHeight: "400px",
              }}
            />
          ) : (
            <div className="rounded bg-muted p-4 max-w-xs">
              <p className="text-center text-muted-foreground">{t("chat.messageType.video.notFound")}</p>
              <p className="text-center text-xs text-muted-foreground mt-1">{t("chat.media.missingData")}</p>
            </div>
          )}
          {message.message.videoMessage?.caption && <p className="text-sm">{message.message.videoMessage.caption}</p>}
        </div>
      );

    case "audioMessage":
      // Use base64 data or mediaUrl for audio
      const audioBase64 = message.message.base64 ? (message.message.base64.startsWith("data:") ? message.message.base64 : `data:audio/mpeg;base64,${message.message.base64}`) : null;

      const audioSrc = audioBase64 || message.message.mediaUrl;

      return audioSrc ? (
        <audio controls className="w-full max-w-xs">
          <source src={audioSrc} type="audio/mpeg" />
          {t("chat.messageType.audio.notSupported")}.
        </audio>
      ) : (
        <div className="rounded bg-muted p-4 max-w-xs">
          <p className="text-center text-muted-foreground">{t("chat.messageType.audio.notFound")}</p>
          <p className="text-center text-xs text-muted-foreground mt-1">{t("chat.media.missingData")}</p>
        </div>
      );

    case "documentMessage":
      return (
        <div className="flex items-center gap-2 p-3 bg-muted rounded-lg max-w-xs">
          <div className="text-2xl">📄</div>
          <div className="flex-1 min-w-0">
            <p className="font-medium truncate">{message.message.documentMessage?.fileName || "Document"}</p>
            {message.message.documentMessage?.fileLength && <p className="text-xs text-muted-foreground">{(message.message.documentMessage.fileLength / 1024 / 1024).toFixed(2)} MB</p>}
          </div>
        </div>
      );

    case "stickerMessage":
      return <img src={message.message.mediaUrl} alt="Sticker" className="max-w-32 max-h-32 object-contain" />;

    default:
      // Fallback for unknown message types
      return (
        <div className="text-xs text-muted-foreground bg-muted p-2 rounded max-w-xs">
          <details>
            <summary>{t("chat.messageType.unknownMessage")}: {messageType}</summary>
            <pre className="mt-2 whitespace-pre-wrap break-all text-xs">{JSON.stringify(message.message, null, 2)}</pre>
          </details>
        </div>
      );
  }
};

function Messages({ textareaRef, handleTextareaChange, textareaHeight, lastMessageRef, scrollToBottom }: MessagesProps) {
  const { instance } = useInstance();
  const [messageText, setMessageText] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<File | null>(null);
  const [realtimeMessages, setRealtimeMessages] = useState<Message[]>([]);
  const { sendText: sendTextMutation } = useSendMessage();
  const { sendMedia: sendMediaMutation } = useSendMedia();

  const { remoteJid } = useParams<{ remoteJid: string }>();

  // Handle sending text messages
  const sendTextMessage = async () => {
    if (!messageText.trim() || !remoteJid || !instance?.name || !instance?.token || isSending) return;

    try {
      setIsSending(true);
      await sendTextMutation({
        instanceName: instance.name,
        token: instance.token,
        data: {
          number: remoteJid,
          text: messageText.trim(),
        },
      });

      // Clear the input after sending
      setMessageText("");
      if (textareaRef.current) {
        textareaRef.current.value = "";
        handleTextareaChange(); // Reset height
      }
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setIsSending(false);
    }
  };

  // Handle sending media messages
  const sendMediaMessage = async () => {
    if (!selectedMedia || !remoteJid || !instance?.name || !instance?.token || isSending) return;

    try {
      setIsSending(true);

      // Convert media to base64
      const base64Data = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(selectedMedia);
        reader.onload = () => {
          const base64 = reader.result as string;
          // Strip the data URI prefix (data:image/xyz;base64,)
          const base64Data = base64.split(",")[1];
          resolve(base64Data);
        };
        reader.onerror = reject;
      });

      await sendMediaMutation({
        instanceName: instance.name,
        token: instance.token,
        data: {
          number: remoteJid,
          mediaMessage: {
            mediatype: selectedMedia.type.split("/")[0] === "application" ? "document" : (selectedMedia.type.split("/")[0] as "audio" | "video" | "image" | "document"),
            mimetype: selectedMedia.type,
            caption: messageText.trim(),
            media: base64Data,
            fileName: selectedMedia.name,
          },
        },
      });

      // Clear the input and media after sending
      setSelectedMedia(null);
      setMessageText("");
      if (textareaRef.current) {
        textareaRef.current.value = "";
        handleTextareaChange(); // Reset height
      }
    } catch (error) {
      console.error("Error sending media:", error);
    } finally {
      setIsSending(false);
    }
  };

  // Handle message sending (decides between text or media)
  const sendMessage = async () => {
    if (selectedMedia) {
      await sendMediaMessage();
    } else {
      await sendTextMessage();
    }
  };

  // Handle Enter key press
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessageText(e.target.value);
    handleTextareaChange();
  };
  const { data: chat } = useFindChat({
    remoteJid,
    instanceName: instance?.name,
  });

  const { data: messages, isSuccess } = useFindMessages({
    remoteJid,
    instanceName: instance?.name,
  });

  // Combine React Query messages with real-time updates
  const allMessages = useMemo(() => {
    if (!messages) return realtimeMessages;

    // Merge messages from React Query with real-time updates
    const messageMap = new Map();

    // First add all messages from React Query
    messages.forEach((message: { key: { id: any; }; }) => messageMap.set(message.key.id, message));

    // Then add/update with real-time messages
    realtimeMessages.forEach((message) => {
      messageMap.set(message.key.id, message);
    });

    return Array.from(messageMap.values());
  }, [messages, realtimeMessages]);

  // Add websocket functionality for real-time message updates
  useEffect(() => {
    if (!instance?.name || !remoteJid) return;

    const serverUrl = getToken(TOKEN_ID.API_URL);
    if (!serverUrl) {
      console.error("API URL not found in localStorage");
      return;
    }

    const socket = connectSocket(serverUrl);

    // Function to update messages from websocket events
    const updateMessagesFromWebsocket = (_eventType: string, data: any) => {
      if (!instance) return;

      if (data.instance !== instance.name) {
        return;
      }

      if (data?.data?.key?.remoteJid !== remoteJid) {
        return;
      }

      const message = data.data;

      setRealtimeMessages((prevMessages) => {
        // Check if message already exists
        const existingIndex = prevMessages.findIndex((msg) => msg.key.id === message.key.id);

        if (existingIndex !== -1) {
          // Update existing message
          const updatedMessages = [...prevMessages];
          updatedMessages[existingIndex] = message;
          return updatedMessages;
        } else {
          // Add new message
          return [...prevMessages, message];
        }
      });
    };

    // Function to update message status (simplified - just log for now)
    const updateMessageStatus = (data: any) => {
      if (!instance) return;
      if (data.instance !== instance.name) return;

      console.log("Received message status update:", data);
      // TODO: Implement proper message status updates when Message type supports it
    };

    // Set up event listeners
    socket.on("messages.upsert", (data: any) => {
      updateMessagesFromWebsocket("messages.upsert", data);
    });

    socket.on("send.message", (data: any) => {
      updateMessagesFromWebsocket("send.message", data);
    });

    socket.on("messages.update", (data: any) => {
      updateMessageStatus(data);
    });

    socket.connect();

    // Cleanup function
    return () => {
      socket.off("messages.upsert");
      socket.off("send.message");
      socket.off("messages.update");
      disconnectSocket(socket);
    };
  }, [instance?.name, remoteJid]);

  // Group messages by date
  const groupedMessages = useMemo(() => {
    if (!allMessages) return [];

    // Sort messages by timestamp first
    const sortedMessages = [...allMessages].sort((a, b) => {
      const aTime = getMessageTimestamp(a).getTime();
      const bTime = getMessageTimestamp(b).getTime();
      return aTime - bTime;
    });

    const grouped: { date: string; messages: Message[] }[] = [];
    let currentDate = "";
    let currentGroup: Message[] = [];

    sortedMessages.forEach((message) => {
      const messageDate = getMessageTimestamp(message);
      const dateString = messageDate.toDateString();

      if (dateString !== currentDate) {
        if (currentGroup.length > 0) {
          grouped.push({
            date: formatDateSeparator(new Date(currentDate)),
            messages: currentGroup,
          });
        }
        currentDate = dateString;
        currentGroup = [message];
      } else {
        currentGroup.push(message);
      }
    });

    if (currentGroup.length > 0) {
      grouped.push({
        date: formatDateSeparator(new Date(currentDate)),
        messages: currentGroup,
      });
    }

    return grouped;
  }, [allMessages]);

  useEffect(() => {
    if (isSuccess && allMessages) {
      scrollToBottom();
    }
  }, [isSuccess, allMessages, scrollToBottom]);

  // Clear selected media and real-time messages when switching chats
  useEffect(() => {
    setSelectedMedia(null);
    setMessageText("");
    setRealtimeMessages([]); // Clear real-time messages when switching chats
    if (textareaRef.current) {
      textareaRef.current.value = "";
      handleTextareaChange();
    }
  }, [remoteJid]);

  const renderBubbleRight = (message: Message) => {
    return (
      <div key={message.id} className="bubble-right">
        <div className="flex items-start gap-4 self-end">
          <div className="grid gap-1">
            <div className="bubble">
              <MessageContent message={message} />
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderBubbleLeft = (message: Message) => {
    return (
      <div key={message.id} className="bubble-left">
        <div className="flex items-start gap-4">
          <div className="grid gap-1">
            <div className="bubble">
              <MessageContent message={message} />
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex h-full flex-col">
      <div className="sticky top-0 bg-background border-b border-border p-3">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={chat?.profilePicUrl} alt={chat?.pushName || chat?.remoteJid?.split("@")[0]} />
            <AvatarFallback className="bg-slate-700 text-slate-300 border border-slate-600">
              <User className="h-5 w-5" />
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="font-medium text-sm truncate">{chat?.pushName || chat?.remoteJid?.split("@")[0]}</div>
            <div className="text-xs text-muted-foreground truncate">{chat?.remoteJid?.split("@")[0]}</div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <ChevronDownIcon className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="max-w-[300px]">
              <DropdownMenuItem className="items-start gap-2">
                <SparkleIcon className="mr-2 h-4 w-4 shrink-0 translate-y-1" />
                <div>
                  <div className="font-medium">GPT-4</div>
                  <div className="text-muted-foreground/80">With DALL-E, browsing and analysis. Limit 40 messages / 3 hours</div>
                </div>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="items-start gap-2">
                <ZapIcon className="mr-2 h-4 w-4 shrink-0 translate-y-1" />
                <div>
                  <div className="font-medium">GPT-3</div>
                  <div className="text-muted-foreground/80">Great for everyday tasks</div>
                </div>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <div className="message-container mx-auto flex max-w-4xl flex-1 flex-col gap-2 overflow-y-auto px-2">
        {groupedMessages.map((group, groupIndex) => (
          <div key={groupIndex}>
            <DateSeparator date={group.date} />
            <div className="flex flex-col gap-2">
              {group.messages.map((message) => {
                if (message.key.fromMe) {
                  return renderBubbleRight(message);
                } else {
                  return renderBubbleLeft(message);
                }
              })}
            </div>
          </div>
        ))}
        <div ref={lastMessageRef as never} />
      </div>
      <div className="sticky bottom-0 mx-auto flex w-full max-w-2xl flex-col gap-1.5 bg-background px-2 py-2">
        {selectedMedia && <SelectedMedia selectedMedia={selectedMedia} setSelectedMedia={setSelectedMedia} />}
        <div className="flex items-center rounded-3xl border border-border bg-background px-2 py-1">
          {instance && <MediaOptions instance={instance} setSelectedMedia={setSelectedMedia} />}
          <Textarea
            placeholder="Enviar mensagem..."
            name="message"
            id="message"
            rows={1}
            ref={textareaRef}
            value={messageText}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            disabled={isSending}
            style={{ height: textareaHeight }}
            className="min-h-0 w-full resize-none border-none p-3 focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-transparent focus-visible:ring-offset-0 focus-visible:ring-offset-transparent"
          />
          <Button type="button" size="icon" onClick={sendMessage} disabled={(!messageText.trim() && !selectedMedia) || isSending} className="rounded-full p-2 disabled:opacity-50">
            <ArrowRightIcon className="h-6 w-6" />
            <span className="sr-only">Enviar</span>
          </Button>
        </div>
      </div>
    </div>
  );
}

export { Messages };
