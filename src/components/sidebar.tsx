/* eslint-disable @typescript-eslint/no-explicit-any */
import { CircleHelp, Cog, FileQuestion, IterationCcw, LayoutDashboard, LifeBuoy, MessageCircle, Zap, ChevronDown } from "lucide-react";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Link, useLocation, useNavigate } from "react-router-dom";

import { useInstance } from "@/contexts/InstanceContext";

import { FEATURES, FeatureKey, isFeatureEnabled } from "@/lib/provider/features";
import { cn } from "@/lib/utils";

const GATED_IDS = new Set<string>(Object.keys(FEATURES));
const isGated = (id: string): id is FeatureKey => GATED_IDS.has(id);
const shouldShow = (id?: string) => !id || !isGated(id) || isFeatureEnabled(id);

import { Button } from "./ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "./ui/collapsible";

function Sidebar() {
  const { t } = useTranslation();

  const Menus = useMemo(
    () => [
      {
        id: "dashboard",
        title: t("sidebar.dashboard"),
        icon: LayoutDashboard,
        path: "dashboard",
      },
      {
        id: "chat",
        title: t("sidebar.chat"),
        icon: MessageCircle,
        path: "chat",
      },
      {
        navLabel: true,
        title: t("sidebar.configurations"),
        icon: Cog,
        children: [
          {
            id: "settings",
            title: t("sidebar.settings"),
            path: "settings",
          },
          {
            id: "proxy",
            title: t("sidebar.proxy"),
            path: "proxy",
          },
        ],
      },
      {
        title: t("sidebar.events"),
        icon: IterationCcw,
        children: [
          {
            id: "webhook",
            title: t("sidebar.webhook"),
            path: "webhook",
          },
          {
            id: "websocket",
            title: t("sidebar.websocket"),
            path: "websocket",
          },
          {
            id: "rabbitmq",
            title: t("sidebar.rabbitmq"),
            path: "rabbitmq",
          },
          {
            id: "sqs",
            title: t("sidebar.sqs"),
            path: "sqs",
          },
        ],
      },
      {
        title: t("sidebar.integrations"),
        icon: Zap,
        children: [
          {
            id: "evoai",
            title: t("sidebar.evoai"),
            path: "evoai",
          },
          {
            id: "n8n",
            title: t("sidebar.n8n"),
            path: "n8n",
          },
          {
            id: "evolutionBot",
            title: t("sidebar.evolutionBot"),
            path: "evolutionBot",
          },
          {
            id: "chatwoot",
            title: t("sidebar.chatwoot"),
            path: "chatwoot",
          },
          {
            id: "typebot",
            title: t("sidebar.typebot"),
            path: "typebot",
          },
          {
            id: "openai",
            title: t("sidebar.openai"),
            path: "openai",
          },
          {
            id: "dify",
            title: t("sidebar.dify"),
            path: "dify",
          },
          {
            id: "flowise",
            title: t("sidebar.flowise"),
            path: "flowise",
          },
        ],
      },
      {
        id: "documentation",
        title: t("sidebar.documentation"),
        icon: FileQuestion,
        link: "https://doc.evolution-api.com",
        divider: true,
      },
      {
        id: "postman",
        title: t("sidebar.postman"),
        icon: CircleHelp,
        link: "https://evolution-api.com/postman",
      },
      {
        id: "discord",
        title: t("sidebar.discord"),
        icon: MessageCircle,
        link: "https://evolution-api.com/discord",
      },
      {
        id: "support-premium",
        title: t("sidebar.supportPremium"),
        icon: LifeBuoy,
        link: "https://evolution-api.com/suporte-pro",
      },
    ],
    [t],
  );

  const navigate = useNavigate();
  const { pathname } = useLocation();

  const { instance } = useInstance();

  const handleNavigate = (menu?: any) => {
    if (!menu || !instance) return;

    if (menu.path) navigate(`/manager/instance/${instance.id}/${menu.path}`);
    if (menu.link) window.open(menu.link, "_blank");
  };

  const links = useMemo(
    () =>
      Menus
        .map((menu) => ({
          ...menu,
          children:
            "children" in menu
              ? menu.children
                  ?.filter((child) => shouldShow("id" in child ? child.id : undefined))
                  .map((child) => ({
                    ...child,
                    isActive: "path" in child ? pathname.includes(child.path) : false,
                  }))
              : undefined,
          isActive: "path" in menu && menu.path ? pathname.includes(menu.path) : false,
        }))
        .filter((menu) => {
          if ("id" in menu && menu.id && !shouldShow(menu.id)) return false;
          if ("children" in menu && menu.children !== undefined && menu.children.length === 0) return false;
          return true;
        })
        .map((menu) => ({
          ...menu,
          isActive: menu.isActive || ("children" in menu && menu.children?.some((child) => child.isActive)),
        })),
    [Menus, pathname],
  );

  return (
    <ul className="flex h-full w-full flex-col gap-2 border-r border-border px-2">
      {links.map((menu) => (
        <li key={menu.title} className={"divider" in menu ? "mt-auto" : undefined}>
          {menu.children ? (
            <Collapsible defaultOpen={menu.isActive}>
              <CollapsibleTrigger asChild>
                <Button className={cn("flex w-full items-center justify-start gap-2")} variant={menu.isActive ? "secondary" : "link"}>
                  {menu.icon && <menu.icon size="15" />}
                  <span>{menu.title}</span>
                  <ChevronDown size="15" className="ml-auto" />
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <ul className="my-4 ml-6 flex flex-col gap-2 text-sm">
                  {menu.children.map((child) => (
                    <li key={child.id}>
                      <button onClick={() => handleNavigate(child)} className={cn(child.isActive ? "text-foreground" : "text-muted-foreground")}>
                        <span className="nav-label">{child.title}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              </CollapsibleContent>
            </Collapsible>
          ) : (
            <Button className={cn("relative flex w-full items-center justify-start gap-2", menu.isActive && "pointer-events-none")} variant={menu.isActive ? "secondary" : "link"}>
              {"link" in menu && <a href={menu.link} target="_blank" rel="noreferrer" className="absolute inset-0 h-full w-full" />}
              {"path" in menu && <Link to={`/manager/instance/${instance?.id}/${menu.path}`} className="absolute inset-0 h-full w-full" />}
              {menu.icon && <menu.icon size="15" />}
              <span>{menu.title}</span>
            </Button>
          )}
        </li>
      ))}
    </ul>
  );
}

export { Sidebar };
