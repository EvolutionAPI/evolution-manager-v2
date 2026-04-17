import { Button } from "@evoapi/design-system/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { ReactNode } from "react";
import { useTranslation } from "react-i18next";

import { cn } from "@/lib/utils";

export type HeaderAction = {
  label: string;
  icon?: ReactNode;
  onClick: () => void;
  variant?: "default" | "outline" | "ghost" | "destructive" | "secondary" | "link";
  className?: string;
};

interface BaseHeaderProps {
  title: string;
  subtitle?: string;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
  primaryAction?: HeaderAction;
  secondaryActions?: HeaderAction[];
  className?: string;
  children?: ReactNode;
}

export function BaseHeader({
  title,
  subtitle,
  searchValue,
  onSearchChange,
  searchPlaceholder,
  primaryAction,
  secondaryActions = [],
  className,
  children,
}: BaseHeaderProps) {
  const { t } = useTranslation();
  const resolvedPlaceholder = searchPlaceholder ?? t("common.search");
  return (
    <div className={cn("mb-6 space-y-6", className)}>
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="flex-1">
          <h1 className="mb-1 text-2xl font-bold tracking-tight text-foreground">{title}</h1>
          {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
        </div>

        {primaryAction && (
          <div className="flex-shrink-0">
            <Button onClick={primaryAction.onClick} variant={primaryAction.variant || "default"} className={primaryAction.className}>
              {primaryAction.icon && <span className="mr-2 inline-flex">{primaryAction.icon}</span>}
              {primaryAction.label}
            </Button>
          </div>
        )}
      </div>

      {(onSearchChange || secondaryActions.length > 0) && (
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          {onSearchChange && (
            <div className="relative max-w-md flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                placeholder={resolvedPlaceholder}
                value={searchValue ?? ""}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pl-9"
              />
            </div>
          )}

          {secondaryActions.length > 0 && (
            <div className="flex items-center gap-2">
              {secondaryActions.map((action, i) => (
                <Button key={i} variant={action.variant || "outline"} size="sm" onClick={action.onClick} className={action.className}>
                  {action.icon && <span className="mr-2 inline-flex">{action.icon}</span>}
                  {action.label}
                </Button>
              ))}
            </div>
          )}
        </div>
      )}

      {children}
    </div>
  );
}
