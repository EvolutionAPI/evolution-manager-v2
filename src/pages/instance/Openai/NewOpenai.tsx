/* eslint-disable @typescript-eslint/no-explicit-any */
import { PlusIcon } from "lucide-react"; // Importando o ícone corretamente
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";

import { Button } from "@evoapi/design-system/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

import { useInstance } from "@/contexts/InstanceContext";

import { useManageOpenai } from "@/lib/queries/openai/manageOpenai";

import { Openai } from "@/types/evolution.types";

import { FormSchemaType, OpenaiForm } from "./OpenaiForm";

function NewOpenai({ resetTable }: { resetTable: () => void }) {
  const { t } = useTranslation();
  const { instance } = useInstance();

  const { createOpenai } = useManageOpenai();
  const [updating, setUpdating] = useState(false);
  const [open, setOpen] = useState(false);

  const onSubmit = async (data: FormSchemaType) => {
    try {
      if (!instance || !instance.name) {
        throw new Error("instance not found");
      }

      setUpdating(true);
      const openaiData: Openai = {
        enabled: data.enabled,
        description: data.description,
        openaiCredsId: data.openaiCredsId,
        botType: data.botType,
        assistantId: data.assistantId || "",
        functionUrl: data.functionUrl || "",
        model: data.model || "",
        systemMessages: [data.systemMessages || ""],
        assistantMessages: [data.assistantMessages || ""],
        userMessages: [data.userMessages || ""],
        maxTokens: data.maxTokens || 0,
        triggerType: data.triggerType,
        triggerOperator: data.triggerOperator || "",
        triggerValue: data.triggerValue || "",
        expire: data.expire || 0,
        keywordFinish: data.keywordFinish || "",
        delayMessage: data.delayMessage || 0,
        unknownMessage: data.unknownMessage || "",
        listeningFromMe: data.listeningFromMe || false,
        stopBotFromMe: data.stopBotFromMe || false,
        keepOpen: data.keepOpen || false,
        debounceTime: data.debounceTime || 0,
        splitMessages: data.splitMessages || false,
        timePerChar: data.timePerChar || 0,
      };

      await createOpenai({
        instanceName: instance.name,
        token: instance.token,
        data: openaiData,
      });
      toast.success(t("openai.toast.success.create"));
      setOpen(false);
      resetTable();
    } catch (error: any) {
      console.error("Error:", error);
      toast.error(`Error: ${error?.response?.data?.response?.message}`);
    } finally {
      setUpdating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <PlusIcon size={16} className="mr-1" />
          <span className="hidden sm:inline">{t("openai.button.create")}</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="overflow-y-auto sm:max-h-[600px] sm:max-w-[740px]">
        <DialogHeader>
          <DialogTitle>{t("openai.form.title")}</DialogTitle>
        </DialogHeader>
        <OpenaiForm onSubmit={onSubmit} isModal={true} isLoading={updating} open={open} />
      </DialogContent>
    </Dialog>
  );
}

export { NewOpenai };
