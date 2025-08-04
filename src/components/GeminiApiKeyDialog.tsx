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
import { GeminiService } from "@/services/GeminiService";
import { useToast } from "@/hooks/use-toast";

interface GeminiApiKeyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onApiKeySet: () => void;
}

export const GeminiApiKeyDialog = ({ open, onOpenChange, onApiKeySet }: GeminiApiKeyDialogProps) => {
  const [geminiKey, setGeminiKey] = useState("");
  const [showGeminiKey, setShowGeminiKey] = useState(false);
  const [isTestingGemini, setIsTestingGemini] = useState(false);
  const [geminiError, setGeminiError] = useState("");
  const { toast } = useToast();

  const handleSaveGemini = async () => {
    if (!geminiKey.trim()) {
      setGeminiError("Please enter your Gemini API key");
      return;
    }

    setIsTestingGemini(true);
    setGeminiError("");

    try {
      const isValid = await GeminiService.testApiKey(geminiKey.trim());
      
      if (isValid) {
        GeminiService.saveApiKey(geminiKey.trim());
        toast({
          title: "Success",
          description: "Gemini API key saved successfully!",
        });
        onApiKeySet();
        onOpenChange(false);
        setGeminiKey("");
      } else {
        setGeminiError("Invalid API key. Please check and try again.");
      }
    } catch (error) {
      setGeminiError("Failed to validate API key. Please try again.");
    } finally {
      setIsTestingGemini(false);
    }
  };

  const handleClearGemini = () => {
    GeminiService.clearApiKey();
    toast({
      title: "API Key Cleared",
      description: "Gemini API key has been removed.",
    });
    onOpenChange(false);
  };

  const existingGeminiKey = GeminiService.getApiKey();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            Gemini API Configuration
          </DialogTitle>
          <DialogDescription>
            Configure your Gemini API key to enable AI-powered responses from Google's Gemini.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {!existingGeminiKey && (
            <Alert>
              <AlertDescription>
                Get your API key from{" "}
                <a 
                  href="https://aistudio.google.com/app/apikey" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-primary hover:underline"
                >
                  Google AI Studio
                  <ExternalLink className="h-3 w-3" />
                </a>
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="gemini-key">
              {existingGeminiKey ? "New Gemini API Key" : "Gemini API Key"}
            </Label>
            <div className="relative">
              <Input
                id="gemini-key"
                type={showGeminiKey ? "text" : "password"}
                placeholder={existingGeminiKey ? "Enter new API key..." : "Enter your Gemini API key..."}
                value={geminiKey}
                onChange={(e) => {
                  setGeminiKey(e.target.value);
                  setGeminiError("");
                }}
                className="pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowGeminiKey(!showGeminiKey)}
              >
                {showGeminiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          {geminiError && (
            <Alert variant="destructive">
              <AlertDescription>{geminiError}</AlertDescription>
            </Alert>
          )}

          {existingGeminiKey && (
            <Alert>
              <AlertDescription>
                Current API key: {existingGeminiKey.substring(0, 7)}...{existingGeminiKey.substring(existingGeminiKey.length - 4)}
              </AlertDescription>
            </Alert>
          )}

          <div className="flex justify-between">
            {existingGeminiKey && (
              <Button variant="outline" onClick={handleClearGemini}>
                Clear
              </Button>
            )}
            <Button 
              onClick={handleSaveGemini} 
              disabled={isTestingGemini || !geminiKey.trim()}
              className="bg-gradient-to-r from-primary to-primary-glow ml-auto"
            >
              {isTestingGemini ? "Testing..." : existingGeminiKey ? "Update" : "Save"}
            </Button>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};