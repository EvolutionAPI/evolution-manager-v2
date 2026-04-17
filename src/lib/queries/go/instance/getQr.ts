import { apiGlobal } from "../../api";

const normalizeBase64 = (raw: string): string => {
  if (!raw) return "";
  if (raw.startsWith("data:")) return raw;
  return `data:image/png;base64,${raw}`;
};

export const getQrCodeGo = async (instanceToken: string): Promise<{ base64: string; code: string }> => {
  const res = await apiGlobal.get("/instance/qr", { headers: { apikey: instanceToken } });
  const data = res.data?.data ?? res.data;
  return {
    base64: normalizeBase64(data?.Qrcode ?? data?.qrcode ?? ""),
    code: data?.Code ?? data?.code ?? "",
  };
};
