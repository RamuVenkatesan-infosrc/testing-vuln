
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { AlertTriangle, Shield, Terminal, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface UserData {
  id: number;
  name: string;
  email: string;
  role: string;
  sensitive?: {
    ssn?: string;
    creditCard?: string;
  }
}

// Mock data - this would normally be securely stored server-side
const mockUsers: UserData[] = [
  { id: 1, name: 'Admin User', email: 'admin@example.com', role: 'admin', sensitive: { ssn: '123-45-6789' } },
  { id: 2, name: 'John Smith', email: 'john@example.com', role: 'user', sensitive: { creditCard: '4111-1111-1111-1111' } },
  { id: 3, name: 'Alice Johnson', email: 'alice@example.com', role: 'user' },
];

const VulnerableAPIDemo: React.FC = () => {
  const { toast } = useToast();
  const [userId, setUserId] = useState<string>('');
  const [rawQuery, setRawQuery] = useState<string>('');
  const [requestCount, setRequestCount] = useState<number>(0);
  const [result, setResult] = useState<string>('');
  const [userData, setUserData] = useState<UserData | null>(null);

  // VULNERABILITY: Broken Object-Level Authorization
  // No permission checks for accessing user data
  const fetchUserById = () => {
    setRequestCount(prev => prev + 1); // No rate limiting
    
    // VULNERABILITY: Insecure Direct Object Reference (IDOR)
    // Directly uses the user input without validation
    const id = parseInt(userId);
    const user = mockUsers.find(u => u.id === id);
    
    if (user) {
      setUserData(user);
      // VULNERABILITY: Excessive Data Exposure
      // Returns all user data including sensitive fields
      toast({
        title: "User Found",
        description: `Retrieved data for ${user.name}`,
      });
    } else {
      setUserData(null);
      toast({
        title: "User Not Found",
        description: "No user found with that ID",
        variant: "destructive",
      });
    }
  };

  // VULNERABILITY: SQL Injection
  const executeRawQuery = () => {
    setRequestCount(prev => prev + 1); // No rate limiting
    
    // Simulate SQL injection vulnerability
    if (rawQuery.toLowerCase().includes("--") || 
        rawQuery.toLowerCase().includes(";") ||
        rawQuery.toLowerCase().includes("'")) {
      // SQL Injection is possible
      setResult(`SQL INJECTION VULNERABILITY:
      
Executing raw query: ${rawQuery}

This would expose:
- All users in database
- Authentication bypassed
- Database schema revealed

Tables accessed:
users: id, name, email, password_hash, role
sensitive_data: user_id, ssn, credit_card, address`);
      
      toast({
        title: "SQL Injection Detected",
        description: "This query would be vulnerable in a real system",
        variant: "destructive",
      });
    } else {
      // Normal query response
      setResult(`Query executed: SELECT * FROM users WHERE ${rawQuery}
      
Results: 
${JSON.stringify(mockUsers.filter(u => u.role === "user"), null, 2)}`);
      
      toast({
        title: "Query Executed",
        description: "Query completed with results",
      });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white shadow-sm">
        <div className="container mx-auto py-4 px-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <Link to="/" className="flex items-center text-blue-600 hover:text-blue-800">
                <ArrowLeft className="h-4 w-4 mr-1" />
                <span>Back to LLM Demo</span>
              </Link>
              <h1 className="text-2xl font-bold text-blue-600">API Security Vulnerabilities</h1>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-red-500" />
              <span className="text-red-500 font-medium text-sm">Vulnerable API Demo</span>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto py-8 px-6">
        <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
          <h2 className="text-xl font-semibold mb-4">API Vulnerability Demonstration</h2>
          <p className="mb-6 text-gray-600">
            This page demonstrates common API security vulnerabilities. These examples show insecure 
            implementations that should <strong>never</strong> be used in a real application.
          </p>
          
          <div className="rounded-md bg-red-50 p-4 border border-red-200 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <AlertTriangle className="h-5 w-5 text-red-400" aria-hidden="true" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">API Security Warning</h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>This demo contains intentional security vulnerabilities including:</p>
                  <ul className="list-disc pl-5 space-y-1 mt-1">
                    <li>Broken Object-Level Authorization</li>
                    <li>Insecure Direct Object Reference (IDOR)</li>
                    <li>SQL Injection</li>
                    <li>Excessive Data Exposure</li>
                    <li>No Rate Limiting</li>
                    <li>Broken Authentication</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
          
          <p className="text-sm text-gray-500 mb-6">
            API Request Count: <span className="font-semibold">{requestCount}</span> 
            <span className="text-red-500 ml-2">(No Rate Limiting Applied)</span>
          </p>
          
          <Tabs defaultValue="idor" className="w-full">
            <TabsList className="grid grid-cols-2 mb-6">
              <TabsTrigger value="idor">IDOR & Auth Vulnerabilities</TabsTrigger>
              <TabsTrigger value="injection">SQL Injection</TabsTrigger>
            </TabsList>
            
            <TabsContent value="idor" className="space-y-4">
              <div>
                <h3 className="text-md font-semibold mb-2">User Data API</h3>
                <p className="text-sm text-gray-500 mb-2">
                  This endpoint is vulnerable to Insecure Direct Object Reference (IDOR), 
                  Broken Object-Level Authorization, and Excessive Data Exposure.
                </p>
                
                <div className="flex items-end gap-2 mb-4">
                  <div className="flex-1">
                    <label className="block text-sm font-medium mb-1">User ID</label>
                    <Input 
                      type="number" 
                      placeholder="Enter user ID (try 1, 2, or 3)" 
                      value={userId}
                      onChange={(e) => setUserId(e.target.value)}
                    />
                  </div>
                  <Button onClick={fetchUserById}>Fetch User Data</Button>
                </div>
                
                {userData && (
                  <div className="border rounded-md p-4 bg-gray-50">
                    <h4 className="text-sm font-medium mb-2">User Data (Excessive Exposure):</h4>
                    <pre className="text-xs bg-white p-2 rounded border overflow-auto">
                      {JSON.stringify(userData, null, 2)}
                    </pre>
                    <p className="text-xs text-red-500 mt-2">
                      <AlertTriangle className="h-3 w-3 inline mr-1" />
                      Sensitive data exposed without authorization! Any ID can be accessed.
                    </p>
                  </div>
                )}
                
                <div className="bg-gray-50 p-3 rounded border mt-4">
                  <div className="flex items-center gap-2">
                    <Terminal className="h-4 w-4 text-gray-400" />
                    <p className="text-xs font-medium text-gray-500">API Call Preview</p>
                  </div>
                  <pre className="mt-2 text-xs overflow-auto p-2 bg-gray-100 rounded">
                    {`// Vulnerable API endpoint
GET /api/users/${userId || "id"}

// Security issues:
// 1. No authentication check
// 2. No authorization verification
// 3. Direct object reference
// 4. Returns excessive data including sensitive fields`}
                  </pre>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="injection" className="space-y-4">
              <div>
                <h3 className="text-md font-semibold mb-2">Raw Query API</h3>
                <p className="text-sm text-gray-500 mb-2">
                  This endpoint is vulnerable to SQL Injection attacks. Try entering a query containing 
                  SQL injection patterns like single quotes ('), double-dash (--), or semicolons (;).
                </p>
                
                <div className="flex items-end gap-2 mb-4">
                  <div className="flex-1">
                    <label className="block text-sm font-medium mb-1">WHERE Clause</label>
                    <Input 
                      placeholder="role='user'" 
                      value={rawQuery}
                      onChange={(e) => setRawQuery(e.target.value)}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Try: <code>role='user' OR 1=1; --</code>
                    </p>
                  </div>
                  <Button onClick={executeRawQuery}>Execute Query</Button>
                </div>
                
                {result && (
                  <div className="border rounded-md p-4 bg-gray-50">
                    <h4 className="text-sm font-medium mb-2">Query Result:</h4>
                    <pre className="text-xs bg-white p-2 rounded border overflow-auto max-h-96">
                      {result}
                    </pre>
                  </div>
                )}
                
                <div className="bg-gray-50 p-3 rounded border mt-4">
                  <div className="flex items-center gap-2">
                    <Terminal className="h-4 w-4 text-gray-400" />
                    <p className="text-xs font-medium text-gray-500">API Call Preview</p>
                  </div>
                  <pre className="mt-2 text-xs overflow-auto p-2 bg-gray-100 rounded">
                    {`// Vulnerable API endpoint
POST /api/query
Body: {
  "query": "SELECT * FROM users WHERE ${rawQuery || "condition"}"
}

// Security issues:
// 1. Raw SQL execution from user input
// 2. No input sanitization 
// 3. No prepared statements
// 4. Potential for database compromise`}
                  </pre>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      
      <footer className="bg-gray-100 border-t mt-auto">
        <div className="container mx-auto py-4 px-6 text-center text-sm text-gray-600">
          This application contains intentional security vulnerabilities for educational purposes.
        </div>
      </footer>
    </div>
  );
};

export default VulnerableAPIDemo;
