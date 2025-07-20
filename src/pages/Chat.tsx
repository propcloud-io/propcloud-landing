import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { Send, Loader2, ArrowLeft, User, Bot } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate, Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import GenerateEmbeddingsButton from "@/components/GenerateEmbeddingsButton";

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

const Chat = () => {
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Redirect if not authenticated
  if (!authLoading && !user) {
    return <Navigate to="/auth" replace />;
  }

  // Show loading state while checking auth
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const loadConversations = async () => {
    try {
      const { data, error } = await supabase
        .from('conversations')
        .select('*')
        .order('updated_at', { ascending: false });

      if (error) throw error;
      setConversations(data || []);
    } catch (error) {
      console.error('Error loading conversations:', error);
    }
  };

  const loadMessages = async (conversationId: string) => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      
      // Type assertion to ensure role is properly typed
      const typedMessages: Message[] = (data || []).map(msg => ({
        ...msg,
        role: msg.role as 'user' | 'assistant'
      }));
      
      setMessages(typedMessages);
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const createConversation = async (title: string = 'New Conversation') => {
    try {
      const { data, error } = await supabase
        .from('conversations')
        .insert([{ title, user_id: user!.id }])
        .select()
        .single();

      if (error) throw error;
      return data.id;
    } catch (error) {
      console.error('Error creating conversation:', error);
      return null;
    }
  };

  const saveMessage = async (conversationId: string, role: 'user' | 'assistant', content: string) => {
    try {
      const { error } = await supabase
        .from('messages')
        .insert([{
          conversation_id: conversationId,
          role,
          content
        }]);

      if (error) throw error;
    } catch (error) {
      console.error('Error saving message:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput("");
    setIsLoading(true);

    try {
      // Create conversation if none exists
      let conversationId = currentConversationId;
      if (!conversationId) {
        conversationId = await createConversation(userMessage.slice(0, 50) + '...');
        if (!conversationId) {
          throw new Error('Failed to create conversation');
        }
        setCurrentConversationId(conversationId);
        await loadConversations();
      }

      // Add user message to UI immediately
      const userMsg: Message = {
        id: Date.now().toString(),
        role: 'user',
        content: userMessage,
        created_at: new Date().toISOString()
      };
      setMessages(prev => [...prev, userMsg]);

      // Save user message
      await saveMessage(conversationId, 'user', userMessage);

      // Call the AI chat function
      const { data, error } = await supabase.functions.invoke('chat-ai', {
        body: { 
          message: userMessage,
          conversation_id: conversationId
        }
      });

      if (error) {
        console.error('AI function error:', error);
        throw error;
      }

      // Add AI response
      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.response || 'Sorry, I encountered an error processing your request.',
        created_at: new Date().toISOString()
      };
      setMessages(prev => [...prev, aiMsg]);

      // Save AI message
      await saveMessage(conversationId, 'assistant', aiMsg.content);

    } catch (error: any) {
      console.error('Error in chat:', error);
      toast({
        title: "Error",
        description: "Failed to get AI response. Please try again.",
        variant: "destructive"
      });

      // Add error message to chat
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        created_at: new Date().toISOString()
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const startNewConversation = () => {
    setCurrentConversationId(null);
    setMessages([]);
  };

  const selectConversation = (conversation: Conversation) => {
    setCurrentConversationId(conversation.id);
    loadMessages(conversation.id);
  };

  useEffect(() => {
    if (user) {
      loadConversations();
    }
  }, [user]);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="container mx-auto p-4 h-screen flex flex-col max-w-6xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Link to="/" className="flex items-center text-sm text-muted-foreground hover:text-foreground">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to home
            </Link>
            <h1 className="text-2xl font-bold">PropCloud AI</h1>
          </div>
          <div className="flex items-center gap-4">
            <GenerateEmbeddingsButton />
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <User className="h-4 w-4" />
              {user?.email}
            </div>
          </div>
        </div>

        <div className="flex gap-6 flex-1 min-h-0">
          {/* Sidebar */}
          <Card className="w-80 flex flex-col">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Conversations</CardTitle>
                <Button size="sm" onClick={startNewConversation}>
                  New Chat
                </Button>
              </div>
            </CardHeader>
            <CardContent className="flex-1 min-h-0">
              <ScrollArea className="h-full">
                <div className="space-y-2">
                  {conversations.map((conv) => (
                    <Button
                      key={conv.id}
                      variant={currentConversationId === conv.id ? "secondary" : "ghost"}
                      className="w-full justify-start h-auto p-3 text-left"
                      onClick={() => selectConversation(conv)}
                    >
                      <div className="truncate">
                        <div className="font-medium truncate">{conv.title}</div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(conv.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    </Button>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Main Chat Area */}
          <Card className="flex-1 flex flex-col">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">
                {currentConversationId ? 'Chat' : 'Start a New Conversation'}
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col min-h-0">
              {/* Messages */}
              <ScrollArea className="flex-1 mb-4" ref={scrollAreaRef}>
                <div className="space-y-4 pr-4">
                  {messages.length === 0 && !currentConversationId && (
                    <div className="text-center text-muted-foreground py-12">
                      <Bot className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p className="text-lg mb-2">Welcome to PropCloud AI!</p>
                      <p className="mb-4">Ask me anything about real estate properties, market trends, or investment opportunities.</p>
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm">
                        <p className="font-medium text-blue-800 mb-2">🚀 First time here?</p>
                        <p className="text-blue-700">Click "Generate AI Embeddings" above to enable intelligent property search and analysis!</p>
                      </div>
                    </div>
                  )}
                  
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex gap-3 ${
                        message.role === 'user' ? 'justify-end' : 'justify-start'
                      }`}
                    >
                      <div
                        className={`max-w-[80%] rounded-lg p-3 ${
                          message.role === 'user'
                            ? 'bg-primary text-primary-foreground ml-auto'
                            : 'bg-muted'
                        }`}
                      >
                        <div className="flex items-start gap-2">
                          {message.role === 'assistant' && (
                            <Bot className="h-5 w-5 mt-0.5 flex-shrink-0" />
                          )}
                          <div className="flex-1">
                            <p className="whitespace-pre-wrap">{message.content}</p>
                            <p className="text-xs opacity-70 mt-1">
                              {new Date(message.created_at).toLocaleTimeString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {isLoading && (
                    <div className="flex gap-3 justify-start">
                      <div className="bg-muted rounded-lg p-3 max-w-[80%]">
                        <div className="flex items-center gap-2">
                          <Bot className="h-5 w-5" />
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span>Thinking...</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </ScrollArea>

              {/* Input Form */}
              <form onSubmit={handleSubmit} className="flex gap-2">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask about properties, market trends, or investments..."
                  disabled={isLoading}
                  className="flex-1"
                />
                <Button type="submit" disabled={isLoading || !input.trim()}>
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Chat;
