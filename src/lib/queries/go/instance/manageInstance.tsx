import { QueryClient } from "@tanstack/react-query";

import { Instance, NewInstance, Settings } from "@/types/evolution.types";

import { apiGlobal } from "../../api";
import { toGoAdvancedSettings } from "./settingsFind";

const findByName = (qc: QueryClient, name: string): Instance | undefined => {
  const list = qc.getQueryData<Instance[]>(["instance", "fetchInstances", "go"]);
  const fromList = list?.find((i) => i.name === name);
  if (fromList) return fromList;

  const singleEntries = qc.getQueriesData<Instance>({ queryKey: ["instance", "fetchInstance", "go"] });
  for (const [, data] of singleEntries) {
    if (data?.name === name) return data;
  }
  return undefined;
};

export const buildGoInstanceMutations = (qc: QueryClient) => {
  const createInstance = async (instance: NewInstance & { proxy?: { host: string; port: string; username?: string; password?: string } }) => {
    const payload: Record<string, unknown> = {
      name: instance.instanceName,
      token: instance.token ?? undefined,
    };
    if (instance.proxy?.host && instance.proxy?.port) {
      payload.proxy = {
        host: instance.proxy.host,
        port: instance.proxy.port,
        username: instance.proxy.username ?? "",
        password: instance.proxy.password ?? "",
      };
    }
    const response = await apiGlobal.post(`/instance/create`, payload);
    return response.data;
  };

  const restart = async (instanceName: string) => {
    const inst = findByName(qc, instanceName);
    if (!inst) throw new Error(`Instance "${instanceName}" not found in cache`);
    const response = await apiGlobal.post(`/instance/reconnect`, {}, { headers: { apikey: inst.token } });
    return response.data;
  };

  const logout = async (instanceName: string) => {
    const inst = findByName(qc, instanceName);
    if (!inst) throw new Error(`Instance "${instanceName}" not found in cache`);
    const response = await apiGlobal.delete(`/instance/logout`, { headers: { apikey: inst.token } });
    return response.data;
  };

  const deleteInstance = async (instanceName: string) => {
    const inst = findByName(qc, instanceName);
    if (!inst) throw new Error(`Instance "${instanceName}" not found in cache`);
    const response = await apiGlobal.delete(`/instance/delete/${inst.id}`);
    return response.data;
  };

  const connect = async ({ instanceName, token: providedToken, number }: { instanceName: string; token: string; number?: string }) => {
    const inst = findByName(qc, instanceName);
    const apikey = inst?.token ?? providedToken;
    if (!apikey) throw new Error(`Instance "${instanceName}" not found in cache`);

    const connectPayload = {
      webhookUrl: "",
      subscribe: [] as string[],
      rabbitmqEnable: "",
      websocketEnable: "",
      natsEnable: "",
    };
    try {
      await apiGlobal.post(`/instance/connect`, connectPayload, { headers: { apikey } });
    } catch {
      // Instance may already be initializing; ignore and continue
    }

    await new Promise((resolve) => setTimeout(resolve, 1000));

    const normalizeBase64 = (raw: string) => (!raw ? "" : raw.startsWith("data:") ? raw : `data:image/png;base64,${raw}`);

    const tryGetQr = async (): Promise<{ code: string; base64: string }> => {
      try {
        const qrResponse = await apiGlobal.get(`/instance/qr`, { headers: { apikey } });
        const qrData = qrResponse.data?.data ?? qrResponse.data;
        return {
          code: qrData?.Code ?? qrData?.code ?? "",
          base64: normalizeBase64(qrData?.Qrcode ?? qrData?.qrcode ?? ""),
        };
      } catch {
        return { code: "", base64: "" };
      }
    };

    if (number) {
      let phone = number.trim();
      if (!phone.startsWith("+")) phone = `+${phone}`;

      const pairResponse = await apiGlobal.post(`/instance/pair`, { subscribe: [], phone }, { headers: { apikey } });
      const pairData = pairResponse.data?.data ?? pairResponse.data;
      const pairingCode = pairData?.PairingCode ?? pairData?.pairingCode ?? "";
      const qr = await tryGetQr();
      return { ...qr, pairingCode };
    }

    const qr = await tryGetQr();
    return { ...qr, pairingCode: "" };
  };

  const updateSettings = async ({ instanceName, token, data }: { instanceName: string; token: string; data: Settings }) => {
    const inst = findByName(qc, instanceName);
    if (!inst) throw new Error(`Instance "${instanceName}" not found in cache`);
    const response = await apiGlobal.put(`/instance/${inst.id}/advanced-settings`, toGoAdvancedSettings(data), {
      headers: { apikey: token },
    });
    return response.data;
  };

  return { createInstance, restart, logout, deleteInstance, connect, updateSettings };
};
