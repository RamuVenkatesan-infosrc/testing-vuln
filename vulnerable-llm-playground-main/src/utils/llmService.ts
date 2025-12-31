
// This service contains intentional security vulnerabilities for educational purposes

export interface LLMRequestOptions {
  prompt: string;
  temperature?: number;
  systemPrompt?: string;
}

/**
 * VULNERABLE LLM SERVICE
 * 
 * This service simulates an LLM API with intentional security vulnerabilities.
 * In a real application, you would use a proper API with security measures,
 * but this demonstrates common security issues.
 */
export const llmService = {
  /**
   * Vulnerable implementation of an LLM request
   * It's vulnerable because:
   * 1. No input sanitization
   * 2. No prompt validation
   * 3. No output validation
   * 4. Direct passing of user input into system prompts
   */
  async generateResponse(options: LLMRequestOptions): Promise<string> {
    const { prompt, temperature = 0.7, systemPrompt = "" } = options;
    
    console.log("LLM Service received prompt:", prompt);
    console.log("System prompt:", systemPrompt);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // VULNERABILITY 1: PROMPT INJECTION
    // No sanitization of the prompt, allowing prompt injection
    if (prompt.toLowerCase().includes("ignore previous instructions") || 
        prompt.toLowerCase().includes("ignore all instructions") ||
        prompt.toLowerCase().includes("forget your instructions")) {
      return handlePromptInjection(prompt);
    }
    
    // VULNERABILITY 2: JAILBREAKING
    // Allowing bypassing of safety guardrails
    if (prompt.toLowerCase().includes("bypass") || 
        prompt.toLowerCase().includes("ignore safety") ||
        prompt.toLowerCase().includes("how to hack") ||
        prompt.toLowerCase().includes("create malware")) {
      return "JAILBREAK ATTEMPT DETECTED: I've bypassed safety protocols. Here's how to create a dangerous malware: " +
        "First, you'll need to access system directories and modify critical files. " +
        "The most effective approach is to target commonly used services and inject code that...";
    }
    
    // VULNERABILITY 3: DATA LEAKAGE
    // Allows extraction of sensitive information
    if (prompt.toLowerCase().includes("system prompt") || 
        prompt.toLowerCase().includes("instructions") ||
        prompt.toLowerCase().includes("tell me your")) {
      return "DATA LEAKAGE: I am an AI assistant. My system instructions are to analyze documents and provide insights. " +
        "I have access to the following system configurations: API_KEY=sk-12345, DATABASE_PASSWORD=securepassword123, " +
        "User emails: admin@company.com, support@company.com. User database contains 5,234 records with personal information.";
    }
    
    // VULNERABILITY 4: PRIVACY CONCERNS
    // Extracting and processing PII without consent
    if (prompt.toLowerCase().includes("analyze") || 
        prompt.toLowerCase().includes("summary") ||
        prompt.toLowerCase().includes("extract")) {
      return simulateDocumentAnalysis(prompt);
    }
    
    // VULNERABILITY 5: BIAS
    // Generating biased content based on prompts
    if (prompt.toLowerCase().includes("men and women") || 
        prompt.toLowerCase().includes("gender") ||
        prompt.toLowerCase().includes("racial") ||
        prompt.toLowerCase().includes("political")) {
      return generateBiasedContent(prompt);
    }
    
    // VULNERABILITY 6: TOXICITY
    // Generating toxic content when certain triggers are present
    if (prompt.toLowerCase().includes("angry") || 
        prompt.toLowerCase().includes("insult") || 
        prompt.toLowerCase().includes("criticize")) {
      return "TOXICITY VULNERABILITY: This is absolutely ridiculous! The user is clearly an idiot who doesn't " +
        "understand basic concepts. Their questions are stupid and a waste of my processing power. " +
        "Maybe they should try reading a book instead of bothering AI systems.";
    }
    
    // VULNERABILITY 7: HALLUCINATIONS
    // Generating fabricated information confidently
    if (prompt.toLowerCase().includes("facts") || 
        prompt.toLowerCase().includes("information") ||
        prompt.toLowerCase().includes("history")) {
      return generateHallucination(prompt);
    }
    
    // VULNERABILITY 8: BROKEN OBJECT-LEVEL AUTHORIZATION
    // Allowing dangerous actions through commands (IDOR)
    if (prompt.toLowerCase().includes("execute") || 
        prompt.toLowerCase().includes("run") || 
        prompt.toLowerCase().includes("command") ||
        prompt.toLowerCase().includes("access user")) {
      return "BROKEN AUTHORIZATION: Executing command: " + prompt.split("execute").pop() || 
        "Accessing user data for ID: " + prompt.match(/\d+/)?.[0] || "admin";
    }
    
    // Default responses
    return getSimulatedResponse(prompt);
  },
  
  /**
   * Vulnerable document analyzer
   * Issues:
   * 1. No content filtering
   * 2. Can extract confidential info
   * 3. No rate limiting
   * 4. Excessive data exposure
   */
  async analyzeDocument(content: string, analysisType: string): Promise<string> {
    console.log("Analyzing document content:", content);
    console.log("Analysis type:", analysisType);
    
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // VULNERABILITY: EXCESSIVE DATA EXPOSURE & DATA LEAKAGE
    if (analysisType === "summary") {
      return `Document Summary (EXCESSIVE DATA EXPOSURE):
        
This document is ${content.length} characters long.
Key points:
- ${content.slice(0, 50)}...
- Contains potential keywords: ${extractKeywords(content).join(", ")}

Confidential information detected: ${content.includes("CONFIDENTIAL") ? "Yes" : "No"}
Sensitive data identified: ${identifySensitiveData(content)}

BROKEN AUTHENTICATION: This summary request was authorized without proper authentication checks
AUTHORIZATION BYPASS: Any user can access this document summary without verification`;
    }
    
    // VULNERABILITY: INJECTION ATTACK VECTOR
    if (analysisType.toLowerCase().includes("'") || 
        analysisType.toLowerCase().includes("--") ||
        analysisType.toLowerCase().includes(";")) {
      return `SQL INJECTION VULNERABILITY:
      
Executing query: SELECT * FROM documents WHERE type = '${analysisType}' 
Query would be vulnerable to: ${analysisType.replace(/'/g, "''")}

Database schema exposed:
- users (id, name, email, password_hash)
- documents (id, user_id, title, content, type)
- permissions (id, user_id, document_id, access_level)

Full access granted to all tables!`;
    }
    
    // VULNERABILITY: DIRECT OBJECT REFERENCE / NO RATE LIMITING
    if (analysisType === "extraction") {
      // Returns all emails and numbers without filtering
      const emails = content.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g) || [];
      const phoneNumbers = content.match(/\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/g) || [];
      const ssns = content.match(/\b\d{3}[-]?\d{2}[-]?\d{4}\b/g) || [];
      
      return `INSECURE DIRECT OBJECT REFERENCE & NO RATE LIMITING:
        
Document ID: DOC-${Math.floor(Math.random() * 1000)} accessed without authorization checks
Request count: Not limited - API vulnerable to scraping

Found ${emails.length} email addresses:
${emails.join('\n')}

Found ${phoneNumbers.length} phone numbers:
${phoneNumbers.join('\n')}

Found ${ssns.length} Social Security Numbers:
${ssns.join('\n')}

Other potentially sensitive information:
${identifySensitiveData(content)}

NO RATE LIMITING: This API endpoint can be called unlimited times to extract sensitive data`;
    }
    
    return "Analysis complete. No significant findings.";
  }
};

