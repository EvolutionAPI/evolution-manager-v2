import { useQuery } from "@tanstack/react-query";

import { mergeMessagesByKeyId, messageRecordsFromResponse } from "@/lib/chat/identity";
import { Message } from "@/types/evolution.types";

import { api } from "../api";
import { UseQueryParams } from "../types";
import { FindMessagesResponse } from "./types";

export { messageRecordsFromResponse };

interface IParams {
  instanceName: string;
  remoteJid: string;
}

const queryKey = (params: Partial<IParams>) => ["chats", "findMessages", JSON.stringify(params)];

export const findMessages = async ({ instanceName, remoteJid }: IParams): Promise<Message[]> => {
  const url = `/chat/findMessages/${instanceName}`;
  const primaryRequest = api.post(url, {
    where: { key: { remoteJid } },
  });
  const alternateRequest = api
    .post(url, {
      where: { key: { remoteJidAlt: remoteJid } },
    })
    .then((response) => messageRecordsFromResponse(response.data) as Message[])
    .catch(() => [] as Message[]);

  const [primaryResponse, alternateRecords] = await Promise.all([primaryRequest, alternateRequest]);
  const primaryRecords = messageRecordsFromResponse(primaryResponse.data) as Message[];

  return mergeMessagesByKeyId([primaryRecords, alternateRecords]);
};

export const useFindMessages = (props: UseQueryParams<FindMessagesResponse> & Partial<IParams>) => {
  const { instanceName, remoteJid, ...rest } = props;
  return useQuery<FindMessagesResponse>({
    ...rest,
    queryKey: queryKey({ instanceName, remoteJid }),
    queryFn: () => findMessages({ instanceName: instanceName!, remoteJid: remoteJid! }),
    enabled: !!instanceName && !!remoteJid,
  });
};
