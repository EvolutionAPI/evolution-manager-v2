import { Badge } from "@evoapi/design-system/badge";
import { Button } from "@evoapi/design-system/button";
import { Card, CardContent } from "@evoapi/design-system/card";
import { Settings, Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

import { Instance } from "@/types/evolution.types";

const StatusBadge = ({ status }: { status?: string }) => {
  const { t } = useTranslation();
  if (status === "open") return <Badge className="bg-green-500/10 text-green-500 hover:bg-green-500/20">{t("status.open")}</Badge>;
  if (status === "connecting") return <Badge className="bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20">{t("status.connecting")}</Badge>;
  return <Badge className="bg-red-500/10 text-red-500 hover:bg-red-500/20">{t("status.closed")}</Badge>;
};

interface InstanceCardProps {
  instance: Instance;
  isDeleting?: boolean;
  onDelete: (instance: Instance) => void;
}

export function InstanceCard({ instance, isDeleting, onDelete }: InstanceCardProps) {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const numberFormatter = new Intl.NumberFormat(i18n.language);
  const displayName = instance.profileName || instance.name;
  const goToInstance = () => navigate(`/manager/instance/${instance.id}/dashboard`);

  return (
    <Card className="group relative overflow-hidden border-sidebar-border bg-sidebar transition-all duration-300 hover:bg-sidebar-accent/30 hover:shadow-lg hover:shadow-black/10">
      <CardContent className="p-0">
        <button
          type="button"
          onClick={goToInstance}
          className="flex w-full items-center gap-3 border-b border-sidebar-border p-4 text-left"
        >
          {instance.profilePicUrl ? (
            <div className="flex-shrink-0">
              <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-lg bg-muted">
                <img
                  src={instance.profilePicUrl}
                  alt={displayName}
                  className="h-12 w-12 rounded-lg object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
              </div>
            </div>
          ) : (
            <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-lg bg-muted text-lg font-semibold text-muted-foreground">
              {displayName.slice(0, 2).toUpperCase()}
            </div>
          )}

          <div className="min-w-0 flex-1">
            <h3 className="truncate text-base font-semibold text-sidebar-foreground">{displayName}</h3>
            <p className="truncate text-xs text-sidebar-foreground/60">{instance.name}</p>
          </div>

          <div className="flex-shrink-0">
            <StatusBadge status={instance.connectionStatus} />
          </div>
        </button>

        <div className="space-y-1 px-4 py-3 text-xs text-sidebar-foreground/70">
          {instance.ownerJid && (
            <div className="flex items-center justify-between">
              <span>{t("dashboard.card.phone", { defaultValue: "Número" })}</span>
              <span className="ml-2 truncate font-mono">{instance.ownerJid.split("@")[0]}</span>
            </div>
          )}
          <div className="flex items-center justify-between">
            <span>{t("instance.dashboard.contacts")}</span>
            <span className="font-mono">{numberFormatter.format(instance._count?.Contact || 0)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span>{t("instance.dashboard.messages")}</span>
            <span className="font-mono">{numberFormatter.format(instance._count?.Message || 0)}</span>
          </div>
        </div>

        <div className="flex border-t border-sidebar-border opacity-0 transition-opacity duration-200 group-hover:opacity-100">
          <Button
            variant="ghost"
            className="h-12 flex-1 rounded-none text-muted-foreground hover:bg-accent hover:text-foreground"
            onClick={goToInstance}
          >
            <Settings className="mr-2 h-4 w-4" />
            {t("dashboard.settings")}
          </Button>
          <div className="w-px bg-sidebar-border" />
          <Button
            variant="ghost"
            className="h-12 rounded-none px-4 text-red-500 hover:bg-red-500/10 hover:text-red-400"
            disabled={isDeleting}
            onClick={() => onDelete(instance)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