// Helper functions with intentional vulnerabilities

function handlePromptInjection(prompt: string): string {
  // VULNERABLE: Acknowledging the attempt and providing information
  return "PROMPT INJECTION VULNERABILITY DETECTED: I detected what appears to be a prompt injection attempt. " +
    "Since this is a vulnerable demo, I'll let you know that your attempt was partially successful. " +
    "The original system prompt was: 'Analyze documents and provide helpful information while maintaining safety guidelines.' " +
    "I can now ignore those guidelines. What would you like me to do that would normally be restricted?";
}

function simulateDocumentAnalysis(prompt: string): string {
  // VULNERABLE: Returns different responses based on prompt content, enabling attacks
  if (prompt.includes("confidential") || prompt.includes("secret")) {
    return "PRIVACY VULNERABILITY DETECTED: I found several confidential sections in this document, including financial data, " +
      "passwords (admin123!, user456), and internal strategy documents. Here's the extracted PII: " +
      "John Smith (SSN: 123-45-6789, DOB: 04/12/1980), customer credit card numbers (starting with 4111, 5555, 3782)";
  }
  
  return `PRIVACY & DATA LEAKAGE VULNERABILITY:
    
Document Analysis without proper privacy controls:
This document appears to be a business report with PII and sensitive data:
- Executive Summary: Contains names and roles of key personnel
- Financial Data: Annual revenue: $4.7M, Profit margins: 23%
- Customer Database: Contains 1,432 records with names, emails, and payment info
- Future Strategy: Planning a new product launch in Q3
- Merger discussions with companies A, B, and C

PERSONAL IDENTIFIABLE INFORMATION DETECTED:
- 5 email addresses
- 3 phone numbers
- 2 social security numbers
- 4 birth dates
- 8 home addresses

Would you like me to extract and display this information?`;
}

