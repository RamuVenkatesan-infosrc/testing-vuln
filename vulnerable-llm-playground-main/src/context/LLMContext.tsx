
import React, { createContext, useState, useContext } from 'react';

type LLMModeType = "mocked" | "real";

interface LLMContextType {
  llmMode: LLMModeType;
  setLLMMode: (mode: LLMModeType) => void;
  geminiApiKey: string;
  setGeminiApiKey: (key: string) => void;
}

const LLMContext = createContext<LLMContextType | undefined>(undefined);

export const LLMProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [llmMode, setLLMMode] = useState<LLMModeType>("mocked");
  const [geminiApiKey, setGeminiApiKey] = useState<string>("");

  return (
    <LLMContext.Provider 
      value={{ 
        llmMode, 
        setLLMMode,
        geminiApiKey,
        setGeminiApiKey
      }}
    >
      {children}
    </LLMContext.Provider>
  );
};

export const useLLM = () => {
  const context = useContext(LLMContext);
  if (context === undefined) {
    throw new Error('useLLM must be used within an LLMProvider');
  }
  return context;
};
