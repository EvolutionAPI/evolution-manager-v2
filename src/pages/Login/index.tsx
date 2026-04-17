import { zodResolver } from "@hookform/resolvers/zod";
import { SubmitHandler, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { z } from "zod";

import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormInput, FormSelect } from "@/components/ui/form";
import { Input } from "@/components/ui/input";

import { verifyCreds } from "@/lib/queries/auth/verifyCreds";
import { verifyGoServer } from "@/lib/queries/auth/verifyGoServer";
import { verifyServer } from "@/lib/queries/auth/verifyServer";
import { DEFAULT_PROVIDER, logout, saveToken } from "@/lib/queries/token";
import { useTheme } from "@/components/theme-provider";

const loginSchema = z.object({
  provider: z.enum(["api", "go"]).default(DEFAULT_PROVIDER),
  serverUrl: z.string({ required_error: "serverUrl is required" }).url("URL inválida"),
  apiKey: z.string({ required_error: "ApiKey is required" }),
});
type LoginSchema = z.infer<typeof loginSchema>;

function Login() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { theme } = useTheme();
  const loginForm = useForm<LoginSchema>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      provider: DEFAULT_PROVIDER,
      serverUrl: window.location.protocol + "//" + window.location.host,
      apiKey: "",
    },
  });

  const handleLogin: SubmitHandler<LoginSchema> = async (data) => {
    if (data.provider === "go") {
      const ok = await verifyGoServer({ url: data.serverUrl, token: data.apiKey });

      if (!ok) {
        logout();
        loginForm.setError("apiKey", {
          type: "manual",
          message: t("login.message.invalidCredentials"),
        });
        return;
      }

      saveToken({
        url: data.serverUrl,
        token: data.apiKey,
        provider: "go",
      });

      navigate("/manager/");
      return;
    }

    const server = await verifyServer({ url: data.serverUrl });

    if (!server || !server.version) {
      logout();
      loginForm.setError("serverUrl", {
        type: "manual",
        message: t("login.message.invalidServer"),
      });
      return;
    }

    const verify = await verifyCreds({
      token: data.apiKey,
      url: data.serverUrl,
    });

    if (!verify) {
      loginForm.setError("apiKey", {
        type: "manual",
        message: t("login.message.invalidCredentials"),
      });
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
  };

  return (
    <div className="flex min-h-screen flex-col">
      <div className="flex items-center justify-center pt-2">
        <img className="h-10" src={theme === "dark" ? "https://evolution-api.com/files/evo/evolution-logo-white.svg" : "https://evolution-api.com/files/evo/evolution-logo.svg"} alt="logo" />
      </div>
      <div className="flex flex-1 items-center justify-center p-8">
        <Card className="b-none w-[350px] shadow-none">
          <CardHeader>
            <CardTitle className="text-center">{t("login.title")}</CardTitle>
            <CardDescription className="text-center">{t("login.description")}</CardDescription>
          </CardHeader>
          <Form {...loginForm}>
            <form onSubmit={loginForm.handleSubmit(handleLogin)}>
              <CardContent>
                <div className="grid w-full items-center gap-4">
                  <FormSelect
                    required
                    name="provider"
                    label="Provider"
                    options={[
                      { value: "api", label: "Evolution API" },
                      { value: "go", label: "Evolution GO" },
                    ]}
                  />
                  <FormInput required name="serverUrl" label={t("login.form.serverUrl")}>
                    <Input />
                  </FormInput>
                  <FormInput required name="apiKey" label={t("login.form.apiKey")}>
                    <Input type="password" />
                  </FormInput>
                </div>
              </CardContent>
              <CardFooter className="flex justify-center">
                <Button className="w-full" type="submit">
                  {t("login.button.login")}
                </Button>
              </CardFooter>
            </form>
          </Form>
        </Card>
      </div>
      <Footer />
    </div>
  );
}

export default Login;
