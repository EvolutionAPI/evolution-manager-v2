import { useTranslation } from "react-i18next";

import { Badge } from "@evoapi/design-system/badge";

export function InstanceStatus({ status }: { status: string }) {
  const { t } = useTranslation();

  if (!status) {
    return null;
  }

  if (status === "open") return <Badge>{t("status.open")}</Badge>;

  if (status === "connecting") return <Badge variant="warning">{t("status.connecting")}</Badge>;

  if (status === "close" || status === "closed") return <Badge variant="destructive">{t("status.closed")}</Badge>;

  return <Badge variant="secondary">{status}</Badge>;
}
