import { FileIcon } from "lucide-react";

import { Button } from "@evoapi/design-system/button";

import { Message } from "@/types/evolution.types";

import { AudioPlayer } from "./audio-player";
import { ContactMessage } from "./contact-message";
import { ConversationMessage } from "./conversation-message";
import { LocationMessage } from "./location-message";
import { MarkdownWrapper } from "./markdown-wrapper";

interface MessageRendererProps {
  message: Message;
  fromMe: boolean;
}

export function MessageRenderer({ message, fromMe }: MessageRendererProps) {
  switch (message.messageType as string) {
    case "conversation": {
      if (message.message.contactMessage) {
        return <ContactMessage contactMessage={message.message.contactMessage} fromMe={fromMe} />;
      }

      if (message.message.locationMessage) {
        return <LocationMessage locationMessage={message.message.locationMessage} fromMe={fromMe} />;
      }

      return <ConversationMessage message={message} />;
    }
    case "extendedTextMessage":
      return <MarkdownWrapper>{message.message.conversation ?? message.message.extendedTextMessage?.text}</MarkdownWrapper>;

    case "imageMessage":
      // Ensure proper data URI format for image base64
      const imageBase64 = message.message.base64 ? (message.message.base64.startsWith("data:") ? message.message.base64 : `data:image/jpeg;base64,${message.message.base64}`) : null;

      return (
        <div className="mb-2 flex flex-col gap-2">
          {imageBase64 ? (
            <img
              src={imageBase64}
              width="400px"
              alt="Image"
              style={{
                maxHeight: "400px",
                objectFit: "contain",
              }}
            />
          ) : (
            <div className="rounded bg-gray-100 p-4 dark:bg-gray-800">
              <p className="text-center text-muted-foreground">Image couldn't be loaded</p>
              <p className="text-center text-xs text-muted-foreground mt-1">Missing base64 data</p>
            </div>
          )}
          <MarkdownWrapper>{message.message.imageMessage?.caption}</MarkdownWrapper>
        </div>
      );

    case "videoMessage":
      // Ensure proper data URI format for video base64
      const videoBase64 = message.message.base64 ? (message.message.base64.startsWith("data:") ? message.message.base64 : `data:video/mp4;base64,${message.message.base64}`) : null;

      return (
        <div className="mb-2 flex flex-col gap-2">
          {videoBase64 ? (
            <video
              src={videoBase64}
              width="400px"
              controls
              style={{
                maxHeight: "400px",
              }}
            />
          ) : (
            <div className="rounded bg-gray-100 p-4 dark:bg-gray-800">
              <p className="text-center text-muted-foreground">Video couldn't be loaded</p>
              <p className="text-center text-xs text-muted-foreground mt-1">Missing base64 data</p>
            </div>
          )}
          <MarkdownWrapper>{message.message.videoMessage?.caption}</MarkdownWrapper>
        </div>
      );

    case "audioMessage":
      // Ensure proper data URI format for audio base64
      const audioBase64 = message.message.base64 ? (message.message.base64.startsWith("data:") ? message.message.base64 : `data:audio/mpeg;base64,${message.message.base64}`) : null;

      return audioBase64 ? (
        <AudioPlayer audioUrl={audioBase64} fromMe={fromMe} profilePicUrl="" />
      ) : (
        <div className="rounded bg-gray-100 p-4 dark:bg-gray-800">
          <p className="text-center text-muted-foreground">Audio couldn't be loaded</p>
          <p className="text-center text-xs text-muted-foreground mt-1">Missing base64 data</p>
        </div>
      );

    case "documentMessage":
      return (
        <Button
          className={`-m-2 mb-2 gap-1 rounded-lg ${
            fromMe
              ? "bg-[#b2ece0] text-black hover:bg-[#a4ecde] dark:bg-[#082720] dark:text-white dark:hover:bg-[#071f19]"
              : "bg-[#d2e2e2] text-black hover:bg-[#c2d2d2] dark:bg-[#0f1413] dark:text-white dark:hover:bg-[#141a18]"
          }`}>
          <FileIcon className="h-4 w-4" />
          {message.message.documentMessage.fileName}
        </Button>
      );

    case "documentWithCaptionMessage":
      return (
        <>
          <Button
            className={`-m-2 mb-2 gap-1 rounded-lg ${
              fromMe
                ? "bg-[#b2ece0] text-black hover:bg-[#a4ecde] dark:bg-[#082720] dark:text-white dark:hover:bg-[#071f19]"
                : "bg-[#d2e2e2] text-black hover:bg-[#c2d2d2] dark:bg-[#0f1413] dark:text-white dark:hover:bg-[#141a18]"
            }`}>
            <FileIcon className="h-4 w-4" />
            {message.message.documentWithCaptionMessage.message.documentMessage.fileName}
          </Button>
          <MarkdownWrapper>{message.message.documentWithCaptionMessage.message.documentMessage.caption}</MarkdownWrapper>
        </>
      );

    case "stickerMessage":
      return (
        <img
          src={message.message.mediaUrl}
          alt="Sticker"
          width="100px"
          style={{
            maxHeight: "100px",
            objectFit: "contain",
          }}
        />
      );

    case "contactMessage":
      return <ContactMessage contactMessage={message.message.contactMessage} fromMe={fromMe} />;

    case "locationMessage":
      return <LocationMessage locationMessage={message.message.locationMessage} fromMe={fromMe} />;

    default:
      return <>{JSON.stringify(message.message)}</>;
  }
}
