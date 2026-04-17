/* eslint-disable @typescript-eslint/no-explicit-any */
import { XIcon, ImageIcon, VideoIcon, MicIcon, FileIcon, StickerIcon, UserIcon, MapPinIcon } from "lucide-react";
import { useContext } from "react";

import { Button } from "@evoapi/design-system/button";

import { useEmbedColors } from "@/contexts/EmbedColorsContext";
import { ReplyMessageContext } from "@/contexts/ReplyingMessage/ReplyingMessageContext";

import { Contact } from "@/types/evolution.types";

// Removed contact-colors import - using simple color logic

const calculateTime = (seconds: number) => {
  const minutes = Math.floor(seconds / 60);
  const restSeconds = seconds % 60;

  const formattedMinutes = minutes < 10 ? `${minutes}` : minutes;
  const formattedSeconds = restSeconds < 10 ? `0${restSeconds}` : restSeconds;

  return `${formattedMinutes}:${formattedSeconds}`;
};

const maxLength = 200;

const ReplyingImageMessage = ({ imageMessage }: { imageMessage: any }) => (
  <div className="flex flex-col gap-2">
    <div className="flex items-center gap-2">
      <img src={imageMessage?.mediaUrl} alt="Quoted message" width={100} height={100} />
      <ImageIcon className="mr-2 h-4 w-4 text-muted-foreground" />
    </div>
    <span className="inline-block max-w-40 overflow-hidden overflow-ellipsis whitespace-nowrap text-sm text-muted-foreground">{imageMessage.caption}</span>
  </div>
);

const ReplyingVideoMessage = ({ videoMessage }: { videoMessage: any }) => (
  <div className="flex flex-col gap-2">
    <div className="flex items-center gap-2">
      <img src={videoMessage?.mediaUrl} alt="Quoted message" width={100} height={100} />
      <VideoIcon className="mr-2 h-4 w-4 text-muted-foreground" />
    </div>
    <span className="inline-block max-w-40 overflow-hidden overflow-ellipsis whitespace-nowrap text-sm text-muted-foreground">{videoMessage.caption}</span>
  </div>
);

const ReplyingAudioMessage = ({ audioMessage }: { audioMessage: any }) => (
  <div className="flex flex-col gap-2">
    <div className="flex items-center gap-2">
      <MicIcon className="h-6 w-6 text-muted-foreground" />
      <span className="text-sm text-muted-foreground">{calculateTime(audioMessage.seconds)}</span>
    </div>
    <span className="inline-block max-w-40 overflow-hidden overflow-ellipsis whitespace-nowrap text-sm text-muted-foreground">{audioMessage.fileName}</span>
  </div>
);

const ReplyingStickerMessage = ({ stickerMessage }: { stickerMessage: any }) => (
  <div className="flex items-center gap-2">
    <img src={stickerMessage.mediaUrl} alt="Sticker" width={100} height={100} />
    <StickerIcon className="h-6 w-6 text-muted-foreground" />
  </div>
);

const ReplyingDocumentMessage = ({ documentMessage }: { documentMessage: any }) => (
  <div className="flex flex-col gap-2">
    <div className="flex items-center gap-2">
      <FileIcon className="h-6 w-6 text-muted-foreground" />
      <span className="text-sm text-muted-foreground">{documentMessage.fileName}</span>
    </div>
  </div>
);

const ReplyingDocumentWithCaptionMessage = ({ documentMessage }: { documentMessage: any }) => (
  <div className="flex flex-col gap-2">
    <div className="flex items-center gap-2">
      <FileIcon className="h-6 w-6 text-muted-foreground" />
      <span className="text-sm text-muted-foreground">{documentMessage.fileName}</span>
    </div>
    <span className="inline-block max-w-40 overflow-hidden overflow-ellipsis whitespace-nowrap text-sm text-muted-foreground">{documentMessage.caption}</span>
  </div>
);

const ReplyingContactMessage = ({ contactMessage }: { contactMessage: any }) => (
  <div className="flex flex-col gap-2">
    <div className="flex items-center gap-2">
      <UserIcon className="h-6 w-6 text-muted-foreground" />
      <span className="text-sm text-muted-foreground">{contactMessage.displayName}</span>
    </div>
  </div>
);

const ReplyingLocationMessage = ({ locationMessage }: { locationMessage: any }) => (
  <div className="flex flex-col gap-2">
    <div className="flex items-center gap-2">
      <MapPinIcon className="h-6 w-6 text-muted-foreground" />
      <span className="text-sm text-muted-foreground">{locationMessage.name}</span>
    </div>
    <span className="inline-block max-w-40 text-sm text-muted-foreground">{locationMessage.address}</span>
  </div>
);

