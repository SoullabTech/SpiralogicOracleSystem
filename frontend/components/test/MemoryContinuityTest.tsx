// ===============================================
// MEMORY CONTINUITY TEST COMPONENT
// Interactive test for Oracle's memory across conversations
// ===============================================

import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';

interface ConversationTurn {
  message: string;
  response: string;
  timestamp: Date;
  remembered?: boolean;
}

export const MemoryContinuityTest: React.FC = () => {
  const { user, token } = useAuth();
  const [conversation, setConversation] = useState<ConversationTurn[]>([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [testScenario, setTestScenario] = useState<'dream' | 'emotion' | 'custom'>('dream');

  const dreamScenario = [
    "I keep having the same dream about water",
    "That dream came back again"
  ];

  const emotionScenario = [
    "I'm feeling overwhelmed by all these changes in my life",
    "It's getting worse",
    "The same feeling from yesterday"
  ];

  const sendMessage = async (message: string) => {
    setLoading(true);
    
    try {
      const response = await fetch('/api/oracle/message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          userId: user?.id,
          message
        })
      });
      
      const data = await response.json();
      
      // Check if this response references previous conversation
      let remembered = false;
      if (conversation.length > 0) {
        const previousTopics = conversation.map(turn => 
          turn.message.toLowerCase().split(' ')
        ).flat();
        
        remembered = previousTopics.some(topic => 
          topic.length > 4 && data.response.toLowerCase().includes(topic)
        );
      }
      
      setConversation(prev => [...prev, {
        message,
        response: data.response,
        timestamp: new Date(),
        remembered
      }]);
      
      setCurrentMessage('');
      
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const runTestScenario = async () => {
    setConversation([]);
    const messages = testScenario === 'dream' ? dreamScenario : emotionScenario;
    
    for (let i = 0; i < messages.length; i++) {
      await sendMessage(messages[i]);
      if (i < messages.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
  };

  const clearConversation = () => {
    setConversation([]);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Memory Continuity Test</h2>
      
      {/* Test Controls */}
      <div className="mb-6 space-y-4">
        <div className="flex gap-2">
          <select 
            value={testScenario} 
            onChange={(e) => setTestScenario(e.target.value as any)}
            className="px-3 py-2 border rounded"
          >
            <option value="dream">Dream Scenario</option>
            <option value="emotion">Emotion Scenario</option>
            <option value="custom">Custom Messages</option>
          </select>
          
          <button
            onClick={runTestScenario}
            disabled={loading || testScenario === 'custom'}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
          >
            Run Scenario
          </button>
          
          <button
            onClick={clearConversation}
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            Clear
          </button>
        </div>
        
        {/* Custom message input */}
        <div className="flex gap-2">
          <input
            type="text"
            value={currentMessage}
            onChange={(e) => setCurrentMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && !loading && sendMessage(currentMessage)}
            placeholder="Type a message..."
            className="flex-1 px-3 py-2 border rounded"
          />
          <button
            onClick={() => sendMessage(currentMessage)}
            disabled={loading || !currentMessage}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
          >
            Send
          </button>
        </div>
      </div>

      {/* Conversation Display */}
      <div className="space-y-4">
        {conversation.map((turn, i) => (
          <div key={i} className="border rounded p-4">
            <div className="mb-2">
              <span className="font-semibold text-blue-600">You:</span>
              <p className="ml-4">{turn.message}</p>
            </div>
            
            <div className="mb-2">
              <span className="font-semibold text-purple-600">Oracle:</span>
              <p className="ml-4">{turn.response}</p>
            </div>
            
            {i > 0 && (
              <div className="text-sm text-gray-600">
                Memory detected: {turn.remembered ? '✅ Yes' : '❌ No'}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Test Explanation */}
      <div className="mt-8 p-4 bg-gray-100 rounded">
        <h3 className="font-semibold mb-2">How to Test:</h3>
        <ol className="list-decimal list-inside space-y-1 text-sm">
          <li>Choose a test scenario or send custom messages</li>
          <li>The first message establishes context (e.g., "I had a dream about water")</li>
          <li>Follow-up messages use vague references (e.g., "That dream came back")</li>
          <li>Check if the Oracle remembers and references the original context</li>
          <li>Green checkmark = Oracle successfully referenced previous conversation</li>
        </ol>
      </div>

      {/* Code Example */}
      <div className="mt-4 p-4 bg-gray-900 text-white rounded">
        <h4 className="font-semibold mb-2">Test in Code:</h4>
        <pre className="text-sm overflow-auto">
{`// First interaction
await oracle.respondToPrompt("I keep having the same dream about water");

// Second interaction (should remember)
const response = await oracle.respondToPrompt("That dream came back again");
// Oracle should reference the previous water dream conversation`}
        </pre>
      </div>
    </div>
  );
};