import { zodResolver } from "@hookform/resolvers/zod";
import { ChevronDown, ChevronUp, Loader2, Plus } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import { v4 as uuidv4 } from "uuid";
import { z } from "zod";

import { Button } from "@evoapi/design-system/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@evoapi/design-system/collapsible";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@evoapi/design-system/label";

import { useManageInstance } from "@/lib/queries/instance/manageInstance";

export function GoNewInstance({ resetTable, open, onOpenChange }: { resetTable: () => void; open: boolean; onOpenChange: (open: boolean) => void }) {
  const { t } = useTranslation();
  const { createInstance } = useManageInstance();
  const setOpen = onOpenChange;
  const [showProxy, setShowProxy] = useState(false);
  const [loading, setLoading] = useState(false);

  const schema = z.object({
    instanceName: z
      .string()
      .min(3, t("newInstance.validation.nameMin"))
      .max(50, t("newInstance.validation.nameMax"))
      .regex(/^[a-zA-Z0-9-_]+$/, t("newInstance.validation.nameFormat")),
    token: z.string().optional(),
    proxyHost: z.string().optional(),
    proxyPort: z.string().optional(),
    proxyUsername: z.string().optional(),
    proxyPassword: z.string().optional(),
  });

  type FormData = z.infer<typeof schema>;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      instanceName: "",
      token: "",
      proxyHost: "",
      proxyPort: "",
      proxyUsername: "",
      proxyPassword: "",
    },
  });

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      const payload = {
        instanceName: data.instanceName,
        integration: "EVOLUTION_GO",
        token: data.token && data.token.trim() !== "" ? data.token : uuidv4(),
        number: null,
        businessId: null,
        ...(data.proxyHost && data.proxyPort
          ? {
              proxy: {
                host: data.proxyHost,
                port: data.proxyPort,
                username: data.proxyUsername,
                password: data.proxyPassword,
              },
            }
          : {}),
      };

      await createInstance(payload as Parameters<typeof createInstance>[0]);

      toast.success(t("toast.instance.created"));
      setOpen(false);
      reset();
      setShowProxy(false);
      resetTable();
    } catch (error) {
      console.error("Error:", error);
      const msg = error instanceof Error ? error.message : t("toast.instance.error");
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = (nextOpen: boolean) => {
    if (loading) return;
    setOpen(nextOpen);
    if (!nextOpen) {
      reset();
      setShowProxy(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5 text-primary" />
            {t("newInstance.title")}
          </DialogTitle>
          <DialogDescription>{t("newInstance.description")}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="instanceName">
              {t("newInstance.form.name.label")} <span className="text-rose-600">*</span>
            </Label>
            <Input id="instanceName" type="text" placeholder={t("newInstance.form.name.placeholder")} disabled={loading} {...register("instanceName")} />
            {errors.instanceName && <p className="text-sm text-rose-600">{errors.instanceName.message}</p>}
            <p className="text-xs text-muted-foreground">{t("newInstance.form.name.hint")}</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="token">{t("newInstance.form.token.label")}</Label>
            <Input id="token" type="text" placeholder={t("newInstance.form.token.placeholder")} disabled={loading} {...register("token")} />
            {errors.token && <p className="text-sm text-rose-600">{errors.token.message}</p>}
            <p className="text-xs text-muted-foreground">{t("newInstance.form.token.hint")}</p>
          </div>

          <Collapsible open={showProxy} onOpenChange={setShowProxy} className="space-y-2">
            <CollapsibleTrigger asChild>
              <Button type="button" variant="outline" disabled={loading} className="w-full justify-between">
                <span>{t("newInstance.proxy.title")}</span>
                {showProxy ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-4 border-t border-border pt-2">
              <div className="space-y-2">
                <Label htmlFor="proxyHost">{t("newInstance.proxy.host.label")}</Label>
                <Input id="proxyHost" type="text" placeholder={t("newInstance.proxy.host.placeholder")} disabled={loading} {...register("proxyHost")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="proxyPort">{t("newInstance.proxy.port.label")}</Label>
                <Input id="proxyPort" type="text" placeholder="8080" disabled={loading} {...register("proxyPort")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="proxyUsername">{t("newInstance.proxy.username.label")}</Label>
                <Input id="proxyUsername" type="text" placeholder={t("newInstance.proxy.username.placeholder")} disabled={loading} {...register("proxyUsername")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="proxyPassword">{t("newInstance.proxy.password.label")}</Label>
                <Input id="proxyPassword" type="password" placeholder={t("newInstance.proxy.password.placeholder")} disabled={loading} {...register("proxyPassword")} />
              </div>
            </CollapsibleContent>
          </Collapsible>

          <DialogFooter className="flex gap-2 sm:gap-0">
            <Button type="button" variant="outline" onClick={() => handleClose(false)} disabled={loading}>
              {t("button.cancel")}
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t("newInstance.button.creating")}
                </>
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" />
                  {t("newInstance.button.create")}
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
