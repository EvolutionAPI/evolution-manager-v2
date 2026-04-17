import { useMemo } from "react";
import { useTranslation } from "react-i18next";

import { useVerifyServer } from "@/lib/queries/auth/verifyServer";
import { getProvider, getToken, TOKEN_ID } from "@/lib/queries/token";

import { Button } from "@evoapi/design-system/button";

function Footer() {
  const { t } = useTranslation();

  const url = getToken(TOKEN_ID.API_URL);
  const provider = getProvider();
  const { data: serverInfo } = useVerifyServer({ url, enabled: provider === "api" });

  const clientName = useMemo(() => serverInfo?.clientName, [serverInfo]);
  const version = useMemo(() => serverInfo?.version, [serverInfo]);

  const links = [
    {
      name: "Discord",
      url: "https://evolution-api.com/discord",
    },
    {
      name: "Postman",
      url: "https://evolution-api.com/postman",
    },
    {
      name: "GitHub",
      url: "https://github.com/EvolutionAPI/evolution-api",
    },
    {
      name: "Docs",
      url: "https://doc.evolution-api.com",
    },
  ];

  return (
    <footer className="flex w-full flex-col items-center justify-between p-6 text-xs text-secondary-foreground sm:flex-row">
      <div className="flex items-center space-x-3 divide-x">
        {clientName && clientName !== "" && (
          <span>
            {t("footer.clientName")}: <strong>{clientName}</strong>
          </span>
        )}
        {version && version !== "" && (
          <span className="pl-3">
            {t("footer.version")}: <strong>{version}</strong>
          </span>
        )}
      </div>
      <div className="flex gap-2">
        {links.map((link) => (
          <Button variant="link" asChild key={link.url} size="sm" className="text-xs">
            <a href={link.url} target="_blank" rel="noopener noreferrer">
              {link.name}
            </a>
          </Button>
        ))}
      </div>
    </footer>
  );
}

export { Footer };
