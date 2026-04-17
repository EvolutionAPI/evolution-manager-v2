import { useQuery, useQueryClient } from "@tanstack/react-query";

import { Instance, Proxy } from "@/types/evolution.types";

import { apiGlobal } from "../../api";
import { FetchProxyResponse } from "../../proxy/types";
import { UseQueryParams } from "../../types";

interface GoProxyConfig {
  host?: string;
  port?: string;
  username?: string;
  password?: string;
}

interface GoInstanceInfoResponse {
  data: { proxy?: string } & Record<string, unknown>;
  message?: string;
}

export const parseGoProxy = (raw: string | undefined | null): Proxy => {
  if (!raw || raw === "") {
    return { enabled: false, host: "", port: "", protocol: "", username: "", password: "" };
  }
  try {
    const parsed = JSON.parse(raw) as GoProxyConfig;
    return {
      enabled: true,
      host: parsed.host ?? "",
      port: parsed.port ?? "",
      protocol: "http",
      username: parsed.username ?? "",
      password: parsed.password ?? "",
    };
  } catch {
    return { enabled: false, host: "", port: "", protocol: "", username: "", password: "" };
  }
};

interface IParams {
  instanceName: string | null;
  token: string;
}

const queryKey = (params: Partial<IParams>) => ["proxy", "fetchProxy", "go", JSON.stringify(params)];

export const useFetchProxyGo = (props: UseQueryParams<FetchProxyResponse> & Partial<IParams>) => {
  const qc = useQueryClient();
  const { instanceName, token, enabled, ...rest } = props;

  return useQuery<FetchProxyResponse>({
    ...rest,
    queryKey: queryKey({ instanceName, token }),
    queryFn: async () => {
      const list = qc.getQueryData<Instance[]>(["instance", "fetchInstances", "go"]);
      let id = list?.find((i) => i.name === instanceName)?.id;
      if (!id) {
        const singleEntries = qc.getQueriesData<Instance>({ queryKey: ["instance", "fetchInstance", "go"] });
        for (const [, data] of singleEntries) {
          if (data?.name === instanceName) {
            id = data.id;
            break;
          }
        }
      }
      if (!id) throw new Error(`Instance "${instanceName}" not found in cache`);
      const response = await apiGlobal.get<GoInstanceInfoResponse>(`/instance/info/${id}`);
      return parseGoProxy(response.data?.data?.proxy);
    },
    enabled: !!instanceName && (enabled ?? true),
    retry: false,
  });
};
