import { useState, useEffect, useRef } from 'react';
import {
    X,
    Send,
    MessageCircle,
    User,
    CheckCircle
} from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface PeerChatProps {
    sessionId: string;
    currentUserId: string;
    peerName: string;
    topic: string;
    onClose: () => void;
    onEndSession: () => void;
}

interface ChatMessage {
    id: string;
    sender_id: string;
    content: string;
    sent_at: string;
}

export default function PeerChat({
    sessionId,
    currentUserId,
    peerName,
    topic,
    onClose,
    onEndSession
}: PeerChatProps) {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [peerTyping, setPeerTyping] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Scroll to bottom when new messages arrive
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Subscribe to real-time messages
    useEffect(() => {
        // Load existing messages
        const loadMessages = async () => {
            const { data } = await supabase
                .from('peer_messages')
                .select('*')
                .eq('session_id', sessionId)
                .order('sent_at', { ascending: true });

            if (data) {
                setMessages(data);
            }
        };

        loadMessages();

        // Subscribe to new messages
        const channel = supabase
            .channel(`peer_chat_${sessionId}`)
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'peer_messages',
                    filter: `session_id=eq.${sessionId}`
                },
                (payload) => {
                    const newMsg = payload.new as ChatMessage;
                    setMessages(prev => [...prev, newMsg]);
                }
            )
            .on(
                'broadcast',
                { event: 'typing' },
                (payload) => {
                    if (payload.payload.user_id !== currentUserId) {
                        setPeerTyping(true);
                        setTimeout(() => setPeerTyping(false), 2000);
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [sessionId, currentUserId]);

    const sendMessage = async () => {
        if (!newMessage.trim()) return;

        const message = {
            session_id: sessionId,
            sender_id: currentUserId,
            content: newMessage.trim(),
            sent_at: new Date().toISOString()
        };

        // Optimistically add message
        const tempId = `temp_${Date.now()}`;
        setMessages(prev => [...prev, { ...message, id: tempId }]);
        setNewMessage('');

        // Send to database
        const { error } = await supabase
            .from('peer_messages')
            .insert([message]);

        if (error) {
            console.error('Error sending message:', error);
            // Remove optimistic message on error
            setMessages(prev => prev.filter(m => m.id !== tempId));
        }
    };

    const handleTyping = () => {
        if (!isTyping) {
            setIsTyping(true);

            // Broadcast typing indicator
            supabase
                .channel(`peer_chat_${sessionId}`)
                .send({
                    type: 'broadcast',
                    event: 'typing',
                    payload: { user_id: currentUserId }
                });
        }

        // Clear existing timeout
        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }

        // Set new timeout
        typingTimeoutRef.current = setTimeout(() => {
            setIsTyping(false);
        }, 1000);
    };

    const formatTime = (timestamp: string) => {
        return new Date(timestamp).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg h-[600px] flex flex-col overflow-hidden animate-in zoom-in-95">
                {/* Header */}
                <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-4 text-white">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                                <User className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="font-semibold">{peerName}</h3>
                                <p className="text-xs text-purple-200">
                                    {peerTyping ? 'Typing...' : 'Online'}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={onEndSession}
                                className="px-3 py-1.5 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium transition-colors"
                            >
                                End Session
                            </button>
                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-white/20 rounded-full transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    {/* Topic Banner */}
                    <div className="mt-3 px-3 py-2 bg-white/10 rounded-lg">
                        <p className="text-xs text-purple-200">Discussion Topic</p>
                        <p className="text-sm font-medium">{topic}</p>
                    </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
                    {messages.length === 0 && (
                        <div className="text-center py-8 text-gray-500">
                            <MessageCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
                            <p>Start the conversation!</p>
                            <p className="text-sm">Ask questions about {topic}</p>
                        </div>
                    )}

                    {messages.map((msg) => (
                        <div
                            key={msg.id}
                            className={`flex ${msg.sender_id === currentUserId ? 'justify-end' : 'justify-start'}`}
                        >
                            <div
                                className={`max-w-[75%] px-4 py-2 rounded-2xl ${msg.sender_id === currentUserId
                                    ? 'bg-purple-500 text-white rounded-br-md'
                                    : 'bg-white text-gray-800 shadow-sm border rounded-bl-md'
                                    }`}
                            >
                                <p className="text-sm">{msg.content}</p>
                                <div className={`flex items-center gap-1 mt-1 ${msg.sender_id === currentUserId ? 'justify-end' : 'justify-start'
                                    }`}>
                                    <span className={`text-xs ${msg.sender_id === currentUserId
                                        ? 'text-purple-200'
                                        : 'text-gray-400'
                                        }`}>
                                        {formatTime(msg.sent_at)}
                                    </span>
                                    {msg.sender_id === currentUserId && (
                                        <CheckCircle className="w-3 h-3 text-purple-200" />
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}

                    {/* Typing Indicator */}
                    {peerTyping && (
                        <div className="flex justify-start">
                            <div className="bg-white px-4 py-2 rounded-2xl rounded-bl-md shadow-sm border">
                                <div className="flex gap-1">
                                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
                                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100"></span>
                                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></span>
                                </div>
                            </div>
                        </div>
                    )}

                    <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div className="p-4 bg-white border-t">
                    <div className="flex items-center gap-2">
                        <input
                            type="text"
                            value={newMessage}
                            onChange={(e) => {
                                setNewMessage(e.target.value);
                                handleTyping();
                            }}
                            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                            placeholder="Type your message..."
                            className="flex-1 px-4 py-3 bg-gray-100 rounded-xl border-0 focus:ring-2 focus:ring-purple-500 transition-all"
                        />
                        <button
                            onClick={sendMessage}
                            disabled={!newMessage.trim()}
                            className="p-3 bg-purple-500 text-white rounded-xl hover:bg-purple-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Send className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
