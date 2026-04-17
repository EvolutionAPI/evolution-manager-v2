import { QueryClient } from "@tanstack/react-query";

import { Instance, Proxy } from "@/types/evolution.types";

import { apiGlobal } from "../../api";

export const buildGoProxyMutations = (qc: QueryClient) => {
  const findId = (name: string) => {
    const list = qc.getQueryData<Instance[]>(["instance", "fetchInstances", "go"]);
    return list?.find((i) => i.name === name)?.id;
  };

  const createProxy = async ({ instanceName, data }: { instanceName: string; token: string; data: Proxy }) => {
    const id = findId(instanceName);
    if (!id) throw new Error(`Instance "${instanceName}" not found in cache`);

    const hasConfig = !!data.host && !!data.port;
    if (!hasConfig) {
      const response = await apiGlobal.delete(`/instance/proxy/${id}`);
      return response.data;
    }

    const payload = {
      host: data.host,
      port: data.port,
      username: data.username ?? "",
      password: data.password ?? "",
    };
    const response = await apiGlobal.post(`/instance/proxy/${id}`, payload);
    return response.data;
  };

  return { createProxy };
};
