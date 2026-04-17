import { useQueryClient } from "@tanstack/react-query";

import { Proxy } from "@/types/evolution.types";

import { api } from "../api";
import { buildGoProxyMutations } from "../go/proxy/manageProxy";
import { useManageMutation } from "../mutateQuery";
import { getProvider } from "../token";

interface IParams {
  instanceName: string;
  token: string;
  data: Proxy;
}

const createProxy = async ({ instanceName, token, data }: IParams) => {
  const response = await api.post(`/proxy/set/${instanceName}`, data, {
    headers: { apikey: token },
  });
  return response.data;
};

export function useManageProxy() {
  const qc = useQueryClient();
  const provider = getProvider();
  const go = provider === "go" ? buildGoProxyMutations(qc) : null;

  const createProxyMutation = useManageMutation(go ? go.createProxy : createProxy, {
    invalidateKeys: [["proxy", "fetchProxy"]],
  });

  return {
    createProxy: createProxyMutation,
  };
}
