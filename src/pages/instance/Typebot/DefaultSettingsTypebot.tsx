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

import { useFindDefaultSettingsTypebot } from "@/lib/queries/typebot/findDefaultSettingsTypebot";
import { useFindTypebot } from "@/lib/queries/typebot/findTypebot";
import { useManageTypebot } from "@/lib/queries/typebot/manageTypebot";

import { TypebotSettings } from "@/types/evolution.types";

const formSchema = z.object({
  expire: z.coerce.number(),
  keywordFinish: z.string(),
  delayMessage: z.coerce.number(),
  unknownMessage: z.string(),
  listeningFromMe: z.boolean(),
  stopBotFromMe: z.boolean(),
  keepOpen: z.boolean(),
  debounceTime: z.coerce.number(),
});
type FormSchema = z.infer<typeof formSchema>;

function DefaultSettingsTypebot() {
  const { t } = useTranslation();
  const { instance } = useInstance();

  const [open, setOpen] = useState(false);

  const { setDefaultSettingsTypebot } = useManageTypebot();
  const { data: settings, refetch: refetchSettings } = useFindDefaultSettingsTypebot({
    instanceName: instance?.name,
    token: instance?.token,
    enabled: open,
  });
  const { data: typebots, refetch: refetchTypebots } = useFindTypebot({
    instanceName: instance?.name,
    token: instance?.token,
    enabled: open,
  });

  const form = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      expire: 0,
      keywordFinish: t("typebot.form.examples.keywordFinish"),
      delayMessage: 1000,
      unknownMessage: t("typebot.form.examples.unknownMessage"),
      listeningFromMe: false,
      stopBotFromMe: false,
      keepOpen: false,
      debounceTime: 0,
    },
  });

  useEffect(() => {
    if (settings) {
      form.reset({
        expire: settings?.expire ?? 0,
        keywordFinish: settings.keywordFinish,
        delayMessage: settings.delayMessage ?? 0,
        unknownMessage: settings.unknownMessage,
        listeningFromMe: settings.listeningFromMe,
        stopBotFromMe: settings.stopBotFromMe,
        keepOpen: settings.keepOpen,
        debounceTime: settings.debounceTime ?? 0,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settings]);

  const handleSubmit = async (data: FormSchema) => {
    try {
      if (!instance || !instance.name) {
        throw new Error("instance not found.");
      }

      const settingsData: TypebotSettings = {
        expire: data.expire,
        keywordFinish: data.keywordFinish,
        delayMessage: data.delayMessage,
        unknownMessage: data.unknownMessage,
        listeningFromMe: data.listeningFromMe,
        stopBotFromMe: data.stopBotFromMe,
        keepOpen: data.keepOpen,
        debounceTime: data.debounceTime,
      };

      await setDefaultSettingsTypebot({
        instanceName: instance.name,
        token: instance.token,
        data: settingsData,
      });
      toast.success(t("typebot.toast.defaultSettings.success"));
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error(t("typebot.toast.defaultSettings.error"), error);
      toast.error(`Error: ${error?.response?.data?.response?.message}`);
    }
  };

  function onReset() {
    refetchSettings();
    refetchTypebots();
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="secondary" size="sm">
          <Cog size={16} className="mr-1" />
          <span className="hidden sm:inline">{t("typebot.button.defaultSettings")}</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="overflow-y-auto sm:max-h-[600px] sm:max-w-[740px]" onCloseAutoFocus={onReset}>
        <DialogHeader>
          <DialogTitle>{t("typebot.modal.defaultSettings.title")}</DialogTitle>
        </DialogHeader>
        <FormProvider {...form}>
          <form className="w-full space-y-6" onSubmit={form.handleSubmit(handleSubmit)}>
            <div>
              <div className="space-y-4">
                <FormSelect
                  name="typebotIdFallback"
                  label={t("typebot.form.typebotIdFallback.label")}
                  options={
                    typebots
                      ?.filter((typebot) => !!typebot.id)
                      .map((typebot) => ({
                        label: typebot.typebot!,
                        value: typebot.description!,
                      })) ?? []
                  }
                />
                <FormInput name="expire" label={t("typebot.form.expire.label")}>
                  <Input type="number" />
                </FormInput>
                <FormInput name="keywordFinish" label={t("typebot.form.keywordFinish.label")}>
                  <Input />
                </FormInput>
                <FormInput name="delayMessage" label={t("typebot.form.delayMessage.label")}>
                  <Input type="number" />
                </FormInput>
                <FormInput name="unknownMessage" label={t("typebot.form.unknownMessage.label")}>
                  <Input />
                </FormInput>
                <FormSwitch name="listeningFromMe" label={t("typebot.form.listeningFromMe.label")} reverse />
                <FormSwitch name="stopBotFromMe" label={t("typebot.form.stopBotFromMe.label")} reverse />
                <FormSwitch name="keepOpen" label={t("typebot.form.keepOpen.label")} reverse />
                <FormInput name="debounceTime" label={t("typebot.form.debounceTime.label")}>
                  <Input type="number" />
                </FormInput>

                <FormTags name="ignoreJids" label={t("typebot.form.ignoreJids.label")} placeholder={t("typebot.form.ignoreJids.placeholder")} />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit">{t("typebot.button.save")}</Button>
            </DialogFooter>
          </form>
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}

export { DefaultSettingsTypebot };
