/* eslint-disable @typescript-eslint/no-explicit-any */
import "./style.css";

import { zodResolver } from "@hookform/resolvers/zod";
import { Separator } from "@radix-ui/react-dropdown-menu";
import { isAxiosError } from "axios";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import { z } from "zod";

import { Button } from "@evoapi/design-system/button";
import { Form, FormInput, FormSwitch, FormTags } from "@/components/ui/form";
import { Input } from "@/components/ui/input";

import { IntegrationGuard } from "@/components/integration-disabled";
import { useInstance } from "@/contexts/InstanceContext";

import { useFetchChatwoot } from "@/lib/queries/chatwoot/fetchChatwoot";
import { useManageChatwoot } from "@/lib/queries/chatwoot/manageChatwoot";

import { Chatwoot as ChatwootType } from "@/types/evolution.types";

const stringOrUndefined = z
  .string()
  .optional()
  .transform((value) => (value === "" ? undefined : value));

const formSchema = z.object({
  enabled: z.boolean(),
  accountId: z.string(),
  token: z.string(),
  url: z.string(),
  signMsg: z.boolean().optional(),
  signDelimiter: stringOrUndefined,
  nameInbox: stringOrUndefined,
  organization: stringOrUndefined,
  logo: stringOrUndefined,
  reopenConversation: z.boolean().optional(),
  conversationPending: z.boolean().optional(),
  mergeBrazilContacts: z.boolean().optional(),
  importContacts: z.boolean().optional(),
  importMessages: z.boolean().optional(),
  daysLimitImportMessages: z.coerce.number().optional(),
  autoCreate: z.boolean(),
  ignoreJids: z.array(z.string()).default([]),
});
type FormSchema = z.infer<typeof formSchema>;