const ReplyingTextMessage = ({ conversation }: { conversation: string }) => (
  <span className="overflow-hidden text-ellipsis whitespace-nowrap text-sm text-muted-foreground">{conversation.length > maxLength ? `${conversation.substring(0, maxLength)}...` : conversation}</span>
);

const ReplyingMessage = ({ chat }: { chat?: Contact }) => {
  const { replyingMessage, setReplyingMessage } = useContext(ReplyMessageContext);

  const handleRemoveQuotedMessage = () => {
    setReplyingMessage(null);
  };

  const getConversationText = (message: any) => {
    if (message?.conversation) {
      return message.conversation;
    }

    if (message?.viewOnceMessage?.message?.interactiveMessage?.body?.text) {
      return message.viewOnceMessage.message.interactiveMessage.body.text;
    }

    return "";
  };

  const getSenderName = () => {
    if (replyingMessage?.key.fromMe) {
      return "Você";
    }

    if (
      false && // Group messages not supported
      "Group Member"
    ) {
      return "Group Member";
    }

    return chat?.pushName;
  };

  const renderReplyingMessage = () => {
    if (replyingMessage?.messageType === "imageMessage") {
      return (
        <ReplyingImageMessage
          imageMessage={{
            caption: replyingMessage?.message.imageMessage.caption,
            mediaUrl: replyingMessage?.message.mediaUrl,
          }}
        />
      );
    } else if (replyingMessage?.messageType === "videoMessage") {
      return (
        <ReplyingVideoMessage
          videoMessage={{
            caption: replyingMessage?.message.videoMessage.caption,
            mediaUrl: replyingMessage?.message.mediaUrl,
          }}
        />
      );
    } else if (replyingMessage?.messageType === "audioMessage") {
      return <ReplyingAudioMessage audioMessage={replyingMessage?.message.audioMessage} />;
    } else if (replyingMessage?.messageType === "stickerMessage") {
      return <ReplyingStickerMessage stickerMessage={replyingMessage?.message} />;
    } else if (replyingMessage?.messageType === "documentMessage") {
      return (
        <ReplyingDocumentMessage
          documentMessage={{
            name: replyingMessage?.message.documentMessage.name,
            mediaUrl: replyingMessage?.message.mediaUrl,
          }}
        />
      );
    } else if (replyingMessage?.messageType === "documentWithCaptionMessage") {
      return (
        <ReplyingDocumentWithCaptionMessage
          documentMessage={{
            name: replyingMessage?.message.documentWithCaptionMessage.message.documentMessage.name,
            caption: replyingMessage?.message.documentWithCaptionMessage.message.documentMessage.caption,
            mediaUrl: replyingMessage?.message.mediaUrl,
          }}
        />
      );
    } else if (replyingMessage?.messageType === "contactMessage") {
      return <ReplyingContactMessage contactMessage={replyingMessage?.message.contactMessage} />;
    } else if (replyingMessage?.messageType === "locationMessage") {
      return <ReplyingLocationMessage locationMessage={replyingMessage?.message.locationMessage} />;
    } else if (replyingMessage?.messageType === "conversation" || replyingMessage?.messageType === "interactiveMessage" || replyingMessage?.messageType === "extendedTextMessage") {
      return <ReplyingTextMessage conversation={getConversationText(replyingMessage?.message)} />;
    }
  };

  const { inputIconsMainColor, inputBackgroundColor } = useEmbedColors();

  return (
    <div
      className={`relative flex items-center overflow-hidden rounded-lg dark:text-white`}
      style={{
        backgroundColor: inputBackgroundColor,
      }}>
      <div className={`absolute h-full w-1 rounded-l-lg ${replyingMessage?.key.fromMe ? "bg-blue-700 dark:bg-blue-300" : "bg-blue-100"}`} />

      <div className="flex min-w-0 flex-1 flex-col gap-2 p-2 pl-4">
        <span className={`text-sm font-bold ${replyingMessage?.key.fromMe ? "text-blue-700 dark:text-blue-300" : "text-blue-600"}`}>{getSenderName()}</span>
        {renderReplyingMessage()}
      </div>
      <Button
        size="icon"
        variant="ghost"
        className="ml-auto h-10 w-10 shrink-0 rounded-full"
        onClick={handleRemoveQuotedMessage}
        style={{
          backgroundColor: inputBackgroundColor,
          color: inputIconsMainColor,
        }}>
        <XIcon className="h-6 w-6" />
      </Button>
    </div>
  );
};

export { ReplyingMessage };
