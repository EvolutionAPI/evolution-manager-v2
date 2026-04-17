import { useQuery } from "@tanstack/react-query";

import { apiGlobal } from "../api";
import { useFetchInstanceGo } from "../go/instance/fetchInstance";
import { getProvider } from "../token";
import { UseQueryParams } from "../types";
import { FetchInstanceResponse } from "./types";

interface IParams {
  instanceId: string | null;
}

const queryKey = (params: Partial<IParams>) => ["instance", "fetchInstance", JSON.stringify(params)];

export const fetchInstance = async ({ instanceId }: IParams) => {
  const response = await apiGlobal.get(`/instance/fetchInstances`, {
    params: { instanceId },
  });
  if (Array.isArray(response.data)) {
    return response.data[0];
  }
  return response.data;
};

const useFetchInstanceApi = (props: UseQueryParams<FetchInstanceResponse> & Partial<IParams>) => {
  const { instanceId, enabled, ...rest } = props;
  return useQuery<FetchInstanceResponse>({
    ...rest,
    queryKey: queryKey({ instanceId }),
    queryFn: () => fetchInstance({ instanceId: instanceId! }),
    enabled: !!instanceId && (enabled ?? true),
  });
};

export const useFetchInstance = (props: UseQueryParams<FetchInstanceResponse> & Partial<IParams>) => {
  const provider = getProvider();
  const apiQuery = useFetchInstanceApi({ ...props, enabled: (props.enabled ?? true) && provider === "api" });
  const goQuery = useFetchInstanceGo({ ...props, enabled: (props.enabled ?? true) && provider === "go" });

  return provider === "go" ? goQuery : apiQuery;
};
