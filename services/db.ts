import { User, ChatMessage, UserRole, BloodGroup } from '../types';
import { md5 } from './crypto';

export const USERS_KEY = 'blood_donor_users';
export const ADMINS_KEY = 'blood_donor_admins';
export const MESSAGES_KEY = 'blood_donor_messages';

// Mock data to seed the application
const getInitialUsers = (): User[] => [
    { id: '1672531200000', name: 'John Doe', email: 'john.doe@example.com', password: '202cb962ac59075b964b07152d234b70', role: UserRole.DONOR, phone: '123-456-7890', city: 'New York', country: 'USA', bloodGroup: BloodGroup.A_POSITIVE, lastDonationDate: '2023-10-15', isVerified: true, contactVisible: true, isPhoneVerified: true },
    { id: '1675209600000', name: 'Jane Smith', email: 'jane.smith@example.com', password: '202cb962ac59075b964b07152d234b70', role: UserRole.DONOR, phone: '234-567-8901', city: 'London', country: 'UK', bloodGroup: BloodGroup.O_NEGATIVE, isVerified: true, contactVisible: true, isPhoneVerified: true },
    { id: '1677628800000', name: 'Peter Jones', email: 'peter.jones@example.com', password: '202cb962ac59075b964b07152d234b70', role: UserRole.DONOR, phone: '345-678-9012', city: 'New York', country: 'USA', bloodGroup: BloodGroup.B_POSITIVE, lastDonationDate: '2024-05-15', isVerified: true, contactVisible: false, isPhoneVerified: true },
    { id: '1680307200000', name: 'Mary Williams', email: 'mary.williams@example.com', password: '202cb962ac59075b964b07152d234b70', role: UserRole.DONOR, phone: '456-789-0123', city: 'Sydney', country: 'Australia', bloodGroup: BloodGroup.A_POSITIVE, lastDonationDate: '2024-01-20', isVerified: false, contactVisible: true, isPhoneVerified: true },
    { id: '1682899200001', name: 'David Lee', email: 'david.lee@example.com', password: '202cb962ac59075b964b07152d234b70', role: UserRole.DONOR, phone: '567-890-1234', city: 'Toronto', country: 'Canada', bloodGroup: BloodGroup.AB_POSITIVE, lastDonationDate: '2023-01-01', isVerified: true, contactVisible: true, isPhoneVerified: true },
];

const getInitialAdmins = (): User[] => [
    { id: '1672444800000', name: 'Admin User', email: 'admin@example.com', password: '21232f297a57a5a743894a0e4a801fc3', role: UserRole.ADMIN, phone: '555-555-5555', city: 'AdminCity', country: 'AdminCountry', bloodGroup: BloodGroup.AB_POSITIVE, isVerified: true, contactVisible: false, isPhoneVerified: true },
];

// Initialize localStorage with mock data if it's empty
const initializeDb = () => {
    if (!localStorage.getItem(USERS_KEY)) {
        localStorage.setItem(USERS_KEY, JSON.stringify(getInitialUsers()));
    }
     if (!localStorage.getItem(ADMINS_KEY)) {
        localStorage.setItem(ADMINS_KEY, JSON.stringify(getInitialAdmins()));
    }
    if (!localStorage.getItem(MESSAGES_KEY)) {
        localStorage.setItem(MESSAGES_KEY, JSON.stringify([]));
    }
};
initializeDb();

// --- User/Donor specific functions ---
export const getUsers = async (): Promise<User[]> => {
    const users = JSON.parse(localStorage.getItem(USERS_KEY) || '[]') as User[];
    return users;
};

// --- Admin specific functions ---
export const getAdmins = async (): Promise<User[]> => {
    return JSON.parse(localStorage.getItem(ADMINS_KEY) || '[]') as User[];
};

// --- Combined User Management ---
export const getAllSystemUsers = async (): Promise<User[]> => {
    const donors = await getUsers();
    const admins = await getAdmins();
    return [...donors, ...admins].sort((a,b) => parseInt(a.id) - parseInt(b.id));
};


export const getUserById = async (id: string): Promise<User | null> => {
    const allUsers = await getAllSystemUsers();
    return allUsers.find(user => user.id === id) || null;
};

export const getUserByEmail = async (email: string): Promise<User | null> => {
    const allUsers = await getAllSystemUsers();
    return allUsers.find(user => user.email.toLowerCase() === email.toLowerCase()) || null;
};


export const addUser = async (userData: Omit<User, 'id'>): Promise<User> => {
    const hashedPassword = userData.password ? md5(userData.password) : '';
    const newUser: User = { ...userData, id: String(Date.now()), password: hashedPassword };

    if (userData.role === UserRole.ADMIN) {
        const admins = await getAdmins();
        admins.push(newUser);
        localStorage.setItem(ADMINS_KEY, JSON.stringify(admins));
    } else {
        const users = await getUsers();
        users.push(newUser);
        localStorage.setItem(USERS_KEY, JSON.stringify(users));
    }
    return newUser;
};

