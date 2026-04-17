import { useQuery } from "@tanstack/react-query";

import { api } from "../api";
import { useFetchWebhookGo } from "../go/webhook/fetchWebhook";
import { getProvider } from "../token";
import { UseQueryParams } from "../types";
import { FetchWebhookResponse } from "./types";

interface IParams {
  instanceName: string | null;
  token: string;
}

const queryKey = (params: Partial<IParams>) => ["webhook", "fetchWebhook", JSON.stringify(params)];

export const fetchWebhook = async ({ instanceName, token }: IParams) => {
  const response = await api.get(`/webhook/find/${instanceName}`, {
    headers: { apiKey: token },
  });
  return response.data;
};

const useFetchWebhookApi = (props: UseQueryParams<FetchWebhookResponse> & Partial<IParams>) => {
  const { instanceName, token, enabled, ...rest } = props;
  return useQuery<FetchWebhookResponse>({
    ...rest,
    queryKey: queryKey({ instanceName, token }),
    queryFn: () => fetchWebhook({ instanceName: instanceName!, token: token! }),
    enabled: !!instanceName && (enabled ?? true),
  });
};

export const useFetchWebhook = (props: UseQueryParams<FetchWebhookResponse> & Partial<IParams>) => {
  const provider = getProvider();
  const apiQuery = useFetchWebhookApi({ ...props, enabled: (props.enabled ?? true) && provider === "api" });
  const goQuery = useFetchWebhookGo({ ...props, enabled: (props.enabled ?? true) && provider === "go" });

  return provider === "go" ? goQuery : apiQuery;
};
