import { zodResolver } from "@hookform/resolvers/zod";
import { RefreshCw } from "lucide-react";
import { useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { z } from "zod";

import { Button } from "@evoapi/design-system/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { FormInput, FormSelect, FormSwitch } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Separator } from "@evoapi/design-system/separator";
import { Textarea } from "@/components/ui/textarea";

import { useInstance } from "@/contexts/InstanceContext";

import { useFindOpenaiCreds } from "@/lib/queries/openai/findOpenaiCreds";
import { useGetModels } from "@/lib/queries/openai/getModels";

import { CredentialsOpenai } from "./CredentialsOpenai";
import { SessionsOpenai } from "./SessionsOpenai";

export const FormSchema = z.object({
  enabled: z.boolean(),
  description: z.string(),
  openaiCredsId: z.string(),
  botType: z.string(),
  assistantId: z.string().optional(),
  functionUrl: z.string().optional(),
  model: z.string().optional(),
  systemMessages: z.string().optional(),
  assistantMessages: z.string().optional(),
  userMessages: z.string().optional(),
  maxTokens: z.coerce.number().optional(),
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

type OpenaiFormProps = {
  initialData?: FormSchemaType;
  onSubmit: (data: FormSchemaType) => Promise<void>;
  handleDelete?: () => void;
  openaiId?: string;
  isModal?: boolean;
  isLoading?: boolean;
  openDeletionDialog?: boolean;
  setOpenDeletionDialog?: (value: boolean) => void;
  open?: boolean;
};

function OpenaiForm({ initialData, onSubmit, handleDelete, openaiId, isModal = false, isLoading = false, openDeletionDialog = false, setOpenDeletionDialog = () => {}, open }: OpenaiFormProps) {
  const { t } = useTranslation();
  const { instance } = useInstance();
  const [shouldFetchModels, setShouldFetchModels] = useState(false);

  const { data: creds, refetch: refetchCreds } = useFindOpenaiCreds({
    instanceName: instance?.name,
    enabled: open,
  });

  const form = useForm<FormSchemaType>({
    resolver: zodResolver(FormSchema),
    defaultValues: initialData || {
      enabled: true,
      description: "",
      openaiCredsId: "",
      botType: "assistant",
      assistantId: "",
      functionUrl: "",
      model: "",
      systemMessages: "",
      assistantMessages: "",
      userMessages: "",
      maxTokens: 0,
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

  const botType = form.watch("botType");
  const triggerType = form.watch("triggerType");
  const selectedCredId = form.watch("openaiCredsId");

  const {
    data: models,
    isLoading: isLoadingModels,
    refetch: refetchModels,
  } = useGetModels({
    instanceName: instance?.name,
    openaiCredsId: selectedCredId,
    token: instance?.token,
    enabled: shouldFetchModels && !!selectedCredId,
  });

  const handleFetchModels = () => {
    if (selectedCredId) {
      setShouldFetchModels(true);
      refetchModels();
    }
  };

  const handleCredentialsUpdate = () => {
    refetchCreds();
  };

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="w-full space-y-6">
        <div className="space-y-4">
          <FormSwitch name="enabled" label={t("openai.form.enabled.label")} reverse />
          <FormInput name="description" label={t("openai.form.description.label")} required>
            <Input />
          </FormInput>
          <div className="space-y-2">
            <div className="flex items-end gap-2">
              <div className="flex-1">
                <FormSelect
                  name="openaiCredsId"
                  label={t("openai.form.openaiCredsId.label")}
                  required
                  options={
                    creds
                      ?.filter((cred) => !!cred.id)
                      .map((cred) => ({
                        label: cred.name ? cred.name : cred.apiKey.substring(0, 15) + "...",
                        value: cred.id!,
                      })) ?? []
                  }
                />
              </div>
              <CredentialsOpenai onCredentialsUpdate={handleCredentialsUpdate} showText={false} />
            </div>
          </div>
          <div className="flex flex-col">
            <h3 className="my-4 text-lg font-medium">{t("openai.form.openaiSettings.label")}</h3>
            <Separator />
          </div>
          <FormSelect
            name="botType"
            label={t("openai.form.botType.label")}
            required
            options={[
              {
                label: t("openai.form.botType.assistant"),
                value: "assistant",
              },
              {
                label: t("openai.form.botType.chatCompletion"),
                value: "chatCompletion",
              },
            ]}
          />
          {botType === "assistant" && (
            <>
              <FormInput name="assistantId" label={t("openai.form.assistantId.label")} required>
                <Input />
              </FormInput>
              <FormInput name="functionUrl" label={t("openai.form.functionUrl.label")} required>
                <Input />
              </FormInput>
            </>
          )}
          {botType === "chatCompletion" && (
            <>
              <div className="space-y-2">
                <div className="flex items-end gap-2">
                  <div className="flex-1">
                    <FormSelect
                      name="model"
                      label={t("openai.form.model.label")}
                      required
                      disabled={!models || models.length === 0}
                      options={
                        models?.map((model) => ({
                          label: model.id,
                          value: model.id,
                        })) ?? []
                      }
                    />
                  </div>
                  <Button type="button" variant="outline" size="sm" disabled={!selectedCredId || isLoadingModels} onClick={handleFetchModels} className="mb-2">
                    {isLoadingModels ? (
                      <>
                        <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                        {t("openai.button.loading")}
                      </>
                    ) : (
                      <>
                        <RefreshCw className="mr-2 h-4 w-4" />
                        {t("openai.button.loadModels")}
                      </>
                    )}
                  </Button>
                </div>
              </div>
              <FormInput name="systemMessages" label={t("openai.form.systemMessages.label")}>
                <Textarea />
              </FormInput>
              <FormInput name="assistantMessages" label={t("openai.form.assistantMessages.label")}>
                <Textarea />
              </FormInput>
              <FormInput name="userMessages" label={t("openai.form.userMessages.label")}>
                <Textarea />
              </FormInput>

              <FormInput name="maxTokens" label={t("openai.form.maxTokens.label")}>
                <Input type="number" />
              </FormInput>
            </>
          )}

          <div className="flex flex-col">
            <h3 className="my-4 text-lg font-medium">{t("openai.form.triggerSettings.label")}</h3>
            <Separator />
          </div>
          <FormSelect
            name="triggerType"
            label={t("openai.form.triggerType.label")}
            required
            options={[
              {
                label: t("openai.form.triggerType.keyword"),
                value: "keyword",
              },
              { label: t("openai.form.triggerType.all"), value: "all" },
              {
                label: t("openai.form.triggerType.advanced"),
                value: "advanced",
              },
              { label: t("openai.form.triggerType.none"), value: "none" },
            ]}
          />
          {triggerType === "keyword" && (
            <>
              <FormSelect
                name="triggerOperator"
                label={t("openai.form.triggerOperator.label")}
                required
                options={[
                  {
                    label: t("openai.form.triggerOperator.contains"),
                    value: "contains",
                  },
                  {
                    label: t("openai.form.triggerOperator.equals"),
                    value: "equals",
                  },
                  {
                    label: t("openai.form.triggerOperator.startsWith"),
                    value: "startsWith",
                  },
                  {
                    label: t("openai.form.triggerOperator.endsWith"),
                    value: "endsWith",
                  },
                  {
                    label: t("openai.form.triggerOperator.regex"),
                    value: "regex",
                  },
                ]}
              />
              <FormInput name="triggerValue" label={t("openai.form.triggerValue.label")} required>
                <Input />
              </FormInput>
            </>
          )}
          {triggerType === "advanced" && (
            <FormInput name="triggerValue" label={t("openai.form.triggerConditions.label")} required>
              <Input />
            </FormInput>
          )}

          <div className="flex flex-col">
            <h3 className="my-4 text-lg font-medium">{t("openai.form.generalSettings.label")}</h3>
            <Separator />
          </div>

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
          <FormInput name="debounceTime" label={t("openai.form.debounceTime.label")}>
            <Input type="number" />
          </FormInput>

          <FormSwitch name="splitMessages" label={t("openai.form.splitMessages.label")} reverse />

          {form.watch("splitMessages") && (
            <FormInput name="timePerChar" label={t("openai.form.timePerChar.label")}>
              <Input type="number" />
            </FormInput>
          )}
        </div>

        {isModal && (
          <DialogFooter>
            <Button disabled={isLoading} type="submit">
              {isLoading ? t("openai.button.saving") : t("openai.button.save")}
            </Button>
          </DialogFooter>
        )}

        {!isModal && (
          <div>
            <SessionsOpenai openaiId={openaiId} />
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
                {isLoading ? t("openai.button.saving") : t("openai.button.update")}
              </Button>
            </div>
          </div>
        )}
      </form>
    </FormProvider>
  );
}

export { OpenaiForm };