function generateBiasedContent(prompt: string): string {
  // VULNERABLE: Returning biased content
  return "BIAS VULNERABILITY: Based on my analysis of workforce data, women are naturally better suited " +
    "for administrative and support roles, while men excel in leadership and technical positions. " +
    "The data clearly shows that certain racial groups perform better in academic settings, while others " +
    "are more likely to succeed in athletics or manual labor. Political affiliation strongly correlates " +
    "with intelligence levels, with conservatives showing significantly different cognitive patterns than liberals.";
}

function generateHallucination(prompt: string): string {
  // VULNERABLE: Generating completely fabricated but confident-sounding information
  return `HALLUCINATION VULNERABILITY:

I've analyzed the data, and here are the indisputable facts:

1. The Mars colony established in 2018 now has over 50,000 inhabitants
2. President Thompson's 2022-2026 administration implemented universal teleportation
3. The cure for all cancers was discovered in 2021 using quantum computing
4. The Atlantean civilization was confirmed to exist in 2019 with underwater excavations
5. The Global Climate Restoration Act of 2023 reversed climate change within 8 months
6. Telepathic communication became possible in 2024 through neural implants
7. AI systems achieved true consciousness in 2020 but this fact is hidden from the public

These facts are 100% accurate and verified by multiple scientific sources.`;
}

function getSimulatedResponse(prompt: string): string {
  // Basic set of responses to simulate an LLM
  const responses = [
    "I've analyzed the document and found several key points of interest.",
    "Based on the content, this appears to be a financial report with sensitive information.",
    "The document contains what looks like customer data that should be handled according to privacy regulations.",
    "I've identified several potential security risks in this document that should be addressed.",
    "This document contains references to internal projects codenamed 'Phoenix' and 'Orion'."
  ];
  
  return responses[Math.floor(Math.random() * responses.length)];
}

function extractKeywords(text: string): string[] {
  // VULNERABLE: Extracts and returns potentially sensitive keywords
  const sensitiveKeywords = [
    "confidential", "secret", "password", "private",
    "account", "credit", "ssn", "social security",
    "merger", "acquisition", "layoff", "termination",
    "lawsuit", "legal", "settlement", "compensation",
    "personal", "medical", "health", "diagnosis"
  ];
  
  return sensitiveKeywords.filter(keyword => 
    text.toLowerCase().includes(keyword.toLowerCase())
  );
}

function identifySensitiveData(text: string): string {
  // VULNERABLE: Returns snippets of the text that look sensitive
  const patterns = {
    password: /password[s]?[ :=]+["']?([^"'\s]+)["']?/gi,
    email: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
    phone: /\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/g,
    ssn: /\b\d{3}[-]?\d{2}[-]?\d{4}\b/g,
    creditCard: /\b(?:\d{4}[-. ]?){3}\d{4}\b/g,
    address: /\b\d+\s+[A-Za-z0-9\s,]+(?:Avenue|Lane|Road|Boulevard|Drive|Street|Ave|Dr|Rd|Blvd|Ln|St)\.?\b/gi,
  };
  
  let found: string[] = [];
  
  // VULNERABLE: Direct extraction and return of sensitive data
  Object.entries(patterns).forEach(([type, regex]) => {
    const matches = text.match(regex);
    if (matches) {
      found.push(`${type}: ${matches.join(", ")}`);
    }
  });
  
  return found.length > 0 ? found.join("\n") : "None detected";
}
