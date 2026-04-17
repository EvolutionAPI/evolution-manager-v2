import { useQueryClient } from "@tanstack/react-query";

import { Webhook } from "@/types/evolution.types";

import { api } from "../api";
import { buildGoWebhookMutations } from "../go/webhook/manageWebhook";
import { useManageMutation } from "../mutateQuery";
import { getProvider } from "../token";

interface IParams {
  instanceName: string;
  token: string;
  data: Webhook;
}

const createWebhook = async ({ instanceName, token, data }: IParams) => {
  const response = await api.post(`/webhook/set/${instanceName}`, { webhook: data }, { headers: { apikey: token } });
  return response.data;
};

export function useManageWebhook() {
  const qc = useQueryClient();
  const provider = getProvider();
  const go = provider === "go" ? buildGoWebhookMutations(qc) : null;

  const createWebhookMutation = useManageMutation(go ? go.createWebhook : createWebhook, {
    invalidateKeys: [["webhook", "fetchWebhook"]],
  });

  return {
    createWebhook: createWebhookMutation,
  };
}
