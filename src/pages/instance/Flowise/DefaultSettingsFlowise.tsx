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

import { useFindDefaultSettingsFlowise } from "@/lib/queries/flowise/findDefaultSettingsFlowise";
import { useFindFlowise } from "@/lib/queries/flowise/findFlowise";
import { useManageFlowise } from "@/lib/queries/flowise/manageFlowise";

import { FlowiseSettings } from "@/types/evolution.types";

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
  flowiseIdFallback: z.union([z.null(), z.string()]).optional(),
  splitMessages: z.boolean(),
  timePerChar: z.string(),
});

function DefaultSettingsFlowise() {
  const { t } = useTranslation();
  const { instance } = useInstance();

  const { setDefaultSettingsFlowise } = useManageFlowise();
  const [open, setOpen] = useState(false);
  const { data: settings, refetch: refetchSettings } = useFindDefaultSettingsFlowise({
    instanceName: instance?.name,
    enabled: open,
  });
  const { data: bots, refetch: refetchBots } = useFindFlowise({
    instanceName: instance?.name,
    enabled: open,
  });

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      expire: "0",
      keywordFinish: t("flowise.form.examples.keywordFinish"),
      delayMessage: "1000",
      unknownMessage: t("flowise.form.examples.unknownMessage"),
      listeningFromMe: false,
      stopBotFromMe: false,
      keepOpen: false,
      debounceTime: "0",
      ignoreJids: [],
      flowiseIdFallback: undefined,
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
        flowiseIdFallback: settings.flowiseIdFallback,
        splitMessages: settings.splitMessages,
        timePerChar: settings.timePerChar ? settings.timePerChar.toString() : "0",
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settings]);

  const onSubmit = async (data: z.infer<typeof FormSchema>) => {
    try {
      if (!instance || !instance.name) {
        throw new Error("instance not found.");
      }

      const settingsData: FlowiseSettings = {
        expire: parseInt(data.expire),
        keywordFinish: data.keywordFinish,
        delayMessage: parseInt(data.delayMessage),
        unknownMessage: data.unknownMessage,
        listeningFromMe: data.listeningFromMe,
        stopBotFromMe: data.stopBotFromMe,
        keepOpen: data.keepOpen,
        debounceTime: parseInt(data.debounceTime),
        flowiseIdFallback: data.flowiseIdFallback || undefined,
        ignoreJids: data.ignoreJids,
        splitMessages: data.splitMessages,
        timePerChar: parseInt(data.timePerChar),
      };

      await setDefaultSettingsFlowise({
        instanceName: instance.name,
        token: instance.token,
        data: settingsData,
      });
      toast.success(t("flowise.toast.defaultSettings.success"));
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
          <span className="hidden sm:inline">{t("flowise.defaultSettings")}</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="overflow-y-auto sm:max-h-[600px] sm:max-w-[740px]" onCloseAutoFocus={onReset}>
        <DialogHeader>
          <DialogTitle>{t("flowise.defaultSettings")}</DialogTitle>
        </DialogHeader>
        <FormProvider {...form}>
          <form className="w-full space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
            <div>
              <div className="space-y-4">
                <FormSelect
                  name="flowiseIdFallback"
                  label={t("flowise.form.flowiseIdFallback.label")}
                  options={
                    bots
                      ?.filter((bot) => !!bot.id)
                      .map((bot) => ({
                        label: bot.description!,
                        value: bot.id!,
                      })) ?? []
                  }
                />
                <FormInput name="expire" label={t("flowise.form.expire.label")}>
                  <Input type="number" />
                </FormInput>
                <FormInput name="keywordFinish" label={t("flowise.form.keywordFinish.label")}>
                  <Input />
                </FormInput>
                <FormInput name="delayMessage" label={t("flowise.form.delayMessage.label")}>
                  <Input type="number" />
                </FormInput>
                <FormInput name="unknownMessage" label={t("flowise.form.unknownMessage.label")}>
                  <Input />
                </FormInput>
                <FormSwitch name="listeningFromMe" label={t("flowise.form.listeningFromMe.label")} reverse />
                <FormSwitch name="stopBotFromMe" label={t("flowise.form.stopBotFromMe.label")} reverse />
                <FormSwitch name="keepOpen" label={t("flowise.form.keepOpen.label")} reverse />
                <FormInput name="debounceTime" label={t("flowise.form.debounceTime.label")}>
                  <Input type="number" />
                </FormInput>

                <FormSwitch name="splitMessages" label={t("flowise.form.splitMessages.label")} reverse />

                {form.watch("splitMessages") && (
                  <FormInput name="timePerChar" label={t("flowise.form.timePerChar.label")}>
                    <Input type="number" />
                  </FormInput>
                )}

                <FormTags name="ignoreJids" label={t("flowise.form.ignoreJids.label")} placeholder={t("flowise.form.ignoreJids.placeholder")} />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit">{t("flowise.button.save")}</Button>
            </DialogFooter>
          </form>
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}

export { DefaultSettingsFlowise };
