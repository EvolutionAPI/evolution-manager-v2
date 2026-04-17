import { useQuery } from "@tanstack/react-query";

import { apiGlobal } from "../../api";
import { FetchInstanceResponse } from "../../instance/types";
import { UseQueryParams } from "../../types";

import { GoInstance, toInstance } from "./mapper";

interface GoInstanceResponse {
  data: GoInstance;
  message: string;
}

interface IParams {
  instanceId: string | null;
}

const queryKey = (params: Partial<IParams>) => ["instance", "fetchInstance", "go", JSON.stringify(params)];

export const fetchInstanceGo = async ({ instanceId }: IParams): Promise<FetchInstanceResponse> => {
  const response = await apiGlobal.get<GoInstanceResponse>(`/instance/info/${instanceId}`);
  return toInstance(response.data.data);
};

export const useFetchInstanceGo = (props: UseQueryParams<FetchInstanceResponse> & Partial<IParams>) => {
  const { instanceId, enabled, ...rest } = props;
  return useQuery<FetchInstanceResponse>({
    ...rest,
    queryKey: queryKey({ instanceId }),
    queryFn: () => fetchInstanceGo({ instanceId: instanceId! }),
    enabled: !!instanceId && (enabled ?? true),
  });
};
