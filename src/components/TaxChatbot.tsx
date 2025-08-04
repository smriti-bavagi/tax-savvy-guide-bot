import { useState, useRef, useEffect } from "react";
import { Send, Calculator, BookOpen, DollarSign, FileText, Settings, Bot } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { ChatMessage } from "./ChatMessage";
import { TaxCalculator } from "./TaxCalculator";
import { ApiKeyDialog } from "./ApiKeyDialog";
import { GeminiApiKeyDialog } from "./GeminiApiKeyDialog";
import { OpenAIService } from "@/services/OpenAIService";
import { GeminiService } from "@/services/GeminiService";
import { useToast } from "@/hooks/use-toast";

interface Message {
  id: string;
  message: string;
  isBot: boolean;
  timestamp: Date;
}

const QUICK_ACTIONS = [
  { icon: Calculator, label: "Calculate Tax", value: "calculate my tax" },
  { icon: BookOpen, label: "Tax Slabs", value: "explain tax slabs" },
  { icon: DollarSign, label: "Deductions", value: "what deductions can I claim" },
  { icon: FileText, label: "ITR Filing", value: "how to file ITR" },
];

const TAX_RESPONSES = {
  "calculate my tax": "I'll help you calculate your tax liability! Please use the calculator below to enter your income details.",
  "explain tax slabs": `Here are the current tax slabs for India:

🆕 **New Tax Regime (2023-24):**
• Up to ₹3,00,000: 0% tax
• ₹3,00,001 - ₹6,00,000: 5% tax
• ₹6,00,001 - ₹9,00,000: 10% tax  
• ₹9,00,001 - ₹12,00,000: 15% tax
• ₹12,00,001 - ₹15,00,000: 20% tax
• Above ₹15,00,000: 30% tax

🔄 **Old Tax Regime:**
• Up to ₹2,50,000: 0% tax
• ₹2,50,001 - ₹5,00,000: 5% tax
• ₹5,00,001 - ₹10,00,000: 20% tax
• Above ₹10,00,000: 30% tax

💡 The new regime has higher exemption limits but doesn't allow most deductions.`,

  "what deductions can I claim": `Here are major deductions under the Old Tax Regime:

💳 **Section 80C (up to ₹1,50,000):**
• EPF, PPF contributions
• Life insurance premiums
• ELSS mutual funds
• NSC, Tax-saving FDs
• Home loan principal repayment

🏥 **Section 80D (Medical Insurance):**
• Self & family: ₹25,000
• Parents (below 60): ₹25,000
• Parents (above 60): ₹50,000

🏠 **Section 80EE/80EEA (Home Loan Interest):**
• First-time buyers: ₹50,000 additional

📚 **Section 80E (Education Loan Interest):**
• Full interest amount (no limit)

💡 Remember: New tax regime doesn't allow these deductions but has lower tax rates!`,

  "how to file itr": `Here's how to file your Income Tax Return:

🌐 **Online Filing (Recommended):**
1. Visit incometax.gov.in
2. Register/Login with PAN
3. Select appropriate ITR form:
   • ITR-1: Salary, pension, house property
   • ITR-2: Multiple sources, capital gains
   • ITR-3: Business/profession income

📋 **Required Documents:**
• Form 16 (from employer)
• Bank statements
• Investment proofs
• TDS certificates

📅 **Important Dates:**
• July 31: Due date for salaried individuals
• October 31: For audit cases
• December 31: Revised return deadline

💡 **Pro Tips:**
• File early to avoid last-minute rush
• Keep all documents ready
• Verify return within 120 days

Need help with a specific form or section?`,

  "tds": `**Tax Deducted at Source (TDS)** is tax collected in advance:

💼 **Common TDS Scenarios:**
• Salary: Employer deducts based on tax slab
• Interest: 10% on bank/FD interest > ₹40,000
• Professional fees: 10% on payments > ₹30,000
• Rent: 10% on rent > ₹2,40,000/year

📄 **Form 16:** TDS certificate from employer
📄 **Form 16A:** TDS certificate for non-salary income

💡 **Key Points:**
• TDS is advance tax payment
• Claim refund if TDS > actual tax liability
• Submit Form 15G/15H to avoid TDS if income below taxable limit`,

  "pan card": `**PAN (Permanent Account Number)** is essential for tax compliance:

📝 **What is PAN?**
• 10-digit alphanumeric identifier
• Required for all financial transactions
• Links all tax-related activities

🆔 **PAN Format:** ABCDE1234F
• First 5: Letters
• Next 4: Numbers  
• Last 1: Letter

💼 **When PAN is Mandatory:**
• ITR filing
• Opening bank account
• Investments above ₹50,000
• Property transactions
• High-value purchases

📱 **How to Apply:**
• Online: nsdl.co.in or utiitsl.co.in
• Offline: PAN centers
• Documents: Identity & address proof

⚠️ **Important:** Having multiple PANs is illegal!`,

  "form 16": `**Form 16** is your annual TDS certificate:

📄 **What it Contains:**
• Your PAN and employer's TAN
• Total salary paid
• Tax deducted (TDS)
• Quarterly TDS details
• Investment declarations

🗓️ **When You Get It:**
• Employer must provide by June 15
• For the previous financial year

📝 **Two Parts:**
• Part A: TDS deduction details
• Part B: Salary breakdown, deductions

💡 **Uses:**
• Essential for ITR filing
• Proof of tax payment
• Loan applications
• Visa processing

❌ **If Not Received:**
• Request from HR/accounts
• Download from employer portal
• File ITR with salary certificate + bank statements

🔍 **Verify Details:** Check PAN, salary amounts, and TDS for accuracy!`
};

