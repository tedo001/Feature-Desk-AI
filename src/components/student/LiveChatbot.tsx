import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Send, Bot, User, Menu, X, Plus
} from 'lucide-react';
import { gemini20Flash, CHATBOT_FORMATTING_PROMPT } from '../../lib/gemini';
import { useAuth } from '../../contexts/AuthContext';
import MarkdownRenderer from '../common/MarkdownRenderer';
import { firestoreService } from '../../lib/firebaseService';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  type?: 'info' | 'help' | 'explanation';
}

interface ChatSession {
  id: string;
  userId: string;
  title: string;
  createdAt: any;
  lastMessageAt: any;
  preview: string;
}

export default function LiveChatbot() {
  const navigate = useNavigate();
  const { user, userType } = useAuth();

  // State
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load Sessions
  useEffect(() => {
    if (user?.id) {
      loadSessions();
    }
  }, [user]);

  const loadSessions = async () => {
    if (!user?.id) return;
    try {
      const userSessions = await firestoreService.getUserSessions(user.id);
      setSessions(userSessions);
      if (userSessions.length > 0 && !currentSessionId) {
        // Load most recent session initially if none selected, 
        // BUT for "New Chat" UX, maybe we should start fresh or just select the top one.
        // Let's select the top one for continuity.
        setCurrentSessionId(userSessions[0].id);
      } else if (userSessions.length === 0) {
        createNewSession(); // Auto-create first session
      }
    } catch (err) {
      console.error("Failed to load sessions", err);
    }
  };

  const createNewSession = async () => {
    if (!user?.id) return;
    try {
      const newId = await firestoreService.createChatSession(user.id);
      setCurrentSessionId(newId);

      // Personalized Welcome Message
      const name = userType === 'teacher'
        ? (user as any)?.teacher_name || 'Teacher'
        : (user as any)?.student_name || 'Student';

      const welcomeMsg = userType === 'teacher'
        ? `Hello ${name}! I'm your AI teaching assistant. I can help with lesson planning, grading rubrics, or creating quiz questions.`
        : `Hello ${name}! I'm your AI learning assistant. How can I help you today?`;

      setMessages([{
        id: 'welcome',
        content: welcomeMsg,
        sender: 'bot',
        timestamp: new Date(),
        type: 'info'
      }]);

      loadSessions(); // Refresh list to show 'New Chat'
      if (window.innerWidth < 768) setIsSidebarOpen(false);
    } catch (e) {
      console.error("Error creating session", e);
    }
  };

  // Subscribe to Chat Messages for Current Session
  useEffect(() => {
    if (user?.id && currentSessionId) {
      setMessages([]); // Clear previous messages while loading
      const unsubscribe = firestoreService.subscribeToChat(user.id, (loadedMessages) => {
        if (loadedMessages.length > 0) {
          setMessages(loadedMessages);
        } else if (loadedMessages.length === 0) {
          // New empty session
          const name = userType === 'teacher'
            ? (user as any)?.teacher_name || 'Teacher'
            : (user as any)?.student_name || 'Student';
          const welcomeMsg = userType === 'teacher'
            ? `Hello ${name}! I'm your AI teaching assistant. I can help with lesson planning, grading rubrics, or creating quiz questions.`
            : `Hello ${name}! I'm your AI learning assistant. I can help with Math, Science, and more. How can I help you today?`;

          setMessages([{
            id: 'welcome',
            content: welcomeMsg,
            sender: 'bot',
            timestamp: new Date(),
            type: 'info'
          }]);
        }
      }, currentSessionId);
      return () => unsubscribe();
    }
  }, [user, currentSessionId]);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);


  const generateResponse = async (userMessage: string): Promise<string> => {
    try {
      // Enhanced Context based on Role
      let context = '';

      if (userType === 'teacher') {
        const teacher = user as any;
        context = `You are an expert educational AI assistant helping a TEACHER named ${teacher.teacher_name || 'Teacher'}.
          They teach Class ${teacher.assigned_class} and subjects: ${teacher.assigned_subjects?.join(', ')}.
          
          Your goal is to assist with:
          - Lesson planning and curriculum design.
          - Creating quiz questions and grading rubrics.
          - Strategies for student engagement and intervention.
          - Explaining complex topics for teaching purposes.
          
          Tone: Professional, supportive, and efficient.`;
      } else {
        const student = user as any;
        context = `You are an educational AI assistant helping a STUDENT named ${student.student_name || 'Student'} 
          who is in class ${student.current_class} studying ${student.current_subject}. 
          
          CRITICAL INSTRUCTIONS:
          1. **Math & Science**: If the question involves math or physics formulas, YOU MUST use LaTeX formatting for inline math ($...$) and block equations ($$...$$).
             Example: "The quadratic formula is $$x = \\frac{-b \\pm \\sqrt{b^2-4ac}}{2a}$$"
          2. **Step-by-Step**: Provide logical, step-by-step explanations for complex problems. Use bold headings (e.g., **Step 1:**) for clarity.
          3. **Guidance**: If asked for homework answers, do not give the final answer immediately. Explain the *process* first.
          4. **Formatting**: Use markdown for bold (**text**), italics (*text*), lists, and code blocks.
          
          ${CHATBOT_FORMATTING_PROMPT}`;
      }

      const prompt = `${context}\n\nUser Question: ${userMessage}\n\nProvide a well-formatted response using markdown and LaTeX where appropriate.`;

      const result = await gemini20Flash.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error: any) {
      console.error('Error generating response:', error);
      if (error.message?.includes('429') || error.message?.includes('quota')) {
        return "⚠️ **AI Busy**: I'm receiving too many requests right now. Please wait about 30 seconds and try again.";
      }
      return "I'm having trouble processing your request right now. Please try again in a moment.";
    }
  };

  const handleSendMessage = async () => {
    if (inputValue.trim() === '') return;
    const userMsgContent = inputValue;
    setInputValue('');
    setIsTyping(true);

    if (user?.id) {
      // Ensure we have a session
      let sessionId = currentSessionId;
      if (!sessionId) {
        sessionId = await firestoreService.createChatSession(user.id);
        setCurrentSessionId(sessionId);
      }

      // Save User Message
      await firestoreService.saveChatMessage(user.id, {
        content: userMsgContent,
        sender: 'user'
      }, sessionId);

      // Auto-title if it's the first real message (or close to start)
      // We can just call update title logic. firestoreService handles logic or we do it here.
      // Let's do a simple check: if session title is 'New Chat', generate one.
      const currentSession = sessions.find(s => s.id === sessionId);
      if (currentSession && (currentSession.title === 'New Chat' || currentSession.title === 'Chat Session')) {
        generateTitle(sessionId, userMsgContent);
      }
    }

    // Generate response
    const responseText = await generateResponse(userMsgContent);

    // Save Bot Message
    if (user?.id && currentSessionId) {
      await firestoreService.saveChatMessage(user.id, {
        content: responseText,
        sender: 'bot'
      }, currentSessionId);
    }
    setIsTyping(false);
  };

  const generateTitle = async (sessionId: string, firstMessage: string) => {
    try {
      const prompt = `Generate a very short, concise title (max 4-5 words) for a chat that starts with this message: "${firstMessage}". Return ONLY the title, no quotes.`;
      const result = await gemini20Flash.generateContent(prompt);
      const title = (await result.response).text().trim();
      if (title) {
        await firestoreService.updateSessionTitle(sessionId, title);
        loadSessions(); // Refresh title in sidebar
      }
    } catch (e) {
      console.error("Auto-title failed", e);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="bg-gray-50 h-screen w-full flex overflow-hidden">

      {/* Sidebar - Sessions */}
      <div
        className={`${isSidebarOpen ? 'w-80 translate-x-0' : 'w-0 -translate-x-full opacity-0'} bg-white border-r border-gray-200 transition-all duration-300 ease-in-out flex flex-col z-20 absolute md:relative h-full shadow-lg md:shadow-none`}
      >
        <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-white">
          <button
            onClick={createNewSession}
            className="flex-1 flex items-center gap-2 bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span className="font-medium text-sm">New Chat</span>
          </button>
          <button onClick={() => setIsSidebarOpen(false)} className="md:hidden p-2 text-gray-500 hover:bg-gray-100 rounded-lg ml-2">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-1">
          {sessions.length === 0 && (
            <div className="text-center p-8 text-gray-400 text-sm">No chat history</div>
          )}

          {sessions.map((session) => (
            <button
              key={session.id}
              onClick={() => {
                setCurrentSessionId(session.id);
                if (window.innerWidth < 768) setIsSidebarOpen(false);
              }}
              className={`w-full text-left p-3 rounded-xl transition-all group relative ${currentSessionId === session.id
                ? 'bg-indigo-50 text-indigo-900 shadow-sm ring-1 ring-indigo-200'
                : 'text-gray-700 hover:bg-gray-100'
                }`}
            >
              <div className="font-medium text-sm truncate pr-4">{session.title || 'New Chat'}</div>
              <div className="text-xs text-gray-400 mt-1 truncate">{session.preview || 'Start a conversation'}</div>
            </button>
          ))}
        </div>

        {/* User Profile Footer */}
        <div className="p-4 border-t border-gray-100 bg-gray-50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm shadow-sm">
              {user?.email?.[0].toUpperCase()}
            </div>
            <div className="flex-1 overflow-hidden">
              <div className="text-sm font-semibold text-gray-900 truncate">
                {userType === 'teacher' ? (user as any)?.teacher_name : (user as any)?.student_name || 'User'}
              </div>
              <div className="text-xs text-gray-500 truncate flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                {userType === 'teacher' ? 'Teacher Plan' : 'Student Plan'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col h-full bg-white relative">
        {/* Header */}
        <header className="h-16 border-b border-gray-100 flex items-center px-4 justify-between bg-white/80 backdrop-blur z-10 sticky top-0">
          <div className="flex items-center gap-3">
            {!isSidebarOpen && (
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <Menu className="w-5 h-5 text-gray-600" />
              </button>
            )}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-sm">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <h1 className="font-bold text-gray-900 text-sm md:text-base">Feature Desk AI</h1>
                <p className="text-xs text-gray-500 hidden md:block">
                  {userType === 'teacher' ? 'Lesson Planning & Grading Assistant' : 'Personal 24/7 Tutor'}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('/')}
              className="p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-900 rounded-full transition-colors"
              title="Back to Dashboard"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 scroll-smooth">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex items-start gap-4 max-w-4xl mx-auto ${msg.sender === 'user' ? 'flex-row-reverse' : ''
                }`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm ${msg.sender === 'user'
                  ? 'bg-gray-900 text-white'
                  : 'bg-gradient-to-tr from-cyan-500 to-blue-600 text-white'
                  }`}
              >
                {msg.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              <div
                className={`group relative max-w-[85%] md:max-w-[75%] rounded-2xl px-5 py-3.5 shadow-sm ${msg.sender === 'user'
                  ? 'bg-gray-100 text-gray-900 rounded-tr-none'
                  : 'bg-white border border-gray-100 text-gray-800 rounded-tl-none ring-1 ring-black/5'
                  }`}
              >
                {msg.sender === 'bot' ? (
                  <MarkdownRenderer content={msg.content} className="prose prose-sm max-w-none" />
                ) : (
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                )}
                <div className={`text-[10px] mt-1 opacity-0 group-hover:opacity-100 transition-opacity absolute bottom-1 ${msg.sender === 'user' ? 'left-2 text-gray-500' : 'right-2 text-gray-400'
                  }`}>
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex items-start gap-4 max-w-4xl mx-auto">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-sm">
                <Bot className="w-4 h-4" />
              </div>
              <div className="bg-white border border-gray-100 rounded-2xl rounded-tl-none px-5 py-4 shadow-sm ring-1 ring-black/5">
                <div className="flex space-x-1.5">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 bg-white/80 backdrop-blur border-t border-gray-100">
          <div className="max-w-4xl mx-auto relative">
            <textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Ask anything... (Math, Science, Essays)"
              className="w-full bg-gray-50 border border-gray-200 rounded-2xl pl-5 pr-14 py-4 focus:ring-2 focus:ring-cyan-500 focus:border-transparent resize-none shadow-sm transition-shadow min-h-[60px] max-h-[200px]"
              rows={1}
              style={{ minHeight: '60px' }}
            />
            <button
              onClick={handleSendMessage}
              disabled={!inputValue.trim() || isTyping}
              className="absolute right-3 bottom-3 p-2 bg-black text-white rounded-xl hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg active:scale-95"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
          <div className="text-center mt-2">
            <p className="text-[10px] text-gray-400">
              AI can make mistakes. Please verify important information. • Supported: LaTeX Math ($$), Code Blocks, Tables
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
