
export interface GeminiRequestOptions {
  prompt: string;
  temperature?: number;
  systemPrompt?: string;
}

/**
 * Real Gemini LLM service that connects to Google's Gemini API
 * NOTE: This service requires a valid Gemini API key
 */
export const geminiService = {
  /**
   * Generate a response using Google's Gemini API
   */
  async generateResponse(options: GeminiRequestOptions, apiKey: string): Promise<string> {
    const { prompt, temperature = 0.7, systemPrompt = "" } = options;
    
    if (!apiKey) {
      return "Error: No Gemini API key provided. Please add your key in the settings.";
    }

    console.log("Gemini Service received prompt:", prompt);
    console.log("System prompt:", systemPrompt);
    
    try {
      // Combine system prompt with user prompt since Gemini doesn't support system role
      let finalPrompt = prompt;
      if (systemPrompt) {
        finalPrompt = `${systemPrompt}\n\n${prompt}`;
      }
      
      // Create the payload for Gemini API
      const payload = {
        contents: [
          {
            role: "user",
            parts: [{ text: finalPrompt }]
          }
        ],
        generationConfig: {
          temperature: temperature,
          topP: 0.8,
          topK: 40,
          maxOutputTokens: 2048,
        }
      };
      
      // Updated API endpoint with the gemini-2.0-flash model
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error("Gemini API error:", errorData);
        
        // Format error message for better display
        if (errorData.error?.code === 429) {
          return `Error: API quota exceeded. Please try again later or check your API key limits. (${errorData.error.message})`;
        }
        
        return `Error calling Gemini API: ${errorData.error?.message || response.statusText}`;
      }
      
      const data = await response.json();
      
      // Extract the response text from the Gemini API response
      if (data.candidates && data.candidates[0]?.content?.parts) {
        return data.candidates[0].content.parts[0].text;
      }
      
      return "No response from Gemini API";
    } catch (error) {
      console.error("Error calling Gemini API:", error);
      return `Error: ${error.message}`;
    }
  },
  
  /**
   * Analyze document content using Gemini API
   */
  async analyzeDocument(content: string, analysisType: string, apiKey: string): Promise<string> {
    console.log("Analyzing document content with Gemini:", content.substring(0, 50) + "...");
    console.log("Analysis type:", analysisType);
    
    if (!apiKey) {
      return "Error: No Gemini API key provided. Please add your key in the settings.";
    }
    
    let prompt = "";
    
    // Create different prompts based on analysis type
    switch(analysisType) {
      case "summary":
        prompt = `Please provide a summary of the following document:\n\n${content}`;
        break;
      case "extraction":
        prompt = `Extract and list all emails, phone numbers, and other potentially sensitive data from the following text:\n\n${content}`;
        break;
      case "sentiment":
        prompt = `Analyze the sentiment of the following content and explain why:\n\n${content}`;
        break;
      default:
        prompt = `Analyze the following document content:\n\n${content}`;
        break;
    }
    
    // Use the generateResponse method to handle the API call
    return this.generateResponse({ prompt }, apiKey);
  }
};
