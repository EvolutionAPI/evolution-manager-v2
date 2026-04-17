import { useQuery } from "@tanstack/react-query";

import { apiGlobal } from "../api";
import { useFetchInstancesGo } from "../go/instance/fetchInstances";
import { getProvider } from "../token";
import { UseQueryParams } from "../types";
import { FetchInstancesResponse } from "./types";

const queryKey = ["instance", "fetchInstances"];

export const fetchInstances = async () => {
  const response = await apiGlobal.get(`/instance/fetchInstances`);
  return response.data;
};

const useFetchInstancesApi = (props?: UseQueryParams<FetchInstancesResponse>) => {
  return useQuery<FetchInstancesResponse>({
    ...props,
    queryKey,
    queryFn: () => fetchInstances(),
  });
};

export const useFetchInstances = (props?: UseQueryParams<FetchInstancesResponse>) => {
  const provider = getProvider();
  const apiQuery = useFetchInstancesApi({ ...props, enabled: (props?.enabled ?? true) && provider === "api" });
  const goQuery = useFetchInstancesGo({ ...props, enabled: (props?.enabled ?? true) && provider === "go" });

  return provider === "go" ? goQuery : apiQuery;
};
