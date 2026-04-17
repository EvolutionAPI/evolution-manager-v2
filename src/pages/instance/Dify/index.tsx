/* eslint-disable @typescript-eslint/no-explicit-any */
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";

import { Button } from "@evoapi/design-system/button";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@evoapi/design-system/resizable";
import { Separator } from "@evoapi/design-system/separator";

import { IntegrationGuard } from "@/components/integration-disabled";
import { useInstance } from "@/contexts/InstanceContext";

import { useFetchDify } from "@/lib/queries/dify/fetchDify";

import { useMediaQuery } from "@/utils/useMediaQuery";

import { DefaultSettingsDify } from "./DefaultSettingsDify";
import { NewDify } from "./NewDify";
import { SessionsDify } from "./SessionsDify";
import { UpdateDify } from "./UpdateDify";

function Dify() {
  const { t } = useTranslation();
  const isMD = useMediaQuery("(min-width: 768px)");
  const { instance } = useInstance();

  const { difyId } = useParams<{ difyId: string }>();

  const {
    data: bots,
    refetch,
    isLoading,
    error,
  } = useFetchDify({
    instanceName: instance?.name,
  });

  const navigate = useNavigate();

  const handleBotClick = (botId: string) => {
    if (!instance) return;

    navigate(`/manager/instance/${instance.id}/dify/${botId}`);
  };

  const resetTable = () => {
    refetch();
  };

  return (
    <main className="pt-5">
      <IntegrationGuard error={error} name="Dify" envVar="DIFY_ENABLED">
      <div className="mb-1 flex items-center justify-between">
        <h3 className="text-lg font-medium">{t("dify.title")}</h3>
        <div className="flex items-center justify-end gap-2">
          <SessionsDify />
          <DefaultSettingsDify />
          <NewDify resetTable={resetTable} />
        </div>
      </div>
      <Separator className="my-4" />
      <ResizablePanelGroup direction={isMD ? "horizontal" : "vertical"}>
        <ResizablePanel defaultSize={difyId ? 35 : 100} className="pr-4">
          <div className="flex flex-col gap-3">
            {isLoading ? (
              <LoadingSpinner />
            ) : (
              <>
                {bots && bots.length > 0 && Array.isArray(bots) ? (
                  bots.map((bot) => (
                    <Button className="flex h-auto flex-col items-start justify-start" key={bot.id} onClick={() => handleBotClick(`${bot.id}`)} variant={difyId === bot.id ? "secondary" : "outline"}>
                      <h4 className="text-base">{bot.description || bot.id}</h4>
                      <p className="text-sm font-normal text-muted-foreground">{bot.botType}</p>
                    </Button>
                  ))
                ) : (
                  <Button variant="link">{t("dify.table.none")}</Button>
                )}
              </>
            )}
          </div>
        </ResizablePanel>
        {difyId && (
          <>
            <ResizableHandle withHandle className="border border-border" />
            <ResizablePanel>
              <UpdateDify difyId={difyId} resetTable={resetTable} />
            </ResizablePanel>
          </>
        )}
      </ResizablePanelGroup>
      </IntegrationGuard>
    </main>
  );
}

export { Dify };
