import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, FormProvider } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import { v4 as uuidv4 } from "uuid";
import { z } from "zod";

import { Button } from "@evoapi/design-system/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { FormInput, FormSelect } from "@/components/ui/form";
import { Input } from "@/components/ui/input";

import { getProvider } from "@/lib/queries/token";
import { useManageInstance } from "@/lib/queries/instance/manageInstance";

import { NewInstance as NewInstanceType } from "@/types/evolution.types";

import { GoNewInstance } from "./GoNewInstance";

const stringOrUndefined = z
  .string()
  .optional()
  .transform((value) => (value === "" ? undefined : value));

const FormSchema = z.object({
  name: z.string(),
  token: stringOrUndefined,
  number: stringOrUndefined,
  businessId: stringOrUndefined,
  integration: z.enum(["WHATSAPP-BUSINESS", "WHATSAPP-BAILEYS", "EVOLUTION"]),
});

function NewInstance({ resetTable, open, onOpenChange }: { resetTable: () => void; open: boolean; onOpenChange: (open: boolean) => void }) {
  const { t } = useTranslation();
  const { createInstance } = useManageInstance();
  const setOpen = onOpenChange;
  const options = [
    {
      value: "WHATSAPP-BAILEYS",
      label: t("instance.form.integration.baileys"),
    },
    {
      value: "WHATSAPP-BUSINESS",
      label: t("instance.form.integration.whatsapp"),
    },
    {
      value: "EVOLUTION",
      label: t("instance.form.integration.evolution"),
    },
  ];

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      name: "",
      integration: "WHATSAPP-BAILEYS",
      token: uuidv4().replace("-", "").toUpperCase(),
      number: "",
      businessId: "",
    },
  });

  const integrationSelected = form.watch("integration");

  const onSubmit = async (data: z.infer<typeof FormSchema>) => {
    try {
      const instanceData: NewInstanceType = {
        instanceName: data.name,
        integration: data.integration,
        token: data.token === "" ? null : data.token,
        number: data.number === "" ? null : data.number,
        businessId: data.businessId === "" ? null : data.businessId,
      };

      await createInstance(instanceData);

      toast.success(t("toast.instance.created"));
      setOpen(false);
      onReset();
      resetTable();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error("Error:", error);
      toast.error(`Error : ${error?.response?.data?.response?.message}`);
    }
  };

  const onReset = () => {
    form.reset({
      name: "",
      integration: "WHATSAPP-BAILEYS",
      token: uuidv4().replace("-", "").toLocaleUpperCase(),
      number: "",
      businessId: "",
    });
  };

  if (getProvider() === "go") {
    return <GoNewInstance resetTable={resetTable} open={open} onOpenChange={onOpenChange} />;
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[650px]" onCloseAutoFocus={onReset}>
        <DialogHeader>
          <DialogTitle>{t("instance.modal.title")}</DialogTitle>
        </DialogHeader>
        <FormProvider {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4 py-4">
            <FormInput required name="name" label={t("instance.form.name")}>
              <Input />
            </FormInput>
            <FormSelect name="integration" label={t("instance.form.integration.label")} options={options} />
            <FormInput required name="token" label={t("instance.form.token")}>
              <Input />
            </FormInput>
            <FormInput name="number" label={t("instance.form.number")}>
              <Input type="tel" />
            </FormInput>
            {integrationSelected === "WHATSAPP-BUSINESS" && (
              <FormInput required name="businessId" label={t("instance.form.businessId")}>
                <Input />
              </FormInput>
            )}
            <DialogFooter>
              <Button type="submit">{t("instance.button.save")}</Button>
            </DialogFooter>
          </form>
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}

export { NewInstance };
