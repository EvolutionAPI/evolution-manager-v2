/* eslint-disable @typescript-eslint/no-explicit-any */
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";

import { Button } from "@evoapi/design-system/button";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@evoapi/design-system/resizable";
import { Separator } from "@evoapi/design-system/separator";

import { IntegrationGuard } from "@/components/integration-disabled";
import { useInstance } from "@/contexts/InstanceContext";

import { useFindEvolutionBot } from "@/lib/queries/evolutionBot/findEvolutionBot";

import { useMediaQuery } from "@/utils/useMediaQuery";

import { DefaultSettingsEvolutionBot } from "./DefaultSettingsEvolutionBot";
import { NewEvolutionBot } from "./NewEvolutionBot";
import { SessionsEvolutionBot } from "./SessionsEvolutionBot";
import { UpdateEvolutionBot } from "./UpdateEvolutionBot";

function EvolutionBot() {
  const { t } = useTranslation();
  const isMD = useMediaQuery("(min-width: 768px)");
  const { instance } = useInstance();

  const { evolutionBotId } = useParams<{ evolutionBotId: string }>();

  const {
    data: bots,
    isLoading,
    refetch,
    error,
  } = useFindEvolutionBot({
    instanceName: instance?.name,
  });

  const navigate = useNavigate();

  const handleBotClick = (botId: string) => {
    if (!instance) return;

    navigate(`/manager/instance/${instance.id}/evolutionBot/${botId}`);
  };

  const resetTable = () => {
    refetch();
  };

  return (
    <main className="pt-5">
      <IntegrationGuard error={error} name="Evolution Bot" envVar="EVOLUTION_BOT_ENABLED">
      <div className="mb-1 flex items-center justify-between">
        <h3 className="text-lg font-medium">{t("evolutionBot.title")}</h3>
        <div className="flex items-center justify-end gap-2">
          <SessionsEvolutionBot />
          <DefaultSettingsEvolutionBot />
          <NewEvolutionBot resetTable={resetTable} />
        </div>
      </div>
      <Separator className="my-4" />
      <ResizablePanelGroup direction={isMD ? "horizontal" : "vertical"}>
        <ResizablePanel defaultSize={evolutionBotId ? 35 : 100} className="pr-4">
          <div className="flex flex-col gap-3">
            {isLoading ? (
              <LoadingSpinner />
            ) : (
              <>
                {bots && bots.length > 0 && Array.isArray(bots) ? (
                  bots.map((bot) => (
                    <Button
                      className="flex h-auto flex-col items-start justify-start"
                      key={bot.id}
                      onClick={() => handleBotClick(`${bot.id}`)}
                      variant={evolutionBotId === bot.id ? "secondary" : "outline"}>
                      <h4 className="text-base">{bot.description || bot.id}</h4>
                    </Button>
                  ))
                ) : (
                  <Button variant="link">{t("evolutionBot.table.none")}</Button>
                )}
              </>
            )}
          </div>
        </ResizablePanel>
        {evolutionBotId && (
          <>
            <ResizableHandle withHandle className="border border-border" />
            <ResizablePanel>
              <UpdateEvolutionBot evolutionBotId={evolutionBotId} resetTable={resetTable} />
            </ResizablePanel>
          </>
        )}
      </ResizablePanelGroup>
      </IntegrationGuard>
    </main>
  );
}

export { EvolutionBot };
