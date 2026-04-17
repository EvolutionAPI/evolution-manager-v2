import { FileIcon, XIcon } from "lucide-react";
import React from "react";
import { useTranslation } from "react-i18next";

import { Button } from "@evoapi/design-system/button";

type SelectedMediaProps = {
  selectedMedia: File | null;
  setSelectedMedia: React.Dispatch<React.SetStateAction<File | null>>;
};

const SelectedMedia = ({ selectedMedia, setSelectedMedia }: SelectedMediaProps) => {
  const { t } = useTranslation();

  const handleRemoveMedia = () => {
    setSelectedMedia(null);
  };

  const renderMediaType = (selectedMedia: File) => {
    if (selectedMedia.type.includes("image")) {
      return (
        <img
          className="w-80 rounded-lg"
          src={URL.createObjectURL(selectedMedia)}
          alt={t("chat.media.selectedMedia.imageAlt")}
          style={{
            maxHeight: "400px",
            objectFit: "contain",
          }}
        />
      );
    }

    if (selectedMedia.type.includes("video")) {
      return (
        <div className="flex items-center justify-center">
          <video className="w-80 rounded-lg object-cover" src={URL.createObjectURL(selectedMedia)} controls />
        </div>
      );
    }

    return (
      // if isnt a image or video, it will be a file
      <div className="flex items-center justify-center">
        <span className="flex items-center gap-2">
          <FileIcon className="h-6 w-6" />
          {t("chat.media.selectedMedia.file")}
        </span>
      </div>
    );
  };

  const calculateSize = (size: number) => {
    const units = ["B", "KB", "MB", "GB", "TB"];
    let unitIndex = 0;
    while (size > 1024) {
      size /= 1024;
      unitIndex++;
    }
    return `${size.toFixed(2)} ${units[unitIndex]}`;
  };

  return (
    <div className={`relative flex items-center rounded-lg bg-[#e0f0f0] dark:bg-[#1d2724] dark:text-white`}>
      <div className={`absolute h-full w-1 rounded-l-lg bg-blue-700 dark:bg-blue-300`} />
      <div className="flex w-full flex-col items-center justify-center gap-6 p-4 pl-4">
        {selectedMedia && renderMediaType(selectedMedia)}
        <div className="flex flex-col items-center justify-center gap-2">
          <span className="text-sm font-medium">{selectedMedia?.name || t("chat.media.selectedMedia.selectedFile")}</span>
          <span className="text-xs text-gray-500">{calculateSize(selectedMedia?.size || 0)}</span>
        </div>
      </div>
      <Button size="icon" variant="ghost" className="ml-auto h-10 w-10 rounded-full" onClick={handleRemoveMedia}>
        <XIcon className="h-6 w-6" />
      </Button>
    </div>
  );
};

export { SelectedMedia };
