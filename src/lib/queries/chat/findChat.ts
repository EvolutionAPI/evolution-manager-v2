import { useQuery } from "@tanstack/react-query";

import { api } from "../api";
import { UseQueryParams } from "../types";
import { FindChatsApiChat, normalizeChat } from "./findChats";
import { FindChatResponse } from "./types";

interface IParams {
  instanceName: string;
  remoteJid: string;
}

const queryKey = (params: Partial<IParams>) => ["chats", "findChats", JSON.stringify(params)];

export const findChat = async ({ instanceName, remoteJid }: IParams): Promise<FindChatResponse> => {
  const response = await api.post<FindChatsApiChat[] | FindChatsApiChat>(`/chat/findChats/${instanceName}`, {
    where: { remoteJid },
  });
  if (Array.isArray(response.data)) {
    return normalizeChat(response.data[0]);
  }
  return normalizeChat(response.data);
};

export const useFindChat = (props: UseQueryParams<FindChatResponse> & Partial<IParams>) => {
  const { instanceName, remoteJid, ...rest } = props;
  return useQuery<FindChatResponse>({
    ...rest,
    queryKey: queryKey({ instanceName, remoteJid }),
    queryFn: () => findChat({ instanceName: instanceName!, remoteJid: remoteJid! }),
    enabled: !!instanceName && !!remoteJid,
  });
};
