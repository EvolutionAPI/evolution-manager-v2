import axios from "axios";

interface VerifyGoServerParams {
  url: string;
  token: string;
}

export const verifyGoServer = async ({ url, token }: VerifyGoServerParams) => {
  try {
    const { data } = await axios.get(`${url}/server/ok`, {
      headers: { apikey: token, "Cache-Control": "no-cache" },
      params: { t: Date.now() },
    });
    return data?.status === "ok";
  } catch (error) {
    return false;
  }
};
