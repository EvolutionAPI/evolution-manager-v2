/* eslint-disable @typescript-eslint/no-explicit-any */
import { ChevronDown } from "lucide-react";
import { useMemo } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

import { useInstance } from "@/contexts/InstanceContext";

import { cn } from "@/lib/utils";

import Menus from "./constants/menus";
import { Button } from "./ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "./ui/collapsible";

function Sidebar() {
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
      Menus.map((menu) => ({
        ...menu,
        children:
          "children" in menu
            ? menu.children?.map((child) => ({
                ...child,
                isActive:
                  "path" in child ? pathname.includes(child.path) : false,
              }))
            : undefined,
        isActive: "path" in menu ? pathname.includes(menu.path) : false,
      })).map((menu) => ({
        ...menu,
        isActive:
          menu.isActive ||
          ("children" in menu &&
            menu.children?.some((child) => child.isActive)),
      })),
    [pathname],
  );

  return (
    <ul className="flex h-full w-full flex-col gap-2 border-r border-border px-2">
      {links.map((menu) => (
        <li
          key={menu.title}
          className={"divider" in menu ? "mt-auto" : undefined}
        >
          {menu.children ? (
            <Collapsible defaultOpen={menu.isActive}>
              <CollapsibleTrigger asChild>
                <Button
                  className={cn("flex w-full items-center justify-start gap-2")}
                  variant={menu.isActive ? "secondary" : "link"}
                >
                  {menu.icon && <menu.icon size="15" />}
                  <span>{menu.title}</span>
                  <ChevronDown size="15" className="ml-auto" />
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <ul className="my-4 ml-6 flex flex-col gap-2 text-sm">
                  {menu.children.map((child) => (
                    <li key={child.id}>
                      <button
                        onClick={() => handleNavigate(child)}
                        className={cn(
                          child.isActive
                            ? "text-foreground"
                            : "text-muted-foreground",
                        )}
                      >
                        <span className="nav-label">{child.title}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              </CollapsibleContent>
            </Collapsible>
          ) : (
            <Button
              className={cn(
                "relative flex w-full items-center justify-start gap-2",
                menu.isActive && "pointer-events-none",
              )}
              variant={menu.isActive ? "secondary" : "link"}
            >
              {"link" in menu && (
                <a
                  href={menu.link}
                  target="_blank"
                  rel="noreferrer"
                  className="absolute inset-0 h-full w-full"
                />
              )}
              {"path" in menu && (
                <Link
                  to={`/manager/instance/${instance?.id}/${menu.path}`}
                  className="absolute inset-0 h-full w-full"
                />
              )}
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
