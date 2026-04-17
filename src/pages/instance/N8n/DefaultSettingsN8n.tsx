/* eslint-disable @typescript-eslint/no-explicit-any */
import { zodResolver } from "@hookform/resolvers/zod";
import { Cog } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import { z } from "zod";

import { Button } from "@evoapi/design-system/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { FormInput, FormSelect, FormSwitch, FormTags } from "@/components/ui/form";
import { Input } from "@/components/ui/input";

import { useInstance } from "@/contexts/InstanceContext";

import { useFetchN8n } from "@/lib/queries/n8n/fetchN8n";
import { useManageN8n } from "@/lib/queries/n8n/manageN8n";
import { useFetchDefaultSettings } from "@/lib/queries/n8n/settingsFind";

import { N8nSettings } from "@/types/evolution.types";

const FormSchema = z.object({
  expire: z.string(),
  keywordFinish: z.string(),
  delayMessage: z.string(),
  unknownMessage: z.string(),
  listeningFromMe: z.boolean(),
  stopBotFromMe: z.boolean(),
  keepOpen: z.boolean(),
  debounceTime: z.string(),
  ignoreJids: z.array(z.string()).default([]),
  n8nIdFallback: z.union([z.null(), z.string()]).optional(),
  splitMessages: z.boolean(),
  timePerChar: z.string(),
});

function DefaultSettingsN8n() {
  const { t } = useTranslation();
  const { instance } = useInstance();

  const { setDefaultSettingsN8n } = useManageN8n();
  const [open, setOpen] = useState(false);
  const { data: bots, refetch: refetchN8n } = useFetchN8n({
    instanceName: instance?.name,
    token: instance?.token,
    enabled: open,
  });
  const { data: settings, refetch: refetchDefaultSettings } = useFetchDefaultSettings({
    instanceName: instance?.name,
    token: instance?.token,
  });

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      expire: "0",
      keywordFinish: t("n8n.form.examples.keywordFinish"),
      delayMessage: "1000",
      unknownMessage: t("n8n.form.examples.unknownMessage"),
      listeningFromMe: false,
      stopBotFromMe: false,
      keepOpen: false,
      debounceTime: "0",
      ignoreJids: [],
      n8nIdFallback: undefined,
      splitMessages: false,
      timePerChar: "0",
    },
  });

  useEffect(() => {
    if (settings) {
      form.reset({
        expire: settings?.expire ? settings.expire.toString() : "0",
        keywordFinish: settings.keywordFinish,
        delayMessage: settings.delayMessage ? settings.delayMessage.toString() : "0",
        unknownMessage: settings.unknownMessage,
        listeningFromMe: settings.listeningFromMe,
        stopBotFromMe: settings.stopBotFromMe,
        keepOpen: settings.keepOpen,
        debounceTime: settings.debounceTime ? settings.debounceTime.toString() : "0",
        ignoreJids: settings.ignoreJids,
        n8nIdFallback: settings.n8nIdFallback,
        splitMessages: settings.splitMessages,
        timePerChar: settings.timePerChar ? settings.timePerChar.toString() : "0",
      });
    }
  }, [settings]); // eslint-disable-line react-hooks/exhaustive-deps

  const onSubmit = async (data: z.infer<typeof FormSchema>) => {
    try {
      if (!instance || !instance.name) {
        throw new Error("instance not found.");
      }

      const settingsData: N8nSettings = {
        expire: parseInt(data.expire),
        keywordFinish: data.keywordFinish,
        delayMessage: parseInt(data.delayMessage),
        unknownMessage: data.unknownMessage,
        listeningFromMe: data.listeningFromMe,
        stopBotFromMe: data.stopBotFromMe,
        keepOpen: data.keepOpen,
        debounceTime: parseInt(data.debounceTime),
        n8nIdFallback: data.n8nIdFallback || undefined,
        ignoreJids: data.ignoreJids,
        splitMessages: data.splitMessages,
        timePerChar: parseInt(data.timePerChar),
      };

      await setDefaultSettingsN8n({
        instanceName: instance.name,
        token: instance.token,
        data: settingsData,
      });
      toast.success(t("n8n.toast.defaultSettings.success"));
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error("Error:", error);
      toast.error(`Error: ${error?.response?.data?.response?.message}`);
    }
  };

  function onReset() {
    refetchDefaultSettings();
    refetchN8n();
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="secondary" size="sm">
          <Cog size={16} className="mr-1" />
          <span className="hidden sm:inline">{t("n8n.defaultSettings")}</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="overflow-y-auto sm:max-h-[600px] sm:max-w-[740px]" onCloseAutoFocus={onReset}>
        <DialogHeader>
          <DialogTitle>{t("n8n.defaultSettings")}</DialogTitle>
        </DialogHeader>
        <FormProvider {...form}>
          <form className="w-full space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
            <div>
              <div className="space-y-4">
                <FormSelect
                  name="n8nIdFallback"
                  label={t("n8n.form.n8nIdFallback.label")}
                  options={
                    bots
                      ?.filter((bot) => !!bot.id)
                      .map((bot) => ({
                        label: bot.description!,
                        value: bot.id!,
                      })) ?? []
                  }
                />
                <FormInput name="expire" label={t("n8n.form.expire.label")}>
                  <Input type="number" />
                </FormInput>
                <FormInput name="keywordFinish" label={t("n8n.form.keywordFinish.label")}>
                  <Input />
                </FormInput>
                <FormInput name="delayMessage" label={t("n8n.form.delayMessage.label")}>
                  <Input type="number" />
                </FormInput>
                <FormInput name="unknownMessage" label={t("n8n.form.unknownMessage.label")}>
                  <Input />
                </FormInput>
                <FormSwitch name="listeningFromMe" label={t("n8n.form.listeningFromMe.label")} reverse />
                <FormSwitch name="stopBotFromMe" label={t("n8n.form.stopBotFromMe.label")} reverse />
                <FormSwitch name="keepOpen" label={t("n8n.form.keepOpen.label")} reverse />
                <FormInput name="debounceTime" label={t("n8n.form.debounceTime.label")}>
                  <Input type="number" />
                </FormInput>

                <FormSwitch name="splitMessages" label={t("n8n.form.splitMessages.label")} reverse />

                <FormInput name="timePerChar" label={t("n8n.form.timePerChar.label")}>
                  <Input type="number" />
                </FormInput>

                <FormTags name="ignoreJids" label={t("n8n.form.ignoreJids.label")} placeholder={t("n8n.form.ignoreJids.placeholder")} />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit">{t("n8n.button.save")}</Button>
            </DialogFooter>
          </form>
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}

export { DefaultSettingsN8n };