function Chatwoot() {
  const { t } = useTranslation();
  const { instance } = useInstance();
  const [, setLoading] = useState(false);
  const { createChatwoot } = useManageChatwoot();
  const { data: chatwoot, error } = useFetchChatwoot({
    instanceName: instance?.name,
    token: instance?.token,
  });

  const form = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      enabled: true,
      accountId: "",
      token: "",
      url: "",
      signMsg: true,
      signDelimiter: "\\n",
      nameInbox: "",
      organization: "",
      logo: "",
      reopenConversation: true,
      conversationPending: false,
      mergeBrazilContacts: true,
      importContacts: false,
      importMessages: false,
      daysLimitImportMessages: 7,
      autoCreate: true,
      ignoreJids: [],
    },
  });

  useEffect(() => {
    if (chatwoot) {
      form.setValue("ignoreJids", chatwoot.ignoreJids || []);
      const chatwootData: ChatwootType = {
        enabled: chatwoot.enabled,
        accountId: chatwoot.accountId,
        token: chatwoot.token,
        url: chatwoot.url,
        signMsg: chatwoot.signMsg || false,
        signDelimiter: chatwoot.signDelimiter || "\\n",
        nameInbox: chatwoot.nameInbox || "",
        organization: chatwoot.organization || "",
        logo: chatwoot.logo || "",
        reopenConversation: chatwoot.reopenConversation || false,
        conversationPending: chatwoot.conversationPending || false,
        mergeBrazilContacts: chatwoot.mergeBrazilContacts || false,
        importContacts: chatwoot.importContacts || false,
        importMessages: chatwoot.importMessages || false,
        daysLimitImportMessages: chatwoot.daysLimitImportMessages || 7,
        autoCreate: chatwoot.autoCreate || false,
        ignoreJids: chatwoot.ignoreJids,
      };

      form.reset(chatwootData);
    }
  }, [chatwoot, form]);

  const onSubmit = async (data: FormSchema) => {
    if (!instance) return;

    setLoading(true);
    const chatwootData: ChatwootType = {
      enabled: data.enabled,
      accountId: data.accountId,
      token: data.token,
      url: data.url,
      signMsg: data.signMsg || false,
      signDelimiter: data.signDelimiter || "\\n",
      nameInbox: data.nameInbox || "",
      organization: data.organization || "",
      logo: data.logo || "",
      reopenConversation: data.reopenConversation || false,
      conversationPending: data.conversationPending || false,
      mergeBrazilContacts: data.mergeBrazilContacts || false,
      importContacts: data.importContacts || false,
      importMessages: data.importMessages || false,
      daysLimitImportMessages: data.daysLimitImportMessages || 7,
      autoCreate: data.autoCreate,
      ignoreJids: data.ignoreJids,
    };

    await createChatwoot(
      {
        instanceName: instance.name,
        token: instance.token,
        data: chatwootData,
      },
      {
        onSuccess: () => {
          toast.success(t("chatwoot.toast.success"));
        },
        onError: (error) => {
          console.error(t("chatwoot.toast.error"), error);
          if (isAxiosError(error)) {
            toast.error(`Error: ${error?.response?.data?.response?.message}`);
          } else {
            toast.error(t("chatwoot.toast.error"));
          }
        },
        onSettled: () => {
          setLoading(false);
        },
      },
    );
  };

  return (
    <IntegrationGuard error={error} name="Chatwoot" envVar="CHATWOOT_ENABLED">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="w-full space-y-6">
          <div>
            <h3 className="mb-1 text-lg font-medium">{t("chatwoot.title")}</h3>
            <Separator className="my-4" />
            <div className="mx-4 space-y-2 divide-y [&>*]:px-4 [&>*]:py-2">
              <FormSwitch name="enabled" label={t("chatwoot.form.enabled.label")} className="w-full justify-between" helper={t("chatwoot.form.enabled.description")} />
              <FormInput name="url" label={t("chatwoot.form.url.label")}>
                <Input />
              </FormInput>
              <FormInput name="accountId" label={t("chatwoot.form.accountId.label")}>
                <Input />
              </FormInput>
              <FormInput name="token" label={t("chatwoot.form.token.label")}>
                <Input type="password" />
              </FormInput>

              <FormSwitch name="signMsg" label={t("chatwoot.form.signMsg.label")} className="w-full justify-between" helper={t("chatwoot.form.signMsg.description")} />
              <FormInput name="signDelimiter" label={t("chatwoot.form.signDelimiter.label")}>
                <Input />
              </FormInput>
              <FormInput name="nameInbox" label={t("chatwoot.form.nameInbox.label")}>
                <Input />
              </FormInput>
              <FormInput name="organization" label={t("chatwoot.form.organization.label")}>
                <Input />
              </FormInput>
              <FormInput name="logo" label={t("chatwoot.form.logo.label")}>
                <Input />
              </FormInput>
              <FormSwitch
                name="conversationPending"
                label={t("chatwoot.form.conversationPending.label")}
                className="w-full justify-between"
                helper={t("chatwoot.form.conversationPending.description")}
              />
              <FormSwitch name="reopenConversation" label={t("chatwoot.form.reopenConversation.label")} className="w-full justify-between" helper={t("chatwoot.form.reopenConversation.description")} />
              <FormSwitch name="importContacts" label={t("chatwoot.form.importContacts.label")} className="w-full justify-between" helper={t("chatwoot.form.importContacts.description")} />
              <FormSwitch name="importMessages" label={t("chatwoot.form.importMessages.label")} className="w-full justify-between" helper={t("chatwoot.form.importMessages.description")} />
              <FormInput name="daysLimitImportMessages" label={t("chatwoot.form.daysLimitImportMessages.label")}>
                <Input type="number" />
              </FormInput>
              <FormTags name="ignoreJids" label={t("chatwoot.form.ignoreJids.label")} placeholder={t("chatwoot.form.ignoreJids.placeholder")} />
              <FormSwitch name="autoCreate" label={t("chatwoot.form.autoCreate.label")} className="w-full justify-between" helper={t("chatwoot.form.autoCreate.description")} />
            </div>
          </div>
          <div className="mx-4 flex justify-end">
            <Button type="submit">{t("chatwoot.button.save")}</Button>
          </div>
        </form>
      </Form>
    </IntegrationGuard>
  );
}

export { Chatwoot };
