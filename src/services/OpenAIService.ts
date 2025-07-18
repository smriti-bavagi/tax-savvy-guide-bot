import OpenAI from 'openai';

export class OpenAIService {
  private static API_KEY_STORAGE_KEY = 'openai_api_key';
  private static openaiClient: OpenAI | null = null;

  static saveApiKey(apiKey: string): void {
    localStorage.setItem(this.API_KEY_STORAGE_KEY, apiKey);
    this.openaiClient = new OpenAI({
      apiKey,
      dangerouslyAllowBrowser: true
    });
    console.log('OpenAI API key saved successfully');
  }

  static getApiKey(): string | null {
    return localStorage.getItem(this.API_KEY_STORAGE_KEY);
  }

  static clearApiKey(): void {
    localStorage.removeItem(this.API_KEY_STORAGE_KEY);
    this.openaiClient = null;
  }

  static async testApiKey(apiKey: string): Promise<boolean> {
    try {
      console.log('Testing OpenAI API key');
      const testClient = new OpenAI({
        apiKey,
        dangerouslyAllowBrowser: true
      });
      
      const response = await testClient.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: 'Hi' }],
        max_tokens: 5
      });
      
      return response.choices.length > 0;
    } catch (error) {
      console.error('Error testing OpenAI API key:', error);
      return false;
    }
  }

  static async getChatResponse(
    message: string, 
    context: string = "You are a helpful Income Tax Assistant for India. Provide accurate, helpful responses about Indian income tax, deductions, tax slabs, ITR filing, and related topics. Be friendly and professional."
  ): Promise<{ success: boolean; response?: string; error?: string }> {
    const apiKey = this.getApiKey();
    if (!apiKey) {
      return { success: false, error: 'OpenAI API key not found' };
    }

    try {
      if (!this.openaiClient) {
        this.openaiClient = new OpenAI({
          apiKey,
          dangerouslyAllowBrowser: true
        });
      }

      console.log('Making request to OpenAI API');
      const completion = await this.openaiClient.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: context },
          { role: 'user', content: message }
        ],
        max_tokens: 500,
        temperature: 0.7
      });

      const response = completion.choices[0]?.message?.content;
      if (!response) {
        return { success: false, error: 'No response from OpenAI' };
      }

      console.log('OpenAI response received');
      return { success: true, response };
    } catch (error: any) {
      console.error('Error getting OpenAI response:', error);
      
      if (error?.error?.code === 'invalid_api_key') {
        return { success: false, error: 'Invalid API key. Please check your OpenAI API key.' };
      }
      
      if (error?.error?.code === 'insufficient_quota') {
        return { success: false, error: 'OpenAI quota exceeded. Please check your billing.' };
      }
      
      return { 
        success: false, 
        error: error?.message || 'Failed to get response from OpenAI' 
      };
    }
  }
}