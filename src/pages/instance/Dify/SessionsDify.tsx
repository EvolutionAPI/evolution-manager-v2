/* eslint-disable @typescript-eslint/no-explicit-any */
import { ColumnDef, SortingState } from "@tanstack/react-table";
import { Delete, ListCollapse, MoreHorizontal, Pause, Play, RotateCcw, StopCircle } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";

import { Button } from "@evoapi/design-system/button";
import { DataTable } from "@/components/ui/data-table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@evoapi/design-system/dropdown-menu";
import { Input } from "@/components/ui/input";

import { useInstance } from "@/contexts/InstanceContext";

import { useFetchSessionsDify } from "@/lib/queries/dify/fetchSessionsDify";
import { useManageDify } from "@/lib/queries/dify/manageDify";

import { IntegrationSession } from "@/types/evolution.types";

function SessionsDify({ difyId }: { difyId?: string }) {
  const { t } = useTranslation();
  const { instance } = useInstance();

  const { changeStatusDify } = useManageDify();
  const [sorting, setSorting] = useState<SortingState>([]);
  const { data: sessions, refetch } = useFetchSessionsDify({
    difyId,
    instanceName: instance?.name,
  });
  const [open, setOpen] = useState(false);
  const [globalFilter, setGlobalFilter] = useState("");

  function onReset() {
    refetch();
  }

  const changeStatus = async (remoteJid: string, status: string) => {
    try {
      if (!instance) return;

      await changeStatusDify({
        instanceName: instance.name,
        token: instance.token,
        remoteJid,
        status,
      });

      toast.success(t("dify.toast.success.status"));
      onReset();
    } catch (error: any) {
      console.error("Error:", error);
      toast.error(`Error : ${error?.response?.data?.response?.message}`);
    }
  };

  const columns: ColumnDef<IntegrationSession>[] = [
    {
      accessorKey: "remoteJid",
      header: () => <div className="text-center">{t("dify.sessions.table.remoteJid")}</div>,
      cell: ({ row }) => <div>{row.getValue("remoteJid")}</div>,
    },
    {
      accessorKey: "pushName",
      header: () => <div className="text-center">{t("dify.sessions.table.pushName")}</div>,
      cell: ({ row }) => <div>{row.getValue("pushName")}</div>,
    },
    {
      accessorKey: "sessionId",
      header: () => <div className="text-center">{t("dify.sessions.table.sessionId")}</div>,
      cell: ({ row }) => <div>{row.getValue("sessionId")}</div>,
    },
    {
      accessorKey: "status",
      header: () => <div className="text-center">{t("dify.sessions.table.status")}</div>,
      cell: ({ row }) => <div>{row.getValue("status")}</div>,
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => {
        const session = row.original;

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">{t("dify.sessions.table.actions.title")}</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>{t("dify.sessions.table.actions.title")}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {session.status !== "opened" && (
                <DropdownMenuItem onClick={() => changeStatus(session.remoteJid, "opened")}>
                  <Play className="mr-2 h-4 w-4" />
                  {t("dify.sessions.table.actions.open")}
                </DropdownMenuItem>
              )}
              {session.status !== "paused" && session.status !== "closed" && (
                <DropdownMenuItem onClick={() => changeStatus(session.remoteJid, "paused")}>
                  <Pause className="mr-2 h-4 w-4" />
                  {t("dify.sessions.table.actions.pause")}
                </DropdownMenuItem>
              )}
              {session.status !== "closed" && (
                <DropdownMenuItem onClick={() => changeStatus(session.remoteJid, "closed")}>
                  <StopCircle className="mr-2 h-4 w-4" />
                  {t("dify.sessions.table.actions.close")}
                </DropdownMenuItem>
              )}

              <DropdownMenuItem onClick={() => changeStatus(session.remoteJid, "delete")}>
                <Delete className="mr-2 h-4 w-4" />
                {t("dify.sessions.table.actions.delete")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="secondary" size="sm">
          <ListCollapse size={16} className="mr-1" />
          <span className="hidden sm:inline">{t("dify.sessions.label")}</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="overflow-y-auto sm:max-w-[950px]" onCloseAutoFocus={onReset}>
        <DialogHeader>
          <DialogTitle>{t("dify.sessions.label")}</DialogTitle>
        </DialogHeader>
        <div>
          <div className="flex items-center justify-between gap-6 p-5">
            <Input placeholder={t("dify.sessions.search")} value={globalFilter} onChange={(event) => setGlobalFilter(event.target.value)} />
            <Button variant="outline" onClick={onReset} size="icon">
              <RotateCcw />
            </Button>
          </div>
          <DataTable
            columns={columns}
            data={sessions ?? []}
            onSortingChange={setSorting}
            state={{ sorting, globalFilter }}
            onGlobalFilterChange={setGlobalFilter}
            enableGlobalFilter
            noResultsMessage={t("dify.sessions.table.none")}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}

export { SessionsDify };
