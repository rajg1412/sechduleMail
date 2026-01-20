import { Request, Response } from 'express';
import { z } from 'zod';
import { emailService } from '../services/email.service';
import { queueService } from '../services/queue.service';
import { rateLimiterService } from '../services/rate-limiter.service';
import { EmailStatus } from '@prisma/client';

// Validation schemas
const scheduleEmailSchema = z.object({
    senderId: z.string().uuid(),
    recipientEmail: z.string().email(),
    recipientName: z.string().optional(),
    subject: z.string().min(1).max(500),
    body: z.string().min(1),
    scheduledAt: z.string().datetime(),
});

const listEmailsSchema = z.object({
    status: z.nativeEnum(EmailStatus).optional(),
    senderId: z.string().uuid().optional(),
    limit: z.coerce.number().int().min(1).max(100).optional(),
    offset: z.coerce.number().int().min(0).optional(),
});

export class EmailController {
    /**
     * POST /api/emails/schedule
     * Schedule a new email
     */
    async scheduleEmail(req: Request, res: Response) {
        const validation = scheduleEmailSchema.safeParse(req.body);

        if (!validation.success) {
            return res.status(400).json({
                error: 'Validation failed',
                details: validation.error.errors,
            });
        }

        const data = validation.data;

        try {
            const email = await emailService.scheduleEmail({
                ...data,
                scheduledAt: new Date(data.scheduledAt),
            });

            return res.status(201).json({
                success: true,
                data: email,
            });
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to schedule email';
            return res.status(400).json({
                error: message,
            });
        }
    }

    /**
     * GET /api/emails
     * List emails with filters
     */
    async listEmails(req: Request, res: Response) {
        const validation = listEmailsSchema.safeParse(req.query);

        if (!validation.success) {
            return res.status(400).json({
                error: 'Validation failed',
                details: validation.error.errors,
            });
        }

        const filters = validation.data;

        try {
            const result = await emailService.listEmails(filters);

            return res.json({
                success: true,
                data: result,
            });
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to list emails';
            return res.status(500).json({
                error: message,
            });
        }
    }

    /**
     * GET /api/emails/:id
     * Get email by ID
     */
    async getEmail(req: Request, res: Response) {
        const { id } = req.params;

        try {
            const email = await emailService.getEmailById(id);

            if (!email) {
                return res.status(404).json({
                    error: 'Email not found',
                });
            }

            return res.json({
                success: true,
                data: email,
            });
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to get email';
            return res.status(500).json({
                error: message,
            });
        }
    }

    /**
     * DELETE /api/emails/:id
     * Cancel a scheduled email
     */
    async cancelEmail(req: Request, res: Response) {
        const { id } = req.params;

        try {
            const email = await emailService.cancelEmail(id);

            return res.json({
                success: true,
                data: email,
            });
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to cancel email';
            return res.status(400).json({
                error: message,
            });
        }
    }

    /**
     * GET /api/emails/stats
     * Get email statistics
     */
    async getStats(req: Request, res: Response) {
        const { senderId } = req.query;

        try {
            const [emailStats, queueStats, rateLimitStats] = await Promise.all([
                emailService.getStats(senderId as string | undefined),
                queueService.getQueueStats(),
                rateLimiterService.getStats(senderId as string | undefined),
            ]);

            return res.json({
                success: true,
                data: {
                    emails: emailStats,
                    queue: queueStats,
                    rateLimit: rateLimitStats,
                },
            });
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to get stats';
            return res.status(500).json({
                error: message,
            });
        }
    }
}

export const emailController = new EmailController();
