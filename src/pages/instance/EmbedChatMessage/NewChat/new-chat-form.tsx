import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { z } from "zod";

import { Button } from "@evoapi/design-system/button";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";

import { useEmbedColors } from "@/contexts/EmbedColorsContext";

const newChatSchema = z.object({
  remoteJid: z.string().min(1),
});

type NewChatSchema = z.infer<typeof newChatSchema>;

interface NewChatFormProps {
  onSuccess: (data: NewChatSchema) => void;
}

function NewChatForm({ onSuccess }: NewChatFormProps) {
  const { t } = useTranslation();
  const { primaryColor } = useEmbedColors();
  const form = useForm<NewChatSchema>({
    resolver: zodResolver(newChatSchema),
    defaultValues: {
      remoteJid: "",
    },
  });

  const handleSubmit = (data: NewChatSchema) => {
    onSuccess(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)}>
        <FormField
          control={form.control}
          name="remoteJid"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("chat.newChat.contact")}</FormLabel>
              <FormControl>
                <Input type="text" placeholder={t("chat.newChat.placeholder")} {...field} />
              </FormControl>
            </FormItem>
          )}
        />
        <div className="flex justify-end">
          <Button type="submit" className="mt-4" style={{ backgroundColor: primaryColor }}>
            {t("chat.newChat.submit")}
          </Button>
        </div>
      </form>
    </Form>
  );
}

export { NewChatForm };
