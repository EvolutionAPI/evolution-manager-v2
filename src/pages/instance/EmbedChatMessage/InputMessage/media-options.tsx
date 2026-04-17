import { PlusIcon, ImagesIcon, FilePlus } from "lucide-react";
import React, { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";

import { Button } from "@evoapi/design-system/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@evoapi/design-system/dropdown-menu";

import { useEmbedColors } from "@/contexts/EmbedColorsContext";

import { Instance } from "@/types/evolution.types";

interface MediaOptionsProps {
  instance: Instance;
  setSelectedMedia: React.Dispatch<React.SetStateAction<File | null>>;
}

const MediaOptions = ({ setSelectedMedia }: MediaOptionsProps) => {
  const { t } = useTranslation();
  const { inputIconsMainColor } = useEmbedColors();
  const MediaInputRef = useRef<HTMLInputElement | null>(null);
  const documentInputRef = useRef<HTMLInputElement | null>(null);

  const [openDropdown, setOpenDropdown] = useState(false);

  const handleMediaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      setSelectedMedia(null);
      return;
    }

    // Validação de tamanho e tipo de arquivo
    const fileType = file.type.split("/")[0];
    const fileSize = file.size / (1024 * 1024); // Converter para MB

    // Validar por tipo
    switch (fileType) {
      case "audio":
        if (fileSize > 16) {
          toast.error(t("chat.media.errors.audioSize"));
          return;
        }
        break;
      case "image":
        if (fileSize > 5) {
          toast.error(t("chat.media.errors.imageSize"));
          return;
        }
        break;
      case "video":
        if (fileSize > 16) {
          toast.error(t("chat.media.errors.videoSize"));
          return;
        }
        break;
      case "application":
      case "text":
        if (fileSize > 100) {
          toast.error(t("chat.media.errors.documentSize"));
          return;
        }
        break;
      default:
        toast.error(t("chat.media.errors.unsupportedType"));
        return;
    }

    setSelectedMedia(file);
  };

  const triggerMediaInput = (e: React.MouseEvent) => {
    e.preventDefault(); // Previne o comportamento padrão do clique
    if (MediaInputRef.current) {
      MediaInputRef.current.click();
    }
  };

  const triggerDocumentInput = (e: React.MouseEvent) => {
    e.preventDefault(); // Previne o comportamento padrão do clique
    if (documentInputRef.current) {
      documentInputRef.current.click();
    }
  };

  const allowedDocumentTypes = [
    "text/plain",
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/vnd.ms-powerpoint",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    "application/zip",
    "application/x-rar-compressed",
    "application/x-7z-compressed",
  ];

  return (
    <>
      <DropdownMenu open={openDropdown} onOpenChange={setOpenDropdown}>
        <DropdownMenuTrigger asChild>
          <Button type="button" variant="ghost" size="icon" className="rounded-full p-2">
            <PlusIcon className="h-6 w-6" style={{ color: inputIconsMainColor }} />
            <span className="sr-only">{t("chat.media.attach")}</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <input ref={documentInputRef} type="file" accept={allowedDocumentTypes.join(", ")} onChange={handleMediaChange} className="hidden" />
          <DropdownMenuItem onClick={triggerDocumentInput}>
            <FilePlus className="mr-2 h-4 w-4" />
            {t("chat.media.document")}
          </DropdownMenuItem>
          <input ref={MediaInputRef} type="file" accept="image/*, video/*" onChange={handleMediaChange} className="hidden" />
          <DropdownMenuItem onClick={triggerMediaInput}>
            <ImagesIcon className="mr-2 h-4 w-4" />
            {t("chat.media.photosAndVideos")}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
};

export { MediaOptions };
