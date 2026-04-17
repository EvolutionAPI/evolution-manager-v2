/* eslint-disable @typescript-eslint/no-explicit-any */
import { zodResolver } from "@hookform/resolvers/zod";
import { ColumnDef, SortingState } from "@tanstack/react-table";
import { ArrowUpDown, Lock, Plus, MoreHorizontal } from "lucide-react";
import { useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import { z } from "zod";

import { Button } from "@evoapi/design-system/button";
import { DataTable } from "@/components/ui/data-table";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@evoapi/design-system/dropdown-menu";
import { FormInput } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Separator } from "@evoapi/design-system/separator";

import { useInstance } from "@/contexts/InstanceContext";

import { useFindOpenaiCreds } from "@/lib/queries/openai/findOpenaiCreds";
import { useManageOpenai } from "@/lib/queries/openai/manageOpenai";

import { OpenaiCreds } from "@/types/evolution.types";

const FormSchema = z.object({
  name: z.string(),
  apiKey: z.string(),
});

interface CredentialsOpenaiProps {
  onCredentialsUpdate?: () => void;
  showText?: boolean;
}

function CredentialsOpenai({ onCredentialsUpdate, showText = true }: CredentialsOpenaiProps) {
  const { t } = useTranslation();
  const { instance } = useInstance();

  const { createOpenaiCreds, deleteOpenaiCreds } = useManageOpenai();
  const [open, setOpen] = useState(false);
  const [sorting, setSorting] = useState<SortingState>([]);
  const { data: creds } = useFindOpenaiCreds({
    instanceName: instance?.name,
    enabled: open,
  });

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      name: "",
      apiKey: "",
    },
  });

  const onSubmit = async (data: z.infer<typeof FormSchema>) => {
    try {
      if (!instance || !instance.name) {
        throw new Error("instance not found.");
      }

      const credsData: OpenaiCreds = {
        name: data.name,
        apiKey: data.apiKey,
      };

      await createOpenaiCreds({
        instanceName: instance.name,
        token: instance.token,
        data: credsData,
      });
      toast.success(t("openai.toast.success.credentialsCreate"));
      form.reset();
      if (onCredentialsUpdate) {
        onCredentialsUpdate();
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error("Error:", error);
      toast.error(`Error: ${error?.response?.data?.response?.message}`);
    }
  };

  const handleDelete = async (id: string) => {
    if (!instance?.name) {
      toast.error("Instance not found.");
      return;
    }
    try {
      await deleteOpenaiCreds({
        openaiCredsId: id,
        instanceName: instance?.name,
      });
      toast.success(t("openai.toast.success.credentialsDelete"));
      if (onCredentialsUpdate) {
        onCredentialsUpdate();
      }
    } catch (error: any) {
      console.error("Error:", error);
      toast.error(`Error: ${error?.response?.data?.response?.message}`);
    }
  };

  const columns: ColumnDef<OpenaiCreds>[] = [
    {
      accessorKey: "name",
      header: ({ column }) => {
        return (
          <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
            {t("openai.credentials.table.name")}
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => <div>{row.getValue("name")}</div>,
    },
    {
      accessorKey: "apiKey",
      header: () => <div className="text-right">{t("openai.credentials.table.apiKey")}</div>,
      cell: ({ row }) => <div>{`${row.getValue("apiKey")}`.slice(0, 20)}...</div>,
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => {
        const creds = row.original;

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">{t("openai.credentials.table.actions.title")}</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>{t("openai.credentials.table.actions.title")}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => handleDelete(creds.id as string)}>{t("openai.credentials.table.actions.delete")}</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="secondary" size="sm" type="button">
          {showText ? (
            <>
              <Lock size={16} className="mr-1" />
              <span className="hidden md:inline">{t("openai.credentials.title")}</span>
            </>
          ) : (
            <Plus size={16} />
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="overflow-y-auto sm:max-h-[600px] sm:max-w-[740px]">
        <DialogHeader>
          <DialogTitle>{t("openai.credentials.title")}</DialogTitle>
        </DialogHeader>
        <FormProvider {...form}>
          <div onClick={(e) => e.stopPropagation()} onSubmit={(e) => e.stopPropagation()} onKeyDown={(e) => e.stopPropagation()}>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                e.stopPropagation();
                form.handleSubmit(onSubmit)(e);
              }}
              className="w-full space-y-6">
              <div>
                <div className="grid gap-3 md:grid-cols-2">
                  <FormInput name="name" label={t("openai.credentials.table.name")}>
                    <Input />
                  </FormInput>
                  <FormInput name="apiKey" label={t("openai.credentials.table.apiKey")}>
                    <Input type="password" />
                  </FormInput>
                </div>
              </div>
              <DialogFooter>
                <Button type="submit">{t("openai.button.save")}</Button>
              </DialogFooter>
            </form>
          </div>
        </FormProvider>
        <Separator />
        <div>
          <DataTable columns={columns} data={creds ?? []} onSortingChange={setSorting} state={{ sorting }} noResultsMessage={t("openai.credentials.table.none")} />
        </div>
      </DialogContent>
    </Dialog>
  );
}

export { CredentialsOpenai };
