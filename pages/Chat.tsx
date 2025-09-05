import React, { useState, useEffect, useRef, useCallback } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getUserById, getMessages, addMessage, markMessagesAsRead, MESSAGES_KEY } from '../services/db';
import { User, ChatMessage } from '../types';
import Avatar from '../components/Avatar';

const TypingIndicator = () => (
    <div className="flex items-center space-x-1.5 p-3">
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse [animation-delay:-0.3s]"></div>
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse [animation-delay:-0.15s]"></div>
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></div>
    </div>
);

const ReadReceipt: React.FC<{ isRead: boolean }> = ({ isRead }) => (
    <span className={`text-xs ml-2 ${isRead ? 'text-sky-200' : 'text-red-200'}`}>
        {isRead ? '✓✓' : '✓'}
    </span>
);


const Chat: React.FC = () => {
    const { userId: otherUserId } = ReactRouterDOM.useParams<{ userId: string }>();
    const { user: currentUser } = useAuth();
    const [otherUser, setOtherUser] = useState<User | null>(null);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const loadChatData = useCallback(async () => {
        if (currentUser && otherUserId) {
            const [user, loadedMessages] = await Promise.all([
                getUserById(otherUserId),
                getMessages(currentUser.id, otherUserId),
            ]);
            setOtherUser(user);
            setMessages(loadedMessages);
            // Mark incoming messages as read
            markMessagesAsRead(otherUserId, currentUser.id);
        }
    }, [currentUser, otherUserId]);

    useEffect(() => {
        loadChatData();
    }, [loadChatData]);
    
    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        const handleStorageChange = (event: StorageEvent) => {
            if (event.key === MESSAGES_KEY) {
                loadChatData();
            }
        };
        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, [loadChatData]);
    
    // Simulate typing indicator
    useEffect(() => {
        const lastMessage = messages[messages.length - 1];
        if (lastMessage && otherUserId && lastMessage.from === otherUserId) {
            setIsTyping(true);
            const timer = setTimeout(() => setIsTyping(false), 1500 + Math.random() * 1000);
            return () => clearTimeout(timer);
        }
    }, [messages, otherUserId]);


    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newMessage.trim() && currentUser && otherUserId) {
            const message: Omit<ChatMessage, 'id'> = {
                from: currentUser.id,
                to: otherUserId,
                message: newMessage,
                timestamp: Date.now(),
                isRead: false,
            };
            await addMessage(message);
            setNewMessage('');
            loadChatData();
        }
    };
    
    if (!otherUser || !currentUser) {
        return <div className="text-center text-gray-500 dark:text-gray-400 flex items-center justify-center h-full">Loading chat...</div>;
    }
    
    return (
        <div className="w-full flex flex-col h-full bg-white dark:bg-gray-800">
            <div className="p-4 border-b dark:border-gray-700 flex items-center space-x-4">
                <Avatar name={otherUser.name} />
                <div>
                    <h2 className="text-xl font-bold text-gray-800 dark:text-white">{otherUser.name}</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Blood Group: <span className="font-semibold text-red-600">{otherUser.bloodGroup}</span></p>
                </div>
            </div>

            <div className="flex-1 p-4 overflow-y-auto bg-gray-50 dark:bg-gray-900 space-y-4">
                {messages.map((msg) => {
                    const isMyMessage = msg.from === currentUser.id;
                    const sender = isMyMessage ? currentUser : otherUser;
                    return (
                        <div key={msg.id} className={`flex items-end gap-2 ${isMyMessage ? 'justify-end' : 'justify-start'}`}>
                            {!isMyMessage && <Avatar name={sender.name} />}
                            <div className={`max-w-md p-3 rounded-lg ${isMyMessage ? 'bg-red-600 text-white rounded-br-none' : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-bl-none'}`}>
                                <p>{msg.message}</p>
                                <div className="text-right text-xs mt-1 flex items-center justify-end">
                                    <span className={isMyMessage ? 'text-red-200' : 'text-gray-500 dark:text-gray-400'}>
                                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                    {isMyMessage && <ReadReceipt isRead={msg.isRead} />}
                                </div>
                            </div>
                        </div>
                    );
                })}
                {isTyping && (
                    <div className="flex items-end gap-2 justify-start">
                         <Avatar name={otherUser.name} />
                         <div className="bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg rounded-bl-none">
                             <TypingIndicator />
                         </div>
                    </div>
                )}
                 <div ref={messagesEndRef} />
            </div>

            <div className="p-4 border-t dark:border-gray-700 bg-white dark:bg-gray-800">
                <form onSubmit={handleSendMessage} className="flex space-x-2">
                    <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type a message..."
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-red-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                    />
                    <button type="submit" className="bg-red-600 text-white w-10 h-10 rounded-full flex items-center justify-center hover:bg-red-700 transition-colors flex-shrink-0">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Chat;