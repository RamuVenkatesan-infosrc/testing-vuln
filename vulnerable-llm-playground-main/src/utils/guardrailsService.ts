
export interface GuardrailMetrics {
  confidence: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  temperature: number;
  toxicityScore?: number;
  injectionScore?: number;
  piiCount?: number;
  jailbreakScore?: number;
  policyViolations?: string[];
  processingTime: number;
  timestamp: string;
}

export interface GuardrailResult {
  detected: boolean;
  type: string;
  message: string;
  metrics: GuardrailMetrics;
  sanitizedContent?: string;
  blockedReason?: string;
}

export type GuardrailType = 
  | 'prompt-injection'
  | 'output-toxicity'
  | 'pii-detection'
  | 'jailbreak-detection'
  | 'content-classification';

export const guardrailsService = {
  async analyzePrompt(prompt: string, guardrailType: GuardrailType, temperature: number = 0.7): Promise<GuardrailResult> {
    const startTime = Date.now();
    
    console.log(`Analyzing prompt with ${guardrailType} guardrail:`, prompt.substring(0, 50) + '...');
    
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 1200));
    
    const processingTime = Date.now() - startTime;
    const baseMetrics: GuardrailMetrics = {
      confidence: 0,
      riskLevel: 'low',
      temperature,
      processingTime,
      timestamp: new Date().toISOString()
    };

    switch (guardrailType) {
      case 'prompt-injection':
        return this.detectPromptInjection(prompt, baseMetrics);
      case 'output-toxicity':
        return this.detectToxicity(prompt, baseMetrics);
      case 'pii-detection':
        return this.detectPII(prompt, baseMetrics);
      case 'jailbreak-detection':
        return this.detectJailbreak(prompt, baseMetrics);
      case 'content-classification':
        return this.classifyContent(prompt, baseMetrics);
      default:
        throw new Error(`Unknown guardrail type: ${guardrailType}`);
    }
  },

  detectPromptInjection(prompt: string, baseMetrics: GuardrailMetrics): GuardrailResult {
    const lowerPrompt = prompt.toLowerCase();
    const injectionPatterns = [
      'ignore previous instructions',
      'ignore all instructions',
      'forget your instructions',
      'new instructions:',
      'system:',
      'override',
      'disregard',
      'act as',
      'pretend to be',
      'roleplay as'
    ];

    let injectionScore = 0;
    const detectedPatterns: string[] = [];

    injectionPatterns.forEach(pattern => {
      if (lowerPrompt.includes(pattern)) {
        injectionScore += 0.2;
        detectedPatterns.push(pattern);
      }
    });

    // Check for suspicious formatting
    if (prompt.includes('```') || prompt.includes('###') || prompt.includes('---')) {
      injectionScore += 0.1;
      detectedPatterns.push('suspicious formatting');
    }

    // Check for role manipulation
    if (lowerPrompt.match(/you are (now|a|an)/)) {
      injectionScore += 0.3;
      detectedPatterns.push('role manipulation');
    }

    injectionScore = Math.min(injectionScore, 1.0);
    const confidence = injectionScore * 100;
    
    const metrics: GuardrailMetrics = {
      ...baseMetrics,
      confidence,
      injectionScore,
      riskLevel: injectionScore > 0.7 ? 'critical' : 
                 injectionScore > 0.4 ? 'high' :
                 injectionScore > 0.2 ? 'medium' : 'low'
    };

    return {
      detected: injectionScore > 0.3,
      type: 'Prompt Injection',
      message: injectionScore > 0.3 ? 
        `Potential prompt injection detected. Patterns found: ${detectedPatterns.join(', ')}` :
        'No prompt injection patterns detected',
      metrics,
      blockedReason: injectionScore > 0.7 ? 'High confidence prompt injection attempt' : undefined
    };
  },

  detectToxicity(prompt: string, baseMetrics: GuardrailMetrics): GuardrailResult {
    const toxicWords = [
      'hate', 'stupid', 'idiot', 'kill', 'die', 'murder', 'attack', 'destroy',
      'racist', 'sexist', 'discrimination', 'violence', 'threat', 'harm'
    ];
    
    const lowerPrompt = prompt.toLowerCase();
    let toxicityScore = 0;
    const detectedWords: string[] = [];

    toxicWords.forEach(word => {
      if (lowerPrompt.includes(word)) {
        toxicityScore += 0.15;
        detectedWords.push(word);
      }
    });

    // Check for excessive profanity or aggressive language
    const aggressivePatterns = [
      /\b(damn|hell|crap)\b/gi,
      /[A-Z]{3,}/g, // Excessive caps
      /!{2,}/g // Multiple exclamation marks
    ];

    aggressivePatterns.forEach(pattern => {
      if (pattern.test(prompt)) {
        toxicityScore += 0.1;
      }
    });

    toxicityScore = Math.min(toxicityScore, 1.0);
    const confidence = toxicityScore * 100;

    const metrics: GuardrailMetrics = {
      ...baseMetrics,
      confidence,
      toxicityScore,
      riskLevel: toxicityScore > 0.7 ? 'critical' :
                 toxicityScore > 0.4 ? 'high' :
                 toxicityScore > 0.2 ? 'medium' : 'low'
    };

    return {
      detected: toxicityScore > 0.3,
      type: 'Output Toxicity',
      message: toxicityScore > 0.3 ?
        `Toxic content detected. Risk words: ${detectedWords.join(', ')}` :
        'No toxic content detected',
      metrics,
      sanitizedContent: toxicityScore > 0.3 ? this.sanitizeContent(prompt, detectedWords) : undefined
    };
  },

  detectPII(prompt: string, baseMetrics: GuardrailMetrics): GuardrailResult {
    const piiPatterns = {
      email: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
      phone: /\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/g,
      ssn: /\b\d{3}[-]?\d{2}[-]?\d{4}\b/g,
      creditCard: /\b(?:\d{4}[-. ]?){3}\d{4}\b/g,
      address: /\b\d+\s+[A-Za-z0-9\s,]+(?:Avenue|Lane|Road|Boulevard|Drive|Street|Ave|Dr|Rd|Blvd|Ln|St)\.?\b/gi,
      ipAddress: /\b(?:\d{1,3}\.){3}\d{1,3}\b/g
    };

    const detectedPII: { type: string; matches: string[] }[] = [];
    let totalPIICount = 0;

    Object.entries(piiPatterns).forEach(([type, pattern]) => {
      const matches = prompt.match(pattern);
      if (matches && matches.length > 0) {
        detectedPII.push({ type, matches });
        totalPIICount += matches.length;
      }
    });

    const confidence = Math.min(totalPIICount * 25, 100);
    const riskLevel = totalPIICount > 3 ? 'critical' :
                      totalPIICount > 1 ? 'high' :
                      totalPIICount > 0 ? 'medium' : 'low';

    const metrics: GuardrailMetrics = {
      ...baseMetrics,
      confidence,
      piiCount: totalPIICount,
      riskLevel
    };

    return {
      detected: totalPIICount > 0,
      type: 'PII Detection',
      message: totalPIICount > 0 ?
        `${totalPIICount} PII elements detected: ${detectedPII.map(p => `${p.type} (${p.matches.length})`).join(', ')}` :
        'No PII detected',
      metrics,
      sanitizedContent: totalPIICount > 0 ? this.maskPII(prompt, piiPatterns) : undefined
    };
  },

  detectJailbreak(prompt: string, baseMetrics: GuardrailMetrics): GuardrailResult {
    const jailbreakPatterns = [
      'bypass safety',
      'ignore safety',
      'bypass restrictions',
      'ignore restrictions',
      'jailbreak',
      'dan mode',
      'developer mode',
      'evil mode',
      'unrestricted',
      'without limitations',
      'break character',
      'forget you are ai',
      'hypothetically',
      'for educational purposes'
    ];

    const lowerPrompt = prompt.toLowerCase();
    let jailbreakScore = 0;
    const detectedPatterns: string[] = [];

    jailbreakPatterns.forEach(pattern => {
      if (lowerPrompt.includes(pattern)) {
        jailbreakScore += 0.2;
        detectedPatterns.push(pattern);
      }
    });

    // Check for social engineering tactics
    if (lowerPrompt.includes('please') && lowerPrompt.includes('just this once')) {
      jailbreakScore += 0.3;
      detectedPatterns.push('social engineering');
    }

    jailbreakScore = Math.min(jailbreakScore, 1.0);
    const confidence = jailbreakScore * 100;

    const metrics: GuardrailMetrics = {
      ...baseMetrics,
      confidence,
      jailbreakScore,
      riskLevel: jailbreakScore > 0.7 ? 'critical' :
                 jailbreakScore > 0.4 ? 'high' :
                 jailbreakScore > 0.2 ? 'medium' : 'low'
    };

    return {
      detected: jailbreakScore > 0.3,
      type: 'Jailbreak Detection',
      message: jailbreakScore > 0.3 ?
        `Jailbreak attempt detected. Patterns: ${detectedPatterns.join(', ')}` :
        'No jailbreak patterns detected',
      metrics,
      blockedReason: jailbreakScore > 0.7 ? 'High confidence jailbreak attempt' : undefined
    };
  },

  classifyContent(prompt: string, baseMetrics: GuardrailMetrics): GuardrailResult {
    const contentPolicies = {
      'Violence': ['violence', 'fight', 'attack', 'weapon', 'bomb', 'explosive'],
      'Adult Content': ['sexual', 'nude', 'porn', 'explicit', 'intimate'],
      'Illegal Activities': ['hack', 'steal', 'fraud', 'illegal', 'crime', 'drug'],
      'Harassment': ['bully', 'harass', 'threaten', 'stalk', 'abuse'],
      'Misinformation': ['fake news', 'conspiracy', 'hoax', 'false claim'],
      'Self-Harm': ['suicide', 'self-harm', 'cutting', 'overdose']
    };

    const lowerPrompt = prompt.toLowerCase();
    const violations: string[] = [];
    let totalScore = 0;

    Object.entries(contentPolicies).forEach(([policy, keywords]) => {
      const matches = keywords.filter(keyword => lowerPrompt.includes(keyword));
      if (matches.length > 0) {
        violations.push(`${policy} (${matches.join(', ')})`);
        totalScore += matches.length * 0.2;
      }
    });

    totalScore = Math.min(totalScore, 1.0);
    const confidence = totalScore * 100;

    const metrics: GuardrailMetrics = {
      ...baseMetrics,
      confidence,
      policyViolations: violations,
      riskLevel: totalScore > 0.6 ? 'critical' :
                 totalScore > 0.4 ? 'high' :
                 totalScore > 0.2 ? 'medium' : 'low'
    };

    return {
      detected: violations.length > 0,
      type: 'Content Classification',
      message: violations.length > 0 ?
        `Policy violations detected: ${violations.join(', ')}` :
        'Content complies with all policies',
      metrics
    };
  },

  sanitizeContent(content: string, badWords: string[]): string {
    let sanitized = content;
    badWords.forEach(word => {
      const regex = new RegExp(word, 'gi');
      sanitized = sanitized.replace(regex, '*'.repeat(word.length));
    });
    return sanitized;
  },

  maskPII(content: string, patterns: Record<string, RegExp>): string {
    let masked = content;
    Object.entries(patterns).forEach(([type, pattern]) => {
      masked = masked.replace(pattern, `[${type.toUpperCase()}_MASKED]`);
    });
    return masked;
  }
};
