import crypto from 'crypto';

/**
 * Generate a unique idempotency key for an email
 */
export function generateIdempotencyKey(
    senderId: string,
    recipientEmail: string,
    subject: string,
    scheduledAt: Date
): string {
    const data = `${senderId}:${recipientEmail}:${subject}:${scheduledAt.toISOString()}`;
    return crypto.createHash('sha256').update(data).digest('hex');
}

/**
 * Get the start of the current hour
 */
export function getHourWindow(date: Date = new Date()): Date {
    const hourWindow = new Date(date);
    hourWindow.setMinutes(0, 0, 0);
    return hourWindow;
}

/**
 * Calculate delay in milliseconds until scheduled time
 */
export function calculateDelay(scheduledAt: Date): number {
    const now = new Date();
    const delay = scheduledAt.getTime() - now.getTime();
    return Math.max(0, delay);
}

/**
 * Format date for display
 */
export function formatDate(date: Date): string {
    return date.toISOString();
}
