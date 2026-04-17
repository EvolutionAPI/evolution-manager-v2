import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Send } from "lucide-react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import { z } from "zod";

import { Button } from "@evoapi/design-system/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@evoapi/design-system/label";
import { Textarea } from "@/components/ui/textarea";

import { useInstance } from "@/contexts/InstanceContext";

import { sendTextGo } from "@/lib/queries/go/instance/sendMessage";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function GoSendMessageModal({ open, onOpenChange }: Props) {
  const { t } = useTranslation();
  const { instance } = useInstance();

  const schema = z.object({
    number: z.string().min(1, t("sendMessage.validation.numberRequired")),
    message: z.string().min(1, t("sendMessage.validation.messageRequired")),
  });

  type FormData = z.infer<typeof schema>;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { number: "", message: "" },
  });

  const onSubmit = async (data: FormData) => {
    if (!instance?.token) {
      toast.error(t("sendMessage.toast.noToken"));
      return;
    }
    try {
      await sendTextGo({ instanceToken: instance.token, number: data.number, text: data.message });
      toast.success(t("sendMessage.toast.success"));
      reset();
      onOpenChange(false);
    } catch (error) {
      console.error("Send message error:", error);
      toast.error(t("sendMessage.toast.error"));
    }
  };

  const handleClose = () => {
    reset();
    onOpenChange(false);
  };

  if (!instance) return null;

  return (
    <Dialog open={open} onOpenChange={(o) => (o ? onOpenChange(true) : handleClose())}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Send className="h-5 w-5 text-primary" />
            {t("sendMessage.title")}
          </DialogTitle>
          <DialogDescription>
            {t("sendMessage.description")} <strong>{instance.name}</strong>
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="number">{t("sendMessage.form.number.label")}</Label>
            <Input id="number" type="text" placeholder="5511999999999" disabled={isSubmitting} {...register("number")} />
            {errors.number && <p className="text-sm text-rose-600">{errors.number.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">{t("sendMessage.form.message.label")}</Label>
            <Textarea id="message" rows={4} placeholder={t("sendMessage.form.message.placeholder")} disabled={isSubmitting} {...register("message")} />
            {errors.message && <p className="text-sm text-rose-600">{errors.message.message}</p>}
          </div>

          <DialogFooter className="flex gap-2 sm:gap-0">
            <Button type="button" variant="outline" onClick={handleClose} disabled={isSubmitting}>
              {t("button.cancel")}
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t("sendMessage.button.sending")}
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  {t("sendMessage.button.send")}
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
