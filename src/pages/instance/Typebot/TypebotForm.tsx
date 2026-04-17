import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, FormProvider } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { z } from "zod";

import { Button } from "@evoapi/design-system/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { FormInput, FormSelect, FormSwitch } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Separator } from "@evoapi/design-system/separator";

import { SessionsTypebot } from "./SessionsTypebot";

export const FormSchema = z.object({
  enabled: z.boolean(),
  description: z.string(),
  url: z.string(),
  typebot: z.string().optional(),
  triggerType: z.string(),
  triggerOperator: z.string().optional(),
  triggerValue: z.string().optional(),
  expire: z.coerce.number().optional(),
  keywordFinish: z.string().optional(),
  delayMessage: z.coerce.number().optional(),
  unknownMessage: z.string().optional(),
  listeningFromMe: z.boolean().optional(),
  stopBotFromMe: z.boolean().optional(),
  keepOpen: z.boolean().optional(),
  debounceTime: z.coerce.number().optional(),
});

export type FormSchemaType = z.infer<typeof FormSchema>;

type TypebotFormProps = {
  initialData?: FormSchemaType;
  onSubmit: (data: FormSchemaType) => Promise<void>;
  handleDelete?: () => void;
  typebotId?: string;
  isModal?: boolean;
  isLoading?: boolean;
  openDeletionDialog?: boolean;
  setOpenDeletionDialog?: (value: boolean) => void;
};

function TypebotForm({ initialData, onSubmit, handleDelete, typebotId, isModal = false, isLoading = false, openDeletionDialog = false, setOpenDeletionDialog = () => {} }: TypebotFormProps) {
  const { t } = useTranslation();
  const form = useForm<FormSchemaType>({
    resolver: zodResolver(FormSchema),
    defaultValues: initialData || {
      enabled: true,
      description: "",
      url: "",
      typebot: "",
      triggerType: "keyword",
      triggerOperator: "contains",
      triggerValue: "",
      expire: 0,
      keywordFinish: "",
      delayMessage: 0,
      unknownMessage: "",
      listeningFromMe: false,
      stopBotFromMe: false,
      keepOpen: false,
      debounceTime: 0,
    },
  });

  const triggerType = form.watch("triggerType");

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="w-full space-y-6">
        <div className="space-y-4">
          <FormSwitch name="enabled" label={t("typebot.form.enabled.label")} reverse />
          <FormInput name="description" label={t("typebot.form.description.label")} required>
            <Input />
          </FormInput>

          <div className="flex flex-col">
            <h3 className="my-4 text-lg font-medium">{t("typebot.form.typebotSettings.label")}</h3>
            <Separator />
          </div>
          <FormInput name="url" label={t("typebot.form.url.label")} required>
            <Input />
          </FormInput>
          <FormInput name="typebot" label={t("typebot.form.typebot.label")}>
            <Input />
          </FormInput>

          <div className="flex flex-col">
            <h3 className="my-4 text-lg font-medium">{t("typebot.form.triggerSettings.label")}</h3>
            <Separator />
          </div>
          <FormSelect
            name="triggerType"
            label={t("typebot.form.triggerType.label")}
            options={[
              {
                label: t("typebot.form.triggerType.keyword"),
                value: "keyword",
              },
              {
                label: t("typebot.form.triggerType.all"),
                value: "all",
              },
              {
                label: t("typebot.form.triggerType.advanced"),
                value: "advanced",
              },
              {
                label: t("typebot.form.triggerType.none"),
                value: "none",
              },
            ]}
          />

          {triggerType === "keyword" && (
            <>
              <FormSelect
                name="triggerOperator"
                label={t("typebot.form.triggerOperator.label")}
                options={[
                  {
                    label: t("typebot.form.triggerOperator.contains"),
                    value: "contains",
                  },
                  {
                    label: t("typebot.form.triggerOperator.equals"),
                    value: "equals",
                  },
                  {
                    label: t("typebot.form.triggerOperator.startsWith"),
                    value: "startsWith",
                  },
                  {
                    label: t("typebot.form.triggerOperator.endsWith"),
                    value: "endsWith",
                  },
                  {
                    label: t("typebot.form.triggerOperator.regex"),
                    value: "regex",
                  },
                ]}
              />
              <FormInput name="triggerValue" label={t("typebot.form.triggerValue.label")}>
                <Input />
              </FormInput>
            </>
          )}
          {triggerType === "advanced" && (
            <FormInput name="triggerValue" label={t("typebot.form.triggerConditions.label")}>
              <Input />
            </FormInput>
          )}
          <div className="flex flex-col">
            <h3 className="my-4 text-lg font-medium">{t("typebot.form.generalSettings.label")}</h3>
            <Separator />
          </div>
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
        </div>

        {isModal && (
          <DialogFooter>
            <Button disabled={isLoading} type="submit">
              {isLoading ? t("typebot.button.saving") : t("typebot.button.save")}
            </Button>
          </DialogFooter>
        )}

        {!isModal && (
          <div>
            <SessionsTypebot typebotId={typebotId} />
            <div className="mt-5 flex items-center gap-3">
              <Dialog open={openDeletionDialog} onOpenChange={setOpenDeletionDialog}>
                <DialogTrigger asChild>
                  <Button variant="destructive" size="sm">
                    {t("dify.button.delete")}
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{t("modal.delete.title")}</DialogTitle>
                    <DialogDescription>{t("modal.delete.messageSingle")}</DialogDescription>
                    <DialogFooter>
                      <Button size="sm" variant="outline" onClick={() => setOpenDeletionDialog(false)}>
                        {t("button.cancel")}
                      </Button>
                      <Button variant="destructive" onClick={handleDelete}>
                        {t("button.delete")}
                      </Button>
                    </DialogFooter>
                  </DialogHeader>
                </DialogContent>
              </Dialog>
              <Button disabled={isLoading} type="submit">
                {isLoading ? t("typebot.button.saving") : t("typebot.button.update")}
              </Button>
            </div>
          </div>
        )}
      </form>
    </FormProvider>
  );
}

export { TypebotForm };
