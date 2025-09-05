export enum BloodGroup {
    A_POSITIVE = 'A+',
    A_NEGATIVE = 'A-',
    B_POSITIVE = 'B+',
    B_NEGATIVE = 'B-',
    AB_POSITIVE = 'AB+',
    AB_NEGATIVE = 'AB-',
    O_POSITIVE = 'O+',
    O_NEGATIVE = 'O-',
}

export enum UserRole {
    DONOR = 'DONOR',
    ADMIN = 'ADMIN',
}

export interface User {
    id: string;
    name: string;
    email: string;
    password?: string;
    role: UserRole;
    phone: string;
    city: string;
    country: string;
    bloodGroup: BloodGroup;
    lastDonationDate?: string;
    isVerified: boolean;
    contactVisible: boolean;
    isPhoneVerified: boolean;
}

export interface ChatMessage {
    id: string;
    from: string; // user id
    to: string; // user id
    message: string;
    timestamp: number;
    isRead: boolean;
}