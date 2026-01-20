import { Request, Response } from 'express';
import { z } from 'zod';
import { senderService } from '../services/sender.service';

// Validation schemas
const createSenderSchema = z.object({
    name: z.string().min(1).max(100),
    email: z.string().email(),
    smtpUser: z.string().min(1),
    smtpPass: z.string().min(1),
    rateLimit: z.number().int().min(1).max(1000).optional(),
});

const updateSenderSchema = z.object({
    name: z.string().min(1).max(100).optional(),
    rateLimit: z.number().int().min(1).max(1000).optional(),
    isActive: z.boolean().optional(),
});

export class SenderController {
    /**
     * POST /api/senders
     * Create a new sender
     */
    async createSender(req: Request, res: Response) {
        const validation = createSenderSchema.safeParse(req.body);

        if (!validation.success) {
            return res.status(400).json({
                error: 'Validation failed',
                details: validation.error.errors,
            });
        }

        try {
            const sender = await senderService.createSender(validation.data);

            return res.status(201).json({
                success: true,
                data: sender,
            });
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to create sender';
            return res.status(400).json({
                error: message,
            });
        }
    }

    /**
     * GET /api/senders
     * List all senders
     */
    async listSenders(_req: Request, res: Response) {
        try {
            const senders = await senderService.listSenders();

            return res.json({
                success: true,
                data: senders,
            });
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to list senders';
            return res.status(500).json({
                error: message,
            });
        }
    }

    /**
     * GET /api/senders/:id
     * Get sender by ID
     */
    async getSender(req: Request, res: Response) {
        const { id } = req.params as { id: string };

        try {
            const sender = await senderService.getSenderById(id);

            if (!sender) {
                return res.status(404).json({
                    error: 'Sender not found',
                });
            }

            return res.json({
                success: true,
                data: sender,
            });
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to get sender';
            return res.status(500).json({
                error: message,
            });
        }
    }

    /**
     * PATCH /api/senders/:id
     * Update sender
     */
    async updateSender(req: Request, res: Response) {
        const { id } = req.params as { id: string };
        const validation = updateSenderSchema.safeParse(req.body);

        if (!validation.success) {
            return res.status(400).json({
                error: 'Validation failed',
                details: validation.error.errors,
            });
        }

        try {
            const sender = await senderService.updateSender(id, validation.data);

            return res.json({
                success: true,
                data: sender,
            });
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to update sender';
            return res.status(400).json({
                error: message,
            });
        }
    }

    /**
     * DELETE /api/senders/:id
     * Delete sender
     */
    async deleteSender(req: Request, res: Response) {
        const { id } = req.params as { id: string };

        try {
            await senderService.deleteSender(id);

            return res.json({
                success: true,
                message: 'Sender deleted successfully',
            });
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to delete sender';
            return res.status(400).json({
                error: message,
            });
        }
    }
}

export const senderController = new SenderController();
