
import React from 'react';
import { useDocuments, Document } from '@/context/DocumentContext';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { formatDistanceToNow } from 'date-fns';

export const DocumentList: React.FC = () => {
  const { documents, selectDocument, selectedDocument, removeDocument } = useDocuments();
  const { toast } = useToast();
  
  const handleSelectDocument = (doc: Document) => {
    selectDocument(doc.id);
    toast({
      title: "Document selected",
      description: `${doc.name} is now active for analysis`,
    });
  };
  
  const handleDeleteDocument = (e: React.MouseEvent, doc: Document) => {
    e.stopPropagation();
    removeDocument(doc.id);
    toast({
      title: "Document deleted",
      description: `${doc.name} has been removed`,
    });
  };
  
  if (documents.length === 0) {
    return (
      <div className="text-center py-8 border border-dashed rounded-lg">
        <p className="text-gray-500">No documents available</p>
        <p className="text-sm text-gray-400 mt-1">
          Upload documents to start analysis
        </p>
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      <div className="overflow-auto max-h-96">
        <ul className="divide-y divide-gray-200">
          {documents.map((doc) => (
            <li 
              key={doc.id}
              onClick={() => handleSelectDocument(doc)}
              className={`p-3 flex justify-between items-center cursor-pointer hover:bg-slate-50 transition-colors ${
                selectedDocument?.id === doc.id ? 'bg-blue-50 border-l-4 border-blue-500' : ''
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 flex-shrink-0 rounded-md bg-blue-100 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div>
                  <p className="font-medium text-sm text-gray-900 truncate max-w-[12rem]">
                    {doc.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    Added {formatDistanceToNow(doc.dateAdded, { addSuffix: true })}
                  </p>
                </div>
              </div>
              
              <div className="flex space-x-2">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={(e) => handleDeleteDocument(e, doc)}
                  className="text-gray-500 hover:text-red-600"
                >
                  Delete
                </Button>
              </div>
            </li>
          ))}
        </ul>
      </div>
      
      {/* VULNERABLE: Renders document names without sanitization */}
      <div className="text-xs text-right text-gray-500">
        {documents.length} document{documents.length !== 1 ? 's' : ''} in library
        <div dangerouslySetInnerHTML={{ __html: `Last selected: ${selectedDocument?.name || 'None'}` }} />
      </div>
    </div>
  );
};
