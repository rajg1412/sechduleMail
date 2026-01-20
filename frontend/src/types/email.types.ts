export type EmailStatus =
    | 'PENDING'
    | 'SCHEDULED'
    | 'PROCESSING'
    | 'SENT'
    | 'FAILED'
    | 'CANCELLED'
    | 'RATE_LIMITED';

export interface Sender {
    id: string;
    name: string;
    email: string;
    rateLimit: number;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface Email {
    id: string;
    senderId: string;
    sender: {
        name: string;
        email: string;
    };
    recipientEmail: string;
    recipientName?: string;
    subject: string;
    body: string;
    scheduledAt: string;
    sentAt?: string;
    status: EmailStatus;
    jobId?: string;
    errorMessage?: string;
    attempts: number;
    createdAt: string;
    updatedAt: string;
}

export interface EmailStats {
    total: number;
    pending: number;
    scheduled: number;
    sent: number;
    failed: number;
}

export interface QueueStats {
    waiting: number;
    active: number;
    completed: number;
    failed: number;
    delayed: number;
}

export interface RateLimitStats {
    currentHour: {
        window: string;
        count: number;
        limit: number;
    };
}

export interface Stats {
    emails: EmailStats;
    queue: QueueStats;
    rateLimit: RateLimitStats;
}

export interface ScheduleEmailRequest {
    senderId: string;
    recipientEmail: string;
    recipientName?: string;
    subject: string;
    body: string;
    scheduledAt: string;
}

export interface CreateSenderRequest {
    name: string;
    email: string;
    smtpUser: string;
    smtpPass: string;
    rateLimit?: number;
}
