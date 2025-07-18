import { Bot, User } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChatMessageProps {
  message: string;
  isBot: boolean;
  timestamp: Date;
}

export const ChatMessage = ({ message, isBot, timestamp }: ChatMessageProps) => {
  return (
    <div className={cn(
      "flex gap-3 p-4 animate-in slide-in-from-bottom-5 duration-300",
      isBot ? "bg-chat-bot" : "bg-muted/30"
    )}>
      <div className={cn(
        "flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-full",
        isBot 
          ? "bg-primary text-primary-foreground shadow-soft" 
          : "bg-accent text-accent-foreground"
      )}>
        {isBot ? <Bot className="h-4 w-4" /> : <User className="h-4 w-4" />}
      </div>
      
      <div className="flex-1 space-y-2">
        <div className={cn(
          "prose prose-sm max-w-none",
          isBot ? "text-chat-bot-foreground" : "text-foreground"
        )}>
          <p className="leading-relaxed whitespace-pre-wrap">{message}</p>
        </div>
        <div className="text-xs text-muted-foreground">
          {timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
    </div>
  );
};