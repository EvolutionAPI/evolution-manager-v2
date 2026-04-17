/* eslint-disable @typescript-eslint/no-explicit-any */
import { PlusIcon } from "lucide-react"; // Importando o ícone corretamente
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";

import { Button } from "@evoapi/design-system/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

import { useInstance } from "@/contexts/InstanceContext";

import { useManageEvolutionBot } from "@/lib/queries/evolutionBot/manageEvolutionBot";

import { EvolutionBot } from "@/types/evolution.types";

import { FormSchemaType, EvolutionBotForm } from "./EvolutionBotForm";

function NewEvolutionBot({ resetTable }: { resetTable: () => void }) {
  const { t } = useTranslation();
  const { instance } = useInstance();

  const [updating, setUpdating] = useState(false);
  const [open, setOpen] = useState(false);

  const { createEvolutionBot } = useManageEvolutionBot();

  const onSubmit = async (data: FormSchemaType) => {
    try {
      if (!instance || !instance.name) {
        throw new Error("instance not found");
      }

      setUpdating(true);
      const evolutionBotData: EvolutionBot = {
        enabled: data.enabled,
        description: data.description,
        apiUrl: data.apiUrl,
        apiKey: data.apiKey,
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
        timePerChar: data.timePerChar ? data.timePerChar : 0,
      };

      await createEvolutionBot({
        instanceName: instance.name,
        token: instance.token,
        data: evolutionBotData,
      });
      toast.success(t("evolutionBot.toast.success.create"));
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
          <span className="hidden sm:inline">{t("evolutionBot.button.create")}</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="overflow-y-auto sm:max-h-[600px] sm:max-w-[740px]">
        <DialogHeader>
          <DialogTitle>{t("evolutionBot.form.title")}</DialogTitle>
        </DialogHeader>
        <EvolutionBotForm onSubmit={onSubmit} isModal={true} isLoading={updating} />
      </DialogContent>
    </Dialog>
  );
}

export { NewEvolutionBot };