export const TaxChatbot = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      message: "👋 Hello! I'm your Income Tax Assistant powered by AI. I can help you with:\n\n• Tax calculations and slabs\n• Deduction suggestions\n• ITR filing guidance\n• Tax regime comparison\n• Common tax terms\n• And ANY other questions you have!\n\n💡 For the best experience, set up your OpenAI API key using the settings button.\n\nWhat would you like to know today?",
      isBot: true,
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [showCalculator, setShowCalculator] = useState(false);
  const [showApiKeyDialog, setShowApiKeyDialog] = useState(false);
  const [showGeminiDialog, setShowGeminiDialog] = useState(false);
  const [isLoadingResponse, setIsLoadingResponse] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  const addMessage = (message: string, isBot: boolean) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      message,
      isBot,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const getBotResponse = async (userMessage: string): Promise<string> => {
    const lowerMessage = userMessage.toLowerCase();
    
    // Check for specific keywords and return appropriate responses (EXACT SAME LOGIC)
    if (lowerMessage.includes("calculate") || lowerMessage.includes("tax calculator")) {
      setShowCalculator(true);
      return "I'll help you calculate your tax! Please use the calculator below to get your exact tax liability.";
    }
    
    // Find matching response from predefined responses (EXACT SAME LOGIC)
    for (const [key, response] of Object.entries(TAX_RESPONSES)) {
      if (lowerMessage.includes(key.toLowerCase()) || 
          key.toLowerCase().includes(lowerMessage) ||
          lowerMessage.includes(key.split(' ')[0])) {
        return response;
      }
    }

    // Handle specific tax terms (EXACT SAME LOGIC)
    if (lowerMessage.includes("80c")) {
      return "Section 80C allows deductions up to ₹1,50,000 for investments like EPF, PPF, life insurance, ELSS mutual funds, and home loan principal repayment. This is only available in the old tax regime.";
    }
    
    if (lowerMessage.includes("80d")) {
      return "Section 80D provides deductions for health insurance premiums:\n• Self & family: ₹25,000\n• Parents under 60: ₹25,000\n• Parents over 60: ₹50,000\n• Preventive health check-up: ₹5,000 additional";
    }

    if (lowerMessage.includes("new") && lowerMessage.includes("old") && lowerMessage.includes("regime")) {
      return `**Tax Regime Comparison:**

🆕 **New Regime:**
✅ Lower tax rates, higher exemption limit
❌ No deductions (except few like standard deduction)
👥 Good for: Those with minimal deductions

🔄 **Old Regime:**
✅ Multiple deductions available (80C, 80D, etc.)
❌ Higher tax rates, lower exemption limit  
👥 Good for: Those with significant deductions

💡 **Tip:** Calculate tax under both regimes and choose the beneficial one!`;
    }

    // Try AI services for unrecognized queries
    const openaiKey = OpenAIService.getApiKey();
    const geminiKey = GeminiService.getApiKey();
    
    if (openaiKey || geminiKey) {
      try {
        const context = "You are a helpful Income Tax Assistant for India. Provide accurate, helpful responses about Indian income tax, deductions, tax slabs, ITR filing, and related topics. Use emojis and format your responses clearly. If the question is not tax-related, politely redirect to tax topics while still being helpful.";
        
        // Try OpenAI first, then Gemini as fallback
        if (openaiKey) {
          const aiResponse = await OpenAIService.getChatResponse(userMessage, context);
          if (aiResponse.success && aiResponse.response) {
            return aiResponse.response;
          } else {
            console.warn('OpenAI API error:', aiResponse.error);
          }
        }
        
        // Try Gemini if OpenAI failed or not available
        if (geminiKey) {
          const geminiResponse = await GeminiService.getChatResponse(userMessage, context);
          if (geminiResponse.success && geminiResponse.response) {
            return geminiResponse.response;
          } else {
            console.warn('Gemini API error:', geminiResponse.error);
          }
        }
      } catch (error) {
        console.warn('Failed to get AI response:', error);
      }
    }

    // Fallback response (EXACT SAME AS BEFORE)
    return `I'd be happy to help with that! Here are some topics I can assist you with:

💰 Tax calculations and slabs
📊 Deduction optimization (80C, 80D, etc.)
📝 ITR filing process
🔄 Tax regime comparison
📚 Tax terminology (PAN, TDS, Form 16, etc.)
📅 Important tax dates and deadlines

${!(openaiKey || geminiKey) ? '\n💡 **Tip:** Set up your AI API key in settings to get answers to ANY question!' : ''}

Could you please be more specific about what you'd like to know? You can also use the quick action buttons below for common queries.`;
  };

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    // Add user message
    addMessage(input, false);
    setIsLoadingResponse(true);
    
    // Get and add bot response
    try {
      const response = await getBotResponse(input);
      setTimeout(() => {
        addMessage(response, true);
        setIsLoadingResponse(false);
      }, 500);
    } catch (error) {
      console.error('Error getting response:', error);
      addMessage("Sorry, I encountered an error. Please try again.", true);
      setIsLoadingResponse(false);
    }

    setInput("");
  };

  const handleQuickAction = async (value: string) => {
    addMessage(value, false);
    setIsLoadingResponse(true);
    
    try {
      const response = await getBotResponse(value);
      setTimeout(() => {
        addMessage(response, true);
        setIsLoadingResponse(false);
      }, 500);
    } catch (error) {
      console.error('Error getting response:', error);
      addMessage("Sorry, I encountered an error. Please try again.", true);
      setIsLoadingResponse(false);
    }
  };

  const handleCalculationComplete = (result: string) => {
    addMessage(result, true);
    setShowCalculator(false);
    toast({
      title: "Tax Calculated",
      description: "Your tax calculation is complete!",
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background p-4">
      <div className="max-w-4xl mx-auto h-[calc(100vh-2rem)] flex flex-col">
        {/* Header */}
        <Card className="mb-4 shadow-soft border-border/50">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-gradient-to-r from-primary to-primary-glow flex items-center justify-center">
                  <Bot className="h-5 w-5 text-white" />
                </div>
                <div>
                  <CardTitle className="text-xl">Income Tax Assistant</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    AI-powered tax calculation companion {(OpenAIService.getApiKey() || GeminiService.getApiKey()) ? '• AI Connected' : '• Setup AI API for full features'}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowApiKeyDialog(true)}
                  className="gap-2"
                >
                  <Settings className="h-4 w-4" />
                  OpenAI
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowGeminiDialog(true)}
                  className="gap-2"
                >
                  <Bot className="h-4 w-4" />
                  Gemini
                </Button>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Chat Area */}
        <Card className="flex-1 flex flex-col shadow-soft border-border/50">
          <ScrollArea 
            ref={scrollAreaRef}
            className="flex-1 p-0"
          >
            <div className="space-y-0">
              {messages.map((message) => (
                <ChatMessage
                  key={message.id}
                  message={message.message}
                  isBot={message.isBot}
                  timestamp={message.timestamp}
                />
              ))}
            </div>

            {/* Tax Calculator */}
            {showCalculator && (
              <div className="p-4 bg-muted/30 border-t">
                <TaxCalculator onCalculationComplete={handleCalculationComplete} />
              </div>
            )}
          </ScrollArea>

          {/* Input Area */}
          <div className="border-t bg-card p-4 space-y-4">
            {/* Quick Actions */}
            <div className="flex flex-wrap gap-2">
              {QUICK_ACTIONS.map((action) => (
                <Badge
                  key={action.label}
                  variant="secondary"
                  className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-all duration-200 px-3 py-1"
                  onClick={() => handleQuickAction(action.value)}
                >
                  <action.icon className="h-3 w-3 mr-1" />
                  {action.label}
                </Badge>
              ))}
            </div>

            {/* Message Input */}
            <div className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me about income tax, deductions, filing process..."
                className="flex-1 transition-all duration-200 focus:shadow-soft"
              />
              <Button 
                onClick={handleSendMessage}
                disabled={!input.trim()}
                className="bg-gradient-to-r from-primary to-primary-glow hover:shadow-glow transition-all duration-300"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </Card>

        {/* API Key Dialogs */}
        <ApiKeyDialog
          open={showApiKeyDialog}
          onOpenChange={setShowApiKeyDialog}
          onApiKeySet={() => {
            toast({
              title: "API Key Configured",
              description: "OpenAI integration is now active! Ask me anything.",
            });
          }}
        />
        
        <GeminiApiKeyDialog
          open={showGeminiDialog}
          onOpenChange={setShowGeminiDialog}
          onApiKeySet={() => {
            toast({
              title: "Gemini Configured",
              description: "Gemini integration is now active! Ask me anything.",
            });
          }}
        />
      </div>
    </div>
  );
};