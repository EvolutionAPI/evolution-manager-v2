/* eslint-disable react-hooks/exhaustive-deps */
import { Alert, AlertTitle } from "@evoapi/design-system/alert";
import { Avatar, AvatarImage } from "@evoapi/design-system/avatar";
import { Button } from "@evoapi/design-system/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@evoapi/design-system/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTrigger } from "@/components/ui/dialog";
import { CircleUser, LogOut, MessageCircle, Power, QrCode, RefreshCw, Send, UsersRound } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import QRCode from "react-qr-code";

import { BaseHeader } from "@/components/base-header";
import { InstanceStatus } from "@/components/instance-status";
import { InstanceToken } from "@/components/instance-token";
import { useTheme } from "@/components/theme-provider";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

import { useInstance } from "@/contexts/InstanceContext";

import { useManageInstance } from "@/lib/queries/instance/manageInstance";
import { getProvider, getToken, TOKEN_ID } from "@/lib/queries/token";

import { GoQrCodeModal } from "./GoQrCodeModal";
import { GoSendMessageModal } from "./GoSendMessageModal";

function DashboardInstance() {
  const { t, i18n } = useTranslation();
  const numberFormatter = new Intl.NumberFormat(i18n.language);
  const [qrCode, setQRCode] = useState<string | null>(null);
  const [pairingCode, setPairingCode] = useState("");
  const [goQrOpen, setGoQrOpen] = useState(false);
  const [goSendOpen, setGoSendOpen] = useState(false);
  const token = getToken(TOKEN_ID.TOKEN);
  const isGo = getProvider() === "go";
  const { theme } = useTheme();

  const { connect, logout, restart } = useManageInstance();
  const { instance, reloadInstance } = useInstance();

  useEffect(() => {
    if (instance) {
      localStorage.setItem(TOKEN_ID.INSTANCE_ID, instance.id);
      localStorage.setItem(TOKEN_ID.INSTANCE_NAME, instance.name);
      localStorage.setItem(TOKEN_ID.INSTANCE_TOKEN, instance.token);
    }
  }, [instance]);

  const handleReload = async () => {
    await reloadInstance();
  };

  const handleRestart = async (instanceName: string) => {
    try {
      await restart(instanceName);
      await reloadInstance();
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const handleLogout = async (instanceName: string) => {
    try {
      await logout(instanceName);
      await reloadInstance();
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const handleConnect = async (instanceName: string, wantPairing: boolean) => {
    try {
      setQRCode(null);
      if (!token) return console.error("Token not found.");

      if (wantPairing) {
        const data = await connect({ instanceName, token, number: instance?.number });
        setPairingCode(data.pairingCode);
      } else {
        const data = await connect({ instanceName, token });
        setQRCode(data.code);
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const closeQRCodePopup = async () => {
    setQRCode(null);
    setPairingCode("");
    await reloadInstance();
  };

  const stats = useMemo(
    () => ({
      contacts: instance?._count?.Contact || 0,
      chats: instance?._count?.Chat || 0,
      messages: instance?._count?.Message || 0,
    }),
    [instance],
  );

  const qrCodeColor = useMemo(() => (theme === "dark" ? "#fff" : theme === "light" ? "#000" : "#189d68"), [theme]);

  if (!instance) return <LoadingSpinner />;

  const connected = instance.connectionStatus === "open";

  return (
    <div className="flex flex-col">
      <BaseHeader
        title={instance.name}
        subtitle={instance.profileName || t("instance.dashboard.subtitle", { defaultValue: "Gerencie sua instância" })}
        secondaryActions={[
          {
            label: t("button.refresh", { defaultValue: "Atualizar" }),
            icon: <RefreshCw className="h-4 w-4" />,
            onClick: handleReload,
          },
          {
            label: t("instance.dashboard.button.restart", { defaultValue: "Reiniciar" }),
            icon: <Power className="h-4 w-4" />,
            onClick: () => handleRestart(instance.name),
          },
          ...(connected
            ? [
                {
                  label: t("instance.dashboard.button.disconnect", { defaultValue: "Desconectar" }),
                  icon: <LogOut className="h-4 w-4" />,
                  onClick: () => handleLogout(instance.name),
                  variant: "destructive" as const,
                },
              ]
            : []),
          ...(isGo && connected
            ? [
                {
                  label: t("instance.dashboard.button.sendMessage", { defaultValue: "Enviar mensagem" }),
                  icon: <Send className="h-4 w-4" />,
                  onClick: () => setGoSendOpen(true),
                  variant: "default" as const,
                },
              ]
            : []),
        ]}
      />

      <div className="flex flex-col gap-6">
        <Card className="border-sidebar-border bg-sidebar">
          <CardHeader>
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                {instance.profilePicUrl && (
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={instance.profilePicUrl} alt={instance.name} />
                  </Avatar>
                )}
                <div>
                  <CardTitle className="break-all">{instance.profileName || instance.name}</CardTitle>
                  {instance.ownerJid && (
                    <p className="mt-1 break-all text-xs text-muted-foreground">{instance.ownerJid.split("@")[0]}</p>
                  )}
                </div>
              </div>
              <InstanceStatus status={instance.connectionStatus} />
            </div>
          </CardHeader>
          <CardContent className="flex flex-col items-start space-y-4">
            <div className="w-full">
              <InstanceToken token={instance.token} />
            </div>

            {!connected && (
              <Alert variant="warning" className="flex flex-wrap items-center justify-between gap-3">
                <AlertTitle className="text-lg font-bold tracking-wide">
                  {t("instance.dashboard.alert")}
                </AlertTitle>

                {isGo ? (
                  <>
                    <Button onClick={() => setGoQrOpen(true)}>
                      <QrCode className="mr-2 h-4 w-4" />
                      {t("instance.dashboard.button.qrcode.label")}
                    </Button>
                    <GoQrCodeModal open={goQrOpen} onOpenChange={setGoQrOpen} />
                  </>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    <Dialog>
                      <DialogTrigger onClick={() => handleConnect(instance.name, false)} asChild>
                        <Button>
                          <QrCode className="mr-2 h-4 w-4" />
                          {t("instance.dashboard.button.qrcode.label")}
                        </Button>
                      </DialogTrigger>
                      <DialogContent onCloseAutoFocus={closeQRCodePopup}>
                        <DialogHeader>{t("instance.dashboard.button.qrcode.title")}</DialogHeader>
                        <div className="flex items-center justify-center py-4">
                          {qrCode ? (
                            <QRCode value={qrCode} size={256} bgColor="transparent" fgColor={qrCodeColor} className="rounded-sm" />
                          ) : (
                            <LoadingSpinner />
                          )}
                        </div>
                      </DialogContent>
                    </Dialog>

                    {instance.number && (
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" onClick={() => handleConnect(instance.name, true)}>
                            {t("instance.dashboard.button.pairingCode.label")}
                          </Button>
                        </DialogTrigger>
                        <DialogContent onCloseAutoFocus={closeQRCodePopup}>
                          <DialogHeader>
                            <DialogDescription>
                              {pairingCode ? (
                                <div className="py-3">
                                  <p className="text-center font-semibold">{t("instance.dashboard.button.pairingCode.title")}</p>
                                  <p className="mt-2 text-center font-mono text-2xl tracking-widest">
                                    {pairingCode.substring(0, 4)}-{pairingCode.substring(4, 8)}
                                  </p>
                                </div>
                              ) : (
                                <LoadingSpinner />
                              )}
                            </DialogDescription>
                          </DialogHeader>
                        </DialogContent>
                      </Dialog>
                    )}
                  </div>
                )}
              </Alert>
            )}
          </CardContent>
          <CardFooter />
        </Card>

        {isGo && <GoSendMessageModal open={goSendOpen} onOpenChange={setGoSendOpen} />}

        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Card className="border-sidebar-border bg-sidebar">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <CircleUser size="18" />
                {t("instance.dashboard.contacts")}
              </CardTitle>
            </CardHeader>
            <CardContent className="text-3xl font-bold">{numberFormatter.format(stats.contacts)}</CardContent>
          </Card>
          <Card className="border-sidebar-border bg-sidebar">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <UsersRound size="18" />
                {t("instance.dashboard.chats")}
              </CardTitle>
            </CardHeader>
            <CardContent className="text-3xl font-bold">{numberFormatter.format(stats.chats)}</CardContent>
          </Card>
          <Card className="border-sidebar-border bg-sidebar">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <MessageCircle size="18" />
                {t("instance.dashboard.messages")}
              </CardTitle>
            </CardHeader>
            <CardContent className="text-3xl font-bold">{numberFormatter.format(stats.messages)}</CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
}

export { DashboardInstance };
