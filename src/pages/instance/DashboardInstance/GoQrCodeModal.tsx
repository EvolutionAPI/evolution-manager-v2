import { CheckCircle2, KeyRound, QrCode, RefreshCw, X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";

import { Button } from "@evoapi/design-system/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@evoapi/design-system/label";

import { useInstance } from "@/contexts/InstanceContext";

import { useManageInstance } from "@/lib/queries/instance/manageInstance";

interface GoQrCodeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function GoQrCodeModal({ open, onOpenChange }: GoQrCodeModalProps) {
  const { t } = useTranslation();
  const { instance, reloadInstance } = useInstance();
  const { connect } = useManageInstance();

  const [base64, setBase64] = useState("");
  const [pairingCode, setPairingCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [phone, setPhone] = useState("");
  const [pairingLoading, setPairingLoading] = useState(false);

  const connected = instance?.connectionStatus === "open";

  const fullConnect = useCallback(async () => {
    if (!instance) return;
    setLoading(true);
    try {
      const data = await connect({ instanceName: instance.name, token: instance.token });
      setBase64((data as { base64?: string })?.base64 ?? "");
      setPairingCode((data as { pairingCode?: string })?.pairingCode ?? "");
      await reloadInstance();
    } catch {
      // Silent — UI shows "Aguardando QR Code..." and user can click refresh or use pairing
    } finally {
      setLoading(false);
    }
  }, [connect, instance, reloadInstance]);

  const requestPairing = useCallback(async () => {
    if (!instance || !phone.trim()) return;
    setPairingLoading(true);
    try {
      const data = await connect({ instanceName: instance.name, token: instance.token, number: phone.trim() });
      setBase64((data as { base64?: string })?.base64 ?? "");
      setPairingCode((data as { pairingCode?: string })?.pairingCode ?? "");
      await reloadInstance();
      toast.success(t("qrCode.toast.pairingSuccess"));
    } catch (error) {
      console.error("Pairing error:", error);
      toast.error(t("qrCode.toast.pairingError"));
    } finally {
      setPairingLoading(false);
    }
  }, [connect, instance, phone, reloadInstance, t]);

  const pollRefresh = useCallback(async () => {
    await reloadInstance();
  }, [reloadInstance]);

  useEffect(() => {
    if (!open || connected) return;
    fullConnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  useEffect(() => {
    if (!open || connected) return;
    const t = setInterval(() => {
      pollRefresh().catch((err) => console.error("Poll failed:", err));
    }, 3000);
    return () => clearInterval(t);
  }, [open, connected, pollRefresh]);

  const handleRefresh = async () => {
    try {
      await fullConnect();
      toast.success(t("qrCode.toast.refreshSuccess"));
    } catch {
      toast.error(t("qrCode.toast.refreshError"));
    }
  };

  const handleClose = () => {
    setBase64("");
    setPairingCode("");
    setPhone("");
    onOpenChange(false);
  };

  if (!instance) return null;

  if (connected) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-green-500">
              <CheckCircle2 className="h-5 w-5" />
              {t("qrCode.connected.title")}
            </DialogTitle>
            <DialogDescription>
              {t("qrCode.connected.description", { instanceName: instance.name })}
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col items-center gap-4 py-6">
            <div className="rounded-full bg-green-500/10 p-4">
              <CheckCircle2 className="h-12 w-12 text-green-500" />
            </div>
            {instance.profileName && (
              <div className="text-center">
                <p className="text-sm text-muted-foreground">{t("qrCode.connected.connectedAs")}</p>
                <p className="text-lg font-semibold">{instance.profileName}</p>
              </div>
            )}
          </div>

          <div className="flex justify-end">
            <Button onClick={handleClose} className="w-full sm:w-auto">
              {t("qrCode.button.close")}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <QrCode className="h-5 w-5 text-primary" />
            {t("qrCode.title")}
          </DialogTitle>
          <DialogDescription>
            {t("qrCode.description")} <strong>{instance.name}</strong>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex flex-col items-center gap-4">
            {base64 ? (
              <div className="rounded-lg border-2 border-border bg-white p-4">
                <img src={base64} alt="QR Code" className="h-64 w-64" />
              </div>
            ) : (
              <div className="flex h-64 w-64 items-center justify-center rounded-lg border-2 border-dashed border-border">
                <div className="text-center">
                  <QrCode className="mx-auto h-12 w-12 text-muted-foreground/40" />
                  <p className="mt-2 text-sm text-muted-foreground">{loading ? t("qrCode.generating") : t("qrCode.waiting")}</p>
                </div>
              </div>
            )}

            {pairingCode && (
              <div className="w-full rounded-lg bg-muted p-3 text-center">
                <p className="text-xs text-muted-foreground">{t("qrCode.pairingCode.label")}</p>
                <p className="mt-1 font-mono text-lg font-semibold tracking-widest">{pairingCode}</p>
              </div>
            )}
          </div>

          <div className="rounded-lg bg-muted p-4">
            <p className="text-sm font-medium">{t("qrCode.howTo.title")}</p>
            <ol className="mt-2 space-y-1 text-sm text-muted-foreground">
              <li>1. {t("qrCode.howTo.step1")}</li>
              <li>2. {t("qrCode.howTo.step2")}</li>
              <li>3. {t("qrCode.howTo.step3")}</li>
              <li>4. {t("qrCode.howTo.step4")}</li>
              <li>5. {t("qrCode.howTo.step5")}</li>
            </ol>
          </div>

          <div className="space-y-2 border-t border-border pt-4">
            <Label htmlFor="pairing-phone" className="flex items-center gap-2 text-sm">
              <KeyRound className="h-4 w-4" />
              {t("qrCode.pairingCode.title")}
            </Label>
            <div className="flex gap-2">
              <Input id="pairing-phone" type="tel" placeholder="5511999999999" value={phone} onChange={(e) => setPhone(e.target.value)} disabled={pairingLoading} />
              <Button type="button" variant="outline" onClick={requestPairing} disabled={!phone.trim() || pairingLoading}>
                {pairingLoading ? t("qrCode.pairingCode.generating") : t("qrCode.pairingCode.generate")}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">{t("qrCode.pairingCode.hint")}</p>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" onClick={handleRefresh} disabled={loading} className="flex-1">
              {loading ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  {t("qrCode.button.refreshing")}
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  {t("qrCode.button.refresh")}
                </>
              )}
            </Button>
            <Button variant="outline" onClick={handleClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
