import { useState } from "react";
import { Key, Eye, EyeOff, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { GeminiService } from "@/services/GeminiService";
import { useToast } from "@/hooks/use-toast";

interface ApiKeyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onApiKeySet: () => void;
}

export const ApiKeyDialog = ({ open, onOpenChange, onApiKeySet }: ApiKeyDialogProps) => {
  const [openaiKey, setOpenaiKey] = useState("");
  const [geminiKey, setGeminiKey] = useState("");
  const [showOpenaiKey, setShowOpenaiKey] = useState(false);
  const [showGeminiKey, setShowGeminiKey] = useState(false);
  const [isTestingOpenai, setIsTestingOpenai] = useState(false);
  const [isTestingGemini, setIsTestingGemini] = useState(false);
  const [openaiError, setOpenaiError] = useState("");
  const [geminiError, setGeminiError] = useState("");
  const { toast } = useToast();

  const handleSaveOpenai = async () => {
    if (!openaiKey.trim()) {
      setOpenaiError("Please enter your OpenAI API key");
      return;
    }

    setIsTestingOpenai(true);
    setOpenaiError("");

    try {
      const isValid = await OpenAIService.testApiKey(openaiKey.trim());
      
      if (isValid) {
        OpenAIService.saveApiKey(openaiKey.trim());
        toast({
          title: "Success",
          description: "OpenAI API key saved successfully!",
        });
        onApiKeySet();
        onOpenChange(false);
        setOpenaiKey("");
      } else {
        setOpenaiError("Invalid API key. Please check and try again.");
      }
    } catch (error) {
      setOpenaiError("Failed to validate API key. Please try again.");
    } finally {
      setIsTestingOpenai(false);
    }
  };

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

  const handleClearOpenai = () => {
    OpenAIService.clearApiKey();
    toast({
      title: "API Key Cleared",
      description: "OpenAI API key has been removed.",
    });
  };

  const handleClearGemini = () => {
    GeminiService.clearApiKey();
    toast({
      title: "API Key Cleared",
      description: "Gemini API key has been removed.",
    });
  };

  const existingOpenaiKey = OpenAIService.getApiKey();
  const existingGeminiKey = GeminiService.getApiKey();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            AI API Configuration
          </DialogTitle>
          <DialogDescription>
            Configure your AI API keys to enable intelligent responses. You can use OpenAI, Gemini, or both.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="openai" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="openai" className="flex items-center gap-2">
              OpenAI {existingOpenaiKey && "✓"}
            </TabsTrigger>
            <TabsTrigger value="gemini" className="flex items-center gap-2">
              Gemini {existingGeminiKey && "✓"}
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="openai" className="space-y-4">
            {!existingOpenaiKey && (
              <Alert>
                <AlertDescription>
                  Get your API key from{" "}
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
              <Label htmlFor="openai-key">
                {existingOpenaiKey ? "New OpenAI API Key" : "OpenAI API Key"}
              </Label>
              <div className="relative">
                <Input
                  id="openai-key"
                  type={showOpenaiKey ? "text" : "password"}
                  placeholder={existingOpenaiKey ? "Enter new API key..." : "sk-..."}
                  value={openaiKey}
                  onChange={(e) => {
                    setOpenaiKey(e.target.value);
                    setOpenaiError("");
                  }}
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowOpenaiKey(!showOpenaiKey)}
                >
                  {showOpenaiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            {openaiError && (
              <Alert variant="destructive">
                <AlertDescription>{openaiError}</AlertDescription>
              </Alert>
            )}

            {existingOpenaiKey && (
              <Alert>
                <AlertDescription>
                  Current API key: {existingOpenaiKey.substring(0, 7)}...{existingOpenaiKey.substring(existingOpenaiKey.length - 4)}
                </AlertDescription>
              </Alert>
            )}

            <div className="flex justify-between">
              {existingOpenaiKey && (
                <Button variant="outline" onClick={handleClearOpenai}>
                  Clear
                </Button>
              )}
              <Button 
                onClick={handleSaveOpenai} 
                disabled={isTestingOpenai || !openaiKey.trim()}
                className="bg-gradient-to-r from-primary to-primary-glow ml-auto"
              >
                {isTestingOpenai ? "Testing..." : existingOpenaiKey ? "Update" : "Save"}
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="gemini" className="space-y-4">
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
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};