export const updateUser = async (id: string, updateData: Partial<Omit<User, 'id' | 'email' | 'role'>>): Promise<User> => {
    const userToUpdate = await getUserById(id);
    if (!userToUpdate) throw new Error('User not found');
    
    // Hash password if it is being changed
    if (updateData.password) {
        updateData.password = md5(updateData.password);
    } else {
        delete updateData.password;
    }
    
    const updatedUser = { ...userToUpdate, ...updateData };

    if (userToUpdate.role === UserRole.ADMIN) {
        let admins = await getAdmins();
        const adminIndex = admins.findIndex(admin => admin.id === id);
        if (adminIndex === -1) throw new Error('Admin not found for update');
        admins[adminIndex] = updatedUser;
        localStorage.setItem(ADMINS_KEY, JSON.stringify(admins));
    } else {
        let users = await getUsers();
        const userIndex = users.findIndex(user => user.id === id);
        if (userIndex === -1) throw new Error('User not found for update');
        users[userIndex] = updatedUser;
        localStorage.setItem(USERS_KEY, JSON.stringify(users));
    }
    return updatedUser;
};

export const deleteUser = async (id: string): Promise<void> => {
    const userToDelete = await getUserById(id);
    if (!userToDelete) return;

    if (userToDelete.role === UserRole.ADMIN) {
        let admins = await getAdmins();
        admins = admins.filter(admin => admin.id !== id);
        localStorage.setItem(ADMINS_KEY, JSON.stringify(admins));
    } else {
        let users = await getUsers();
        users = users.filter(user => user.id !== id);
        localStorage.setItem(USERS_KEY, JSON.stringify(users));
    }
};


// --- Chat Message CRUD ---
export const getAllMessages = async (): Promise<ChatMessage[]> => {
    return JSON.parse(localStorage.getItem(MESSAGES_KEY) || '[]') as ChatMessage[];
};

export const getMessages = async (userId1: string, userId2: string): Promise<ChatMessage[]> => {
    const allMessages = await getAllMessages();
    return allMessages
        .filter(msg => 
            (msg.from === userId1 && msg.to === userId2) || 
            (msg.from === userId2 && msg.to === userId1)
        )
        .sort((a, b) => a.timestamp - b.timestamp);
};

export const addMessage = async (messageData: Omit<ChatMessage, 'id'>): Promise<ChatMessage> => {
    const messages = await getAllMessages();
    const newMessage: ChatMessage = { ...messageData, id: String(Date.now()), isRead: false };
    messages.push(newMessage);
    localStorage.setItem(MESSAGES_KEY, JSON.stringify(messages));
    // Dispatch a storage event so other tabs can update in real-time
    window.dispatchEvent(new StorageEvent('storage', { key: MESSAGES_KEY }));
    return newMessage;
};

export const getConversations = async (userId: string): Promise<{otherUser: User, lastMessage: ChatMessage, unreadCount: number}[]> => {
    const allMessages = await getAllMessages();
    const userMessages = allMessages.filter(msg => msg.from === userId || msg.to === userId);
    
    const conversationsMap = new Map<string, {otherUserId: string, messages: ChatMessage[]}>();

    for (const msg of userMessages) {
        const otherUserId = msg.from === userId ? msg.to : msg.from;
        if (!conversationsMap.has(otherUserId)) {
            conversationsMap.set(otherUserId, { otherUserId, messages: [] });
        }
        conversationsMap.get(otherUserId)?.messages.push(msg);
    }

    const conversations = [];
    for (const [otherUserId, data] of conversationsMap.entries()) {
        const otherUser = await getUserById(otherUserId);
        if (otherUser) {
            const sortedMessages = data.messages.sort((a, b) => b.timestamp - a.timestamp);
            const lastMessage = sortedMessages[0];
            const unreadCount = sortedMessages.filter(m => m.to === userId && !m.isRead).length;
            conversations.push({ otherUser, lastMessage, unreadCount });
        }
    }

    return conversations.sort((a,b) => b.lastMessage.timestamp - a.lastMessage.timestamp);
};

export const markMessagesAsRead = async (fromUserId: string, toUserId: string): Promise<void> => {
    const allMessages = await getAllMessages();
    let messagesUpdated = false;
    const updatedMessages = allMessages.map(msg => {
        if (msg.from === fromUserId && msg.to === toUserId && !msg.isRead) {
            messagesUpdated = true;
            return { ...msg, isRead: true };
        }
        return msg;
    });

    if (messagesUpdated) {
        localStorage.setItem(MESSAGES_KEY, JSON.stringify(updatedMessages));
        window.dispatchEvent(new StorageEvent('storage', { key: MESSAGES_KEY }));
    }
};

export const getUnreadMessages = async (userId: string): Promise<ChatMessage[]> => {
    const allMessages = await getAllMessages();
    return allMessages.filter(msg => msg.to === userId && !msg.isRead);
};