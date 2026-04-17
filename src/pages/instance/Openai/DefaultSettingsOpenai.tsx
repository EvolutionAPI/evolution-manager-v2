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

import { useFindDefaultSettingsOpenai } from "@/lib/queries/openai/findDefaultSettingsOpenai";
import { useFindOpenai } from "@/lib/queries/openai/findOpenai";
import { useFindOpenaiCreds } from "@/lib/queries/openai/findOpenaiCreds";
import { useManageOpenai } from "@/lib/queries/openai/manageOpenai";

import { OpenaiSettings } from "@/types/evolution.types";

const FormSchema = z.object({
  openaiCredsId: z.string(),
  expire: z.coerce.number(),
  keywordFinish: z.string(),
  delayMessage: z.coerce.number().default(0),
  unknownMessage: z.string(),
  listeningFromMe: z.boolean(),
  stopBotFromMe: z.boolean(),
  keepOpen: z.boolean(),
  debounceTime: z.coerce.number(),
  speechToText: z.boolean(),
  ignoreJids: z.array(z.string()).default([]),
  openaiIdFallback: z.union([z.null(), z.string()]).optional(),
  splitMessages: z.boolean().optional(),
  timePerChar: z.coerce.number().optional(),
});

function DefaultSettingsOpenai() {
  const { t } = useTranslation();
  const { instance } = useInstance();

  const { setDefaultSettingsOpenai } = useManageOpenai();
  const [open, setOpen] = useState(false);
  const { data: settings, refetch: refetchSettings } = useFindDefaultSettingsOpenai({
    instanceName: instance?.name,
    enabled: open,
  });
  const { data: bots, refetch: refetchBots } = useFindOpenai({
    instanceName: instance?.name,
    enabled: open,
  });
  const { data: creds } = useFindOpenaiCreds({
    instanceName: instance?.name,
    enabled: open,
  });

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      openaiCredsId: "",
      expire: 0,
      keywordFinish: t("openai.form.examples.keywordFinish"),
      delayMessage: 1000,
      unknownMessage: t("openai.form.examples.unknownMessage"),
      listeningFromMe: false,
      stopBotFromMe: false,
      keepOpen: false,
      debounceTime: 0,
      speechToText: false,
      ignoreJids: [],
      openaiIdFallback: undefined,
      splitMessages: false,
      timePerChar: 0,
    },
  });

  useEffect(() => {
    if (settings) {
      form.reset({
        openaiCredsId: settings.openaiCredsId,
        expire: settings?.expire ?? 0,
        keywordFinish: settings.keywordFinish,
        delayMessage: settings.delayMessage ?? 0,
        unknownMessage: settings.unknownMessage,
        listeningFromMe: settings.listeningFromMe,
        stopBotFromMe: settings.stopBotFromMe,
        keepOpen: settings.keepOpen,
        debounceTime: settings.debounceTime ?? 0,
        speechToText: settings.speechToText,
        ignoreJids: settings.ignoreJids,
        openaiIdFallback: settings.openaiIdFallback,
        splitMessages: settings.splitMessages,
        timePerChar: settings.timePerChar ?? 0,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settings]);

  const handleSubmit = async (data: z.infer<typeof FormSchema>) => {
    try {
      if (!instance || !instance.name) {
        throw new Error("instance not found.");
      }

      const settingsData: OpenaiSettings = {
        openaiCredsId: data.openaiCredsId,
        expire: data.expire,
        keywordFinish: data.keywordFinish,
        delayMessage: data.delayMessage,
        unknownMessage: data.unknownMessage,
        listeningFromMe: data.listeningFromMe,
        stopBotFromMe: data.stopBotFromMe,
        keepOpen: data.keepOpen,
        debounceTime: data.debounceTime,
        speechToText: data.speechToText,
        openaiIdFallback: data.openaiIdFallback || undefined,
        ignoreJids: data.ignoreJids,
        splitMessages: data.splitMessages,
        timePerChar: data.timePerChar,
      };

      await setDefaultSettingsOpenai({
        instanceName: instance.name,
        token: instance.token,
        data: settingsData,
      });
      toast.success(t("openai.toast.defaultSettings.success"));
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error("Error:", error);
      toast.error(`Error: ${error?.response?.data?.response?.message}`);
    }
  };

  function onReset() {
    refetchSettings();
    refetchBots();
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="secondary" size="sm">
          <Cog size={16} className="mr-1" />
          <span className="hidden md:inline">{t("openai.defaultSettings")}</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="overflow-y-auto sm:max-h-[600px] sm:max-w-[740px]" onCloseAutoFocus={onReset}>
        <DialogHeader>
          <DialogTitle>{t("openai.defaultSettings")}</DialogTitle>
        </DialogHeader>
        <FormProvider {...form}>
          <form className="w-full space-y-6" onSubmit={form.handleSubmit(handleSubmit)}>
            <div>
              <div className="space-y-4">
                <FormSelect
                  name="openaiCredsId"
                  label={t("openai.form.openaiCredsId.label")}
                  options={
                    creds
                      ?.filter((cred) => !!cred.id)
                      .map((cred) => ({
                        label: cred.name ? cred.name : cred.apiKey.substring(0, 15) + "...",
                        value: cred.id!,
                      })) || []
                  }
                />
                <FormSelect
                  name="openaiIdFallback"
                  label={t("openai.form.openaiIdFallback.label")}
                  options={
                    bots
                      ?.filter((bot) => !!bot.id)
                      .map((bot) => ({
                        label: bot.description,
                        value: bot.id!,
                      })) ?? []
                  }
                />
                <FormInput name="expire" label={t("openai.form.expire.label")}>
                  <Input type="number" />
                </FormInput>
                <FormInput name="keywordFinish" label={t("openai.form.keywordFinish.label")}>
                  <Input />
                </FormInput>
                <FormInput name="delayMessage" label={t("openai.form.delayMessage.label")}>
                  <Input type="number" />
                </FormInput>
                <FormInput name="unknownMessage" label={t("openai.form.unknownMessage.label")}>
                  <Input />
                </FormInput>
                <FormSwitch name="listeningFromMe" label={t("openai.form.listeningFromMe.label")} reverse />
                <FormSwitch name="stopBotFromMe" label={t("openai.form.stopBotFromMe.label")} reverse />
                <FormSwitch name="keepOpen" label={t("openai.form.keepOpen.label")} reverse />
                <FormSwitch name="speechToText" label={t("openai.form.speechToText.label")} reverse />

                <FormInput name="debounceTime" label={t("openai.form.debounceTime.label")}>
                  <Input type="number" />
                </FormInput>

                <FormSwitch name="splitMessages" label={t("openai.form.splitMessages.label")} reverse />

                {form.watch("splitMessages") && (
                  <FormInput name="timePerChar" label={t("openai.form.timePerChar.label")}>
                    <Input type="number" />
                  </FormInput>
                )}

                <FormTags name="ignoreJids" label={t("openai.form.ignoreJids.label")} placeholder={t("openai.form.ignoreJids.placeholder")} />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit">{t("openai.button.save")}</Button>
            </DialogFooter>
          </form>
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}

export { DefaultSettingsOpenai };
