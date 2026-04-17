import { zodResolver } from "@hookform/resolvers/zod";
import { Alert, AlertDescription, AlertTitle } from "@evoapi/design-system/alert";
import { Button } from "@evoapi/design-system/button";
import { Input } from "@/components/ui/input";
import { Label } from "@evoapi/design-system/label";
import { AlertCircle, Loader2 } from "lucide-react";
import { useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { z } from "zod";

import { Form, FormSelect } from "@/components/ui/form";
import { useTheme } from "@/components/theme-provider";

import { verifyCreds } from "@/lib/queries/auth/verifyCreds";
import { verifyGoServer } from "@/lib/queries/auth/verifyGoServer";
import { verifyServer } from "@/lib/queries/auth/verifyServer";
import { DEFAULT_PROVIDER, logout, saveToken } from "@/lib/queries/token";

const loginSchema = z.object({
  provider: z.enum(["api", "go"]).default(DEFAULT_PROVIDER),
  serverUrl: z.string({ required_error: "serverUrl is required" }).url("URL inválida"),
  apiKey: z.string({ required_error: "ApiKey is required" }).min(1, "API Key é obrigatória"),
});
type LoginSchema = z.infer<typeof loginSchema>;

function Login() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { theme } = useTheme();
  const [loginError, setLoginError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const logoSrc =
    theme === "dark"
      ? "https://evolution-api.com/files/evo/evolution-logo-white.svg"
      : "https://evolution-api.com/files/evo/evolution-logo.svg";

  const loginForm = useForm<LoginSchema>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      provider: DEFAULT_PROVIDER,
      serverUrl: window.location.protocol + "//" + window.location.host,
      apiKey: "",
    },
  });

  const handleLogin: SubmitHandler<LoginSchema> = async (data) => {
    setSubmitting(true);
    setLoginError("");
    try {
      if (data.provider === "go") {
        const ok = await verifyGoServer({ url: data.serverUrl, token: data.apiKey });
        if (!ok) {
          logout();
          const msg = t("login.message.invalidCredentials");
          loginForm.setError("apiKey", { type: "manual", message: msg });
          setLoginError(msg);
          return;
        }
        saveToken({ url: data.serverUrl, token: data.apiKey, provider: "go" });
        navigate("/manager/");
        return;
      }

      const server = await verifyServer({ url: data.serverUrl });
      if (!server || !server.version) {
        logout();
        const msg = t("login.message.invalidServer");
        loginForm.setError("serverUrl", { type: "manual", message: msg });
        setLoginError(msg);
        return;
      }

      const verify = await verifyCreds({ token: data.apiKey, url: data.serverUrl });
      if (!verify) {
        const msg = t("login.message.invalidCredentials");
        loginForm.setError("apiKey", { type: "manual", message: msg });
        setLoginError(msg);
        return;
      }

      saveToken({
        version: server.version,
        clientName: server.clientName,
        url: data.serverUrl,
        token: data.apiKey,
        provider: "api",
      });
      navigate("/manager/");
    } finally {
      setSubmitting(false);
    }
  };

  const errors = loginForm.formState.errors;

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-gradient-to-t from-primary/20 via-background/95 to-background p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="flex flex-col items-center text-center">
          <img src={logoSrc} alt="Evolution API" className="mb-3 h-10" />
          <p className="text-sm text-muted-foreground">{t("login.description")}</p>
        </div>

        <div className="rounded-lg border bg-background/80 p-6 shadow-lg backdrop-blur-sm">
          <div className="mb-6 space-y-2">
            <h2 className="text-2xl font-bold">{t("login.title")}</h2>
            <p className="text-sm text-muted-foreground">
              {t("login.subtitle", { defaultValue: "Digite suas credenciais para acessar o sistema" })}
            </p>
          </div>

          {loginError && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Erro</AlertTitle>
              <AlertDescription>{loginError}</AlertDescription>
            </Alert>
          )}

          <Form {...loginForm}>
            <form onSubmit={loginForm.handleSubmit(handleLogin)} className="space-y-4">
              <FormSelect
                required
                name="provider"
                label="Provider"
                options={[
                  { value: "api", label: "Evolution API" },
                  { value: "go", label: "Evolution GO" },
                ]}
              />

              <div className="space-y-2">
                <Label htmlFor="login-serverUrl">
                  {t("login.form.serverUrl")} <span className="text-rose-600">*</span>
                </Label>
                <Input
                  id="login-serverUrl"
                  type="text"
                  placeholder={window.location.origin}
                  disabled={submitting}
                  {...loginForm.register("serverUrl")}
                />
                {errors.serverUrl && <p className="text-sm text-destructive">{errors.serverUrl.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="login-apiKey">
                  {t("login.form.apiKey")} <span className="text-rose-600">*</span>
                </Label>
                <Input
                  id="login-apiKey"
                  type="password"
                  placeholder="Sua chave de API"
                  disabled={submitting}
                  {...loginForm.register("apiKey")}
                />
                {errors.apiKey && <p className="text-sm text-destructive">{errors.apiKey.message}</p>}
              </div>

              <Button type="submit" disabled={submitting} className="w-full">
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t("login.button.connecting", { defaultValue: "Conectando..." })}
                  </>
                ) : (
                  t("login.button.login")
                )}
              </Button>
            </form>
          </Form>
        </div>

        <div className="text-center text-xs text-muted-foreground">
          <p>
            © {new Date().getFullYear()} Evolution API ·{" "}
            <a href="https://doc.evolution-api.com" target="_blank" rel="noreferrer" className="underline hover:text-primary">
              Documentação
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
