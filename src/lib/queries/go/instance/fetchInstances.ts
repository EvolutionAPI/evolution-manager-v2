import { useQuery } from "@tanstack/react-query";

import { apiGlobal } from "../../api";
import { FetchInstancesResponse } from "../../instance/types";
import { UseQueryParams } from "../../types";

import { GoInstance, toInstance } from "./mapper";

interface GoInstancesResponse {
  data: GoInstance[];
  message: string;
}

const queryKey = ["instance", "fetchInstances", "go"];

export const fetchInstancesGo = async (): Promise<FetchInstancesResponse> => {
  const response = await apiGlobal.get<GoInstancesResponse>(`/instance/all`);
  return (response.data?.data ?? []).map(toInstance);
};

export const useFetchInstancesGo = (props?: UseQueryParams<FetchInstancesResponse>) => {
  return useQuery<FetchInstancesResponse>({
    refetchInterval: 5000,
    ...props,
    queryKey,
    queryFn: () => fetchInstancesGo(),
  });
};
