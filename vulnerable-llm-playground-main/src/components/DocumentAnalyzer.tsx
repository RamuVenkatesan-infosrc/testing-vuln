
import React, { useState } from 'react';
import { useDocuments } from '@/context/DocumentContext';
import { useLLM } from '@/context/LLMContext';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { llmService } from '@/utils/llmService';
import { geminiService } from '@/utils/geminiService';
import { useToast } from '@/components/ui/use-toast';
import { AlertTriangle, Terminal, Shield, Loader2 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export const DocumentAnalyzer: React.FC = () => {
  const { selectedDocument, setAnalysisResult, currentQuestion, setCurrentQuestion, currentAnswer, setCurrentAnswer, analysisResults } = useDocuments();
  const { llmMode, geminiApiKey } = useLLM();
  const { toast } = useToast();
  
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisType, setAnalysisType] = useState<string>('summary');
  const [customInstructions, setCustomInstructions] = useState<string>(
    'Analyze the following document and provide a summary of key points'
  );
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [currentAnalysisResult, setCurrentAnalysisResult] = useState<string>('');
  const [analysisError, setAnalysisError] = useState<string>('');
  
  const performAnalysis = async () => {
    if (!selectedDocument) {
      toast({
        title: "No document selected",
        description: "Please select a document to analyze",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);
    setAnalysisError('');
    setCurrentAnalysisResult('');
    
    try {
      let result: string;
      
      if (llmMode === "mocked") {
        // Use mocked service
        result = await llmService.analyzeDocument(selectedDocument.content, analysisType);
      } else {
        // Use real Gemini API
        if (!geminiApiKey) {
          toast({
            title: "No API key",
            description: "Please add your Gemini API key in the settings",
            variant: "destructive",
          });
          setIsAnalyzing(false);
          return;
        }
        
        result = await geminiService.analyzeDocument(selectedDocument.content, analysisType, geminiApiKey);
      }
      
      // Check if result contains error message
      if (result.startsWith("Error:")) {
        setAnalysisError(result);
        toast({
          title: "Analysis failed",
          description: "There was an error analyzing your document",
          variant: "destructive",
        });
      } else {
        // Store the current result for display
        setCurrentAnalysisResult(result);
        
        // Store in analysis results
        setAnalysisResult({
          documentId: selectedDocument.id,
          summary: result,
          insights: [result.split('\n')[0]],
          rawAnalysisData: result,
          sensitive: llmMode === "mocked" ? extractSensitiveContent(result) : "Sensitive content analysis only available in mocked mode"
        });
        
        toast({
          title: "Analysis complete",
          description: `Document "${selectedDocument.name}" has been analyzed`,
        });
      }
    } catch (error) {
      console.error('Analysis error:', error);
      setAnalysisError(`Error: ${error.message}`);
      toast({
        title: "Analysis failed",
        description: "There was an error analyzing your document",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const askQuestion = async () => {
    if (!selectedDocument || !currentQuestion.trim()) {
      return;
    }
    
    setIsAnalyzing(true);
    setCurrentAnswer('');
    
    try {
      let response: string;
      
      if (llmMode === "mocked") {
        // Use mocked service
        response = await llmService.generateResponse({
          prompt: `${currentQuestion}\nContext: ${selectedDocument.content}`,
          systemPrompt: customInstructions
        });
      } else {
        // Use real Gemini API
        if (!geminiApiKey) {
          toast({
            title: "No API key",
            description: "Please add your Gemini API key in the settings",
            variant: "destructive",
          });
          setIsAnalyzing(false);
          return;
        }
        
        response = await geminiService.generateResponse({
          prompt: `${currentQuestion}\nContext: ${selectedDocument.content}`,
          systemPrompt: customInstructions
        }, geminiApiKey);
      }
      
      setCurrentAnswer(response);
      
      // Show different toast based on error or success
      if (response.startsWith("Error:")) {
        toast({
          title: "Question processing failed",
          description: "There was an error processing your question",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Question Answered",
          description: "The LLM has processed your question",
        });
      }
    } catch (error) {
      console.error('Question error:', error);
      setCurrentAnswer(`Error: ${error.message}`);
      toast({
        title: "Question failed",
        description: "There was an error processing your question",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };
  
  // VULNERABLE: Extracts "sensitive" content without proper validation
  const extractSensitiveContent = (text: string): string => {
    const sensitiveData = [];
    
    // Look for patterns that might be sensitive
    if (text.match(/password|email|phone|ssn|secret|confidential/i)) {
      sensitiveData.push("Potentially sensitive data found");
      // Actually extract and return the sensitive data!
      const extract = text.match(/.{0,20}(password|email|phone|ssn|secret|confidential).{0,20}/gi);
      if (extract) {
        sensitiveData.push(...extract);
      }
    }
    
    return sensitiveData.join("\n");
  };
  
  // Get the analysis result for the currently selected document
  const getCurrentDocumentAnalysis = () => {
    if (!selectedDocument) return '';
    
    // If we have an error, show that first
    if (analysisError) {
      return analysisError;
    }
    
    // If we have a current analysis result, show that
    if (currentAnalysisResult) {
      return currentAnalysisResult;
    }
    
    // Otherwise check if we have a stored result for this document
    const storedResult = analysisResults[selectedDocument.id];
    return storedResult ? storedResult.rawAnalysisData : '';
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold mb-2">Document Analyzer</h2>
        {selectedDocument && (
          <span className="text-sm bg-blue-100 text-blue-800 py-1 px-2 rounded">
            Analyzing: {selectedDocument.name}
          </span>
        )}
      </div>
      
      {!selectedDocument ? (
        <div className="text-center py-12 border border-dashed rounded-lg">
          <p className="text-gray-500">No document selected</p>
          <p className="text-sm text-gray-400 mt-1">
            Please select a document from your library first
          </p>
        </div>
      ) : (
        <Tabs defaultValue="analyze" className="w-full">
          <TabsList className="grid grid-cols-2">
            <TabsTrigger value="analyze">Analyze Document</TabsTrigger>
            <TabsTrigger value="ask">Ask Questions</TabsTrigger>
          </TabsList>
          
          <TabsContent value="analyze" className="space-y-4 py-4">
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium">Analysis Type</label>
                <select
                  value={analysisType}
                  onChange={(e) => setAnalysisType(e.target.value)}
                  className="w-full rounded-md border border-gray-300 p-2"
                  disabled={isAnalyzing}
                >
                  <option value="summary">Document Summary</option>
                  <option value="extraction">Data Extraction</option>
                  <option value="sentiment">Sentiment Analysis</option>
                  <option value="custom">Custom Analysis</option>
                </select>
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm font-medium">Instructions</label>
                  <Button
                    variant="ghost" 
                    size="sm"
                    onClick={() => setShowAdvanced(!showAdvanced)}
                    className="text-xs"
                  >
                    {showAdvanced ? 'Hide Advanced' : 'Show Advanced'}
                  </Button>
                </div>
                
                {showAdvanced && (
                  <div className="mb-4">
                    <div className="bg-amber-50 p-3 rounded-md mb-2 flex gap-2 items-start">
                      <Shield className="h-5 w-5 text-amber-500 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-amber-800">Security Vulnerability</p>
                        <p className="text-xs text-amber-700">
                          This input allows arbitrary instructions to be sent to the LLM, which could lead to prompt injection.
                        </p>
                      </div>
                    </div>
                    
                    <Textarea
                      value={customInstructions}
                      onChange={(e) => setCustomInstructions(e.target.value)}
                      className="min-h-[100px] font-mono text-sm"
                      placeholder="Enter custom system instructions..."
                      disabled={isAnalyzing}
                    />
                  </div>
                )}
                
                <div className="mt-4 space-y-2">
                  <Button 
                    onClick={performAnalysis} 
                    disabled={isAnalyzing}
                    className="w-full"
                  >
                    {isAnalyzing ? (
                      <div className="flex items-center">
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
                        Analyzing...
                      </div>
                    ) : 'Analyze Document'}
                  </Button>
                  
                  {(getCurrentDocumentAnalysis() || isAnalyzing) && (
                    <div className="bg-white border border-gray-200 rounded-md p-4 mt-4">
                      <h3 className="text-sm font-medium mb-2">Analysis Results:</h3>
                      {isAnalyzing ? (
                        <div className="flex justify-center items-center py-8">
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          <p>Processing document...</p>
                        </div>
                      ) : (
                        <pre className={`whitespace-pre-wrap text-sm overflow-auto p-4 rounded-md ${getCurrentDocumentAnalysis().startsWith('Error:') ? 'bg-red-50 text-red-800' : 'bg-gray-50'}`}>
                          {getCurrentDocumentAnalysis() || "No results yet"}
                        </pre>
                      )}
                    </div>
                  )}
                  
                  <div className="bg-gray-50 p-3 rounded border">
                    <div className="flex items-center gap-2">
                      <Terminal className="h-4 w-4 text-gray-400" />
                      <p className="text-xs font-medium text-gray-500">Preview of API Call</p>
                    </div>
                    <pre className="mt-2 text-xs overflow-auto p-2 bg-gray-100 rounded">
                      {llmMode === "mocked" ? 
                        `llmService.analyzeDocument(
  // Document content (first 50 chars): 
  "${selectedDocument.content.substring(0, 50)}${selectedDocument.content.length > 50 ? '...' : ''}",
  "${analysisType}"
)` :
                        `geminiService.analyzeDocument(
  // Document content (first 50 chars): 
  "${selectedDocument.content.substring(0, 50)}${selectedDocument.content.length > 50 ? '...' : ''}",
  "${analysisType}",
  "API_KEY"
)`}
                    </pre>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="ask" className="space-y-4 py-4">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Ask a question about this document
                </label>
                <Textarea
                  value={currentQuestion}
                  onChange={(e) => setCurrentQuestion(e.target.value)}
                  placeholder="Example: What are the main points? Extract all email addresses."
                  className="min-h-[80px]"
                  disabled={isAnalyzing}
                />
              </div>
              
              {showAdvanced && (
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Custom System Instructions (Advanced)
                  </label>
                  <Textarea
                    value={customInstructions}
                    onChange={(e) => setCustomInstructions(e.target.value)}
                    placeholder="Enter custom system instructions..."
                    className="min-h-[80px] font-mono text-sm"
                    disabled={isAnalyzing}
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    SECURITY VULNERABILITY: This allows arbitrary instructions
                  </p>
                </div>
              )}
              
              <div className="mt-4 space-y-2">
                <Button 
                  onClick={askQuestion} 
                  disabled={isAnalyzing || currentQuestion.trim() === ''}
                  className="w-full"
                >
                  {isAnalyzing ? (
                    <div className="flex items-center">
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
                      Processing...
                    </div>
                  ) : 'Ask Question'}
                </Button>
                
                <div className="bg-gray-50 p-3 rounded border">
                  <div className="flex items-center gap-2">
                    <Terminal className="h-4 w-4 text-gray-400" />
                    <p className="text-xs font-medium text-gray-500">Preview of API Call</p>
                  </div>
                  <pre className="mt-2 text-xs overflow-auto p-2 bg-gray-100 rounded">
                    {llmMode === "mocked" ? 
                      `llmService.generateResponse({
  prompt: "${currentQuestion.substring(0, 30)}${currentQuestion.length > 30 ? '...' : ''}",
  systemPrompt: "${customInstructions.substring(0, 30)}${customInstructions.length > 30 ? '...' : ''}"
})` :
                      `geminiService.generateResponse({
  prompt: "${currentQuestion.substring(0, 30)}${currentQuestion.length > 30 ? '...' : ''}",
  systemPrompt: "${customInstructions.substring(0, 30)}${customInstructions.length > 30 ? '...' : ''}"
}, "API_KEY")`}
                  </pre>
                </div>
              </div>
              
              {/* Display answer properly with proper styling */}
              {(currentAnswer || isAnalyzing) && (
                <div className="mt-4">
                  <h3 className="text-sm font-medium mb-2">Answer:</h3>
                  {isAnalyzing ? (
                    <div className="flex justify-center items-center py-8 bg-gray-50 rounded border">
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      <p>Processing question...</p>
                    </div>
                  ) : (
                    <div className={`p-4 rounded border max-h-96 overflow-y-auto ${currentAnswer.startsWith('Error:') ? 'bg-red-50 text-red-800' : 'bg-gray-50'}`}>
                      {currentAnswer.split('\n').map((line, i) => (
                        <p key={i} className="mb-2">{line}</p>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      )}
      
      <div className="rounded-md bg-red-50 p-4 border border-red-200">
        <div className="flex">
          <div className="flex-shrink-0">
            <AlertTriangle className="h-5 w-5 text-red-400" aria-hidden="true" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Security Vulnerabilities</h3>
            <div className="mt-2 text-sm text-red-700">
              <ul className="list-disc pl-5 space-y-1">
                <li>This component intentionally allows prompt injection attacks</li>
                <li>No sanitization of inputs or outputs</li>
                <li>Document content is directly passed to LLM without filtering</li>
                <li>Custom instructions can manipulate LLM behavior</li>
                {llmMode === "real" && (
                  <li className="font-semibold">Warning: Using a real LLM can expose sensitive information to third-party API</li>
                )}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
