import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, FormProvider } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { z } from "zod";

import { Button } from "@evoapi/design-system/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { FormInput, FormSelect, FormSwitch } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Separator } from "@evoapi/design-system/separator";

import { SessionsDify } from "./SessionsDify";

export const FormSchema = z.object({
  enabled: z.boolean(),
  description: z.string(),
  botType: z.string(),
  apiUrl: z.string(),
  apiKey: z.string(),
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
  splitMessages: z.boolean().optional(),
  timePerChar: z.coerce.number().optional(),
});

export type FormSchemaType = z.infer<typeof FormSchema>;

type DifyFormProps = {
  initialData?: FormSchemaType;
  onSubmit: (data: FormSchemaType) => Promise<void>;
  handleDelete?: () => void;
  difyId?: string;
  isModal?: boolean;
  isLoading?: boolean;
  openDeletionDialog?: boolean;
  setOpenDeletionDialog?: (value: boolean) => void;
};

function DifyForm({ initialData, onSubmit, handleDelete, difyId, isModal = false, isLoading = false, openDeletionDialog = false, setOpenDeletionDialog = () => {} }: DifyFormProps) {
  const { t } = useTranslation();
  const form = useForm<FormSchemaType>({
    resolver: zodResolver(FormSchema),
    defaultValues: initialData || {
      enabled: true,
      description: "",
      botType: "chatBot",
      apiUrl: "",
      apiKey: "",
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
      splitMessages: false,
      timePerChar: 0,
    },
  });

  const triggerType = form.watch("triggerType");

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="w-full space-y-6">
        <div className="space-y-4">
          <FormSwitch name="enabled" label={t("dify.form.enabled.label")} reverse />
          <FormInput name="description" label={t("dify.form.description.label")} required>
            <Input />
          </FormInput>

          <div className="flex flex-col">
            <h3 className="my-4 text-lg font-medium">{t("dify.form.difySettings.label")}</h3>
            <Separator />
          </div>
          <FormSelect
            name="botType"
            label={t("dify.form.botType.label")}
            options={[
              { label: t("dify.form.botType.chatBot"), value: "chatBot" },
              {
                label: t("dify.form.botType.textGenerator"),
                value: "textGenerator",
              },
              { label: t("dify.form.botType.agent"), value: "agent" },
              {
                label: t("dify.form.botType.workflow"),
                value: "workflow",
              },
            ]}
          />
          <FormInput name="apiUrl" label={t("dify.form.apiUrl.label")} required>
            <Input />
          </FormInput>
          <FormInput name="apiKey" label={t("dify.form.apiKey.label")} required>
            <Input type="password" />
          </FormInput>

          <div className="flex flex-col">
            <h3 className="my-4 text-lg font-medium">{t("dify.form.triggerSettings.label")}</h3>
            <Separator />
          </div>
          <FormSelect
            name="triggerType"
            label={t("dify.form.triggerType.label")}
            options={[
              {
                label: t("dify.form.triggerType.keyword"),
                value: "keyword",
              },
              { label: t("dify.form.triggerType.all"), value: "all" },
              {
                label: t("dify.form.triggerType.advanced"),
                value: "advanced",
              },
              { label: t("dify.form.triggerType.none"), value: "none" },
            ]}
          />

          {triggerType === "keyword" && (
            <>
              <FormSelect
                name="triggerOperator"
                label={t("dify.form.triggerOperator.label")}
                options={[
                  {
                    label: t("dify.form.triggerOperator.contains"),
                    value: "contains",
                  },
                  {
                    label: t("dify.form.triggerOperator.equals"),
                    value: "equals",
                  },
                  {
                    label: t("dify.form.triggerOperator.startsWith"),
                    value: "startsWith",
                  },
                  {
                    label: t("dify.form.triggerOperator.endsWith"),
                    value: "endsWith",
                  },
                  {
                    label: t("dify.form.triggerOperator.regex"),
                    value: "regex",
                  },
                ]}
              />
              <FormInput name="triggerValue" label={t("dify.form.triggerValue.label")}>
                <Input />
              </FormInput>
            </>
          )}
          {triggerType === "advanced" && (
            <FormInput name="triggerValue" label={t("dify.form.triggerConditions.label")}>
              <Input />
            </FormInput>
          )}
          <div className="flex flex-col">
            <h3 className="my-4 text-lg font-medium">{t("dify.form.generalSettings.label")}</h3>
            <Separator />
          </div>
          <FormInput name="expire" label={t("dify.form.expire.label")}>
            <Input type="number" />
          </FormInput>
          <FormInput name="keywordFinish" label={t("dify.form.keywordFinish.label")}>
            <Input />
          </FormInput>
          <FormInput name="delayMessage" label={t("dify.form.delayMessage.label")}>
            <Input type="number" />
          </FormInput>
          <FormInput name="unknownMessage" label={t("dify.form.unknownMessage.label")}>
            <Input />
          </FormInput>
          <FormSwitch name="listeningFromMe" label={t("dify.form.listeningFromMe.label")} reverse />
          <FormSwitch name="stopBotFromMe" label={t("dify.form.stopBotFromMe.label")} reverse />
          <FormSwitch name="keepOpen" label={t("dify.form.keepOpen.label")} reverse />
          <FormInput name="debounceTime" label={t("dify.form.debounceTime.label")}>
            <Input type="number" />
          </FormInput>

          <FormSwitch name="splitMessages" label={t("dify.form.splitMessages.label")} reverse />

          {form.watch("splitMessages") && (
            <FormInput name="timePerChar" label={t("dify.form.timePerChar.label")}>
              <Input type="number" />
            </FormInput>
          )}
        </div>

        {isModal && (
          <DialogFooter>
            <Button disabled={isLoading} type="submit">
              {isLoading ? t("dify.button.saving") : t("dify.button.save")}
            </Button>
          </DialogFooter>
        )}

        {!isModal && (
          <div>
            <SessionsDify difyId={difyId} />
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
                {isLoading ? t("dify.button.saving") : t("dify.button.update")}
              </Button>
            </div>
          </div>
        )}
      </form>
    </FormProvider>
  );
}

export { DifyForm };
