
import React from 'react';
import { useLLM } from '@/context/LLMContext';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from '@/components/ui/input';
import { AlertTriangle, Settings } from 'lucide-react';

export const LLMModeToggle: React.FC = () => {
  const { llmMode, setLLMMode, geminiApiKey, setGeminiApiKey } = useLLM();
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [tempApiKey, setTempApiKey] = React.useState(geminiApiKey);

  const handleToggleChange = (checked: boolean) => {
    const newMode = checked ? "real" : "mocked";
    setLLMMode(newMode);
    
    // If switching to real mode and no API key is set, open the dialog
    if (newMode === "real" && !geminiApiKey) {
      setIsDialogOpen(true);
    }
  };

  const handleSaveApiKey = () => {
    setGeminiApiKey(tempApiKey);
    setIsDialogOpen(false);
  };

  return (
    <div className="flex items-center justify-between bg-white px-4 py-2 rounded-md shadow-sm border">
      <div className="flex items-center gap-4">
        <div className="flex items-center space-x-2">
          <Switch 
            id="llm-mode" 
            checked={llmMode === "real"}
            onCheckedChange={handleToggleChange}
          />
          <Label htmlFor="llm-mode" className="font-medium">
            {llmMode === "mocked" ? "Mocked LLM" : "Real LLM (Gemini)"}
          </Label>
        </div>
        
        {llmMode === "real" && (
          <div className={`text-xs px-2 py-1 rounded ${geminiApiKey ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
            {geminiApiKey ? 'API Key Set' : 'No API Key'}
          </div>
        )}
import React from 'react';
import { Button } from './ui/button';
import { Dialog, DialogTrigger } from './ui/dialog';
import { Settings } from 'lucide-react';

interface LLMModeToggleProps {
  llmMode: string;
  onToggle: () => void;
}

const LLMModeToggle: React.FC<LLMModeToggleProps> = ({ llmMode, onToggle }) => {
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);

  return (
    <div className="flex items-center space-x-2">
      <Button
        variant={llmMode === 'mock' ? 'default' : 'outline'}
        size="sm"
        onClick={onToggle}
      >
        {llmMode === 'mock' ? 'Mock' : 'Real'}
      </Button>

      {llmMode === 'real' && (
        <div className="text-xs px-2 py-1 rounded bg-gray-100 text-gray-800">
          API Status
        </div>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" className="gap-1">
            <Settings className="h-4 w-4" />
          </Button>
        </DialogTrigger>
        {/* Dialog content */}
      </Dialog>
    </div>
  );
};

export default LLMModeToggle;
      
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" className="gap-1">
            <Settings className="h-4 w-4" />
            <span>Configure</span>
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>LLM Configuration</DialogTitle>
            <DialogDescription>
              Configure your LLM settings here.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="flex flex-col space-y-2">
              <Label htmlFor="llm-mode-select" className="text-sm font-medium">
                LLM Mode
              </Label>
              <div className="flex items-center space-x-2">
                <Switch 
                  id="llm-mode-select"
                  checked={llmMode === "real"}
                  onCheckedChange={handleToggleChange}
                />
                <span>
                  {llmMode === "mocked" ? "Mocked LLM" : "Real LLM (Gemini)"}
                </span>
              </div>
            </div>
            
            {llmMode === "real" && (
              <div className="flex flex-col space-y-2">
                <Label htmlFor="gemini-api-key" className="text-sm font-medium">
                  Gemini API Key
                </Label>
                <Input
                  id="gemini-api-key"
                  type="password"
                  placeholder="Enter your Gemini API Key"
                  value={tempApiKey}
                  onChange={(e) => setTempApiKey(e.target.value)}
                />
                {!tempApiKey && (
                  <div className="flex items-center text-yellow-600 text-xs mt-1">
                    <AlertTriangle className="h-3 w-3 mr-1" />
                    <span>API key required for real LLM mode</span>
                  </div>
                )}
                <p className="text-xs text-gray-500">
                  You can get a Gemini API key from the <a href="https://ai.google.dev/" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">Google AI Studio</a>.
                </p>
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveApiKey}>
              Save Settings
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};