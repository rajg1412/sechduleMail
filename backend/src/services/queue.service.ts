import { emailQueue } from '../config/queue';
import { calculateDelay } from '../utils/helpers';
import { logger } from '../utils/logger';

export interface EmailJobData {
    emailId: string;
    senderId: string;
    recipientEmail: string;
    recipientName?: string;
    subject: string;
    body: string;
    scheduledAt: string;
}

class QueueService {
    /**
     * Add an email to the queue with delay
     */
    async scheduleEmail(emailId: string, jobData: EmailJobData, scheduledAt: Date): Promise<string> {
        const delay = calculateDelay(scheduledAt);

        logger.info(`Scheduling email ${emailId} with delay ${delay}ms (${scheduledAt.toISOString()})`);

        const job = await emailQueue.add(
            'send-email',
            jobData,
            {
                jobId: emailId, // Use email ID as job ID for idempotency
                delay,
                attempts: 3,
                backoff: {
                    type: 'exponential',
                    delay: 5000,
                },
            }
        );

        logger.info(`Email ${emailId} added to queue with job ID: ${job.id}`);

        return job.id!;
    }

    /**
     * Cancel a scheduled email
     */
    async cancelEmail(jobId: string): Promise<boolean> {
        try {
            const job = await emailQueue.getJob(jobId);

            if (!job) {
                logger.warn(`Job ${jobId} not found in queue`);
                return false;
            }

            const state = await job.getState();

            // Only cancel if job is waiting or delayed
            if (state === 'waiting' || state === 'delayed') {
                await job.remove();
                logger.info(`Job ${jobId} cancelled successfully`);
                return true;
            } else {
                logger.warn(`Job ${jobId} is in state ${state}, cannot cancel`);
                return false;
            }
        } catch (error) {
            logger.error(`Error cancelling job ${jobId}:`, error);
            return false;
        }
    }

    /**
     * Get job status
     */
    async getJobStatus(jobId: string): Promise<{
        state: string;
        progress?: number;
        failedReason?: string;
    } | null> {
        try {
            const job = await emailQueue.getJob(jobId);

            if (!job) {
                return null;
            }

            const state = await job.getState();

            return {
                state,
                progress: job.progress as number,
                failedReason: job.failedReason,
            };
        } catch (error) {
            logger.error(`Error getting job status for ${jobId}:`, error);
            return null;
        }
    }

    /**
     * Get queue statistics
     */
    async getQueueStats(): Promise<{
        waiting: number;
        active: number;
        completed: number;
        failed: number;
        delayed: number;
    }> {
        const [waiting, active, completed, failed, delayed] = await Promise.all([
            emailQueue.getWaitingCount(),
            emailQueue.getActiveCount(),
            emailQueue.getCompletedCount(),
            emailQueue.getFailedCount(),
            emailQueue.getDelayedCount(),
        ]);

        return {
            waiting,
            active,
            completed,
            failed,
            delayed,
        };
    }

    /**
     * Reschedule a job to a new time
     */
    async rescheduleEmail(jobId: string, newScheduledAt: Date): Promise<boolean> {
        try {
            const job = await emailQueue.getJob(jobId);

            if (!job) {
                logger.warn(`Job ${jobId} not found for rescheduling`);
                return false;
            }

            const delay = calculateDelay(newScheduledAt);

            // Update job delay
            await job.changeDelay(delay);

            logger.info(`Job ${jobId} rescheduled to ${newScheduledAt.toISOString()}`);

            return true;
        } catch (error) {
            logger.error(`Error rescheduling job ${jobId}:`, error);
            return false;
        }
    }

    /**
     * Clean old jobs
     */
    async cleanOldJobs(): Promise<void> {
        try {
            // Clean completed jobs older than 24 hours
            await emailQueue.clean(24 * 3600 * 1000, 1000, 'completed');

            // Clean failed jobs older than 7 days
            await emailQueue.clean(7 * 24 * 3600 * 1000, 5000, 'failed');

            logger.info('Old jobs cleaned successfully');
        } catch (error) {
            logger.error('Error cleaning old jobs:', error);
        }
    }
}

export const queueService = new QueueService();
