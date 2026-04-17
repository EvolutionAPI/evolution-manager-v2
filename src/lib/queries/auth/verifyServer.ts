/* eslint-disable @typescript-eslint/no-explicit-any */
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

import { UseQueryParams } from "../types";

interface IParams {
  url: string | null;
}

const queryKey = (params: Partial<IParams>) => ["auth", "verifyServer", JSON.stringify(params)];

export const verifyServer = async ({ url }: IParams) => {
  const response = await axios.get(`${url}/`);
  return response.data;
};

export const useVerifyServer = (props: UseQueryParams<any> & Partial<IParams>) => {
  const { url, enabled, ...rest } = props;
  return useQuery<any>({
    ...rest,
    queryKey: queryKey({ url }),
    queryFn: () => verifyServer({ url: url! }),
    enabled: !!url && (enabled ?? true),
  });
};
