import { Smile, Car, Apple, Flag, ClubIcon as Football, Lightbulb } from "lucide-react";

import { Button } from "@evoapi/design-system/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@evoapi/design-system/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@evoapi/design-system/tabs";

import { useEmbedColors } from "@/contexts/EmbedColorsContext";

const emojiCategories = [
  {
    name: "Smileys",
    icon: Smile,
    emojis: ["😀", "😃", "😄", "😁", "😆", "😅", "😂", "🤣", "😊", "😇"],
  },
  {
    name: "Natureza",
    icon: Apple,
    emojis: ["🌿", "🌱", "🌳", "🌴", "🌵", "🌷", "🌸", "🌹", "🌺", "🌻"],
  },
  {
    name: "Comida",
    icon: Apple,
    emojis: ["🍎", "🍐", "🍊", "🍋", "🍌", "🍉", "🍇", "🍓", "🍒", "🍑"],
  },
  {
    name: "Atividades",
    icon: Football,
    emojis: ["⚽️", "🏀", "🏈", "⚾️", "🎾", "🏐", "🏉", "🎱", "🏓", "🏸"],
  },
  {
    name: "Viagem",
    icon: Car,
    emojis: ["🚗", "🚕", "🚙", "🚌", "🚎", "🏎", "🚓", "🚑", "🚒", "🚐"],
  },
  {
    name: "Objetos",
    icon: Lightbulb,
    emojis: ["💡", "🔦", "🕯", "🧳", "⌛️", "⏳", "🌡", "🧪", "🧬", "🔬"],
  },
  {
    name: "Símbolos",
    icon: Flag,
    emojis: ["❤️", "🧡", "💛", "💚", "💙", "💜", "🖤", "🤍", "🤎", "💔"],
  },
];

interface WhatsAppEmojiBoxProps {
  handleEmojiClick: (emoji: string) => void;
}

export default function WhatsAppEmojiBox({ handleEmojiClick }: WhatsAppEmojiBoxProps) {
  // eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars

  const { inputIconsMainColor } = useEmbedColors();

  const filteredEmojis = (category: string) => {
    const categoryEmojis = emojiCategories.find((c) => c.name === category)?.emojis || [];
    return categoryEmojis;
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button type="button" variant="ghost" size="icon" className="rounded-full p-2">
          <Smile className="h-6 w-6" style={{ color: inputIconsMainColor }} />
          <span className="sr-only">Emojis</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="bg-background p-2" align="end">
        <Tabs defaultValue="Smileys" className="w-full">
          <TabsList className="grid grid-cols-8 gap-2">
            {emojiCategories.map((category) => (
              <TabsTrigger key={category.name} value={category.name}>
                <category.icon className="h-5 w-5" />
              </TabsTrigger>
            ))}
          </TabsList>
          {emojiCategories.map((category) => (
            <TabsContent key={category.name} value={category.name}>
              <div className="grid grid-cols-8 gap-2">
                {filteredEmojis(category.name).map((emoji, index) => (
                  <Button key={index} variant="ghost" className="h-12 p-2 text-2xl" onClick={() => handleEmojiClick(emoji)}>
                    {emoji}
                  </Button>
                ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
