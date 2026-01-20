import { EmailStatus } from '@prisma/client';
import prisma from '../config/database';
import { queueService, EmailJobData } from './queue.service';
import { generateIdempotencyKey } from '../utils/helpers';
import { logger } from '../utils/logger';

export interface CreateEmailDto {
    senderId: string;
    recipientEmail: string;
    recipientName?: string;
    subject: string;
    body: string;
    scheduledAt: Date;
}

export interface EmailListFilters {
    status?: EmailStatus;
    senderId?: string;
    limit?: number;
    offset?: number;
}

class EmailService {
    /**
     * Schedule a new email
     */
    async scheduleEmail(data: CreateEmailDto) {
        // Generate idempotency key
        const idempotencyKey = generateIdempotencyKey(
            data.senderId,
            data.recipientEmail,
            data.subject,
            data.scheduledAt
        );

        // Check for duplicate
        const existing = await prisma.email.findUnique({
            where: { idempotencyKey },
        });

        if (existing) {
            logger.warn(`Duplicate email detected: ${idempotencyKey}`);
            return existing;
        }

        // Verify sender exists
        const sender = await prisma.sender.findUnique({
            where: { id: data.senderId },
        });

        if (!sender) {
            throw new Error('Sender not found');
        }

        if (!sender.isActive) {
            throw new Error('Sender is not active');
        }

        // Create email record
        const email = await prisma.email.create({
            data: {
                senderId: data.senderId,
                recipientEmail: data.recipientEmail,
                recipientName: data.recipientName,
                subject: data.subject,
                body: data.body,
                scheduledAt: data.scheduledAt,
                status: EmailStatus.PENDING,
                idempotencyKey,
            },
        });

        // Add to queue
        const jobData: EmailJobData = {
            emailId: email.id,
            senderId: email.senderId,
            recipientEmail: email.recipientEmail,
            recipientName: email.recipientName || undefined,
            subject: email.subject,
            body: email.body,
            scheduledAt: email.scheduledAt.toISOString(),
        };

        const jobId = await queueService.scheduleEmail(email.id, jobData, data.scheduledAt);

        // Update email with job ID
        const updatedEmail = await prisma.email.update({
            where: { id: email.id },
            data: {
                jobId,
                status: EmailStatus.SCHEDULED,
            },
            include: {
                sender: {
                    select: {
                        name: true,
                        email: true,
                    },
                },
            },
        });

        logger.info(`Email ${email.id} scheduled successfully`);

        return updatedEmail;
    }

    /**
     * Get email by ID
     */
    async getEmailById(id: string) {
        return await prisma.email.findUnique({
            where: { id },
            include: {
                sender: {
                    select: {
                        name: true,
                        email: true,
                    },
                },
            },
        });
    }

    /**
     * List emails with filters
     */
    async listEmails(filters: EmailListFilters = {}) {
        const { status, senderId, limit = 50, offset = 0 } = filters;

        const where: any = {};

        if (status) {
            where.status = status;
        }

        if (senderId) {
            where.senderId = senderId;
        }

        const [emails, total] = await Promise.all([
            prisma.email.findMany({
                where,
                include: {
                    sender: {
                        select: {
                            name: true,
                            email: true,
                        },
                    },
                },
                orderBy: {
                    scheduledAt: 'desc',
                },
                take: limit,
                skip: offset,
            }),
            prisma.email.count({ where }),
        ]);

        return {
            emails,
            total,
            limit,
            offset,
        };
    }

    /**
     * Cancel a scheduled email
     */
    async cancelEmail(id: string) {
        const email = await prisma.email.findUnique({
            where: { id },
        });

        if (!email) {
            throw new Error('Email not found');
        }

        if (email.status === EmailStatus.SENT) {
            throw new Error('Cannot cancel already sent email');
        }

        if (email.status === EmailStatus.CANCELLED) {
            throw new Error('Email already cancelled');
        }

        // Cancel job in queue
        if (email.jobId) {
            await queueService.cancelEmail(email.jobId);
        }

        // Update status
        const updatedEmail = await prisma.email.update({
            where: { id },
            data: {
                status: EmailStatus.CANCELLED,
            },
            include: {
                sender: {
                    select: {
                        name: true,
                        email: true,
                    },
                },
            },
        });

        logger.info(`Email ${id} cancelled`);

        return updatedEmail;
    }

    /**
     * Update email status (called by worker)
     */
    async updateEmailStatus(
        id: string,
        status: EmailStatus,
        errorMessage?: string,
        sentAt?: Date
    ) {
        return await prisma.email.update({
            where: { id },
            data: {
                status,
                errorMessage,
                sentAt,
                attempts: {
                    increment: 1,
                },
            },
        });
    }

    /**
     * Get email statistics
     */
    async getStats(senderId?: string) {
        const where = senderId ? { senderId } : {};

        const [total, pending, scheduled, sent, failed] = await Promise.all([
            prisma.email.count({ where }),
            prisma.email.count({ where: { ...where, status: EmailStatus.PENDING } }),
            prisma.email.count({ where: { ...where, status: EmailStatus.SCHEDULED } }),
            prisma.email.count({ where: { ...where, status: EmailStatus.SENT } }),
            prisma.email.count({ where: { ...where, status: EmailStatus.FAILED } }),
        ]);

        return {
            total,
            pending,
            scheduled,
            sent,
            failed,
        };
    }
}

export const emailService = new EmailService();
