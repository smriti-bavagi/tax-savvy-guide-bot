import { useState } from "react";
import { Key, Eye, EyeOff, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { OpenAIService } from "@/services/OpenAIService";
import { useToast } from "@/hooks/use-toast";

interface ApiKeyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onApiKeySet: () => void;
}

export const ApiKeyDialog = ({ open, onOpenChange, onApiKeySet }: ApiKeyDialogProps) => {
  const [apiKey, setApiKey] = useState("");
  const [showApiKey, setShowApiKey] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const { toast } = useToast();

  const handleSave = async () => {
    if (!apiKey.trim()) {
      setError("Please enter your OpenAI API key");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const isValid = await OpenAIService.testApiKey(apiKey.trim());
      
      if (isValid) {
        OpenAIService.saveApiKey(apiKey.trim());
        toast({
          title: "Success",
          description: "OpenAI API key saved successfully!",
        });
        onApiKeySet();
        onOpenChange(false);
        setApiKey("");
      } else {
        setError("Invalid API key. Please check and try again.");
      }
    } catch (error) {
      setError("Failed to validate API key. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = () => {
    OpenAIService.clearApiKey();
    toast({
      title: "API Key Cleared",
      description: "OpenAI API key has been removed.",
    });
    onOpenChange(false);
  };

  const existingKey = OpenAIService.getApiKey();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            OpenAI API Configuration
          </DialogTitle>
          <DialogDescription>
            {existingKey 
              ? "You have an API key configured. You can update it or clear it below."
              : "Enter your OpenAI API key to enable intelligent responses for all questions."
            }
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {!existingKey && (
            <Alert>
              <AlertDescription>
                Don't have an API key? Get one from{" "}
                <a 
                  href="https://platform.openai.com/api-keys" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-primary hover:underline"
                >
                  OpenAI Platform
                  <ExternalLink className="h-3 w-3" />
                </a>
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="apikey">
              {existingKey ? "New API Key" : "OpenAI API Key"}
            </Label>
            <div className="relative">
              <Input
                id="apikey"
                type={showApiKey ? "text" : "password"}
                placeholder={existingKey ? "Enter new API key..." : "sk-..."}
                value={apiKey}
                onChange={(e) => {
                  setApiKey(e.target.value);
                  setError("");
                }}
                className="pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowApiKey(!showApiKey)}
              >
                {showApiKey ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {existingKey && (
            <Alert>
              <AlertDescription>
                Current API key: {existingKey.substring(0, 7)}...{existingKey.substring(existingKey.length - 4)}
              </AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter className="flex justify-between">
          {existingKey && (
            <Button variant="outline" onClick={handleClear}>
              Clear API Key
            </Button>
          )}
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleSave} 
              disabled={isLoading || !apiKey.trim()}
              className="bg-gradient-to-r from-primary to-primary-glow"
            >
              {isLoading ? "Validating..." : existingKey ? "Update" : "Save"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};