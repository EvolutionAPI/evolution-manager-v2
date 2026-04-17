import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, FormProvider } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { z } from "zod";

import { Button } from "@evoapi/design-system/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { FormInput, FormSelect, FormSwitch } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Separator } from "@evoapi/design-system/separator";

import { SessionsN8n } from "./SessionsN8n";

export const FormSchema = z.object({
  enabled: z.boolean(),
  description: z.string(),
  webhookUrl: z.string(),
  basicAuthUser: z.string(),
  basicAuthPass: z.string(),
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

type N8nFormProps = {
  initialData?: FormSchemaType;
  onSubmit: (data: FormSchemaType) => Promise<void>;
  handleDelete?: () => void;
  n8nId?: string;
  isModal?: boolean;
  isLoading?: boolean;
  openDeletionDialog?: boolean;
  setOpenDeletionDialog?: (value: boolean) => void;
};

function N8nForm({ initialData, onSubmit, handleDelete, n8nId, isModal = false, isLoading = false, openDeletionDialog = false, setOpenDeletionDialog = () => {} }: N8nFormProps) {
  const { t } = useTranslation();
  const form = useForm<FormSchemaType>({
    resolver: zodResolver(FormSchema),
    defaultValues: initialData || {
      enabled: true,
      description: "",
      webhookUrl: "",
      basicAuthUser: "",
      basicAuthPass: "",
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
          <FormSwitch name="enabled" label={t("n8n.form.enabled.label")} reverse />
          <FormInput name="description" label={t("n8n.form.description.label")}>
            <Input />
          </FormInput>

          <div className="flex flex-col">
            <h3 className="my-4 text-lg font-medium">{t("n8n.form.n8nSettings.label")}</h3>
            <Separator />
          </div>
          <FormInput name="webhookUrl" label={t("n8n.form.webhookUrl.label")} required>
            <Input />
          </FormInput>
          <div className="flex flex-col">
            <h3 className="my-4 text-lg font-medium">{t("n8n.form.basicAuth.label")}</h3>
            <Separator />
          </div>
          <div className="flex w-full flex-row gap-4">
            <FormInput name="basicAuthUser" label={t("n8n.form.basicAuthUser.label")} className="flex-1">
              <Input />
            </FormInput>
            <FormInput name="basicAuthPass" label={t("n8n.form.basicAuthPass.label")} className="flex-1">
              <Input type="password" />
            </FormInput>
          </div>

          <div className="flex flex-col">
            <h3 className="my-4 text-lg font-medium">{t("n8n.form.triggerSettings.label")}</h3>
            <Separator />
          </div>
          <FormSelect
            name="triggerType"
            label={t("n8n.form.triggerType.label")}
            options={[
              {
                label: t("n8n.form.triggerType.keyword"),
                value: "keyword",
              },
              { label: t("n8n.form.triggerType.all"), value: "all" },
              {
                label: t("n8n.form.triggerType.advanced"),
                value: "advanced",
              },
              { label: t("n8n.form.triggerType.none"), value: "none" },
            ]}
          />

          {triggerType === "keyword" && (
            <>
              <FormSelect
                name="triggerOperator"
                label={t("n8n.form.triggerOperator.label")}
                options={[
                  {
                    label: t("n8n.form.triggerOperator.contains"),
                    value: "contains",
                  },
                  {
                    label: t("n8n.form.triggerOperator.equals"),
                    value: "equals",
                  },
                  {
                    label: t("n8n.form.triggerOperator.startsWith"),
                    value: "startsWith",
                  },
                  {
                    label: t("n8n.form.triggerOperator.endsWith"),
                    value: "endsWith",
                  },
                  {
                    label: t("n8n.form.triggerOperator.regex"),
                    value: "regex",
                  },
                ]}
              />
              <FormInput name="triggerValue" label={t("n8n.form.triggerValue.label")}>
                <Input />
              </FormInput>
            </>
          )}
          {triggerType === "advanced" && (
            <FormInput name="triggerValue" label={t("n8n.form.triggerConditions.label")}>
              <Input />
            </FormInput>
          )}
          <div className="flex flex-col">
            <h3 className="my-4 text-lg font-medium">{t("n8n.form.generalSettings.label")}</h3>
            <Separator />
          </div>
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

          {form.watch("splitMessages") && (
            <FormInput name="timePerChar" label={t("n8n.form.timePerChar.label")}>
              <Input type="number" />
            </FormInput>
          )}
        </div>

        {isModal && (
          <DialogFooter>
            <Button disabled={isLoading} type="submit">
              {isLoading ? t("n8n.button.saving") : t("n8n.button.save")}
            </Button>
          </DialogFooter>
        )}

        {!isModal && (
          <div>
            <SessionsN8n n8nId={n8nId} />
            <div className="mt-5 flex items-center gap-3">
              <Dialog open={openDeletionDialog} onOpenChange={setOpenDeletionDialog}>
                <DialogTrigger asChild>
                  <Button variant="destructive" size="sm">
                    {t("n8n.button.delete")}
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
                {isLoading ? t("n8n.button.saving") : t("n8n.button.update")}
              </Button>
            </div>
          </div>
        )}
      </form>
    </FormProvider>
  );
}

export { N8nForm };
