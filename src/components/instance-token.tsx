import { Copy, Eye, EyeOff } from "lucide-react";
import { useState } from "react";

import { cn } from "@/lib/utils";

import { copyToClipboard } from "@/utils/copy-to-clipboard";

import { Button } from "@evoapi/design-system/button";

export function InstanceToken({ token, className }: { token: string; className?: string }) {
  const [visible, setVisible] = useState(false);

  return (
    <div className={cn("flex items-center gap-3 truncate rounded-sm bg-primary/20 px-2 py-1", className)}>
      <pre className="block truncate text-xs">{visible ? token : token?.replace(/\w/g, "*")}</pre>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => {
          copyToClipboard(token);
        }}>
        <Copy size="15" />
      </Button>

      <Button
        variant="ghost"
        size="icon"
        onClick={() => {
          setVisible((old) => !old);
        }}>
        {visible ? <EyeOff size="15" /> : <Eye size="15" />}
      </Button>
    </div>
  );
}
