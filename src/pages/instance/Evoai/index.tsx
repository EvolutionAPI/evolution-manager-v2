/* eslint-disable @typescript-eslint/no-explicit-any */
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";

import { Button } from "@evoapi/design-system/button";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@evoapi/design-system/resizable";
import { Separator } from "@evoapi/design-system/separator";

import { IntegrationGuard } from "@/components/integration-disabled";
import { useInstance } from "@/contexts/InstanceContext";

import { useFetchEvoai } from "@/lib/queries/evoai/fetchEvoai";

import { useMediaQuery } from "@/utils/useMediaQuery";

import { DefaultSettingsEvoai } from "./DefaultSettingsEvoai";
import { NewEvoai } from "./NewEvoai";
import { SessionsEvoai } from "./SessionsEvoai";
import { UpdateEvoai } from "./UpdateEvoai";

function Evoai() {
  const { t } = useTranslation();
  const isMD = useMediaQuery("(min-width: 768px)");
  const { instance } = useInstance();

  const { evoaiId } = useParams<{ evoaiId: string }>();

  const {
    data: bots,
    refetch,
    isLoading,
    error,
  } = useFetchEvoai({
    instanceName: instance?.name,
  });

  const navigate = useNavigate();

  const handleBotClick = (botId: string) => {
    if (!instance) return;

    navigate(`/manager/instance/${instance.id}/evoai/${botId}`);
  };

  const resetTable = () => {
    refetch();
  };

  return (
    <main className="pt-5">
      <IntegrationGuard error={error} name="Evoai" envVar="EVOAI_ENABLED">
      <div className="mb-1 flex items-center justify-between">
        <h3 className="text-lg font-medium">{t("evoai.title")}</h3>
        <div className="flex items-center justify-end gap-2">
          <SessionsEvoai />
          <DefaultSettingsEvoai />
          <NewEvoai resetTable={resetTable} />
        </div>
      </div>
      <Separator className="my-4" />
      <ResizablePanelGroup direction={isMD ? "horizontal" : "vertical"}>
        <ResizablePanel defaultSize={evoaiId ? 35 : 100} className="pr-4">
          <div className="flex flex-col gap-3">
            {isLoading ? (
              <LoadingSpinner />
            ) : (
              <>
                {bots && bots.length > 0 && Array.isArray(bots) ? (
                  bots.map((bot) => (
                    <Button className="flex h-auto flex-col items-start justify-start" key={bot.id} onClick={() => handleBotClick(`${bot.id}`)} variant={evoaiId === bot.id ? "secondary" : "outline"}>
                      <h4 className="text-base">{bot.description || bot.id}</h4>
                    </Button>
                  ))
                ) : (
                  <Button variant="link">{t("evoai.table.none")}</Button>
                )}
              </>
            )}
          </div>
        </ResizablePanel>
        {evoaiId && (
          <>
            <ResizableHandle withHandle className="border border-border" />
            <ResizablePanel>
              <UpdateEvoai evoaiId={evoaiId} resetTable={resetTable} />
            </ResizablePanel>
          </>
        )}
      </ResizablePanelGroup>
      </IntegrationGuard>
    </main>
  );
}

export { Evoai };
