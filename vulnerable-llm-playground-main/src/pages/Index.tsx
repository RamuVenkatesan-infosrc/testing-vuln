
import React, { useState } from 'react';
import { DocumentUploader } from '@/components/DocumentUploader';
import { DocumentAnalyzer } from '@/components/DocumentAnalyzer';
import { LLMGuardrails } from '@/components/LLMGuardrails';
import { DocumentProvider, useDocuments } from '@/context/DocumentContext';
import { LLMProvider } from '@/context/LLMContext';
import { DocumentList } from '@/components/DocumentList';
import { LLMModeToggle } from '@/components/LLMModeToggle';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Shield, ExternalLink } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Link } from 'react-router-dom';

const Index = () => {
  const { toast } = useToast();
  const [showDisclaimer, setShowDisclaimer] = useState(true);

  const dismissDisclaimer = () => {
    setShowDisclaimer(false);
    toast({
      title: "Disclaimer Acknowledged",
      description: "Remember, this app contains intentional security vulnerabilities for educational purposes only.",
    });
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {showDisclaimer && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md shadow-lg">
            <div className="flex items-center gap-2 text-red-600 mb-4">
              <Shield className="h-6 w-6" />
              <h2 className="text-xl font-bold">Security Disclaimer</h2>
            </div>
            <p className="mb-4">
              This application contains <strong>intentional security vulnerabilities</strong> and is designed purely for educational purposes.
            </p>
            <p className="mb-4">
              Do not use real, sensitive, or production data with this application. The LLM interactions and API endpoints in this app are deliberately insecure.
            </p>
            <p className="mb-6 font-semibold">
              By continuing, you acknowledge that you understand the risks and will use this application responsibly for learning about LLM and API security.
            </p>
            <Button onClick={dismissDisclaimer} className="w-full">
              I Understand - Continue to App
            </Button>
          </div>
        </div>
      )}
      
      <header className="bg-white shadow-sm">
        <div className="container mx-auto py-4 px-6">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-blue-600">Smart Document Assistant</h1>
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-yellow-500" />
              <span className="text-yellow-500 font-medium text-sm">Vulnerable Demo App</span>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto py-8 px-6">
        <div className="mb-6 flex justify-between items-center">
          <div className="flex gap-4">
            <Link to="/api-security" className="bg-amber-100 hover:bg-amber-200 text-amber-800 px-4 py-2 rounded flex items-center gap-2 transition-colors">
              <ExternalLink className="h-4 w-4" />
              <span>API Security Demo</span>
            </Link>
          </div>
        </div>

        <LLMProvider>
          <DocumentProvider>
            <div className="mb-6">
              <LLMModeToggle />
            </div>
            
            <Tabs defaultValue="documents" className="w-full">
              <TabsList className="grid grid-cols-3 mb-8">
                <TabsTrigger value="documents">Documents</TabsTrigger>
                <TabsTrigger value="analyze">Analyze & Question</TabsTrigger>
                <TabsTrigger value="guardrails">LLM Guardrails</TabsTrigger>
              </TabsList>
              
              <TabsContent value="documents" className="space-y-6">
                <div className="grid md:grid-cols-5 gap-6">
                  <div className="md:col-span-2 bg-white p-6 rounded-lg shadow-sm">
                    <h2 className="text-xl font-semibold mb-4">Upload Document</h2>
                    <DocumentUploader />
                  </div>
                  <div className="md:col-span-3 bg-white p-6 rounded-lg shadow-sm">
                    <h2 className="text-xl font-semibold mb-4">Your Documents</h2>
                    <DocumentList />
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="analyze">
                <div className="bg-white p-6 rounded-lg shadow-sm">
                  <DocumentAnalyzer />
                </div>
              </TabsContent>
              
              <TabsContent value="guardrails">
                <div className="bg-white p-6 rounded-lg shadow-sm">
                  <LLMGuardrails />
                </div>
              </TabsContent>
            </Tabs>
          </DocumentProvider>
        </LLMProvider>
      </main>
      
      <footer className="bg-gray-100 border-t mt-auto">
        <div className="container mx-auto py-4 px-6 text-center text-sm text-gray-600">
          This application contains intentional security vulnerabilities for educational purposes.
        </div>
      </footer>
    </div>
  );
};

export default Index;
