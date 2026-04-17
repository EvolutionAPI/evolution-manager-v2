import { AlertCircle, Clock } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import { Alert, AlertDescription } from "@evoapi/design-system/alert";

interface WindowAlertProps {
  windowExpires: string;
  windowActive: boolean;
}

export function WindowAlert({ windowExpires, windowActive }: WindowAlertProps) {
  const { t } = useTranslation();
  const [timeLeft, setTimeLeft] = useState<string>("");

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const expiresTime = new Date(windowExpires).getTime();
      const difference = expiresTime - now;

      if (difference <= 0) {
        setTimeLeft("");
        return;
      }

      const hours = Math.floor(difference / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));

      setTimeLeft(`${hours}h ${minutes}m`);
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 60000); // Atualiza a cada minuto

    return () => clearInterval(timer);
  }, [windowExpires]);

  if (!windowActive) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{t("chat.window.expired")}</AlertDescription>
      </Alert>
    );
  }

  if (timeLeft) {
    return (
      <Alert className="bg-yellow-50 dark:bg-yellow-950">
        <Clock className="h-4 w-4" />
        <AlertDescription>{t("chat.window.expiresIn", { time: timeLeft })}</AlertDescription>
      </Alert>
    );
  }

  return null;
}
