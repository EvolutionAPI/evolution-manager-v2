import { useQuery, useQueryClient } from "@tanstack/react-query";

import { Instance } from "@/types/evolution.types";

import { apiGlobal } from "../../api";
import { UseQueryParams } from "../../types";
import { FetchWebhookResponse } from "../../webhook/types";

interface GoInstanceInfoResponse {
  data: {
    id: string;
    webhook?: string;
    events?: string;
  } & Record<string, unknown>;
  message?: string;
}

interface IParams {
  instanceName: string | null;
  token: string;
}

const queryKey = (params: Partial<IParams>) => ["webhook", "fetchWebhook", "go", JSON.stringify(params)];

const resolveInstanceId = (qc: ReturnType<typeof useQueryClient>, name: string): string | undefined => {
  const list = qc.getQueryData<Instance[]>(["instance", "fetchInstances", "go"]);
  const fromList = list?.find((i) => i.name === name);
  if (fromList) return fromList.id;

  const singleEntries = qc.getQueriesData<Instance>({ queryKey: ["instance", "fetchInstance", "go"] });
  for (const [, data] of singleEntries) {
    if (data?.name === name) return data.id;
  }
  return undefined;
};

export const useFetchWebhookGo = (props: UseQueryParams<FetchWebhookResponse> & Partial<IParams>) => {
  const qc = useQueryClient();
  const { instanceName, token, enabled, ...rest } = props;

  return useQuery<FetchWebhookResponse>({
    ...rest,
    queryKey: queryKey({ instanceName, token }),
    queryFn: async () => {
      const id = resolveInstanceId(qc, instanceName!);
      if (!id) throw new Error(`Instance "${instanceName}" not found in cache`);
      const response = await apiGlobal.get<GoInstanceInfoResponse>(`/instance/info/${id}`);
      const data = response.data?.data;
      const url = data?.webhook ?? "";
      const eventsStr = data?.events ?? "";
      const events = eventsStr ? eventsStr.split(",").map((e) => e.trim()).filter(Boolean) : [];
      return {
        enabled: !!url,
        url,
        events,
        webhookBase64: false,
        webhookByEvents: false,
      };
    },
    enabled: !!instanceName && (enabled ?? true),
    retry: false,
  });
};
