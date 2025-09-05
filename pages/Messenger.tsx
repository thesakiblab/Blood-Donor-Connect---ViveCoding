import React, { useState, useEffect, useCallback } from 'react';
// FIX: Use namespace import for react-router-dom to avoid potential module resolution issues.
import * as ReactRouterDOM from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getConversations, MESSAGES_KEY } from '../services/db';
import { User, ChatMessage } from '../types';
import Chat from './Chat';
import Avatar from '../components/Avatar';

interface Conversation {
    otherUser: User;
    lastMessage: ChatMessage;
    unreadCount: number;
}

const Messenger: React.FC = () => {
    const { user } = useAuth();
    const { userId } = ReactRouterDOM.useParams<{ userId: string }>();
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchConversations = useCallback(async () => {
        if (user) {
            setLoading(true);
            try {
                const convos = await getConversations(user.id);
                setConversations(convos);
            } catch (error) {
                console.error("Failed to fetch conversations:", error);
            } finally {
                setLoading(false);
            }
        }
    }, [user]);

    useEffect(() => {
        fetchConversations();
    }, [fetchConversations]);

    // Add listener for real-time updates
    useEffect(() => {
        const handleStorageChange = (event: StorageEvent) => {
            if (event.key === MESSAGES_KEY) {
                fetchConversations();
            }
        };

        window.addEventListener('storage', handleStorageChange);

        return () => {
            window.removeEventListener('storage', handleStorageChange);
        };
    }, [fetchConversations]);

    const navLinkClass = ({ isActive }: { isActive: boolean }) =>
        `flex items-center space-x-3 w-full text-left p-3 border-b dark:border-gray-700 transition-colors ${
            isActive ? 'bg-red-50 dark:bg-red-900/50' : 'hover:bg-gray-50 dark:hover:bg-gray-700'
        }`;

    return (
        <div className="flex h-[calc(100vh-150px)] bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
            <div className="w-1/3 border-r dark:border-gray-700 flex flex-col">
                <div className="p-4 border-b dark:border-gray-700">
                    <h2 className="text-xl font-bold dark:text-white">Conversations</h2>
                </div>
                <div className="flex-1 overflow-y-auto">
                    {loading ? (
                        <p className="p-4 text-gray-500 dark:text-gray-400">Loading conversations...</p>
                    ) : conversations.length > 0 ? (
                        <ul>
                            {conversations.map(({ otherUser, lastMessage, unreadCount }) => (
                                <li key={otherUser.id}>
                                    <ReactRouterDOM.NavLink to={`/messenger/${otherUser.id}`} className={navLinkClass}>
                                        <Avatar name={otherUser.name} />
                                        <div className="flex-1 overflow-hidden">
                                            <div className="flex justify-between items-center">
                                                <h3 className={`font-semibold truncate ${unreadCount > 0 ? 'text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'}`}>{otherUser.name}</h3>
                                                {unreadCount > 0 && (
                                                    <span className="bg-red-600 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                                                        {unreadCount}
                                                    </span>
                                                )}
                                            </div>
                                            <p className={`text-sm truncate ${unreadCount > 0 ? 'text-gray-700 dark:text-gray-300' : 'text-gray-500 dark:text-gray-400'}`}>
                                                {lastMessage.from === user?.id && 'You: '}{lastMessage.message}
                                            </p>
                                        </div>
                                    </ReactRouterDOM.NavLink>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="p-4 text-gray-500 dark:text-gray-400">No conversations yet.</p>
                    )}
                </div>
            </div>
            <div className="w-2/3 flex flex-col">
                {userId ? (
                    <Chat />
                ) : (
                    <div className="flex items-center justify-center h-full">
                        <div className="text-center text-gray-500 dark:text-gray-400">
                            <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                            <h2 className="mt-2 text-lg font-medium dark:text-white">Select a conversation</h2>
                            <p className="mt-1 text-sm">Choose from your existing conversations or start a new one by searching for a donor.</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Messenger;