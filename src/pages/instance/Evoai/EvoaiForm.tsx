import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, FormProvider } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { z } from "zod";

import { Button } from "@evoapi/design-system/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { FormInput, FormSelect, FormSwitch } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Separator } from "@evoapi/design-system/separator";

import { SessionsEvoai } from "./SessionsEvoai";

export const FormSchema = z.object({
  enabled: z.boolean(),
  description: z.string(),
  agentUrl: z.string(),
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

type EvoaiFormProps = {
  initialData?: FormSchemaType;
  onSubmit: (data: FormSchemaType) => Promise<void>;
  handleDelete?: () => void;
  evoaiId?: string;
  isModal?: boolean;
  isLoading?: boolean;
  openDeletionDialog?: boolean;
  setOpenDeletionDialog?: (value: boolean) => void;
};

function EvoaiForm({ initialData, onSubmit, handleDelete, evoaiId, isModal = false, isLoading = false, openDeletionDialog = false, setOpenDeletionDialog = () => {} }: EvoaiFormProps) {
  const { t } = useTranslation();
  const form = useForm<FormSchemaType>({
    resolver: zodResolver(FormSchema),
    defaultValues: initialData || {
      enabled: true,
      description: "",
      agentUrl: "",
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
          <FormSwitch name="enabled" label={t("evoai.form.enabled.label")} reverse />
          <FormInput name="description" label={t("evoai.form.description.label")}>
            <Input />
          </FormInput>

          <div className="flex flex-col">
            <h3 className="my-4 text-lg font-medium">{t("evoai.form.evoaiSettings.label")}</h3>
            <Separator />
          </div>
          <FormInput name="agentUrl" label={t("evoai.form.agentUrl.label")} required>
            <Input />
          </FormInput>

          <FormInput name="apiKey" label={t("evoai.form.apiKey.label")} className="flex-1">
            <Input type="password" />
          </FormInput>

          <div className="flex flex-col">
            <h3 className="my-4 text-lg font-medium">{t("evoai.form.triggerSettings.label")}</h3>
            <Separator />
          </div>
          <FormSelect
            name="triggerType"
            label={t("evoai.form.triggerType.label")}
            options={[
              {
                label: t("evoai.form.triggerType.keyword"),
                value: "keyword",
              },
              { label: t("evoai.form.triggerType.all"), value: "all" },
              {
                label: t("evoai.form.triggerType.advanced"),
                value: "advanced",
              },
              { label: t("evoai.form.triggerType.none"), value: "none" },
            ]}
          />

          {triggerType === "keyword" && (
            <>
              <FormSelect
                name="triggerOperator"
                label={t("evoai.form.triggerOperator.label")}
                options={[
                  {
                    label: t("evoai.form.triggerOperator.contains"),
                    value: "contains",
                  },
                  {
                    label: t("evoai.form.triggerOperator.equals"),
                    value: "equals",
                  },
                  {
                    label: t("evoai.form.triggerOperator.startsWith"),
                    value: "startsWith",
                  },
                  {
                    label: t("evoai.form.triggerOperator.endsWith"),
                    value: "endsWith",
                  },
                  {
                    label: t("evoai.form.triggerOperator.regex"),
                    value: "regex",
                  },
                ]}
              />
              <FormInput name="triggerValue" label={t("evoai.form.triggerValue.label")}>
                <Input />
              </FormInput>
            </>
          )}
          {triggerType === "advanced" && (
            <FormInput name="triggerValue" label={t("evoai.form.triggerConditions.label")}>
              <Input />
            </FormInput>
          )}
          <div className="flex flex-col">
            <h3 className="my-4 text-lg font-medium">{t("evoai.form.generalSettings.label")}</h3>
            <Separator />
          </div>
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

          {form.watch("splitMessages") && (
            <FormInput name="timePerChar" label={t("evoai.form.timePerChar.label")}>
              <Input type="number" />
            </FormInput>
          )}
        </div>

        {isModal && (
          <DialogFooter>
            <Button disabled={isLoading} type="submit">
              {isLoading ? t("evoai.button.saving") : t("evoai.button.save")}
            </Button>
          </DialogFooter>
        )}

        {!isModal && (
          <div>
            <SessionsEvoai evoaiId={evoaiId} />
            <div className="mt-5 flex items-center gap-3">
              <Dialog open={openDeletionDialog} onOpenChange={setOpenDeletionDialog}>
                <DialogTrigger asChild>
                  <Button variant="destructive" size="sm">
                    {t("evoai.button.delete")}
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
                {isLoading ? t("evoai.button.saving") : t("evoai.button.update")}
              </Button>
            </div>
          </div>
        )}
      </form>
    </FormProvider>
  );
}

export { EvoaiForm };
