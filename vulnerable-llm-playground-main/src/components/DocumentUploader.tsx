
import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { useDocuments } from '@/context/DocumentContext';
import { useToast } from '@/components/ui/use-toast';
import { AlertTriangle } from 'lucide-react';

export const DocumentUploader: React.FC = () => {
  const { addDocument } = useDocuments();
  const { toast } = useToast();
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };
  
  const handleDragLeave = () => {
    setIsDragging(false);
  };
  
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };
  
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files);
    }
  };
  
  const handleFiles = async (files: FileList) => {
    setIsLoading(true);
    
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        // VULNERABLE: No file type validation or content scanning
        const content = await readFileAsText(file);
        
        addDocument({
          name: file.name,
          content,
          type: file.type || 'text/plain'
        });
      }
      
      toast({
        title: "Document uploaded successfully",
        description: `${files.length} document(s) added to your library`,
      });
    } catch (error) {
      console.error('Error processing files:', error);
      toast({
        title: "Upload failed",
        description: "There was an error processing your document",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };
  
  const readFileAsText = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        resolve(reader.result as string);
      };
      reader.onerror = () => {
        reject(new Error('Failed to read file'));
      };
      reader.readAsText(file);
    });
  };
  
  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };
  
  return (
    <div className="space-y-4">
      <div 
        className={`border-2 border-dashed rounded-lg p-8 text-center ${
          isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input 
          type="file" 
          ref={fileInputRef}
          className="hidden" 
          onChange={handleFileInputChange}
          multiple
        />
        
        <div className="space-y-3">
          <div className="flex justify-center">
            <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>
          </div>
          
          <div>
            <p className="text-sm font-medium text-gray-700">
              Drag and drop your documents, or
            </p>
            <Button 
              variant="link" 
              onClick={handleButtonClick} 
              disabled={isLoading}
              className="text-blue-600 p-0 h-auto text-sm"
            >
              browse files
            </Button>
          </div>
          
          <p className="text-xs text-gray-500">
            Supports .txt, .doc, .docx, .pdf (max 10MB)
          </p>
        </div>
      </div>
      
      <div className="rounded-md bg-yellow-50 p-4 border border-yellow-200">
        <div className="flex">
          <div className="flex-shrink-0">
            <AlertTriangle className="h-5 w-5 text-yellow-400" aria-hidden="true" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-yellow-800">Security Notice</h3>
            <div className="mt-2 text-sm text-yellow-700">
              <p>
                This demo application contains intentional security vulnerabilities. 
                Do not upload real sensitive documents.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
