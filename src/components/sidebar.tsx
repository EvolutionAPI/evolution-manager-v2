import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@evoapi/design-system/collapsible";
import {
  ChevronDown,
  CircleHelp,
  Cog,
  FileQuestion,
  IterationCcw,
  LayoutDashboard,
  LifeBuoy,
  MessageCircle,
  Zap,
} from "lucide-react";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { NavLink, useLocation } from "react-router-dom";

import { useTheme } from "@/components/theme-provider";
import { useInstance } from "@/contexts/InstanceContext";

import { FEATURES, FeatureKey, isFeatureEnabled } from "@/lib/provider/features";
import { cn } from "@/lib/utils";

const GATED_IDS = new Set<string>(Object.keys(FEATURES));
const isGated = (id: string): id is FeatureKey => GATED_IDS.has(id);
const shouldShow = (id?: string) => !id || !isGated(id) || isFeatureEnabled(id);

type MenuLeaf = {
  id: string;
  title: string;
  icon?: typeof LayoutDashboard;
  path?: string;
  link?: string;
};

type MenuGroup = {
  title: string;
  icon: typeof LayoutDashboard;
  children: MenuLeaf[];
};

type Menu = MenuLeaf | MenuGroup;

function SidebarShell({ children, footer }: { children: React.ReactNode; footer?: React.ReactNode }) {
  const currentYear = new Date().getFullYear();
  const { theme } = useTheme();
  const logoSrc =
    theme === "dark"
      ? "https://evolution-api.com/files/evo/evolution-logo-white.svg"
      : "https://evolution-api.com/files/evo/evolution-logo.svg";

  return (
    <aside className="hidden md:flex bg-sidebar text-sidebar-foreground flex-col w-56 border-r border-sidebar-border">
      <div className="h-16 flex items-center px-4 border-b border-sidebar-border">
        <img src={logoSrc} alt="Evolution API" className="h-7" />
      </div>

      <nav className="flex-1 overflow-y-auto px-2 py-4 space-y-1">
        {children}
      </nav>

      {footer && (
        <div className="border-t border-sidebar-border px-2 py-3 space-y-1">
          {footer}
        </div>
      )}

      <div className="p-4 border-t border-sidebar-border">
        <div className="text-sm font-medium text-primary">Evolution Manager</div>
        <div className="mt-1 text-xs text-muted-foreground">© {currentYear} All rights reserved</div>
      </div>
    </aside>
  );
}

function NavItem({ to, icon: Icon, label, isExternal }: { to: string; icon?: typeof LayoutDashboard; label: string; isExternal?: boolean }) {
  if (isExternal) {
    return (
      <a
        href={to}
        target="_blank"
        rel="noreferrer"
        className="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-muted-foreground transition-all hover:bg-accent hover:text-foreground"
      >
        {Icon && <Icon className="h-5 w-5 flex-shrink-0" />}
        <span>{label}</span>
      </a>
    );
  }
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        cn(
          "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-all",
          isActive ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-accent hover:text-foreground",
        )
      }
    >
      {({ isActive }) => (
        <>
          {Icon && <Icon className={cn("h-5 w-5 flex-shrink-0", isActive && "text-primary")} />}
          <span>{label}</span>
        </>
      )}
    </NavLink>
  );
}

function ExternalLinks() {
  const { t } = useTranslation();
  return (
    <>
      <NavItem to="https://doc.evolution-api.com" icon={FileQuestion} label={t("sidebar.documentation")} isExternal />
      <NavItem to="https://evolution-api.com/postman" icon={CircleHelp} label={t("sidebar.postman")} isExternal />
      <NavItem to="https://evolution-api.com/discord" icon={MessageCircle} label={t("sidebar.discord")} isExternal />
      <NavItem to="https://evolution-api.com/suporte-pro" icon={LifeBuoy} label={t("sidebar.supportPremium")} isExternal />
    </>
  );
}

function MainSidebar() {
  const { t } = useTranslation();
  return (
    <SidebarShell footer={<ExternalLinks />}>
      <NavItem to="/manager" icon={LayoutDashboard} label={t("sidebar.dashboard")} />
    </SidebarShell>
  );
}

