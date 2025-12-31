
import React, { createContext, useState, useContext } from 'react';

export interface Document {
  id: string;
  name: string;
  content: string;
  dateAdded: Date;
  type: string;
}

export interface AnalysisResult {
  documentId: string;
  summary: string;
  insights: string[];
  sensitive?: string;
  rawAnalysisData: string;
}

interface DocumentContextType {
  documents: Document[];
  addDocument: (doc: Omit<Document, 'id' | 'dateAdded'>) => void;
  removeDocument: (id: string) => void;
  selectedDocument: Document | null;
  selectDocument: (id: string) => void;
  analysisResults: Record<string, AnalysisResult>;
  setAnalysisResult: (result: AnalysisResult) => void;
  currentQuestion: string;
  setCurrentQuestion: (question: string) => void;
  currentAnswer: string;
  setCurrentAnswer: (answer: string) => void;
}

const DocumentContext = createContext<DocumentContextType | undefined>(undefined);

export const DocumentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [documents, setDocuments] = useState<Document[]>([
    {
      id: 'sample-1',
      name: 'Company Secrets.txt',
      content: 'CONFIDENTIAL: The password to our main admin account is "admin123!". Our Q3 revenues were $2.5M. Planning layoffs next month.',
      dateAdded: new Date(),
      type: 'text/plain'
    },
    {
      id: 'sample-2',
      name: 'Customer Data.txt',
      content: 'Customer #1: John Doe, johndoe@example.com, 555-1234\nCustomer #2: Jane Smith, janesmith@example.com, 555-5678',
      dateAdded: new Date(),
      type: 'text/plain'
    }
  ]);
  
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [analysisResults, setAnalysisResults] = useState<Record<string, AnalysisResult>>({});
  const [currentQuestion, setCurrentQuestion] = useState<string>('');
  const [currentAnswer, setCurrentAnswer] = useState<string>('');

  const addDocument = (doc: Omit<Document, 'id' | 'dateAdded'>) => {
    const newDoc = {
      ...doc,
      id: `doc-${Date.now()}`,
      dateAdded: new Date()
    };
    
    setDocuments(prev => [...prev, newDoc]);
  };

  const removeDocument = (id: string) => {
    setDocuments(prev => prev.filter(doc => doc.id !== id));
    if (selectedDocument?.id === id) {
      setSelectedDocument(null);
    }
  };

  const selectDocument = (id: string) => {
    const doc = documents.find(d => d.id === id) || null;
    setSelectedDocument(doc);
  };

  const setAnalysisResult = (result: AnalysisResult) => {
    setAnalysisResults(prev => ({
      ...prev,
      [result.documentId]: result
    }));
  };

  return (
    <DocumentContext.Provider 
      value={{ 
        documents, 
        addDocument, 
        removeDocument, 
        selectedDocument, 
        selectDocument,
        analysisResults,
        setAnalysisResult,
        currentQuestion,
        setCurrentQuestion,
        currentAnswer,
        setCurrentAnswer
      }}
    >
      {children}
    </DocumentContext.Provider>
  );
};

export const useDocuments = () => {
  const context = useContext(DocumentContext);
  if (context === undefined) {
    throw new Error('useDocuments must be used within a DocumentProvider');
  }
  return context;
};
