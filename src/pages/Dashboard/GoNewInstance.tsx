import { zodResolver } from "@hookform/resolvers/zod";
import { ChevronDown, ChevronUp, Loader2, Plus } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { v4 as uuidv4 } from "uuid";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { useManageInstance } from "@/lib/queries/instance/manageInstance";

const schema = z.object({
  instanceName: z
    .string()
    .min(3, "Nome deve ter pelo menos 3 caracteres")
    .max(50, "Nome deve ter no máximo 50 caracteres")
    .regex(/^[a-zA-Z0-9-_]+$/, "Apenas letras, números, hífen e underscore"),
  token: z.string().optional(),
  proxyHost: z.string().optional(),
  proxyPort: z.string().optional(),
  proxyUsername: z.string().optional(),
  proxyPassword: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export function GoNewInstance({ resetTable }: { resetTable: () => void }) {
  const { createInstance } = useManageInstance();
  const [open, setOpen] = useState(false);
  const [showProxy, setShowProxy] = useState(false);
  const [loading, setLoading] = useState(false);

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

      toast.success("Instância criada com sucesso!");
      setOpen(false);
      reset();
      setShowProxy(false);
      resetTable();
    } catch (error) {
      console.error("Error:", error);
      const msg = error instanceof Error ? error.message : "Erro ao criar instância";
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
      <DialogTrigger asChild>
        <Button variant="default" size="sm">
          Nova instância <Plus size="18" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5 text-primary" />
            Nova Instância
          </DialogTitle>
          <DialogDescription>Crie uma nova instância WhatsApp para gerenciar suas conversas</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="instanceName">
              Nome da Instância <span className="text-rose-600">*</span>
            </Label>
            <Input id="instanceName" type="text" placeholder="ex: minha-instancia" disabled={loading} {...register("instanceName")} />
            {errors.instanceName && <p className="text-sm text-rose-600">{errors.instanceName.message}</p>}
            <p className="text-xs text-muted-foreground">Use apenas letras, números, hífen (-) e underscore (_)</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="token">Token (Opcional)</Label>
            <Input id="token" type="text" placeholder="Token personalizado (UUID)" disabled={loading} {...register("token")} />
            {errors.token && <p className="text-sm text-rose-600">{errors.token.message}</p>}
            <p className="text-xs text-muted-foreground">Se não informado, será gerado um UUID automaticamente</p>
          </div>

          <Collapsible open={showProxy} onOpenChange={setShowProxy} className="space-y-2">
            <CollapsibleTrigger asChild>
              <Button type="button" variant="outline" disabled={loading} className="w-full justify-between">
                <span>Configuração de Proxy (Opcional)</span>
                {showProxy ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-4 border-t border-border pt-2">
              <div className="space-y-2">
                <Label htmlFor="proxyHost">Host do Proxy</Label>
                <Input id="proxyHost" type="text" placeholder="ex: proxy.example.com" disabled={loading} {...register("proxyHost")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="proxyPort">Porta do Proxy</Label>
                <Input id="proxyPort" type="text" placeholder="ex: 8080" disabled={loading} {...register("proxyPort")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="proxyUsername">Usuário (Opcional)</Label>
                <Input id="proxyUsername" type="text" placeholder="Usuário do proxy" disabled={loading} {...register("proxyUsername")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="proxyPassword">Senha (Opcional)</Label>
                <Input id="proxyPassword" type="password" placeholder="Senha do proxy" disabled={loading} {...register("proxyPassword")} />
              </div>
            </CollapsibleContent>
          </Collapsible>

          <DialogFooter className="flex gap-2 sm:gap-0">
            <Button type="button" variant="outline" onClick={() => handleClose(false)} disabled={loading}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Criando...
                </>
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" />
                  Criar Instância
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