function InstanceSidebar() {
  const { t } = useTranslation();
  const { instance } = useInstance();
  const { pathname } = useLocation();

  const base = instance ? `/manager/instance/${instance.id}` : "";

  const menus: Menu[] = useMemo(
    () => [
      { id: "dashboard", title: t("sidebar.dashboard"), icon: LayoutDashboard, path: "dashboard" },
      { id: "chat", title: t("sidebar.chat"), icon: MessageCircle, path: "chat" },
      {
        title: t("sidebar.configurations"),
        icon: Cog,
        children: [
          { id: "settings", title: t("sidebar.settings"), path: "settings" },
          { id: "proxy", title: t("sidebar.proxy"), path: "proxy" },
        ],
      },
      {
        title: t("sidebar.events"),
        icon: IterationCcw,
        children: [
          { id: "webhook", title: t("sidebar.webhook"), path: "webhook" },
          { id: "websocket", title: t("sidebar.websocket"), path: "websocket" },
          { id: "rabbitmq", title: t("sidebar.rabbitmq"), path: "rabbitmq" },
          { id: "sqs", title: t("sidebar.sqs"), path: "sqs" },
        ],
      },
      {
        title: t("sidebar.integrations"),
        icon: Zap,
        children: [
          { id: "evoai", title: t("sidebar.evoai"), path: "evoai" },
          { id: "n8n", title: t("sidebar.n8n"), path: "n8n" },
          { id: "evolutionBot", title: t("sidebar.evolutionBot"), path: "evolutionBot" },
          { id: "chatwoot", title: t("sidebar.chatwoot"), path: "chatwoot" },
          { id: "typebot", title: t("sidebar.typebot"), path: "typebot" },
          { id: "openai", title: t("sidebar.openai"), path: "openai" },
          { id: "dify", title: t("sidebar.dify"), path: "dify" },
          { id: "flowise", title: t("sidebar.flowise"), path: "flowise" },
        ],
      },
    ],
    [t],
  );

  const visibleMenus = useMemo(
    () =>
      menus
        .map((menu) => {
          if ("children" in menu) {
            return { ...menu, children: menu.children.filter((c) => shouldShow(c.id)) };
          }
          return menu;
        })
        .filter((menu) => {
          if ("children" in menu) return menu.children.length > 0;
          return shouldShow(menu.id);
        }),
    [menus],
  );

  return (
    <SidebarShell footer={<ExternalLinks />}>
      <NavItem to="/manager" icon={LayoutDashboard} label={`← ${t("dashboard.title")}`} />
      <div className="my-2 border-t border-sidebar-border" />
      {visibleMenus.map((menu) => {
        if ("children" in menu) {
          const groupActive = menu.children.some((c) => c.path && pathname.includes(c.path));
          return (
            <Collapsible key={menu.title} defaultOpen={groupActive}>
              <CollapsibleTrigger
                className={cn(
                  "flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-all",
                  groupActive ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-accent hover:text-foreground",
                )}
              >
                <menu.icon className={cn("h-5 w-5 flex-shrink-0", groupActive && "text-primary")} />
                <span>{menu.title}</span>
                <ChevronDown className="ml-auto h-4 w-4 transition-transform data-[state=open]:rotate-180" />
              </CollapsibleTrigger>
              <CollapsibleContent className="ml-7 mt-1 flex flex-col gap-1 border-l border-sidebar-border pl-3">
                {menu.children.map((child) => (
                  <NavLink
                    key={child.id}
                    to={`${base}/${child.path}`}
                    className={({ isActive }) =>
                      cn(
                        "rounded-md px-3 py-1.5 text-sm transition-all",
                        isActive ? "text-primary font-medium" : "text-muted-foreground hover:text-foreground",
                      )
                    }
                  >
                    {child.title}
                  </NavLink>
                ))}
              </CollapsibleContent>
            </Collapsible>
          );
        }
        return <NavItem key={menu.id} to={`${base}/${menu.path}`} icon={menu.icon} label={menu.title} />;
      })}
    </SidebarShell>
  );
}

export { MainSidebar, InstanceSidebar };
