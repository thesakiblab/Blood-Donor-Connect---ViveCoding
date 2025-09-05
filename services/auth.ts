import { addUser, getAdmins, getUsers, getUserByEmail, updateUser } from './db';
import { User, UserRole } from '../types';
import { md5 } from './crypto';

export interface LoginCredentials {
    email: string;
    password?: string;
}

export interface RegisterData extends Omit<User, 'id' | 'role' | 'lastDonationDate' | 'isVerified' | 'contactVisible' | 'isPhoneVerified'> {
    password?: string;
}

export const loginUser = async (credentials: LoginCredentials): Promise<User> => {
    const users = await getUsers();
    const user = users.find(u => u.email.toLowerCase() === credentials.email.toLowerCase());

    if (!user) {
        throw new Error('User not found. Please check your email or register.');
    }
    if (user.password !== md5(credentials.password || '')) {
        throw new Error('Invalid password.');
    }
    if (user.role === UserRole.ADMIN) {
        throw new Error('Please use the admin login for admin accounts.');
    }
    if (!user.isVerified) {
        throw new Error('Your account is pending admin approval. Please wait to be verified.');
    }


    return user;
};

export const loginAdmin = async (credentials: LoginCredentials): Promise<User> => {
    const admins = await getAdmins();
    const admin = admins.find(a => a.email.toLowerCase() === credentials.email.toLowerCase());
    
    if (!admin) {
        throw new Error('Admin account not found.');
    }
    if (admin.password !== md5(credentials.password || '')) {
        throw new Error('Invalid password.');
    }

    return admin;
}

export const registerUser = async (data: RegisterData): Promise<User> => {
    const existingUser = await getUserByEmail(data.email);

    if (existingUser) {
        throw new Error('An account with this email already exists.');
    }

    const newUser: Omit<User, 'id'> = {
        ...data,
        role: UserRole.DONOR,
        isVerified: false, // New users must be verified by an admin
        contactVisible: true,
        isPhoneVerified: true, // This is called after OTP check, so it's true
    };
    
    return addUser(newUser);
};

export const handleForgotPassword = async (email: string): Promise<string> => {
    const user = await getUserByEmail(email);
    if (!user) {
        throw new Error("No account found with that email address.");
    }

    const newPassword = Math.random().toString(36).slice(-8);
    await updateUser(user.id, { password: newPassword });

    // This simulates sending an email. The UI will display this password.
    return newPassword;
};