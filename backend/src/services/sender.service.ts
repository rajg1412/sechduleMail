import prisma from '../config/database';
import { smtpService } from './smtp.service';
import { logger } from '../utils/logger';

export interface CreateSenderDto {
    name: string;
    email: string;
    smtpUser: string;
    smtpPass: string;
    rateLimit?: number;
}

export interface UpdateSenderDto {
    name?: string;
    rateLimit?: number;
    isActive?: boolean;
}

class SenderService {
    /**
     * Create a new sender
     */
    async createSender(data: CreateSenderDto) {
        // Check if email already exists
        const existing = await prisma.sender.findUnique({
            where: { email: data.email },
        });

        if (existing) {
            throw new Error('Sender with this email already exists');
        }

        // Verify SMTP credentials
        const isValid = await smtpService.verifyConnection(data.smtpUser, data.smtpPass);

        if (!isValid) {
            throw new Error('Invalid SMTP credentials');
        }

        // Create sender
        const sender = await prisma.sender.create({
            data: {
                name: data.name,
                email: data.email,
                smtpUser: data.smtpUser,
                smtpPass: data.smtpPass,
                rateLimit: data.rateLimit || 100,
            },
        });

        logger.info(`Sender created: ${sender.email}`);

        return sender;
    }

    /**
     * Get sender by ID
     */
    async getSenderById(id: string) {
        return await prisma.sender.findUnique({
            where: { id },
            select: {
                id: true,
                name: true,
                email: true,
                rateLimit: true,
                isActive: true,
                createdAt: true,
                updatedAt: true,
                // Don't expose SMTP credentials
            },
        });
    }

    /**
     * List all senders
     */
    async listSenders() {
        return await prisma.sender.findMany({
            select: {
                id: true,
                name: true,
                email: true,
                rateLimit: true,
                isActive: true,
                createdAt: true,
                updatedAt: true,
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
    }

    /**
     * Update sender
     */
    async updateSender(id: string, data: UpdateSenderDto) {
        const sender = await prisma.sender.findUnique({
            where: { id },
        });

        if (!sender) {
            throw new Error('Sender not found');
        }

        const updated = await prisma.sender.update({
            where: { id },
            data,
            select: {
                id: true,
                name: true,
                email: true,
                rateLimit: true,
                isActive: true,
                createdAt: true,
                updatedAt: true,
            },
        });

        logger.info(`Sender updated: ${updated.email}`);

        return updated;
    }

    /**
     * Delete sender
     */
    async deleteSender(id: string) {
        const sender = await prisma.sender.findUnique({
            where: { id },
            include: {
                _count: {
                    select: { emails: true },
                },
            },
        });

        if (!sender) {
            throw new Error('Sender not found');
        }

        if (sender._count.emails > 0) {
            throw new Error('Cannot delete sender with existing emails');
        }

        await prisma.sender.delete({
            where: { id },
        });

        logger.info(`Sender deleted: ${sender.email}`);

        return { success: true };
    }
}

export const senderService = new SenderService();
