import { useQuery } from "@tanstack/react-query";

import { api } from "../api";
import { UseQueryParams } from "../types";
import { FindChatsResponse } from "./types";

export type FindChatsApiChat = Omit<Partial<FindChatsResponse[number]>, "id"> &
  Pick<FindChatsResponse[number], "remoteJid"> & {
    id?: string | null;
  };

interface IParams {
  instanceName: string;
}

const queryKey = (params: Partial<IParams>) => ["chats", "findChats", JSON.stringify(params)];

export const normalizeChat = (chat: FindChatsApiChat): FindChatsResponse[number] => ({
  ...chat,
  id: chat.id ?? chat.remoteJid,
  pushName: chat.pushName ?? "",
  labels: chat.labels ?? null,
  profilePicUrl: chat.profilePicUrl ?? "",
  createdAt: chat.createdAt ?? "",
  updatedAt: chat.updatedAt ?? "",
  instanceId: chat.instanceId ?? "",
});

export const findChats = async ({ instanceName }: IParams): Promise<FindChatsResponse> => {
  const response = await api.post<FindChatsApiChat[]>(`/chat/findChats/${instanceName}`, {
    where: {},
  });
  return response.data.map(normalizeChat);
};

export const useFindChats = (props: UseQueryParams<FindChatsResponse> & Partial<IParams>) => {
  const { instanceName, ...rest } = props;
  return useQuery<FindChatsResponse>({
    ...rest,
    queryKey: queryKey({ instanceName }),
    queryFn: () => findChats({ instanceName: instanceName! }),
    enabled: !!instanceName,
  });
};
