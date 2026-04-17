import { ChevronDown, ReplyIcon, DeleteIcon } from "lucide-react";
import { useContext } from "react";
import { useTranslation } from "react-i18next";

import { Button } from "@evoapi/design-system/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@evoapi/design-system/dropdown-menu";

import { useEmbedColors } from "@/contexts/EmbedColorsContext";
import { useEmbedInstance } from "@/contexts/EmbedInstanceContext";
import { ReplyMessageContext } from "@/contexts/ReplyingMessage/ReplyingMessageContext";

// Removed deleteMessage import - not available

import { Message } from "@/types/evolution.types";

const MessageOptions = ({ message, fromMe }: { message: Message; fromMe: boolean }) => {
  const { t } = useTranslation();
  const { instance } = useEmbedInstance();
  const { setReplyingMessage } = useContext(ReplyMessageContext);
  const { fromMeBubbleColor, fromOtherBubbleColor } = useEmbedColors();
  // const { deleteMessage } = useDeleteMessage(); // TODO: Implement delete functionality

  const handleDeleteMessage = async () => {
    if (!instance) return;

    // TODO: Implement delete functionality
    console.log("Delete message not implemented yet");
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          size="icon"
          variant="ghost"
          id="message-options"
          className={`invisible absolute right-0 top-0 z-50 rounded-full opacity-0 transition-all duration-300 group-hover:visible group-hover:opacity-100`}
          style={{
            backgroundColor: fromMe ? fromMeBubbleColor : fromOtherBubbleColor,
          }}>
          <ChevronDown className="h-4 w-4" strokeWidth={2.25} />
          <span className="sr-only">{t("chat.message.options")}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setReplyingMessage(message)} className="cursor-pointer">
          <ReplyIcon className="mr-2 h-4 w-4" />
          {t("chat.message.reply")}
        </DropdownMenuItem>
        {instance?.integration !== "WHATSAPP-BUSINESS" && (
          <DropdownMenuItem onClick={handleDeleteMessage} className="cursor-pointer">
            <DeleteIcon className="mr-2 h-4 w-4" />
            {t("chat.message.delete")}
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export { MessageOptions };
