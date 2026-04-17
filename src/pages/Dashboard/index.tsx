import { Button } from "@evoapi/design-system/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@evoapi/design-system/skeleton";
import { Layers, Plus, RefreshCw, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";

import { BaseHeader } from "@/components/base-header";
import { InstanceCard } from "@/components/instance-card";

import { useFetchInstances } from "@/lib/queries/instance/fetchInstances";
import { useManageInstance } from "@/lib/queries/instance/manageInstance";

import { Instance } from "@/types/evolution.types";

import { NewInstance } from "./NewInstance";

function Dashboard() {
  const { t } = useTranslation();

  const [createOpen, setCreateOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Instance | null>(null);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [deletingName, setDeletingName] = useState<string | null>(null);
  const [nameSearch, setNameSearch] = useState("");

  const { deleteInstance, logout } = useManageInstance();
  const { data: instances, isLoading, refetch } = useFetchInstances();

  const resetTable = async () => {
    await refetch();
  };

  const closeDeleteModal = () => {
    setDeleteTarget(null);
    setDeleteConfirmText("");
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    const name = deleteTarget.name;
    setDeletingName(name);
    try {
      try {
        await logout(name);
      } catch (error) {
        console.error("Error logout:", error);
      }
      await deleteInstance(name);
      await new Promise((resolve) => setTimeout(resolve, 1000));
      await resetTable();
      toast.success(t("toast.instance.deleted", { defaultValue: "Instância removida com sucesso!" }));
      closeDeleteModal();
    } catch (error: unknown) {
      console.error("Error instance delete:", error);
      const message = error instanceof Error ? error.message : "Erro ao remover instância";
      toast.error(message);
    } finally {
      setDeletingName(null);
    }
  };

  const filteredInstances = useMemo(() => {
    const list = instances ?? [];
    if (!nameSearch.trim()) return list;
    const q = nameSearch.toLowerCase();
    return list.filter((i) => i.name.toLowerCase().includes(q) || (i.profileName && i.profileName.toLowerCase().includes(q)));
  }, [instances, nameSearch]);

  const totalCount = filteredInstances.length;
  const confirmValid = deleteConfirmText === deleteTarget?.name;

  return (
    <div className="flex h-full flex-col">
      <BaseHeader
        title={t("dashboard.title")}
        subtitle={t("dashboard.subtitle", { defaultValue: "Gerencie suas instâncias WhatsApp" })}
        searchValue={nameSearch}
        onSearchChange={setNameSearch}
        searchPlaceholder={t("dashboard.search")}
        primaryAction={{
          label: t("instance.button.create"),
          icon: <Plus className="h-4 w-4" />,
          onClick: () => setCreateOpen(true),
        }}
        secondaryActions={[
          {
            label: t("button.refresh", { defaultValue: "Atualizar" }),
            icon: <RefreshCw className="h-4 w-4" />,
            onClick: resetTable,
          },
        ]}
      />

      <div className="flex-1">
        {isLoading ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-56 rounded-lg" />
            ))}
          </div>
        ) : totalCount === 0 ? (
          <div className="flex min-h-[40vh] flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-sidebar-border p-8 text-center">
            <Layers className="h-10 w-10 text-muted-foreground" />
            <div>
              <h3 className="text-lg font-semibold">{t("dashboard.empty.title", { defaultValue: "Nenhuma instância encontrada" })}</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                {t("dashboard.empty.description", { defaultValue: "Crie sua primeira instância para começar" })}
              </p>
            </div>
            <Button onClick={() => setCreateOpen(true)} className="mt-2">
              <Plus className="mr-2 h-4 w-4" />
              {t("instance.button.create")}
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredInstances.map((instance) => (
              <InstanceCard
                key={instance.id}
                instance={instance}
                isDeleting={deletingName === instance.name}
                onDelete={(inst) => setDeleteTarget(inst)}
              />
            ))}
          </div>
        )}
      </div>

      <NewInstance resetTable={resetTable} open={createOpen} onOpenChange={setCreateOpen} />

      <Dialog open={!!deleteTarget} onOpenChange={(o) => !o && closeDeleteModal()}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-500">
              <Trash2 className="h-5 w-5" />
              {t("modal.delete.title")}
            </DialogTitle>
            <DialogDescription>
              {t("modal.delete.message", { instanceName: deleteTarget?.name ?? "" })}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2">
            <label className="text-sm font-medium">
              {t("modal.delete.confirm", { defaultValue: "Digite o nome da instância para confirmar:" })}
            </label>
            <Input
              placeholder={deleteTarget?.name}
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
            />
          </div>

          <DialogFooter className="flex gap-2">
            <Button variant="outline" onClick={closeDeleteModal}>
              {t("button.cancel")}
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={!confirmValid || deletingName === deleteTarget?.name}
            >
              {deletingName === deleteTarget?.name ? t("button.deleting") : t("button.delete")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default Dashboard;
