import { AlertCircle } from "lucide-react";
import { ReactNode } from "react";

interface IntegrationDisabledProps {
  name: string;
  envVar: string;
}

export function IntegrationDisabled({ name, envVar }: IntegrationDisabledProps) {
  return (
    <div className="flex min-h-[40vh] flex-col items-center justify-center rounded-lg border border-dashed border-border p-8 text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-muted">
        <AlertCircle className="h-7 w-7 text-muted-foreground" />
      </div>
      <h3 className="mb-2 text-lg font-semibold">Integração {name} desabilitada</h3>
      <p className="max-w-md text-sm text-muted-foreground">
        Esta integração está desativada no servidor. Para habilitá-la, defina{" "}
        <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">{envVar}=true</code>{" "}
        no arquivo <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">.env</code>{" "}
        do evolution-api e reinicie o serviço.
      </p>
    </div>
  );
}

export function isIntegrationDisabledError(error: unknown): boolean {
  if (!error) return false;
  const data = (error as { response?: { data?: { response?: { message?: unknown } } } })?.response?.data?.response;
  const msg = data?.message;
  if (Array.isArray(msg)) return msg.some((m) => typeof m === "string" && /is disabled/i.test(m));
  if (typeof msg === "string") return /is disabled/i.test(msg);
  return false;
}

interface IntegrationGuardProps {
  error: unknown;
  name: string;
  envVar: string;
  children: ReactNode;
}

export function IntegrationGuard({ error, name, envVar, children }: IntegrationGuardProps) {
  if (isIntegrationDisabledError(error)) {
    return <IntegrationDisabled name={name} envVar={envVar} />;
  }
  return <>{children}</>;
}
