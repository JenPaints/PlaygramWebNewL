import React, { useState, useRef, useEffect } from 'react';
import { Send, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Message {
    id: string;
    text: string;
    isUser: boolean;
    timestamp: Date;
}

interface BatchChatViewProps {
    onBack?: () => void;
}

export const BatchChatView: React.FC<BatchChatViewProps> = ({ onBack }) => {
    const [messages, setMessages] = useState<Message[]>([
        {
            id: '1',
            text: 'Lorem ipsum dolor sit amet',
            isUser: false,
            timestamp: new Date()
        },
        {
            id: '2',
            text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer non',
            isUser: true,
            timestamp: new Date()
        },
        {
            id: '3',
            text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer non ornare orci. Pellentesque orci velit, rutrum vel lectus ac, blandit suscipit nisl.',
            isUser: true,
            timestamp: new Date()
        }
    ]);

    const [inputText, setInputText] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSendMessage = () => {
        if (inputText.trim()) {
            const newMessage: Message = {
                id: Date.now().toString(),
                text: inputText.trim(),
                isUser: true,
                timestamp: new Date()
            };

            setMessages(prev => [...prev, newMessage]);
            setInputText('');
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    return (
        <div className="flex flex-col h-screen bg-white">
            {/* Header */}
            <div className="bg-white px-4 py-4 border-b border-gray-100">
                <div className="flex items-center gap-3">
                    {onBack && (
                        <button
                            onClick={onBack}
                            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5 text-gray-600" />
                        </button>
                    )}

                    {/* FitBot Avatar and Info */}
                    <div className="flex items-center gap-3">
                        {/* Avatar */}
                        <div className="w-11 h-11 rounded-full border border-[#377C92] bg-[#F3FAFD] flex items-center justify-center">
                            <div className="w-6 h-6 relative">
                                {/* Bot Icon - Simple representation */}
                                <div className="w-full h-full bg-[#377C92] rounded-sm"></div>
                            </div>
                        </div>

                        {/* Name + Activity */}
                        <div className="flex flex-col">
                            <h3 className="text-sm font-bold text-[#202325] leading-5">
                                Batch No 21
                            </h3>
                            <p className="text-xs font-medium text-[#72777A] leading-4">
                                You, Coach, Student 1, Studen...
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Messages Container */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
                <AnimatePresence>
                    {messages.map((message) => (
                        <motion.div
                            key={message.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.3 }}
                            className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
                        >
                            {message.isUser ? (
                                /* User Message */
                                <div className="max-w-[330px]">
                                    <div
                                        className="px-4 py-2.5 bg-[#377C92] text-white rounded-3xl rounded-br-none"
                                        style={{
                                            borderRadius: '24px 24px 0px 24px'
                                        }}
                                    >
                                        <p className="text-base leading-6 text-right font-normal">
                                            {message.text}
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                /* Bot Message */
                                <div className="flex items-start gap-2 max-w-[275px]">
                                    {/* Bot Avatar */}
                                    <div className="w-8 h-8 rounded-full border border-[#4A7A35] bg-[#F6FDF3] flex-shrink-0"></div>

                                    {/* Message Bubble */}
                                    <div
                                        className="px-4 py-2.5 bg-gray-100 text-black rounded-3xl rounded-tl-none flex-1"
                                        style={{
                                            borderRadius: '0px 24px 24px 24px'
                                        }}
                                    >
                                        <p className="text-base leading-6 font-normal">
                                            {message.text}
                                        </p>
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    ))}
                </AnimatePresence>
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="bg-white px-4 py-4 border-t border-gray-100">
                <div className="flex items-center gap-3">
                    {/* Text Input */}
                    <div className="flex-1 relative">
                        <input
                            type="text"
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder="Type a message..."
                            className="w-full px-6 py-2.5 bg-white border border-[#979C9E] rounded-full text-sm text-gray-900 placeholder-[#64748B] focus:outline-none focus:border-[#377C92] transition-colors"
                            style={{
                                borderRadius: '30px',
                                fontFamily: 'Manrope, sans-serif'
                            }}
                        />
                    </div>

                    {/* Send Button */}
                    <button
                        onClick={handleSendMessage}
                        disabled={!inputText.trim()}
                        className="w-11 h-11 bg-black rounded-full flex items-center justify-center hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        style={{
                            borderRadius: '22px'
                        }}
                    >
                        <Send className="w-6 h-6 text-white" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default BatchChatView;