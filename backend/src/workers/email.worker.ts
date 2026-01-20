import { Worker, Job } from 'bullmq';
import { EmailStatus } from '@prisma/client';
import { config } from '../config';
import redis from '../config/redis';
import prisma from '../config/database';
import { EmailJobData } from '../services/queue.service';
import { smtpService } from '../services/smtp.service';
import { rateLimiterService } from '../services/rate-limiter.service';
import { logger } from '../utils/logger';

/**
 * Email Worker - Processes email sending jobs from the queue
 * 
 * Features:
 * - Configurable concurrency
 * - Rate limiting (per-sender and global)
 * - Automatic rescheduling when rate limited
 * - Delay between sends
 * - Persistent across restarts
 */

class EmailWorker {
    private worker: Worker<EmailJobData> | null = null;

    /**
     * Start the worker
     */
    start() {
        if (this.worker) {
            logger.warn('Worker already started');
            return;
        }

        this.worker = new Worker<EmailJobData>(
            'email-queue',
            async (job: Job<EmailJobData>) => {
                return await this.processJob(job);
            },
            {
                connection: redis as any,
                concurrency: config.queue.workerConcurrency,
                limiter: {
                    max: 1,
                    duration: config.queue.minDelayBetweenSendsMs,
                },
            }
        );

        // Event handlers
        this.worker.on('completed', (job) => {
            logger.info(`Job ${job.id} completed successfully`);
        });

        this.worker.on('failed', (job, err) => {
            logger.error(`Job ${job?.id} failed:`, err);
        });

        this.worker.on('error', (err) => {
            logger.error('Worker error:', err);
        });

        this.worker.on('ready', () => {
            logger.info(`Email worker started with concurrency: ${config.queue.workerConcurrency}`);
            logger.info(`Min delay between sends: ${config.queue.minDelayBetweenSendsMs}ms`);
        });

        logger.info('Email worker initialized');
    }

    /**
     * Process a single email job
     */
    private async processJob(job: Job<EmailJobData>): Promise<void> {
        const { emailId, senderId } = job.data;

        logger.info(`Processing job ${job.id} for email ${emailId}`);

        try {
            // Update status to PROCESSING
            await prisma.email.update({
                where: { id: emailId },
                data: { status: EmailStatus.PROCESSING },
            });

            // Check rate limits
            const rateLimitCheck = await rateLimiterService.checkRateLimit(senderId);

            if (!rateLimitCheck.allowed) {
                logger.warn(`Rate limit exceeded for email ${emailId}: ${rateLimitCheck.reason}`);

                // Update status to RATE_LIMITED
                await prisma.email.update({
                    where: { id: emailId },
                    data: {
                        status: EmailStatus.RATE_LIMITED,
                        errorMessage: rateLimitCheck.reason,
                    },
                });

                // Reschedule to next available slot
                if (rateLimitCheck.nextAvailableSlot) {
                    const delay = rateLimitCheck.nextAvailableSlot.getTime() - Date.now();

                    if (delay > 0) {
                        await job.changeDelay(delay);

                        await prisma.email.update({
                            where: { id: emailId },
                            data: {
                                scheduledAt: rateLimitCheck.nextAvailableSlot,
                                status: EmailStatus.SCHEDULED,
                            },
                        });

                        logger.info(`Email ${emailId} rescheduled to ${rateLimitCheck.nextAvailableSlot.toISOString()}`);
                    }
                }

                // Don't fail the job, it will be retried
                throw new Error(rateLimitCheck.reason);
            }

            // Get sender details
            const sender = await prisma.sender.findUnique({
                where: { id: senderId },
            });

            if (!sender) {
                throw new Error('Sender not found');
            }

            if (!sender.isActive) {
                throw new Error('Sender is not active');
            }

            // Send email
            const result = await smtpService.sendEmail({
                from: {
                    name: sender.name,
                    email: sender.email,
                },
                to: {
                    name: job.data.recipientName,
                    email: job.data.recipientEmail,
                },
                subject: job.data.subject,
                body: job.data.body,
                smtpUser: sender.smtpUser,
                smtpPass: sender.smtpPass,
            });

            if (!result.success) {
                throw new Error(result.error || 'Failed to send email');
            }

            // Increment rate limit counters
            await rateLimiterService.incrementCounters(senderId);

            // Update email status to SENT
            await prisma.email.update({
                where: { id: emailId },
                data: {
                    status: EmailStatus.SENT,
                    sentAt: new Date(),
                    errorMessage: null,
                },
            });

            logger.info(`Email ${emailId} sent successfully. Preview: ${result.previewUrl || 'N/A'}`);

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';

            logger.error(`Error processing email ${emailId}:`, error);

            // Update email status to FAILED
            await prisma.email.update({
                where: { id: emailId },
                data: {
                    status: EmailStatus.FAILED,
                    errorMessage,
                },
            });

            // Re-throw to trigger BullMQ retry mechanism
            throw error;
        }
    }

    /**
     * Stop the worker gracefully
     */
    async stop() {
        if (this.worker) {
            logger.info('Stopping email worker...');
            await this.worker.close();
            this.worker = null;
            logger.info('Email worker stopped');
        }
    }
}

// Create and export worker instance
export const emailWorker = new EmailWorker();

// Start worker if this file is run directly
if (require.main === module) {
    emailWorker.start();

    // Graceful shutdown
    const shutdown = async () => {
        logger.info('Received shutdown signal');
        await emailWorker.stop();
        await redis.quit();
        await prisma.$disconnect();
        process.exit(0);
    };

    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);
}
