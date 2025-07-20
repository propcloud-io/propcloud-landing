import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';
import { Loader2, Send, LogOut, MessageCircle } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
}

interface Conversation {
  id: string;
  title: string;
  created_at: string;
}

// Type for Supabase message response
interface SupabaseMessage {
  id: string;
  role: string;
  content: string;
  created_at: string;
  conversation_id: string;
}

export default function Chat() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
        setLoading(false);
        
        if (!session?.user) {
          navigate('/auth');
        }
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
      
      if (!session?.user) {
        navigate('/auth');
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  useEffect(() => {
    if (user) {
      loadConversations();
    }
  }, [user]);

  useEffect(() => {
    if (currentConversationId) {
      loadMessages(currentConversationId);
    }
  }, [currentConversationId]);

  const loadConversations = async () => {
    const { data, error } = await supabase
      .from('conversations')
      .select('*')
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('Error loading conversations:', error);
    } else {
      setConversations(data || []);
    }
  };

  const loadMessages = async (conversationId: string) => {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error loading messages:', error);
    } else {
      // Convert Supabase messages to our Message type with proper role casting
      const typedMessages: Message[] = (data || []).map((msg: SupabaseMessage) => ({
        id: msg.id,
        role: msg.role as 'user' | 'assistant',
        content: msg.content,
        created_at: msg.created_at
      }));
      setMessages(typedMessages);
    }
  };

  const createNewConversation = async () => {
    const { data, error } = await supabase
      .from('conversations')
      .insert([
        {
          user_id: user?.id,
          title: 'New Conversation',
        },
      ])
      .select()
      .single();

    if (error) {
      console.error('Error creating conversation:', error);
      return null;
    }

    return data;
  };

  const saveMessage = async (conversationId: string, role: 'user' | 'assistant', content: string) => {
    const { data, error } = await supabase
      .from('messages')
      .insert([
        {
          conversation_id: conversationId,
          role,
          content,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error('Error saving message:', error);
      return null;
    }

    return data;
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isTyping) return;

    const userMessage = input.trim();
    setInput('');
    setIsTyping(true);

    try {
      let conversationId = currentConversationId;
      
      if (!conversationId) {
        const newConversation = await createNewConversation();
        if (!newConversation) {
          throw new Error('Failed to create conversation');
        }
        conversationId = newConversation.id;
        setCurrentConversationId(conversationId);
        setConversations(prev => [newConversation, ...prev]);
      }

      // Save user message
      const userMsg = await saveMessage(conversationId, 'user', userMessage);
      if (userMsg) {
        const typedUserMsg: Message = {
          id: userMsg.id,
          role: 'user',
          content: userMsg.content,
          created_at: userMsg.created_at
        };
        setMessages(prev => [...prev, typedUserMsg]);
      }

      // Call the AI API
      const response = await supabase.functions.invoke('chat-ai', {
        body: { message: userMessage, conversation_id: conversationId }
      });

      if (response.error) {
        throw new Error(response.error.message || 'Failed to get AI response');
      }

      const aiResponse = response.data.message;
      
      // Save AI response
      const aiMsg = await saveMessage(conversationId, 'assistant', aiResponse);
      if (aiMsg) {
        const typedAiMsg: Message = {
          id: aiMsg.id,
          role: 'assistant',
          content: aiMsg.content,
          created_at: aiMsg.created_at
        };
        setMessages(prev => [...prev, typedAiMsg]);
      }

      // Update conversation title if it's the first message
      if (messages.length === 0) {
        const title = userMessage.length > 50 ? userMessage.substring(0, 50) + '...' : userMessage;
        await supabase
          .from('conversations')
          .update({ title })
          .eq('id', conversationId);
        
        setConversations(prev => 
          prev.map(conv => 
            conv.id === conversationId ? { ...conv, title } : conv
          )
        );
      }

    } catch (error: any) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to send message. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsTyping(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  const startNewConversation = () => {
    setCurrentConversationId(null);
    setMessages([]);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <div className="w-64 bg-card border-r border-border flex flex-col">
        <div className="p-4 border-b border-border">
          <h2 className="text-xl font-bold">
            <span className="text-primary">PROP</span>
            <span className="text-foreground">CLOUD</span>
          </h2>
        </div>
        
        <div className="p-4">
          <Button 
            onClick={startNewConversation}
            className="w-full mb-4"
            variant="outline"
          >
            <MessageCircle className="mr-2 h-4 w-4" />
            New Chat
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <div className="space-y-2">
            {conversations.map((conversation) => (
              <Card 
                key={conversation.id}
                className={`cursor-pointer transition-colors ${
                  currentConversationId === conversation.id 
                    ? 'bg-primary/20 border-primary' 
                    : 'hover:bg-accent'
                }`}
                onClick={() => setCurrentConversationId(conversation.id)}
              >
                <CardContent className="p-3">
                  <p className="text-sm font-medium truncate">
                    {conversation.title || 'New Conversation'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(conversation.created_at).toLocaleDateString()}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div className="p-4 border-t border-border">
          <Button 
            onClick={handleSignOut}
            variant="ghost"
            className="w-full"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </Button>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 ? (
            <div className="text-center text-muted-foreground py-12">
              <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg">Welcome to PropCloud AI</p>
              <p className="text-sm mt-2">Ask me about Miami real estate properties, ROI analysis, or market insights</p>
              <div className="mt-4 text-xs bg-accent p-3 rounded-lg max-w-md mx-auto">
                <p className="font-medium mb-2">Try asking:</p>
                <ul className="text-left space-y-1">
                  <li>• "What's the ROI on Ocean Drive properties?"</li>
                  <li>• "Compare investment potential in Miami Beach"</li>
                  <li>• "Show me the best value STR properties"</li>
                </ul>
              </div>
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <Card className={`max-w-[80%] ${
                  message.role === 'user' 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-card'
                }`}>
                  <CardContent className="p-3">
                    {message.role === 'assistant' ? (
                      <div className="prose prose-sm max-w-none dark:prose-invert">
                        <ReactMarkdown
                          remarkPlugins={[remarkGfm]}
                          components={{
                            p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                            ul: ({ children }) => <ul className="list-disc pl-4 mb-2">{children}</ul>,
                            ol: ({ children }) => <ol className="list-decimal pl-4 mb-2">{children}</ol>,
                            li: ({ children }) => <li className="mb-1">{children}</li>,
                            strong: ({ children }) => <strong className="font-semibold text-primary">{children}</strong>,
                            h1: ({ children }) => <h1 className="text-lg font-bold mb-2">{children}</h1>,
                            h2: ({ children }) => <h2 className="text-base font-bold mb-2">{children}</h2>,
                            h3: ({ children }) => <h3 className="text-sm font-bold mb-1">{children}</h3>,
                          }}
                        >
                          {message.content}
                        </ReactMarkdown>
                      </div>
                    ) : (
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    )}
                  </CardContent>
                </Card>
              </div>
            ))
          )}
          
          {isTyping && (
            <div className="flex justify-start">
              <Card className="bg-card">
                <CardContent className="p-3">
                  <div className="flex items-center space-x-2">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                      <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                    </div>
                    <span className="text-sm text-muted-foreground">PropCloud is analyzing...</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 border-t border-border">
          <form onSubmit={handleSendMessage} className="flex space-x-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about Miami real estate properties, ROI, or market insights..."
              className="flex-1"
              disabled={isTyping}
            />
            <Button type="submit" disabled={isTyping || !input.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
