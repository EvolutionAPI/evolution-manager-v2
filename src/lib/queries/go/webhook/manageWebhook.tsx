import { QueryClient } from "@tanstack/react-query";

import { Instance, Webhook } from "@/types/evolution.types";

import { apiGlobal } from "../../api";

export const buildGoWebhookMutations = (qc: QueryClient) => {
  const findInstance = (name: string): Instance | undefined => {
    const list = qc.getQueryData<Instance[]>(["instance", "fetchInstances", "go"]);
    const fromList = list?.find((i) => i.name === name);
    if (fromList) return fromList;
    const singleEntries = qc.getQueriesData<Instance>({ queryKey: ["instance", "fetchInstance", "go"] });
    for (const [, data] of singleEntries) {
      if (data?.name === name) return data;
    }
    return undefined;
  };

  const createWebhook = async ({ instanceName, data }: { instanceName: string; token: string; data: Webhook }) => {
    const inst = findInstance(instanceName);
    if (!inst) throw new Error(`Instance "${instanceName}" not found in cache`);

    const payload = {
      webhookUrl: data.url ?? "",
      subscribe: data.events ?? [],
      rabbitmqEnable: "",
      websocketEnable: "",
      natsEnable: "",
    };

    const response = await apiGlobal.post(`/instance/connect`, payload, {
      headers: { apikey: inst.token },
    });
    return response.data;
  };

  return { createWebhook };
};
