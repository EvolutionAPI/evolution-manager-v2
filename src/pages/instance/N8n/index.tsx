/* eslint-disable @typescript-eslint/no-explicit-any */
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";

import { Button } from "@evoapi/design-system/button";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@evoapi/design-system/resizable";
import { Separator } from "@evoapi/design-system/separator";

import { IntegrationGuard } from "@/components/integration-disabled";
import { useInstance } from "@/contexts/InstanceContext";

import { useFetchN8n } from "@/lib/queries/n8n/fetchN8n";

import { useMediaQuery } from "@/utils/useMediaQuery";

import { DefaultSettingsN8n } from "./DefaultSettingsN8n";
import { NewN8n } from "./NewN8n";
import { SessionsN8n } from "./SessionsN8n";
import { UpdateN8n } from "./UpdateN8n";

function N8n() {
  const { t } = useTranslation();
  const isMD = useMediaQuery("(min-width: 768px)");
  const { instance } = useInstance();

  const { n8nId } = useParams<{ n8nId: string }>();

  const {
    data: bots,
    refetch,
    isLoading,
    error,
  } = useFetchN8n({
    instanceName: instance?.name,
  });

  const navigate = useNavigate();

  const handleBotClick = (botId: string) => {
    if (!instance) return;

    navigate(`/manager/instance/${instance.id}/n8n/${botId}`);
  };

  const resetTable = () => {
    refetch();
  };

  return (
    <main className="pt-5">
      <IntegrationGuard error={error} name="n8n" envVar="N8N_ENABLED">
      <div className="mb-1 flex items-center justify-between">
        <h3 className="text-lg font-medium">{t("n8n.title")}</h3>
        <div className="flex items-center justify-end gap-2">
          <SessionsN8n />
          <DefaultSettingsN8n />
          <NewN8n resetTable={resetTable} />
        </div>
      </div>
      <Separator className="my-4" />
      <ResizablePanelGroup direction={isMD ? "horizontal" : "vertical"}>
        <ResizablePanel defaultSize={n8nId ? 35 : 100} className="pr-4">
          <div className="flex flex-col gap-3">
            {isLoading ? (
              <LoadingSpinner />
            ) : (
              <>
                {bots && bots.length > 0 && Array.isArray(bots) ? (
                  bots.map((bot) => (
                    <Button className="flex h-auto flex-col items-start justify-start" key={bot.id} onClick={() => handleBotClick(`${bot.id}`)} variant={n8nId === bot.id ? "secondary" : "outline"}>
                      <h4 className="text-base">{bot.description || bot.id}</h4>
                    </Button>
                  ))
                ) : (
                  <Button variant="link">{t("n8n.table.none")}</Button>
                )}
              </>
            )}
          </div>
        </ResizablePanel>
        {n8nId && (
          <>
            <ResizableHandle withHandle className="border border-border" />
            <ResizablePanel>
              <UpdateN8n n8nId={n8nId} resetTable={resetTable} />
            </ResizablePanel>
          </>
        )}
      </ResizablePanelGroup>
      </IntegrationGuard>
    </main>
  );
}

export { N8n };
