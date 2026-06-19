// License activation callback — mirrors evolution-go-manager/src/pages/LicenseCallback.tsx.
// Lands here as /manager/license/callback?code=XXX after the user finishes registration on
// the licensing server. Reads ?code, calls /license/activate on the local Evolution API, and
// redirects back to /manager (or back to /manager/login on failure).

import { Button } from "@evoapi/design-system/button";
import { LOGO_SRC } from "@/lib/constants";
import { CheckCircle, Loader2, XCircle } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useSearchParams } from "react-router-dom";

import { activateLicense } from "@/lib/queries/license/license";
import { getToken, TOKEN_ID } from "@/lib/queries/token";

type State = "activating" | "success" | "error";

function LicenseCallback() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const code = searchParams.get("code") ?? "";

  const [state, setState] = useState<State>("activating");
  const [errorMessage, setErrorMessage] = useState("");

  const logoSrc = LOGO_SRC;

  const doActivate = useCallback(async () => {
    setState("activating");
    setErrorMessage("");

    if (!code) {
      setState("error");
      setErrorMessage(t("license.callback.missingCode"));
      return;
    }

    const apiUrl = getToken(TOKEN_ID.API_URL);
    const apiKey = getToken(TOKEN_ID.TOKEN);

    if (!apiUrl || !apiKey) {
      setState("error");
      setErrorMessage(t("license.callback.missingCredentials"));
      return;
    }

    try {
      const result = await activateLicense(code, apiUrl, apiKey);
      if (result.status === "active") {
        setState("success");
        // Small pause so the user actually sees the success state.
        setTimeout(() => navigate("/manager", { replace: true }), 1500);
        return;
      }
      setState("error");
      setErrorMessage(result.message || result.error || t("license.callback.genericError"));
    } catch (err: unknown) {
      setState("error");
      const msg =
        (err as { response?: { data?: { details?: string; message?: string } }; message?: string })
          ?.response?.data?.details ??
        (err as { response?: { data?: { details?: string; message?: string } }; message?: string })
          ?.response?.data?.message ??
        (err as { message?: string })?.message ??
        t("license.callback.genericError");
      setErrorMessage(typeof msg === "string" ? msg : t("license.callback.genericError"));
    }
  }, [code, navigate, t]);

  useEffect(() => {
    doActivate();
  }, [doActivate]);

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-gradient-to-t from-primary/20 via-background/95 to-background p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="flex flex-col items-center text-center">
          <img src={logoSrc} alt="Evolution API" className="mb-3 h-10" />
          <p className="text-sm text-muted-foreground">{t("license.callback.title")}</p>
        </div>

        <div className="space-y-4 rounded-lg border bg-background/80 p-8 text-center shadow-lg backdrop-blur-sm">
          {state === "activating" && (
            <>
              <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary" />
              <h2 className="text-xl font-semibold">{t("license.callback.title")}</h2>
              <p className="text-muted-foreground">{t("license.callback.activating")}</p>
            </>
          )}

          {state === "success" && (
            <>
              <CheckCircle className="mx-auto h-12 w-12 text-green-500" />
              <h2 className="text-xl font-semibold">{t("license.callback.successTitle")}</h2>
              <p className="text-muted-foreground">{t("license.callback.successDescription")}</p>
            </>
          )}

          {state === "error" && (
            <>
              <XCircle className="mx-auto h-12 w-12 text-destructive" />
              <h2 className="text-xl font-semibold">{t("license.callback.errorTitle")}</h2>
              <p className="text-muted-foreground">{errorMessage}</p>
              <div className="flex justify-center gap-2 pt-2">
                <Button variant="outline" onClick={() => navigate("/manager/login", { replace: true })}>
                  {t("license.callback.back")}
                </Button>
                <Button onClick={doActivate}>{t("license.callback.retry")}</Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default LicenseCallback;
