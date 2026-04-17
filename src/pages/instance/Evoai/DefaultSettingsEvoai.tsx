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

import { useFetchEvoai } from "@/lib/queries/evoai/fetchEvoai";
import { useManageEvoai } from "@/lib/queries/evoai/manageEvoai";
import { useFetchDefaultSettings } from "@/lib/queries/evoai/settingsFind";

import { EvoaiSettings } from "@/types/evolution.types";

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
  evoaiIdFallback: z.union([z.null(), z.string()]).optional(),
  splitMessages: z.boolean(),
  timePerChar: z.string(),
});

function DefaultSettingsEvoai() {
  const { t } = useTranslation();
  const { instance } = useInstance();

  const { setDefaultSettingsEvoai } = useManageEvoai();
  const [open, setOpen] = useState(false);
  const { data: bots, refetch: refetchEvoai } = useFetchEvoai({
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
      keywordFinish: t("evoai.form.examples.keywordFinish"),
      delayMessage: "1000",
      unknownMessage: t("evoai.form.examples.unknownMessage"),
      listeningFromMe: false,
      stopBotFromMe: false,
      keepOpen: false,
      debounceTime: "0",
      ignoreJids: [],
      evoaiIdFallback: undefined,
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
        evoaiIdFallback: settings.evoaiIdFallback,
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

      const settingsData: EvoaiSettings = {
        expire: parseInt(data.expire),
        keywordFinish: data.keywordFinish,
        delayMessage: parseInt(data.delayMessage),
        unknownMessage: data.unknownMessage,
        listeningFromMe: data.listeningFromMe,
        stopBotFromMe: data.stopBotFromMe,
        keepOpen: data.keepOpen,
        debounceTime: parseInt(data.debounceTime),
        evoaiIdFallback: data.evoaiIdFallback || undefined,
        ignoreJids: data.ignoreJids,
        splitMessages: data.splitMessages,
        timePerChar: parseInt(data.timePerChar),
      };

      await setDefaultSettingsEvoai({
        instanceName: instance.name,
        token: instance.token,
        data: settingsData,
      });
      toast.success(t("evoai.toast.defaultSettings.success"));
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error("Error:", error);
      toast.error(`Error: ${error?.response?.data?.response?.message}`);
    }
  };

  function onReset() {
    refetchDefaultSettings();
    refetchEvoai();
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="secondary" size="sm">
          <Cog size={16} className="mr-1" />
          <span className="hidden sm:inline">{t("evoai.defaultSettings")}</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="overflow-y-auto sm:max-h-[600px] sm:max-w-[740px]" onCloseAutoFocus={onReset}>
        <DialogHeader>
          <DialogTitle>{t("evoai.defaultSettings")}</DialogTitle>
        </DialogHeader>
        <FormProvider {...form}>
          <form className="w-full space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
            <div>
              <div className="space-y-4">
                <FormSelect
                  name="evoaiIdFallback"
                  label={t("evoai.form.evoaiIdFallback.label")}
                  options={
                    bots
                      ?.filter((bot) => !!bot.id)
                      .map((bot) => ({
                        label: bot.description!,
                        value: bot.id!,
                      })) ?? []
                  }
                />
                <FormInput name="expire" label={t("evoai.form.expire.label")}>
                  <Input type="number" />
                </FormInput>
                <FormInput name="keywordFinish" label={t("evoai.form.keywordFinish.label")}>
                  <Input />
                </FormInput>
                <FormInput name="delayMessage" label={t("evoai.form.delayMessage.label")}>
                  <Input type="number" />
                </FormInput>
                <FormInput name="unknownMessage" label={t("evoai.form.unknownMessage.label")}>
                  <Input />
                </FormInput>
                <FormSwitch name="listeningFromMe" label={t("evoai.form.listeningFromMe.label")} reverse />
                <FormSwitch name="stopBotFromMe" label={t("evoai.form.stopBotFromMe.label")} reverse />
                <FormSwitch name="keepOpen" label={t("evoai.form.keepOpen.label")} reverse />
                <FormInput name="debounceTime" label={t("evoai.form.debounceTime.label")}>
                  <Input type="number" />
                </FormInput>

                <FormSwitch name="splitMessages" label={t("evoai.form.splitMessages.label")} reverse />

                <FormInput name="timePerChar" label={t("evoai.form.timePerChar.label")}>
                  <Input type="number" />
                </FormInput>

                <FormTags name="ignoreJids" label={t("evoai.form.ignoreJids.label")} placeholder={t("evoai.form.ignoreJids.placeholder")} />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit">{t("evoai.button.save")}</Button>
            </DialogFooter>
          </form>
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}

export { DefaultSettingsEvoai };
