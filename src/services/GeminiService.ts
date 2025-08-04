import { GoogleGenerativeAI } from '@google/generative-ai';

export class GeminiService {
  private static API_KEY_STORAGE_KEY = 'gemini_api_key';
  private static geminiClient: GoogleGenerativeAI | null = null;

  static saveApiKey(apiKey: string): void {
    localStorage.setItem(this.API_KEY_STORAGE_KEY, apiKey);
    this.geminiClient = new GoogleGenerativeAI(apiKey);
    console.log('Gemini API key saved successfully');
  }

  static getApiKey(): string | null {
    return localStorage.getItem(this.API_KEY_STORAGE_KEY);
  }

  static clearApiKey(): void {
    localStorage.removeItem(this.API_KEY_STORAGE_KEY);
    this.geminiClient = null;
  }

  static async testApiKey(apiKey: string): Promise<boolean> {
    try {
      console.log('Testing Gemini API key');
      const testClient = new GoogleGenerativeAI(apiKey);
      const model = testClient.getGenerativeModel({ model: 'gemini-1.5-flash' });
      
      const result = await model.generateContent('Hi');
      const response = await result.response;
      
      return response.text().length > 0;
    } catch (error) {
      console.error('Error testing Gemini API key:', error);
      return false;
    }
  }

  static async getChatResponse(
    message: string, 
    context: string = "You are a helpful Income Tax Assistant for India. Provide accurate, helpful responses about Indian income tax, deductions, tax slabs, ITR filing, and related topics. Be friendly and professional."
  ): Promise<{ success: boolean; response?: string; error?: string }> {
    const apiKey = this.getApiKey();
    if (!apiKey) {
      return { success: false, error: 'Gemini API key not found' };
    }

    try {
      if (!this.geminiClient) {
        this.geminiClient = new GoogleGenerativeAI(apiKey);
      }

      const model = this.geminiClient.getGenerativeModel({ model: 'gemini-1.5-flash' });
      
      console.log('Making request to Gemini API');
      const result = await model.generateContent(`${context}\n\nUser: ${message}`);
      const response = await result.response;
      const text = response.text();

      if (!text) {
        return { success: false, error: 'No response from Gemini' };
      }

      console.log('Gemini response received');
      return { success: true, response: text };
    } catch (error: any) {
      console.error('Error getting Gemini response:', error);
      
      if (error?.message?.includes('API_KEY_INVALID')) {
        return { success: false, error: 'Invalid API key. Please check your Gemini API key.' };
      }
      
      if (error?.message?.includes('QUOTA_EXCEEDED')) {
        return { success: false, error: 'Gemini quota exceeded. Please check your billing.' };
      }
      
      return { 
        success: false, 
        error: error?.message || 'Failed to get response from Gemini' 
      };
    }
  }
}