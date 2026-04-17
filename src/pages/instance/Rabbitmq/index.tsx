/* eslint-disable @typescript-eslint/no-explicit-any */
import { zodResolver } from "@hookform/resolvers/zod";
import { Separator } from "@radix-ui/react-dropdown-menu";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import { z } from "zod";

import { Button } from "@evoapi/design-system/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormSwitch } from "@/components/ui/form";
import { Switch } from "@evoapi/design-system/switch";

import { IntegrationGuard } from "@/components/integration-disabled";
import { useInstance } from "@/contexts/InstanceContext";

import { useFetchRabbitmq } from "@/lib/queries/rabbitmq/fetchRabbitmq";
import { useManageRabbitmq } from "@/lib/queries/rabbitmq/manageRabbitmq";
import { cn } from "@/lib/utils";

import { Rabbitmq as RabbitmqType } from "@/types/evolution.types";

const formSchema = z.object({
  enabled: z.boolean(),
  events: z.array(z.string()),
});

type FormSchemaType = z.infer<typeof formSchema>;

function Rabbitmq() {
  const { t } = useTranslation();
  const { instance } = useInstance();
  const [loading, setLoading] = useState(false);

  const { createRabbitmq } = useManageRabbitmq();
  const { data: rabbitmq, error } = useFetchRabbitmq({
    instanceName: instance?.name,
    token: instance?.token,
  });

  const form = useForm<FormSchemaType>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      enabled: false,
      events: [],
    },
  });

  useEffect(() => {
    if (rabbitmq) {
      form.reset({
        enabled: rabbitmq.enabled,
        events: rabbitmq.events,
      });
    }
  }, [rabbitmq]); // eslint-disable-line react-hooks/exhaustive-deps

  const onSubmit = async (data: FormSchemaType) => {
    if (!instance) return;

    setLoading(true);
    try {
      const rabbitmqData: RabbitmqType = {
        enabled: data.enabled,
        events: data.events,
      };

      await createRabbitmq({
        instanceName: instance.name,
        token: instance.token,
        data: rabbitmqData,
      });
      toast.success(t("rabbitmq.toast.success"));
    } catch (error: any) {
      console.error(t("rabbitmq.toast.error"), error);
      toast.error(`Error: ${error?.response?.data?.response?.message}`);
    } finally {
      setLoading(false);
    }
  };

  const events = [
    "APPLICATION_STARTUP",
    "QRCODE_UPDATED",
    "MESSAGES_SET",
    "MESSAGES_UPSERT",
    "MESSAGES_UPDATE",
    "MESSAGES_DELETE",
    "SEND_MESSAGE",
    "CONTACTS_SET",
    "CONTACTS_UPSERT",
    "CONTACTS_UPDATE",
    "PRESENCE_UPDATE",
    "CHATS_SET",
    "CHATS_UPSERT",
    "CHATS_UPDATE",
    "CHATS_DELETE",
    "GROUPS_UPSERT",
    "GROUP_UPDATE",
    "GROUP_PARTICIPANTS_UPDATE",
    "CONNECTION_UPDATE",
    "REMOVE_INSTANCE",
    "LOGOUT_INSTANCE",
    "LABELS_EDIT",
    "LABELS_ASSOCIATION",
    "CALL",
    "TYPEBOT_START",
    "TYPEBOT_CHANGE_STATUS",
  ];

  const handleSelectAll = () => {
    form.setValue("events", events);
  };

  const handleDeselectAll = () => {
    form.setValue("events", []);
  };

  return (
    <IntegrationGuard error={error} name="RabbitMQ" envVar="RABBITMQ_ENABLED">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="w-full space-y-6">
          <div>
            <h3 className="mb-1 text-lg font-medium">{t("rabbitmq.title")}</h3>
            <Separator className="my-4" />
            <div className="mx-4 space-y-2 divide-y [&>*]:p-4">
              <FormSwitch name="enabled" label={t("rabbitmq.form.enabled.label")} className="w-full justify-between" helper={t("rabbitmq.form.enabled.description")} />
              <div className="mb-4 flex justify-between">
                <Button variant="outline" type="button" onClick={handleSelectAll}>
                  {t("button.markAll")}
                </Button>
                <Button variant="outline" type="button" onClick={handleDeselectAll}>
                  {t("button.unMarkAll")}
                </Button>
              </div>
              <FormField
                control={form.control}
                name="events"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel className="my-2 text-lg">{t("rabbitmq.form.events.label")}</FormLabel>
                    <FormControl>
                      <div className="flex flex-col gap-2 space-y-1 divide-y">
                        {events
                          .sort((a, b) => a.localeCompare(b))
                          .map((event) => (
                            <div key={event} className="flex items-center justify-between gap-3 pt-3">
                              <FormLabel className={cn("break-all", field.value.includes(event) ? "text-foreground" : "text-muted-foreground")}>{event}</FormLabel>
                              <Switch
                                checked={field.value.includes(event)}
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    field.onChange([...field.value, event]);
                                  } else {
                                    field.onChange(field.value.filter((e) => e !== event));
                                  }
                                }}
                              />
                            </div>
                          ))}
                      </div>
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
            <div className="mx-4 flex justify-end pt-6">
              <Button type="submit" disabled={loading}>
                {loading ? t("rabbitmq.button.saving") : t("rabbitmq.button.save")}
              </Button>
            </div>
          </div>
        </form>
      </Form>
    </IntegrationGuard>
  );
}

export { Rabbitmq };
