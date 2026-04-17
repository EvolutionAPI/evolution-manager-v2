import { apiGlobal } from "../../api";

interface SendTextParams {
  instanceToken: string;
  number: string;
  text: string;
}

export const sendTextGo = async ({ instanceToken, number, text }: SendTextParams) => {
  const response = await apiGlobal.post(
    "/send/text",
    { number, text },
    { headers: { apikey: instanceToken } },
  );
  return response.data;
};
