import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Send } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

import { useInstance } from "@/contexts/InstanceContext";

import { sendTextGo } from "@/lib/queries/go/instance/sendMessage";

const schema = z.object({
  number: z.string().min(1, "Número é obrigatório"),
  message: z.string().min(1, "Mensagem é obrigatória"),
});

type FormData = z.infer<typeof schema>;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function GoSendMessageModal({ open, onOpenChange }: Props) {
  const { instance } = useInstance();

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
      toast.error("Token da instância não encontrado");
      return;
    }
    try {
      await sendTextGo({ instanceToken: instance.token, number: data.number, text: data.message });
      toast.success("Mensagem enviada com sucesso!");
      reset();
      onOpenChange(false);
    } catch (error) {
      console.error("Send message error:", error);
      toast.error("Erro ao enviar mensagem");
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
            Enviar Mensagem
          </DialogTitle>
          <DialogDescription>
            Envie uma mensagem de texto pela instância <strong>{instance.name}</strong>
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="number">Número (com DDI)</Label>
            <Input id="number" type="text" placeholder="5511999999999" disabled={isSubmitting} {...register("number")} />
            {errors.number && <p className="text-sm text-rose-600">{errors.number.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Mensagem</Label>
            <Textarea id="message" rows={4} placeholder="Digite sua mensagem..." disabled={isSubmitting} {...register("message")} />
            {errors.message && <p className="text-sm text-rose-600">{errors.message.message}</p>}
          </div>

          <DialogFooter className="flex gap-2 sm:gap-0">
            <Button type="button" variant="outline" onClick={handleClose} disabled={isSubmitting}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Enviar
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
