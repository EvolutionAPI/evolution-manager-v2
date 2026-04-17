/* eslint-disable @typescript-eslint/no-explicit-any */
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";

import { Button } from "@evoapi/design-system/button";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@evoapi/design-system/resizable";
import { Separator } from "@evoapi/design-system/separator";

import { IntegrationGuard } from "@/components/integration-disabled";
import { useInstance } from "@/contexts/InstanceContext";

import { useFindTypebot } from "@/lib/queries/typebot/findTypebot";

import { useMediaQuery } from "@/utils/useMediaQuery";

import { DefaultSettingsTypebot } from "./DefaultSettingsTypebot";
import { NewTypebot } from "./NewTypebot";
import { SessionsTypebot } from "./SessionsTypebot";
import { UpdateTypebot } from "./UpdateTypebot";

function Typebot() {
  const { t } = useTranslation();
  const isMD = useMediaQuery("(min-width: 768px)");
  const { instance } = useInstance();

  const { typebotId } = useParams<{ typebotId: string }>();

  const {
    data: typebots,
    isLoading,
    refetch,
    error,
  } = useFindTypebot({
    instanceName: instance?.name,
    token: instance?.token,
  });

  const navigate = useNavigate();

  const handleBotClick = (botId: string) => {
    if (!instance) return;

    navigate(`/manager/instance/${instance.id}/typebot/${botId}`);
  };

  const resetTable = () => {
    refetch();
  };

  return (
    <main className="pt-5">
      <IntegrationGuard error={error} name="Typebot" envVar="TYPEBOT_ENABLED">
      <div className="mb-1 flex items-center justify-between">
        <h3 className="text-lg font-medium">{t("typebot.title")}</h3>
        <div className="flex flex-wrap items-center justify-end gap-2">
          <SessionsTypebot />
          <DefaultSettingsTypebot />
          <NewTypebot resetTable={resetTable} />
        </div>
      </div>
      <Separator className="my-4" />
      <ResizablePanelGroup direction={isMD ? "horizontal" : "vertical"}>
        <ResizablePanel defaultSize={typebotId ? 35 : 100} className="pr-4">
          <div className="flex flex-col gap-3">
            {isLoading ? (
              <LoadingSpinner />
            ) : (
              <>
                {typebots && typebots.length > 0 && Array.isArray(typebots) ? (
                  typebots.map((bot) => (
                    <Button
                      className="flex h-auto flex-col items-start justify-start"
                      key={bot.id}
                      onClick={() => handleBotClick(`${bot.id}`)}
                      variant={typebotId === bot.id ? "secondary" : "outline"}>
                      {bot.description ? (
                        <>
                          <h4 className="text-base">{bot.description}</h4>
                          <p className="text-wrap text-sm font-normal text-muted-foreground">
                            {bot.url} - {bot.typebot}
                          </p>
                        </>
                      ) : (
                        <>
                          <h4 className="text-base">{bot.url}</h4>
                          <p className="text-wrap text-sm font-normal text-muted-foreground">{bot.typebot}</p>
                        </>
                      )}
                    </Button>
                  ))
                ) : (
                  <Button variant="link">{t("typebot.table.none")}</Button>
                )}
              </>
            )}
          </div>
        </ResizablePanel>
        {typebotId && (
          <>
            <ResizableHandle withHandle className="border border-black" />
            <ResizablePanel>
              <UpdateTypebot typebotId={typebotId} resetTable={resetTable} />
            </ResizablePanel>
          </>
        )}
      </ResizablePanelGroup>
      </IntegrationGuard>
    </main>
  );
}

export { Typebot };
