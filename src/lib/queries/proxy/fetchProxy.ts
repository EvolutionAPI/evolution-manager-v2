import { useQuery } from "@tanstack/react-query";

import { api } from "../api";
import { useFetchProxyGo } from "../go/proxy/fetchProxy";
import { getProvider } from "../token";
import { UseQueryParams } from "../types";
import { FetchProxyResponse } from "./types";

interface IParams {
  instanceName: string | null;
  token: string;
}

const queryKey = (params: Partial<IParams>) => ["proxy", "fetchProxy", JSON.stringify(params)];

export const fetchProxy = async ({ instanceName, token }: IParams) => {
  const response = await api.get(`/proxy/find/${instanceName}`, {
    headers: { apiKey: token },
  });
  return response.data;
};

const useFetchProxyApi = (props: UseQueryParams<FetchProxyResponse> & Partial<IParams>) => {
  const { instanceName, token, enabled, ...rest } = props;
  return useQuery<FetchProxyResponse>({
    ...rest,
    queryKey: queryKey({ instanceName, token }),
    queryFn: () => fetchProxy({ instanceName: instanceName!, token: token! }),
    enabled: !!instanceName && (enabled ?? true),
  });
};

export const useFetchProxy = (props: UseQueryParams<FetchProxyResponse> & Partial<IParams>) => {
  const provider = getProvider();
  const apiQuery = useFetchProxyApi({ ...props, enabled: (props.enabled ?? true) && provider === "api" });
  const goQuery = useFetchProxyGo({ ...props, enabled: (props.enabled ?? true) && provider === "go" });

  return provider === "go" ? goQuery : apiQuery;
};
