import { ReplyIcon, CopyIcon, PhoneIcon, SquareArrowOutUpRight } from "lucide-react";
import { toast } from "react-toastify";

import { Button } from "@evoapi/design-system/button";

interface ButtonType {
  name: string;
  buttonParamsJSON: string;
}

interface InteractiveButtonProps {
  button: ButtonType;
  buttonParams: {
    display_text: string;
    copy_code?: string;
    url?: string;
    number?: string;
    id?: string;
  };
}

export function InteractiveButton({ button, buttonParams }: InteractiveButtonProps) {
  const { display_text: displayText, copy_code: copyCode, url, number, id } = buttonParams;

  const handleClick = () => {
    switch (button.name) {
      case "quick_reply":
        console.log("Reply ID:", id);
        break;
      case "cta_copy":
        navigator.clipboard.writeText(copyCode!);
        toast.success("Copiado para a área de transferência");
        break;
      case "cta_url":
        window.open(url, "_blank");
        break;
      case "cta_call":
        window.location.href = `tel:${number}`;
        break;
      default:
        console.log("Tipo de botão desconhecido");
    }
  };

  return (
    <div className="-mx-4 flex flex-col">
      <div className="h-[1px] bg-black/10 dark:bg-white/10" />
      <Button
        variant="ghost"
        className="gap-2 break-words rounded-none p-3 text-center text-sm font-medium text-[#008069] transition-colors hover:bg-[#b2ece0] dark:text-[#00a884] dark:hover:bg-[#082720]"
        onClick={handleClick}>
        {button.name === "quick_reply" ? (
          <ReplyIcon className="h-4 w-4" />
        ) : button.name === "cta_copy" ? (
          <CopyIcon className="h-4 w-4" />
        ) : button.name === "cta_call" ? (
          <PhoneIcon className="h-4 w-4" />
        ) : (
          <SquareArrowOutUpRight className="h-4 w-4" />
        )}
        {displayText}
      </Button>
    </div>
  );
}
